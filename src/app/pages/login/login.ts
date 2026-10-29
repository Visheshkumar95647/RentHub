// Import Angular component decorator.
import { Component } from '@angular/core';

// Import FormsModule for form handling and NgForm for form validation.
import { FormsModule, NgForm } from '@angular/forms';

// Import Router for navigation and RouterLink for template links.
import { Router, RouterLink } from '@angular/router';

// Import AuthService to handle user authentication.
import { AuthService } from '../../core/services/auth.service';

// Configure the standalone login component.
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login {

  // Store the email and password entered by the user.
  email = '';
  password = '';

  // Store the login error message.
  errorMessage = '';

  // Track whether the user has attempted to submit the form.
  submitted = false;

  // Inject AuthService for login and Router for navigation.
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  // Handle login form submission.
  onSubmit(form: NgForm): void {

    // Mark the form as submitted and clear previous errors.
    this.submitted = true;
    this.errorMessage = '';

    // Mark all form fields as touched to display validation errors.
    form.form.markAllAsTouched();

    // Stop submission if the form contains invalid fields.
    if (form.invalid) return;

    // Attempt to log in using the entered email and password.
    if (!this.auth.login(this.email, this.password)) {
      this.errorMessage = 'Incorrect email or password.';
      return;
    }

    // Redirect the user to the appropriate page based on their role.
    this.router.navigateByUrl(this.auth.getDashboardRoute());
  }
}