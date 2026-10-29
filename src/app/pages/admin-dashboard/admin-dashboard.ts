// Import Angular pipes used to format currency, dates, and text.
import {
  CurrencyPipe,
  DatePipe,
  TitleCasePipe
} from '@angular/common';

// Import Component to define the component and OnInit for initialization.
import { Component, OnInit } from '@angular/core';

// Import FormsModule to support ngModel in the HTML template.
import { FormsModule } from '@angular/forms';

// Import Router for navigation and RouterLink for template links.
import { Router, RouterLink } from '@angular/router';

// Import services used for authentication and property management.
import { AuthService } from '../../core/services/auth.service';
import { PropertyService } from '../../core/services/property.service';

// Import user-related types.
import {
  AuthUser,
  UserRole
} from '../../core/models/user.model';

// Import the property model.
import { Property } from '../../core/models/property.model';

// Configure the Admin Dashboard component.
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    TitleCasePipe,
    FormsModule
  ],
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboard implements OnInit {

  // Store all registered users, landlord requests, and properties.
  users: AuthUser[] = [];
  requests: AuthUser[] = [];
  properties: Property[] = [];

  // Store search text and selected role filters.
  userSearch = '';
  selectedRole = 'all';
  propertySearch = '';

  // User pagination settings.
  userCurrentPage = 1;
  userPageSize = 6;

  // Property pagination settings.
  propertyCurrentPage = 1;
  propertyPageSize = 3;

  // Store feedback messages and request processing status.
  feedback = '';
  feedbackError = false;
  isProcessing = false;

  // Inject the required services and Angular router.
  constructor(
    private readonly auth: AuthService,
    private readonly propertyService: PropertyService,
    private readonly router: Router
  ) {}

  // Runs when the component is initialized.
  ngOnInit(): void {

    // Prevent non-admin users from accessing the dashboard.
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }

    // Load dashboard data after checking admin access.
    this.refresh();
  }

  // Refresh users, landlord requests, and property data.
  refresh(): void {
    this.users = this.auth.getAllUsers();
    this.requests = this.auth.getPromotionRequests();
    this.properties = this.propertyService.getAllProperties();

    // Keep the current pages valid after data changes.
    this.clampUserPage();
    this.clampPropertyPage();
  }

  // Return the total number of registered non-admin users.
  get totalUsers(): number {
    return this.users.filter(
      user => user.role !== 'admin'
    ).length;
  }

  // Return the total number of approved landlords.
  get totalLandlords(): number {
    return this.users.filter(
      user => user.role === 'landlord'
    ).length;
  }

  // Return the total number of regular tenant accounts.
  get totalRegularUsers(): number {
    return this.users.filter(
      user => user.role === 'user'
    ).length;
  }

  // Return the number of pending landlord promotion requests.
  get pendingRequests(): number {
    return this.requests.length;
  }

  // Return the total number of properties.
  get totalProperties(): number {
    return this.properties.length;
  }

  // Filter users according to the search text and selected role.
  get filteredUsers(): AuthUser[] {

    // Normalize the search text for case-insensitive matching.
    const query = this.userSearch.trim().toLowerCase();

    return this.users.filter(user => {

      // Match users by name, email, or mobile number.
      const matchesSearch =
        !query ||
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.mobile.includes(query);

      // Match the selected role or include every role.
      const matchesRole =
        this.selectedRole === 'all' ||
        user.role === this.selectedRole;

      // Include only users matching both conditions.
      return matchesSearch && matchesRole;
    });
  }

  // Calculate the total number of user pages.
  get totalUserPages(): number {
    return Math.ceil(
      this.filteredUsers.length / this.userPageSize
    );
  }

  // Return only the users belonging to the current page.
  get paginatedUsers(): AuthUser[] {

    // Calculate the starting index for the current page.
    const startIndex =
      (this.userCurrentPage - 1) * this.userPageSize;

    // Return the required number of users.
    return this.filteredUsers.slice(
      startIndex,
      startIndex + this.userPageSize
    );
  }

  // Generate an array containing all available user page numbers.
  get userPageNumbers(): number[] {
    return Array.from(
      { length: this.totalUserPages },
      (_, index) => index + 1
    );
  }

  // Calculate the first result number displayed on the current page.
  get firstUserResult(): number {

    // Return zero when no users match the filters.
    if (this.filteredUsers.length === 0) {
      return 0;
    }

    return (
      (this.userCurrentPage - 1) * this.userPageSize + 1
    );
  }

  // Calculate the last result number displayed on the current page.
  get lastUserResult(): number {
    return Math.min(
      this.userCurrentPage * this.userPageSize,
      this.filteredUsers.length
    );
  }

  // Update the user search and reset pagination to the first page.
  onUserSearchChange(value: string): void {
    this.userSearch = value;
    this.userCurrentPage = 1;
  }

  // Update the selected user role and reset pagination.
  onUserRoleChange(value: string): void {
    this.selectedRole = value;
    this.userCurrentPage = 1;
  }

  // Change the number of users displayed per page.
  onUserPageSizeChange(value: string | number): void {
    const pageSize = Number(value);

    // Accept only the supported page sizes.
    if (![3, 6, 9].includes(pageSize)) {
      return;
    }

    this.userPageSize = pageSize;
    this.userCurrentPage = 1;
  }

  // Navigate to a particular user page if it is valid.
  goToUserPage(page: number): void {
    if (
      page < 1 ||
      page > this.totalUserPages
    ) {
      return;
    }

    this.userCurrentPage = page;
  }

  // Navigate to the previous user page.
  previousUserPage(): void {
    this.goToUserPage(this.userCurrentPage - 1);
  }

  // Navigate to the next user page.
  nextUserPage(): void {
    this.goToUserPage(this.userCurrentPage + 1);
  }

  // Keep the current user page within the valid page range.
  private clampUserPage(): void {

    // Reset to page one if there are no matching users.
    if (this.totalUserPages === 0) {
      this.userCurrentPage = 1;
      return;
    }

    // Move to the last available page if the current page is too high.
    this.userCurrentPage = Math.min(
      this.userCurrentPage,
      this.totalUserPages
    );
  }

  // Filter properties using their title, city, location, or landlord name.
  get filteredProperties(): Property[] {

    // Normalize the search text.
    const query = this.propertySearch.trim().toLowerCase();

    // Return every property when the search field is empty.
    if (!query) {
      return this.properties;
    }

    // Keep properties containing the search text in any supported field.
    return this.properties.filter(property =>
      [
        property.title,
        property.city,
        property.location,
        property.landlordName
      ].some(value =>
        value.toLowerCase().includes(query)
      )
    );
  }

  // Calculate the total number of property pages.
  get totalPropertyPages(): number {
    return Math.ceil(
      this.filteredProperties.length / this.propertyPageSize
    );
  }

  // Return only the properties belonging to the current page.
  get paginatedProperties(): Property[] {

    // Calculate the starting index for the current page.
    const startIndex =
      (this.propertyCurrentPage - 1) * this.propertyPageSize;

    // Return the properties for the current page.
    return this.filteredProperties.slice(
      startIndex,
      startIndex + this.propertyPageSize
    );
  }

  // Generate an array containing all property page numbers.
  get propertyPageNumbers(): number[] {
    return Array.from(
      { length: this.totalPropertyPages },
      (_, index) => index + 1
    );
  }

  // Calculate the first property result displayed on the current page.
  get firstPropertyResult(): number {

    // Return zero if no properties match the search.
    if (this.filteredProperties.length === 0) {
      return 0;
    }

    return (
      (this.propertyCurrentPage - 1) * this.propertyPageSize + 1
    );
  }

  // Calculate the last property result displayed on the current page.
  get lastPropertyResult(): number {
    return Math.min(
      this.propertyCurrentPage * this.propertyPageSize,
      this.filteredProperties.length
    );
  }

  // Update property search text and reset to the first page.
  onPropertySearchChange(value: string): void {
    this.propertySearch = value;
    this.propertyCurrentPage = 1;
  }

  // Change the number of properties displayed per page.
  onPropertyPageSizeChange(value: string | number): void {
    const pageSize = Number(value);

    // Accept only the supported page sizes.
    if (![3, 6, 9].includes(pageSize)) {
      return;
    }

    this.propertyPageSize = pageSize;
    this.propertyCurrentPage = 1;
  }

  // Navigate to a particular property page if it is valid.
  goToPropertyPage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPropertyPages
    ) {
      return;
    }

    this.propertyCurrentPage = page;
  }

  // Navigate to the previous property page.
  previousPropertyPage(): void {
    this.goToPropertyPage(
      this.propertyCurrentPage - 1
    );
  }

  // Navigate to the next property page.
  nextPropertyPage(): void {
    this.goToPropertyPage(
      this.propertyCurrentPage + 1
    );
  }

  // Keep the current property page within the valid page range.
  private clampPropertyPage(): void {

    // Reset to page one when no properties match the search.
    if (this.totalPropertyPages === 0) {
      this.propertyCurrentPage = 1;
      return;
    }

    // Move to the last available page if necessary.
    this.propertyCurrentPage = Math.min(
      this.propertyCurrentPage,
      this.totalPropertyPages
    );
  }

  // Count users who have a particular role.
  countRole(role: UserRole): number {
    return this.users.filter(
      user => user.role === role
    ).length;
  }

  // Approve or reject a user's request to become a landlord.
  review(
    userId: string,
    decision: 'approved' | 'rejected'
  ): void {

    // Prevent multiple requests from being processed simultaneously.
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    // Clear any previous feedback before processing the request.
    this.feedback = '';

    try {

      // Ask AuthService to process the selected decision.
      const result = this.auth.reviewPromotionRequest(
        userId,
        decision
      );

      // Display the result returned by the authentication service.
      this.feedback = result.message;
      this.feedbackError = !result.success;

      // Reload dashboard data if the operation succeeds.
      if (result.success) {
        this.refresh();
      }
    } catch {

      // Display an error message if an unexpected exception occurs.
      this.feedback =
        'Something went wrong. Please try again.';
      this.feedbackError = true;
    } finally {

      // Allow another request after processing finishes.
      this.isProcessing = false;
    }
  }

  // Log out the current admin and redirect to the login page.
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}