
// Import Component to create the Angular component and OnInit for initialization.
import { Component, OnInit } from '@angular/core';

// Import FormsModule to support template-driven forms and ngModel.
import { FormsModule } from '@angular/forms';

// Import Router for navigation and RouterLink for template links.
import { Router, RouterLink } from '@angular/router';

// Import services for authentication and property-related operations.
import { AuthService } from '../../core/services/auth.service';
import { PropertyService } from '../../core/services/property.service';

// Configure the Profile component.
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './profile.html'
})
export class Profile implements OnInit {

  // Store the user's personal information.
  fullName = '';
  email = '';
  mobile = '';

  // Store feedback messages and form-saving status.
  feedback = '';
  feedbackError = false;
  isSaving = false;

  // Inject the required services and Angular Router.
  constructor(
    private readonly authService: AuthService,
    private readonly propertyService: PropertyService,
    private readonly router: Router
  ) {}

  // Run this method when the component is initialized.
  ngOnInit(): void {

    // Get the currently logged-in user.
    const user = this.authService.getCurrentUser();

    // Redirect to login if no user is logged in.
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Fill the form with the user's existing information.
    this.fullName = user.fullName;
    this.email = user.email;
    this.mobile = user.mobile ?? '';
  }

  // Get the currently logged-in user's information.
  get user() {
    return this.authService.getCurrentUser();
  }

  // Convert the user's role into a readable label.
  get roleLabel(): string {
    const user = this.user;

    // Return a default label if no user exists.
    if (!user) {
      return 'Unknown';
    }

    // Return the appropriate label for each role.
    if (user.role === 'admin') {
      return 'Administrator';
    }

    if (user.role === 'landlord') {
      return 'Landlord';
    }

    return 'User';
  }

  // Get the user's landlord promotion status.
  get promotionStatus(): string {
    return this.user?.promotionStatus ?? 'Not requested';
  }

  // Count favourites belonging only to the logged-in user.
  get favouriteCount(): number {
    const user = this.user;

    // Return zero if no user is logged in.
    if (!user) {
      return 0;
    }

    // Return the number of properties saved by this user.
    return this.propertyService.getFavourites(user.id).length;
  }

  // Validate and save the updated profile information.
  saveProfile(): void {

    // Clear previous feedback messages.
    this.feedback = '';
    this.feedbackError = false;

    // Remove extra spaces and normalize the email address.
    const fullName = this.fullName.trim();
    const email = this.email.trim().toLowerCase();
    const mobile = this.mobile.trim();

    // Check that all required fields have been filled in.
    if (!fullName || !email || !mobile) {
      this.feedback = 'Please complete all required fields.';
      this.feedbackError = true;
      return;
    }

    // Validate the email address format.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.feedback = 'Please enter a valid email address.';
      this.feedbackError = true;
      return;
    }

    // Validate the mobile number format and length.
    if (!/^[0-9+\-()\s]{7,20}$/.test(mobile)) {
      this.feedback = 'Please enter a valid mobile number.';
      this.feedbackError = true;
      return;
    }

    // Show the saving state while updating the profile.
    this.isSaving = true;

    try {
      // Send the updated information to the authentication service.
      const result = this.authService.updateCurrentUserProfile({
        fullName,
        email,
        mobile
      });

      // Display the result returned by the service.
      this.feedback = result.message;
      this.feedbackError = !result.success;

      // Update the form values if the save was successful.
      if (result.success) {
        this.fullName = fullName;
        this.email = email;
        this.mobile = mobile;
      }
    } catch {
      // Display an error if the profile update fails unexpectedly.
      this.feedback = 'Unable to update your profile.';
      this.feedbackError = true;
    } finally {
      // Reset the saving state whether the operation succeeds or fails.
      this.isSaving = false;
    }
  }

  // Log out the current user and redirect to the login page.
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
