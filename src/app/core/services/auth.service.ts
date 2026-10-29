
import { Injectable } from '@angular/core';

import {
  AuthUser,
  PromotionStatus,
  User,
  UserRole
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_KEY = 'renthub_users';
  private readonly SESSION_KEY = 'renthub_session';

  // Development-only admin credentials.
  readonly adminEmail = 'admin@renthub.local';
  readonly adminPassword = 'Admin@12345';

  constructor() {
    this.seedAdmin();
  }

  // ---------- REGISTRATION ----------

  register(data: {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
  }): { success: boolean; message: string } {
    const fullName = data.fullName.trim();
    const email = data.email.trim().toLowerCase();
    const mobile = data.mobile.trim();

    if (fullName.length < 2) {
      return {
        success: false,
        message: 'Enter your full name.'
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        message: 'Enter a valid email address.'
      };
    }

    if (!/^\d{10}$/.test(mobile)) {
      return {
        success: false,
        message: 'Enter a valid 10-digit mobile number.'
      };
    }

    if (data.password.length < 8) {
      return {
        success: false,
        message: 'Password must contain at least 8 characters.'
      };
    }

    const users = this.getUsers();

    if (users.some(user => user.email.toLowerCase() === email)) {
      return {
        success: false,
        message: 'An account with this email already exists.'
      };
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      fullName,
      email,
      mobile,
      password: data.password,
      role: 'user'
    };

    users.push(newUser);

    if (!this.saveUsers(users)) {
      return {
        success: false,
        message: 'Unable to create the account. Please try again.'
      };
    }

    return {
      success: true,
      message: 'Account created successfully. Please sign in.'
    };
  }

  // ---------- LOGIN ----------

  login(email: string, password: string): boolean {
    const normalizedEmail = email.trim().toLowerCase();

    const user = this.getUsers().find(
      item =>
        item.email.toLowerCase() === normalizedEmail &&
        item.password === password
    );

    if (!user) {
      return false;
    }

    const { password: _password, ...safeUser } = user;

    try {
      localStorage.setItem(
        this.SESSION_KEY,
        JSON.stringify(safeUser)
      );

      return true;
    } catch {
      return false;
    }
  }

  // ---------- CURRENT USER ----------

  getCurrentUser(): AuthUser | null {
    try {
      const sessionValue = localStorage.getItem(this.SESSION_KEY);

      if (!sessionValue) {
        return null;
      }

      const session = JSON.parse(sessionValue) as AuthUser;

      const storedUser = this.getUsers().find(
        user => user.id === session.id
      );

      if (!storedUser) {
        localStorage.removeItem(this.SESSION_KEY);
        return null;
      }

      // Always use the latest stored account details.
      const { password: _password, ...safeUser } = storedUser;

      localStorage.setItem(
        this.SESSION_KEY,
        JSON.stringify(safeUser)
      );

      return safeUser;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(role: UserRole): boolean {
    return this.getCurrentUser()?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isLandlord(): boolean {
    return this.hasRole('landlord');
  }

  isRegularUser(): boolean {
    return this.hasRole('user');
  }


  getDashboardRoute(): string {
  const user = this.getCurrentUser();

  if (!user) return '/login';

  switch (user.role) {
    case 'admin':
      return '/admin-dashboard';

    case 'landlord':
      return '/landlord-dashboard';

    default:
      return '/';
  }
}


  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  // ---------- LANDLORD PROMOTION REQUEST ----------

  requestLandlordPromotion(
    message: string
  ): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();

    if (!currentUser) {
      return {
        success: false,
        message: 'Please sign in first.'
      };
    }

    if (currentUser.role !== 'user') {
      return {
        success: false,
        message: 'Only regular users can request landlord access.'
      };
    }

    if (currentUser.promotionStatus === 'pending') {
      return {
        success: false,
        message: 'Your promotion request is already pending.'
      };
    }

    if (message.trim().length < 10) {
      return {
        success: false,
        message: 'Please enter at least 10 characters.'
      };
    }

    const users = this.getUsers();

    const index = users.findIndex(
      user => user.id === currentUser.id
    );

    if (index === -1) {
      return {
        success: false,
        message: 'Your account could not be found.'
      };
    }

    users[index] = {
      ...users[index],
      promotionStatus: 'pending',
      promotionMessage: message.trim(),
      promotionRequestedAt: new Date().toISOString(),
      promotionReviewedAt: undefined
    };

    if (!this.saveUsers(users)) {
      return {
        success: false,
        message: 'Unable to submit your request. Please try again.'
      };
    }

    this.syncSession(users[index]);

    return {
      success: true,
      message: 'Your landlord promotion request has been submitted.'
    };
  }

  getPromotionRequests(): AuthUser[] {
    return this.getUsers()
      .filter(user => user.promotionStatus === 'pending')
      .map(({ password: _password, ...user }) => user);
  }

  // ---------- ADMIN REVIEW ----------

  reviewPromotionRequest(
    userId: string,
    decision: Extract<PromotionStatus, 'approved' | 'rejected'>
  ): { success: boolean; message: string } {
    if (!this.isAdmin()) {
      return {
        success: false,
        message: 'Only an administrator can review requests.'
      };
    }

    const users = this.getUsers();

    const index = users.findIndex(
      user =>
        user.id === userId &&
        user.promotionStatus === 'pending'
    );

    if (index === -1) {
      return {
        success: false,
        message: 'Pending promotion request not found.'
      };
    }

    users[index] = {
      ...users[index],
      role: decision === 'approved' ? 'landlord' : 'user',
      promotionStatus: decision,
      promotionReviewedAt: new Date().toISOString()
    };

    if (!this.saveUsers(users)) {
      return {
        success: false,
        message: 'Unable to save the decision. Please try again.'
      };
    }

    this.syncSession(users[index]);

    return {
      success: true,
      message:
        decision === 'approved'
          ? 'User promoted to landlord successfully.'
          : 'Landlord promotion request rejected.'
    };
  }

  // ---------- ADMIN USER DIRECTORY ----------

  getAllUsers(): AuthUser[] {
    return this.getUsers().map(
      ({ password: _password, ...user }) => user
    );
  }

  // ---------- PROFILE UPDATE ----------

  updateCurrentUserProfile(data: {
    fullName: string;
    email: string;
    mobile: string;
  }): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();

    if (!currentUser) {
      return {
        success: false,
        message: 'Please sign in to update your profile.'
      };
    }

    const fullName = data.fullName.trim();
    const email = data.email.trim().toLowerCase();
    const mobile = data.mobile.trim();

    if (fullName.length < 2) {
      return {
        success: false,
        message: 'Name must contain at least 2 characters.'
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        message: 'Enter a valid email address.'
      };
    }

    if (!/^\d{10}$/.test(mobile)) {
      return {
        success: false,
        message: 'Enter a valid 10-digit mobile number.'
      };
    }

    const users = this.getUsers();

    const duplicateEmail = users.some(
      user =>
        user.id !== currentUser.id &&
        user.email.toLowerCase() === email
    );

    if (duplicateEmail) {
      return {
        success: false,
        message: 'This email is already registered.'
      };
    }

    const index = users.findIndex(
      user => user.id === currentUser.id
    );

    if (index === -1) {
      return {
        success: false,
        message: 'Your account could not be found.'
      };
    }

    users[index] = {
      ...users[index],
      fullName,
      email,
      mobile
    };

    if (!this.saveUsers(users)) {
      return {
        success: false,
        message: 'Unable to update your profile.'
      };
    }

    // Synchronize the current session with the updated user.
    if (!this.syncSession(users[index])) {
      return {
        success: false,
        message:
          'Profile saved, but the session could not be updated. Refresh the page.'
      };
    }

    return {
      success: true,
      message: 'Profile updated successfully.'
    };
  }

  // ---------- ADMIN SEED ----------

  private seedAdmin(): void {
    const users = this.getUsers();

    const existingAdmin = users.find(
      user => user.email.toLowerCase() === this.adminEmail
    );

    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        this.saveUsers(users);
      }

      return;
    }

    users.push({
      id: crypto.randomUUID(),
      fullName: 'RentHub Administrator',
      email: this.adminEmail,
      mobile: '9999999999',
      password: this.adminPassword,
      role: 'admin'
    });

    this.saveUsers(users);
  }

  // ---------- STORAGE HELPERS ----------

  private getUsers(): User[] {
    try {
      const stored = localStorage.getItem(this.USERS_KEY);

      if (!stored) {
        return [];
      }

      const users: unknown = JSON.parse(stored);

      return Array.isArray(users) ? users as User[] : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: User[]): boolean {
    try {
      localStorage.setItem(
        this.USERS_KEY,
        JSON.stringify(users)
      );

      return true;
    } catch {
      return false;
    }
  }

  private syncSession(user: User): boolean {
    try {
      const currentSession = localStorage.getItem(this.SESSION_KEY);

      if (!currentSession) {
        return true;
      }

      const session = JSON.parse(currentSession) as AuthUser;

      if (session.id !== user.id) {
        return true;
      }

      const { password: _password, ...safeUser } = user;

      localStorage.setItem(
        this.SESSION_KEY,
        JSON.stringify(safeUser)
      );

      return true;
    } catch {
      return false;
    }
  }
}
