
import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../core/models/property.model';
import { PropertyCard } from '../../shared/components/property-card/property-card';

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, FormsModule, PropertyCard],
  templateUrl: './my-listings.html'
})
export class MyListings implements OnInit {
  // Properties belonging to the current landlord
  properties: Property[] = [];

  // ID of the property currently being deleted
  deletingPropertyId: string | null = null;

  // Feedback displayed after an operation
  feedback = '';
  feedbackType: 'success' | 'error' = 'success';

  // Pagination settings
  currentPage = 1;
  pageSize = 6;

  constructor(
    private readonly auth: AuthService,
    private readonly propertyService: PropertyService,
    private readonly router: Router
  ) {}

  // Load the current landlord's properties when the page opens
  ngOnInit(): void {
    this.loadProperties();
  }

  // Check access and load the landlord's listings
  private loadProperties(): void {
    const user = this.auth.getCurrentUser();

    // Redirect to login if nobody is authenticated
    if (!user) {
      this.router.navigateByUrl('/login');
      return;
    }

    // Only landlords can manage their own listings
    if (user.role !== 'landlord') {
      this.router.navigateByUrl(this.auth.getDashboardRoute());
      return;
    }

    this.properties = this.propertyService.getPropertiesByLandlord(user.id);

    // Ensure the selected page is valid
    this.adjustCurrentPage();
  }

  // Return the total number of listings
  get totalListings(): number {
    return this.properties.length;
  }

  // Calculate the average monthly rent
  get averageRent(): number {
    if (this.properties.length === 0) {
      return 0;
    }

    const totalRent = this.properties.reduce(
      (sum, property) => sum + Number(property.monthlyRent || 0),
      0
    );

    return totalRent / this.properties.length;
  }

  // Count the unique cities containing listings
  getCityCount(): number {
    return new Set(
      this.properties
        .map(property => property.city?.trim().toLowerCase())
        .filter(Boolean)
    ).size;
  }

  // Calculate the total number of pages
  get totalPages(): number {
    return Math.ceil(this.properties.length / this.pageSize);
  }

  // Return only the properties belonging to the current page
  get paginatedProperties(): Property[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;

    return this.properties.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  // Generate the page numbers for the pagination controls
  get pageNumbers(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }

  // Change to a selected page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Navigate to the previous page
  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  // Navigate to the next page
  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  // Change how many listings are displayed on each page
  changePageSize(size: number | string): void {
    const newSize = Number(size);

    // Accept only the page sizes available in the dropdown
    if (![3, 6, 9].includes(newSize)) {
      return;
    }

    this.pageSize = newSize;

    // Return to the first page when the page size changes
    this.currentPage = 1;

    // Keep the selected page within the valid range
    this.adjustCurrentPage();
  }

  // Keep the current page valid when listings change
  private adjustCurrentPage(): void {
    if (this.totalPages === 0) {
      this.currentPage = 1;
      return;
    }

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  // Navigate to the property creation form
  addProperty(): void {
    this.router.navigateByUrl('/property-form');
  }

  // Navigate to the edit form for the selected property
  editProperty(property: Property): void {
    this.router.navigate(['/property-form', property.id]);
  }

  // Delete a property after confirmation
  deleteProperty(property: Property): void {
    // Prevent another deletion while one is in progress
    if (this.deletingPropertyId) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${property.title}"?`
    );

    if (!confirmed) {
      return;
    }

    const user = this.auth.getCurrentUser();

    // Check authentication before deleting
    if (!user) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.deletingPropertyId = property.id;
    this.feedback = '';

    try {
      // Delete the property and reload the landlord's listings
      this.propertyService.deleteProperty(property.id, user.id);

      this.properties =
        this.propertyService.getPropertiesByLandlord(user.id);

      // Correct the current page if the last listing was deleted
      this.adjustCurrentPage();

      this.feedbackType = 'success';
      this.feedback = 'Property listing deleted successfully.';
    } catch {
      // Display an error if deletion fails
      this.feedbackType = 'error';
      this.feedback = 'Unable to delete this listing. Please try again.';
    } finally {
      // Clear the deletion state regardless of the result
      this.deletingPropertyId = null;
    }
  }

  // Navigate back to the landlord dashboard
  goToDashboard(): void {
    this.router.navigateByUrl('/landlord-dash');
  }

  // Log out and return to the login page
  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
