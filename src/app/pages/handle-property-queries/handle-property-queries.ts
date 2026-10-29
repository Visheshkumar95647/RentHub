// Import Angular component and lifecycle interface.
import { Component, OnInit } from '@angular/core';

// Import DatePipe to format dates in the template.
import { DatePipe } from '@angular/common';

// Import FormsModule to use ngModel in forms.
import { FormsModule } from '@angular/forms';

// Import RouterLink to navigate between pages.
import { RouterLink } from '@angular/router';

// Import PropertyQuery interface and PropertyService.
import {
  PropertyQuery,
  PropertyService
} from '../../core/services/property.service';

// Import AuthService to get the logged-in user's details.
import { AuthService } from '../../core/services/auth.service';

// Define the standalone component for handling property queries.
@Component({
  selector: 'app-handle-property-queries',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './handle-property-queries.html'
})
export class HandlePropertyQueries implements OnInit {

  // Store the queries received for the landlord's properties.
  queries: PropertyQuery[] = [];

  // Store the search text entered by the landlord.
  searchTerm = '';

  // Show open queries by default.
  selectedStatus: 'all' | 'open' | 'answered' = 'open';

  // Store replies using the query ID as the key.
  replies: Record<string, string> = {};

  // Store success or error messages displayed to the user.
  feedback = '';

  // Track whether the feedback message is an error.
  feedbackError = false;

  // Inject services required to manage queries and user authentication.
  constructor(
    private readonly propertyService: PropertyService,
    private readonly auth: AuthService
  ) {}

  // Run this method when the component is initialized.
  ngOnInit(): void {
    this.loadQueries();
  }

  // Get the current logged-in landlord's ID.
  get landlordId(): string {
    const user = this.auth.getCurrentUser();

    // Return the ID only if the logged-in user is a landlord.
    return user?.role === 'landlord' ? user.id : '';
  }

  // Load queries for all properties owned by this landlord.
  loadQueries(): void {
    // Clear the list if no landlord is logged in.
    if (!this.landlordId) {
      this.queries = [];
      return;
    }

    // Fetch queries based on the landlord ID and selected status.
    this.queries = this.propertyService.getQueriesForLandlord(
      this.landlordId,
      this.selectedStatus
    );
  }

  // Return queries matching the search text.
  get filteredQueries(): PropertyQuery[] {
    // Remove extra spaces and make the search case-insensitive.
    const term = this.searchTerm.trim().toLowerCase();

    // Match the search text against the property title, tenant name, or question.
    return this.queries.filter(query =>
      !term ||
      query.propertyTitle.toLowerCase().includes(term) ||
      query.tenantName.toLowerCase().includes(term) ||
      query.message.toLowerCase().includes(term)
    );
  }

  // Get the total number of queries across all the landlord's properties.
  get totalQueries(): number {
    return this.propertyService.getQueriesForLandlord(
      this.landlordId,
      'all'
    ).length;
  }

  // Get the number of queries that are still unanswered.
  get pendingCount(): number {
    return this.propertyService.getQueriesForLandlord(
      this.landlordId,
      'open'
    ).length;
  }

  // Get the number of queries that have already been answered.
  get answeredCount(): number {
    return this.propertyService.getQueriesForLandlord(
      this.landlordId,
      'answered'
    ).length;
  }

  // Change the selected status filter and reload the queries.
  setStatus(status: 'all' | 'open' | 'answered'): void {
    this.selectedStatus = status;
    this.loadQueries();
  }

  // Submit a reply to a tenant's property query.
  submitReply(query: PropertyQuery): void {

    // Prevent replying to a query that has already been answered.
    if (query.status !== 'open') {
      this.feedback = 'This query has already been answered.';
      this.feedbackError = true;
      this.loadQueries();
      return;
    }

    // Ensure the current user is logged in as a landlord.
    if (!this.landlordId) {
      this.feedback = 'You must be logged in as a landlord to reply.';
      this.feedbackError = true;
      return;
    }

    // Get the reply for this query and remove extra spaces.
    const reply = (this.replies[query.id] ?? '').trim();

    // Do not allow an empty reply.
    if (!reply) {
      this.feedback = 'Please enter a reply before submitting.';
      this.feedbackError = true;
      return;
    }

    // Save the reply through the property service.
    const result = this.propertyService.replyToQuery(
      query.id,
      this.landlordId,
      reply
    );

    // Display an error if the reply could not be saved.
    if (!result) {
      this.feedback = 'Unable to reply. Please refresh and try again.';
      this.feedbackError = true;
      this.loadQueries();
      return;
    }

    // Clear the reply input after successful submission.
    this.replies[query.id] = '';

    // Display a success message.
    this.feedback = 'Reply submitted successfully.';
    this.feedbackError = false;

    // Reload the queries to show the updated status and reply.
    this.loadQueries();
  }
}