// Import Angular component, lifecycle interface, and inject function.
import { Component, OnInit, inject } from '@angular/core';

// Import Router to navigate between pages.
import { Router } from '@angular/router';

// Import AuthService to get the logged-in user's details.
import { AuthService } from '../../core/services/auth.service';

// Define a standalone component that redirects users based on their role.
@Component({
  selector: 'app-home-redirect',
  standalone: true,
  template: ''
})
export class HomeRedirect implements OnInit {

  // Inject AuthService to access the current user's information.
  private authService = inject(AuthService);

  // Inject Router to navigate to the appropriate page.
  private router = inject(Router);

  // Run this method when the component is initialized.
  ngOnInit(): void {

    // Get the currently logged-in user.
    const user = this.authService.getCurrentUser();

    // Redirect to the login page if no user is logged in.
    if (!user) {
      this.router.navigateByUrl('/login', {
        // Replace the current history entry to prevent going back to this redirect.
        replaceUrl: true
      });
      return;
    }

    // Redirect the user based on their role.
    switch (user.role) {

      // Admin users are redirected to the admin dashboard.
      case 'admin':
        this.router.navigateByUrl('/admin-dashboard', {
          replaceUrl: true
        });
        break;

      // Landlords are redirected to the landlord dashboard.
      case 'landlord':
        this.router.navigateByUrl('/landlord-dashboard', {
          replaceUrl: true
        });
        break;

      // Regular users and any unrecognized roles are redirected to the home page.
      case 'user':
      default:
        this.router.navigateByUrl('/', {
          replaceUrl: true
        });
        break;
    }
  }
}