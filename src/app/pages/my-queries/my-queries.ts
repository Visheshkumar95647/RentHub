// Import Angular component and lifecycle interface.
import { Component, OnInit } from '@angular/core';

// Import DatePipe to format query dates in the template.
import { DatePipe } from '@angular/common';

// Import RouterLink for navigation between pages.
import { RouterLink } from '@angular/router';

// Import PropertyQuery interface and PropertyService.
import {
  PropertyQuery,
  PropertyService
} from '../../core/services/property.service';

// Import AuthService to get the logged-in user's details.
import { AuthService } from '../../core/services/auth.service';

// Configure the standalone My Queries component.
@Component({
  selector: 'app-my-queries',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './my-queries.html'
})
export class MyQueries implements OnInit {

  // Store the queries submitted by the current user.
  queries: PropertyQuery[] = [];

  // Inject services for retrieving queries and user information.
  constructor(
    private readonly propertyService: PropertyService,
    private readonly auth: AuthService
  ) {}

  // Load the user's queries when the component is initialized.
  ngOnInit(): void {

    // Get the currently logged-in user.
    const user = this.auth.getCurrentUser();

    // Fetch queries for the logged-in user, or use an empty list if no user exists.
    this.queries = user
      ? this.propertyService.getQueriesByUser(user.id)
      : [];
  }

  // Count the queries that are waiting for a landlord's response.
  get pendingCount(): number {
    return this.queries.filter(query => query.status === 'open').length;
  }

  // Count the queries that have been answered by landlords.
  get answeredCount(): number {
    return this.queries.filter(query => query.status === 'answered').length;
  }
}