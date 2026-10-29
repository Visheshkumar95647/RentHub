import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.getCurrentUser();
  const allowedRoles = route.data['roles'] as UserRole[] | undefined;

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return router.createUrlTree([auth.getDashboardRoute()]);
  }

  return true;
};