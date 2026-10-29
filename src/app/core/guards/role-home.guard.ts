import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleHomeGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.getCurrentUser();

  if (user?.role === 'landlord') {
    return router.createUrlTree(['/landlord-dash']);
  }

  if (user?.role === 'admin') {
    return router.createUrlTree(['/admin-dashboard']);
  }

  // Guests and regular tenants can access the marketplace.
  return true;
};