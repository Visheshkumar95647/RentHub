
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,

  // Import modules required for template-driven forms and navigation links
  imports: [FormsModule, RouterLink],

  // Connect this component to its HTML template
  templateUrl: './register.html'
})
export class Register {

  // Store the values entered in the registration form
  fullName = '';
  email = '';
  mobile = '';
  password = '';
  confirmPassword = '';

  // Store error and success messages
  errorMessage = '';
  successMessage = '';

  // Track whether the user has attempted to submit the form
  submitted = false;

  constructor(
    // AuthService handles user registration
    private auth: AuthService,

    // Router is used to navigate between pages
    private router: Router
  ) {}

  // Called when the registration form is submitted
  onSubmit(form: NgForm): void {

    // Mark the form as submitted and clear previous errors
    this.submitted = true;
    this.errorMessage = '';

    // Mark every field as touched to display validation errors
    form.form.markAllAsTouched();

    // Stop registration if any form field is invalid
    if (form.invalid) return;

    // Check whether the password and confirmation match
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    // Send the registration details to the authentication service
    const result = this.auth.register({
      fullName: this.fullName,
      email: this.email,
      mobile: this.mobile,
      password: this.password
    });

    // Display the error if registration fails
    if (!result.success) {
      this.errorMessage = result.message;
      return;
    }

    // Navigate to the login page after successful registration
    // Pass a query parameter to indicate that registration succeeded
    this.router.navigate(['/login'], {
      queryParams: { registered: 'true' }
    });
  }
}
