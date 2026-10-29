// Import pipes used to format currency and dates in the template.
import { CurrencyPipe, DatePipe } from '@angular/common';

// Import Angular component and lifecycle interface.
import { Component, OnInit } from '@angular/core';

// Import FormsModule for two-way data binding with ngModel.
import { FormsModule } from '@angular/forms';

// Import Router for navigation and RouterLink for template links.
import { Router, RouterLink } from '@angular/router';

// Import AuthService to manage user authentication.
import { AuthService } from '../../core/services/auth.service';

// Import PropertyQuery interface and PropertyService.
import {
  PropertyQuery,
  PropertyService
} from '../../core/services/property.service';

// Import the Property model.
import { Property } from '../../core/models/property.model';

// Configure the standalone landlord dashboard component.
@Component({
  selector: 'app-landlord-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './landlord-dashboard.html'
})
export class LandlordDashboard implements OnInit {

  // Store properties and tenant queries belonging to the landlord.
  properties: Property[] = [];
  queries: PropertyQuery[] = [];

  // Store the values used to search, filter, and sort properties.
  searchQuery = '';
  selectedCity = '';
  minRent: number | null = null;
  maxRent: number | null = null;
  sortBy = 'newest';

  // Store pagination settings.
  currentPage = 1;
  pageSize = 4;

  // Store feedback messages and track whether a message is an error.
  feedback = '';
  feedbackError = false;

  // Online fallback image used when a property has no uploaded image.
  readonly fallbackImage =
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80';

  // Inject services required by the dashboard.
  constructor(
    private readonly auth: AuthService,
    private readonly propertyService: PropertyService,
    private readonly router: Router
  ) {}

  // Run when the dashboard component is initialized.
  ngOnInit(): void {

    // Get the currently logged-in user.
    const user = this.auth.getCurrentUser();

    // Redirect unauthenticated users to the login page.
    if (!user) {
      this.router.navigateByUrl('/login');
      return;
    }

    // Redirect users who are not landlords to their appropriate dashboard.
    if (user.role !== 'landlord') {
      this.router.navigateByUrl(this.auth.getDashboardRoute());
      return;
    }

    // Load the landlord's properties and queries.
    this.loadDashboard();
  }

  // Get the currently logged-in user's details.
  get user() {
    return this.auth.getCurrentUser();
  }

  // Load properties and tenant queries for the current landlord.
  loadDashboard(): void {
    const user = this.user;

    // Clear the dashboard data if the user is not a landlord.
    if (!user || user.role !== 'landlord') {
      this.properties = [];
      this.queries = [];
      return;
    }

    // Fetch properties owned by the logged-in landlord.
    this.properties =
      this.propertyService.getPropertiesByLandlord(user.id);

    // Fetch queries related to the landlord's properties.
    this.queries =
      this.propertyService.getQueriesForLandlord(user.id);

    // Ensure the current page remains within the valid page range.
    this.clampPage();
  }

  // Get the total number of properties managed by the landlord.
  get totalProperties(): number {
    return this.properties.length;
  }

  // Count the tenant queries that are still open.
  get openQueries(): number {
    return this.queries.filter(query => query.status === 'open').length;
  }

  // Count the tenant queries that have been answered.
  get answeredQueries(): number {
    return this.queries.filter(query => query.status === 'answered').length;
  }

  // Get a sorted list of unique cities from the landlord's properties.
  get cities(): string[] {
    return [...new Set(
      this.properties
        .map(property => property.city?.trim())
        .filter((city): city is string => Boolean(city))
    )].sort((a, b) => a.localeCompare(b));
  }

