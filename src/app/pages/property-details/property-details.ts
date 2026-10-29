
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthUser } from '../../core/models/user.model';
import {
  Property,
  PropertyComment
} from '../../core/models/property.model';
import {
  PropertyQuery,
  PropertyService
} from '../../core/services/property.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './property-details.html'
})
export class PropertyDetails implements OnInit {
  property: Property | null = null;
  ownerContact: AuthUser | null = null;

  comments: PropertyComment[] = [];
  commentMessage = '';
  replyMessage = '';
  replyToId: string | null = null;

  queries: PropertyQuery[] = [];
  queryMessage = '';
  queryReplies: Record<string, string> = {};

  feedback = '';
  feedbackError = false;
  queryFeedback = '';
  queryFeedbackError = false;

  isSubmitting = false;
  isSendingQuery = false;
  isFavourite = false;
  isDeleting = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly propertyService: PropertyService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProperty();
  }

  get currentUser(): AuthUser | null {
    return this.authService.getCurrentUser();
  }

  get isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  get isOwner(): boolean {
    return !!(
      this.currentUser &&
      this.property &&
      this.currentUser.role === 'landlord' &&
      this.currentUser.id === this.property.landlordId
    );
  }

  get canSendQuery(): boolean {
    const user = this.currentUser;

    return !!(
      user &&
      user.role === 'user' &&
      this.property &&
      user.id !== this.property.landlordId
    );
  }

  get myQueries(): PropertyQuery[] {
    const user = this.currentUser;
    const property = this.property;

    if (!user || !property) {
      return [];
    }

    return this.queries
      .filter(query =>
        this.isOwner
          ? query.propertyId === property.id &&
            query.landlordId === user.id
          : query.propertyId === property.id &&
            query.tenantId === user.id
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }

  get ownerHasQueries(): boolean {
    return this.myQueries.length > 0;
  }

  get unansweredQueryCount(): number {
    return this.myQueries.filter(query => query.status === 'open').length;
  }

  get ownerEmail(): string {
    return this.ownerContact?.email ?? '';
  }

  get ownerMobile(): string {
    return this.ownerContact?.mobile ?? '';
  }

  get topLevelComments(): PropertyComment[] {
    return this.comments
      .filter(comment => comment.parentId === null)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }

  // ---------- LOAD PROPERTY ----------

  loadProperty(): void {
    const propertyId = this.route.snapshot.paramMap.get('id');

    if (!propertyId) {
      this.property = null;
      return;
    }

    this.property = this.propertyService.getPropertyById(propertyId);

    if (!this.property) {
      return;
    }

    this.loadOwnerContact();
    this.refreshFavourite();
    this.loadComments();
    this.loadQueries();
  }

  loadOwnerContact(): void {
    if (!this.property) {
      this.ownerContact = null;
      return;
    }

    this.ownerContact =
      this.authService.getAllUsers().find(
        user => user.id === this.property?.landlordId
      ) ?? null;
  }

  // ---------- PER-USER FAVOURITES ----------

  refreshFavourite(): void {
    const user = this.currentUser;

    this.isFavourite = !!(
      user &&
      this.property &&
      this.propertyService.isFavourite(user.id, this.property.id)
    );
  }

  toggleFavourite(): void {
    const user = this.currentUser;

    if (!user) {
      this.setFeedback('Please log in to save favourites.', true);
      return;
    }

    if (!this.property) {
      return;
    }

    this.propertyService.toggleFavourite(user.id, this.property.id);
    this.refreshFavourite();

    this.setFeedback(
      this.isFavourite
        ? 'Property added to favourites.'
        : 'Property removed from favourites.',
      false
    );
  }

  // ---------- DELETE PROPERTY ----------

  deleteOwnProperty(): void {
    const user = this.currentUser;
    const property = this.property;

    if (!property || !this.isOwner || this.isDeleting || !user) {
      return;
    }

    if (!confirm('Are you sure you want to delete this property?')) {
      return;
    }

    this.isDeleting = true;

    const deleted = this.propertyService.deleteProperty(
      property.id,
      user.id
    );

    this.isDeleting = false;

    if (deleted) {
      this.router.navigate(['/my-listings']);
    } else {
      this.setFeedback('Unable to delete this property.', true);
    }
  }

  // ---------- PUBLIC COMMENTS AND REPLIES ----------

  loadComments(): void {
    this.comments = this.property
      ? this.propertyService.getComments(this.property.id)
      : [];
  }

  getReplies(commentId: string): PropertyComment[] {
    return this.comments
      .filter(comment => comment.parentId === commentId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );
  }

  isCommentOwner(comment: PropertyComment): boolean {
    return this.currentUser?.id === comment.userId;
  }

  submitComment(): void {
    const user = this.currentUser;
    const property = this.property;
    const message = this.commentMessage.trim();

    if (!user) {
      this.setFeedback('Please log in to comment.', true);
      return;
    }

    if (!property || !message || this.isSubmitting) {
      this.setFeedback('Please enter a comment.', true);
      return;
    }

    this.isSubmitting = true;

    try {
      this.propertyService.addComment(
        property.id,
        user.id,
        user.fullName,
        message,
        null
      );

      this.commentMessage = '';
      this.loadComments();
      this.setFeedback('Your public comment has been posted.', false);
    } catch (error) {
      this.setFeedback(
        error instanceof Error
          ? error.message
          : 'Unable to post comment.',
        true
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  startReply(commentId: string): void {
    if (!this.currentUser) {
      this.setFeedback('Please log in to reply.', true);
      return;
    }

    this.replyToId = commentId;
    this.replyMessage = '';
  }

  cancelReply(): void {
    this.replyToId = null;
    this.replyMessage = '';
  }

  submitReply(parentComment: PropertyComment): void {
    const user = this.currentUser;
    const property = this.property;
    const message = this.replyMessage.trim();

    if (!user) {
      this.setFeedback('Please log in to reply.', true);
      return;
    }

    if (!property || !message) {
      this.setFeedback('Please enter a reply.', true);
      return;
    }

    try {
      this.propertyService.addComment(
        property.id,
        user.id,
        user.fullName,
        message,
        parentComment.id
      );

      this.cancelReply();
      this.loadComments();
      this.setFeedback('Your public reply has been posted.', false);
    } catch (error) {
      this.setFeedback(
        error instanceof Error
          ? error.message
          : 'Unable to post reply.',
        true
      );
    }
  }

  // ---------- PRIVATE QUERIES ----------

  loadQueries(): void {
    this.queries = this.property
      ? this.propertyService.getQueriesForProperty(this.property.id)
      : [];
  }

  sendQuery(): void {
    const user = this.currentUser;
    const property = this.property;
    const message = this.queryMessage.trim();

    if (!user) {
      this.setQueryFeedback(
        'Please log in to send a private query.',
        true
      );
      return;
    }

    if (user.role !== 'user') {
      this.setQueryFeedback(
        'Only tenant accounts can send private queries.',
        true
      );
      return;
    }

    if (!property || !message || this.isSendingQuery) {
      this.setQueryFeedback('Please enter your query.', true);
      return;
    }

    this.isSendingQuery = true;

    try {
      this.propertyService.createQuery(
        property.id,
        user.id,
        user.fullName,
        message
      );

      this.queryMessage = '';
      this.loadQueries();
      this.setQueryFeedback('Your private query has been sent.', false);
    } catch (error) {
      this.setQueryFeedback(
        error instanceof Error
          ? error.message
          : 'Unable to send query.',
        true
      );
    } finally {
      this.isSendingQuery = false;
    }
  }

  replyToQuery(query: PropertyQuery): void {
    const user = this.currentUser;

    if (!this.isOwner || !user) {
      this.setQueryFeedback(
        'Only the property owner can reply.',
        true
      );
      return;
    }

    const reply = (this.queryReplies[query.id] ?? '').trim();

    if (!reply) {
      this.setQueryFeedback('Please enter a reply.', true);
      return;
    }

    try {
      const updated = this.propertyService.replyToQuery(
        query.id,
        user.id,
        reply
      );

      if (!updated) {
        this.setQueryFeedback(
          'Query not found or access denied.',
          true
        );
        return;
      }

      this.queryReplies[query.id] = '';
      this.loadQueries();
      this.setQueryFeedback(
        'Your private reply has been saved.',
        false
      );
    } catch (error) {
      this.setQueryFeedback(
        error instanceof Error
          ? error.message
          : 'Unable to reply to query.',
        true
      );
    }
  }

  // ---------- NAVIGATION ----------

  goBack(): void {
    this.router.navigate(['/user-dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ---------- FEEDBACK ----------

  private setFeedback(message: string, isError: boolean): void {
    this.feedback = message;
    this.feedbackError = isError;
  }

  private setQueryFeedback(message: string, isError: boolean): void {
    this.queryFeedback = message;
    this.queryFeedbackError = isError;
  }
}
