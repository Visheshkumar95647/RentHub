// Import Angular component and lifecycle interface.
import { Component, OnInit } from '@angular/core';

// Import Router for navigation and RouterLink for template links.
import { Router, RouterLink } from '@angular/router';

// Import services for authentication and property management.
import { AuthService } from '../../core/services/auth.service';
import { PropertyService } from '../../core/services/property.service';

// Import the Property model.
import { Property } from '../../core/models/property.model';

// Import the reusable property card component.
import { PropertyCard } from '../../shared/components/property-card/property-card';

// Configure the Favourites component.
@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [RouterLink, PropertyCard],
  templateUrl: './favourites.html'
})
export class Favourites implements OnInit {

  // Store the properties saved by the current user.
  properties: Property[] = [];

  // Pagination settings.
  currentPage = 1;
  pageSize = 6;

  // Inject the required services and router.
  constructor(
    private readonly auth: AuthService,
    private readonly propertyService: PropertyService,
    private readonly router: Router
  ) {}

  // Runs when the component is initialized.
  ngOnInit(): void {

    // Redirect users to login if they are not authenticated.
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Load the current user's favourite properties.
    this.loadFavourites();
  }

  // Get the currently logged-in user.
  get user() {
    return this.auth.getCurrentUser();
  }

  // Load favourite properties belonging to the current user.
  loadFavourites(): void {
    const user = this.user;

    // Fetch favourites if a user exists; otherwise, return an empty array.
    this.properties = user
      ? this.propertyService.getFavouriteProperties(user.id)
      : [];

    // Keep the current page within the available page range.
    this.currentPage = Math.min(
      this.currentPage,
      Math.max(1, this.totalPages)
    );
  }

  // Calculate the total number of pages.
  get totalPages(): number {
    return Math.ceil(this.properties.length / this.pageSize);
  }

  // Return only the favourite properties for the current page.
  get paginatedProperties(): Property[] {

    // Calculate the starting index for the current page.
    const startIndex = (this.currentPage - 1) * this.pageSize;

    // Return the properties for the current page.
    return this.properties.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  // Generate an array containing all available page numbers.
  get pageNumbers(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }

  // Calculate the first visible result number.
  get firstVisibleResult(): number {
    return this.properties.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  // Calculate the last visible result number.
  get lastVisibleResult(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.properties.length
    );
  }

  // Change the number of properties displayed per page.
  changePageSize(value: string | number): void {
    const size = Number(value);

    // Allow only the supported page sizes.
    if (![6, 9, 12].includes(size)) {
      return;
    }

    // Update page size and reset pagination.
    this.pageSize = size;
    this.currentPage = 1;
  }

  // Navigate to the requested page if it is valid.
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Navigate to the previous page.
  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  // Navigate to the next page.
  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  // Add or remove a property from the user's favourites.
  toggleFavourite(propertyId: string): void {
    const user = this.user;

    // Redirect to login if no user is available.
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Update the favourite status for the current user.
    this.propertyService.toggleFavourite(user.id, propertyId);

    // Reload favourites to reflect the updated list.
    this.loadFavourites();
  }

  // Navigate to the details page for the selected property.
  viewDetails(propertyId: string): void {
    this.router.navigate(['/property-details', propertyId]);
  }

  // Log out the user and redirect to the login page.
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}