
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { roleHomeGuard } from './core/guards/role-home.guard';

export const routes: Routes = [
  // Public marketplace.
  // Landlords and admins are redirected by roleHomeGuard.
  {
    path: '',
    pathMatch: 'full',
    canActivate: [roleHomeGuard],
    loadComponent: () =>
      import('./pages/user-dashboard/user-dashboard')
        .then(m => m.UserDashboard)
  },

  // Authentication
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login')
        .then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register')
        .then(m => m.Register)
  },

  // Backward-compatible marketplace URL
  {
    path: 'user-dashboard',
    redirectTo: '',
    pathMatch: 'full'
  },

  // Admin dashboard
  {
    path: 'admin-dashboard',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard')
        .then(m => m.AdminDashboard)
  },

  // Access denied
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./pages/forbidden/forbidden')
        .then(m => m.Forbidden)
  },

  // Landlord dashboard
  {
    path: 'landlord-dash',
    canActivate: [authGuard],
    data: { roles: ['landlord'] },
    loadComponent: () =>
      import('./pages/landlord-dashboard/landlord-dashboard')
        .then(m => m.LandlordDashboard)
  },

  // Redirect the old landlord dashboard URL
  {
    path: 'landlord-dashboard',
    redirectTo: 'landlord-dash',
    pathMatch: 'full'
  },

  // Landlord: manage owned properties
  {
    path: 'my-listings',
    canActivate: [authGuard],
    data: { roles: ['landlord'] },
    loadComponent: () =>
      import('./pages/my-listings/my-listings')
        .then(m => m.MyListings)
  },
  {
    path: 'property-form',
    canActivate: [authGuard],
    data: { roles: ['landlord'] },
    loadComponent: () =>
      import('./pages/property-form/property-form')
        .then(m => m.PropertyForm)
  },

  // Property details
  {
    path: 'property-details/:id',
    canActivate: [authGuard],
    data: { roles: ['user', 'landlord'] },
    loadComponent: () =>
      import('./pages/property-details/property-details')
        .then(m => m.PropertyDetails)
  },

  // Profile
  {
    path: 'profile',
    canActivate: [authGuard],
    data: { roles: ['user', 'landlord'] },
    loadComponent: () =>
      import('./pages/profile/profile')
        .then(m => m.Profile)
  },

  // Favourites
  {
    path: 'favourites',
    canActivate: [authGuard],
    data: { roles: ['user', 'landlord'] },
    loadComponent: () =>
      import('./pages/favourites/favourites')
        .then(m => m.Favourites)
  },

  // Tenant/landlord query history
  {
    path: 'my-queries',
    canActivate: [authGuard],
    data: { roles: ['user', 'landlord'] },
    loadComponent: () =>
      import('./pages/my-queries/my-queries')
        .then(m => m.MyQueries)
  },

  // Landlord: handle queries for owned properties
  {
    path: 'handle-property-queries',
    canActivate: [authGuard],
    data: { roles: ['landlord'] },
    loadComponent: () =>
      import('./pages/handle-property-queries/handle-property-queries')
        .then(m => m.HandlePropertyQueries)
  },

  // Unknown URLs
  {
    path: '**',
    redirectTo: ''
  }
];