  // Filter and sort properties based on the selected search criteria.
  get filteredProperties(): Property[] {
    // Convert the search text to lowercase and remove extra spaces.
    const search = this.searchQuery.trim().toLowerCase();

    // Filter properties according to the selected criteria.
    const filtered = this.properties.filter(property => {

      // Match the search text against the title, location, or city.
      const matchesSearch =
        !search ||
        property.title.toLowerCase().includes(search) ||
        property.location.toLowerCase().includes(search) ||
        property.city.toLowerCase().includes(search);

      // Match the selected city, or include all cities if none is selected.
      const matchesCity =
        !this.selectedCity || property.city === this.selectedCity;

      // Check whether the rent is at least the minimum rent.
      const matchesMinRent =
        this.minRent === null ||
        this.minRent === undefined ||
        property.monthlyRent >= this.minRent;

      // Check whether the rent is within the maximum rent.
      const matchesMaxRent =
        this.maxRent === null ||
        this.maxRent === undefined ||
        property.monthlyRent <= this.maxRent;

      // Include only properties that satisfy every filter.
      return (
        matchesSearch &&
        matchesCity &&
        matchesMinRent &&
        matchesMaxRent
      );
    });

    // Sort the filtered properties according to the selected option.
    return filtered.sort((a, b) => {
      switch (this.sortBy) {

        // Show the oldest properties first.
        case 'oldest':
          return new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime();

        // Sort by rent from lowest to highest.
        case 'rent-low':
          return a.monthlyRent - b.monthlyRent;

        // Sort by rent from highest to lowest.
        case 'rent-high':
          return b.monthlyRent - a.monthlyRent;

        // Sort property titles alphabetically.
        case 'title':
          return a.title.localeCompare(b.title);

        // Show the newest properties first by default.
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime();
      }
    });
  }

  // Calculate the total number of pages.
  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredProperties.length / this.pageSize)
    );
  }

  // Return only the properties displayed on the current page.
  get paginatedProperties(): Property[] {
    const start = (this.currentPage - 1) * this.pageSize;

    return this.filteredProperties.slice(start, start + this.pageSize);
  }

  // Generate an array containing all available page numbers.
  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  // Get the position of the first property displayed on the current page.
  get firstResult(): number {
    return this.filteredProperties.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  // Get the position of the last property displayed on the current page.
  get lastResult(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredProperties.length
    );
  }

  // Return the four most recently added properties.
  get recentProperties(): Property[] {
    return [...this.properties]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 4);
  }

  // Return the four most recently submitted tenant queries.
  get recentQueries(): PropertyQuery[] {
    return [...this.queries]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 4);
  }

  // Get a property's first available image or the fallback image.
  getPropertyImage(property: Property): string {
    return property.images?.find(image => Boolean(image)) ||
      this.fallbackImage;
  }

  // Reset pagination when a search or filter changes.
  onFilterChange(): void {
    this.currentPage = 1;
  }

  // Update the number of properties displayed on each page.
  onPageSizeChange(value: number | string): void {
    const parsed = Number(value);

    // Accept only the supported page sizes.
    if ([4, 8, 12].includes(parsed)) {
      this.pageSize = parsed;
      this.currentPage = 1;
    }
  }

  // Clear all filters and restore the default sorting.
  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCity = '';
    this.minRent = null;
    this.maxRent = null;
    this.sortBy = 'newest';
    this.currentPage = 1;
  }

  // Navigate to a page if its number is valid.
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Move to the previous page.
  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  // Move to the next page.
  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  // Keep the current page within the valid page range.
  private clampPage(): void {
    this.currentPage = Math.min(this.currentPage, this.totalPages);
  }

  // Navigate to the form for creating a new property.
  addProperty(): void {
    this.router.navigateByUrl('/property-form');
  }

  // Open the property form with the selected property's ID for editing.
  editProperty(property: Property): void {
    this.router.navigate(['/property-form'], {
      queryParams: { id: property.id }
    });
  }

  // Navigate to the details page of the selected property.
  viewProperty(property: Property): void {
    this.router.navigate(['/property-details', property.id]);
  }

  // Navigate to the page containing all the landlord's listings.
  manageListings(): void {
    this.router.navigateByUrl('/my-listings');
  }

  // Navigate to the tenant query management page.
  handleQueries(): void {
    this.router.navigateByUrl('/handle-property-queries');
  }

  // Navigate to the page displaying the landlord's queries.
  viewAllQueries(): void {
    this.router.navigateByUrl('/my-queries');
  }

  // Log out the current user and redirect to the login page.
  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}