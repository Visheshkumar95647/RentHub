
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../core/models/property.model';
import { PropertyCard } from '../../shared/components/property-card/property-card';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [FormsModule, RouterLink, PropertyCard],
  templateUrl: './user-dashboard.html'
})
export class UserDashboard implements OnInit {
  properties: Property[] = [];
  favourites = new Set<string>();

  // Search and filters
  searchQuery = '';
  selectedCity = '';
  minRent: number | null = null;
  maxRent: number | null = null;
  selectedBedrooms: number | '' = '';
  selectedAmenities: string[] = [];
  amenityInput = '';
  sortBy = 'newest';

  // Amenity selector
  showAllSelectedAmenities = false;
  readonly amenityDisplayLimit = 5;
  readonly amenitySuggestionLimit = 10;

  // Pagination
  currentPage = 1;
  pageSize = 3;

  // Featured carousel
  featuredStartIndex = 0;

  // Landlord promotion
  promotionMessage = '';
  feedback = '';
  feedbackError = false;

  constructor(
    private readonly auth: AuthService,
    private readonly propertyService: PropertyService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // The homepage is public. Guests can browse and filter properties.
    this.loadProperties();
  }

  get user() {
    return this.auth.getCurrentUser();
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get isLandlord(): boolean {
    return this.user?.role === 'landlord';
  }

  get promotionStatus(): string | undefined {
    return this.user?.promotionStatus;
  }

  loadProperties(): void {
    this.properties = this.propertyService.getAllProperties();

    // Load favourites for the currently logged-in user only.
    const user = this.user;

    this.favourites = new Set(
      user
        ? this.propertyService.getFavourites(user.id)
        : []
    );

    this.currentPage = Math.min(
      this.currentPage,
      Math.max(1, this.totalPages)
    );

    if (this.featuredStartIndex >= this.featuredProperties.length) {
      this.featuredStartIndex = 0;
    }
  }

  // Smoothly scroll to the actual property listings.
  scrollToProperties(): void {
    const target = document.getElementById('explore');

    if (!target) {
      return;
    }

    const headerOffset = 90;
    const targetPosition =
      target.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({
      top: Math.max(0, targetPosition),
      behavior: 'smooth'
    });
  }

  // Featured properties
  get featuredProperties(): Property[] {
    return [...this.properties]
      .sort((a, b) => b.monthlyRent - a.monthlyRent)
      .slice(0, 6);
  }

  get featuredCarouselItems(): Property[] {
    const featured = this.featuredProperties;

    if (featured.length <= 3) {
      return featured;
    }

    return Array.from(
      { length: 3 },
      (_, index) =>
        featured[(this.featuredStartIndex + index) % featured.length]
    );
  }

  nextFeatured(): void {
    const count = this.featuredProperties.length;

    if (count > 1) {
      this.featuredStartIndex =
        (this.featuredStartIndex + 1) % count;
    }
  }

  previousFeatured(): void {
    const count = this.featuredProperties.length;

    if (count > 1) {
      this.featuredStartIndex =
        (this.featuredStartIndex - 1 + count) % count;
    }
  }

  // Favourites — isolated by user ID
  get favouriteProperties(): Property[] {
    return this.properties.filter(
      property => this.favourites.has(property.id)
    );
  }

  toggleFavourite(propertyId: string): void {
    const user = this.user;

    // Guests must log in before saving favourites.
    if (!user) {
      this.requireLogin();
      return;
    }

    // Save the favourite against the current user's ID.
    this.propertyService.toggleFavourite(user.id, propertyId);

    // Refresh only the current user's favourites.
    this.favourites = new Set(
      this.propertyService.getFavourites(user.id)
    );
  }

  isFavourite(propertyId: string): boolean {
    return this.favourites.has(propertyId);
  }

  // Redirect guests to login before protected actions.
  requireLogin(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    }
  }

  // Cities
  get cities(): string[] {
    return [
      ...new Set(
        this.properties
          .map(property => property.city?.trim())
          .filter((city): city is string => !!city)
      )
    ].sort((a, b) => a.localeCompare(b));
  }

  // Available amenities
  get availableAmenities(): string[] {
    return [
      ...new Set(
        this.properties.flatMap(property => property.amenities ?? [])
      )
    ].sort((a, b) => a.localeCompare(b));
  }

  get filteredAmenityOptions(): string[] {
    const query = this.amenityInput.trim().toLowerCase();

    return this.availableAmenities
      .filter(amenity =>
        !query || amenity.toLowerCase().includes(query)
      )
      .slice(0, this.amenitySuggestionLimit);
  }

  get visibleSelectedAmenities(): string[] {
    return this.showAllSelectedAmenities
      ? this.selectedAmenities
      : this.selectedAmenities.slice(0, this.amenityDisplayLimit);
  }

  get hiddenSelectedAmenitiesCount(): number {
    return Math.max(
      0,
      this.selectedAmenities.length - this.amenityDisplayLimit
    );
  }

  addAmenity(): void {
    const amenity = this.amenityInput.trim();

    if (!amenity) {
      return;
    }

    const alreadySelected = this.selectedAmenities.some(
      item => item.toLowerCase() === amenity.toLowerCase()
    );

    if (!alreadySelected) {
      this.selectedAmenities = [...this.selectedAmenities, amenity];
    }

    this.amenityInput = '';
    this.showAllSelectedAmenities = false;
    this.applyFilters();
  }

  toggleAmenity(amenity: string): void {
    const existing = this.selectedAmenities.find(
      item => item.toLowerCase() === amenity.toLowerCase()
    );

    if (existing) {
      this.selectedAmenities = this.selectedAmenities.filter(
        item => item !== existing
      );
    } else {
      this.selectedAmenities = [...this.selectedAmenities, amenity];
    }

    this.applyFilters();
  }

  removeAmenity(amenity: string): void {
    this.selectedAmenities = this.selectedAmenities.filter(
      item => item !== amenity
    );

    this.applyFilters();
  }

  clearAmenities(): void {
    this.selectedAmenities = [];
    this.showAllSelectedAmenities = false;
    this.amenityInput = '';
    this.applyFilters();
  }

  // Filter and sort properties
  get filteredProperties(): Property[] {
    const query = this.searchQuery.trim().toLowerCase();

    const filtered = this.properties.filter(property => {
      const matchesQuery =
        !query ||
        (property.title ?? '').toLowerCase().includes(query) ||
        (property.city ?? '').toLowerCase().includes(query) ||
        (property.location ?? '').toLowerCase().includes(query) ||
        (property.description ?? '').toLowerCase().includes(query);

      const matchesCity =
        !this.selectedCity || property.city === this.selectedCity;

      const matchesMinRent =
        this.minRent === null ||
        this.minRent === 0 ||
        property.monthlyRent >= this.minRent;

      const matchesMaxRent =
        this.maxRent === null ||
        this.maxRent === 0 ||
        property.monthlyRent <= this.maxRent;

      const matchesBedrooms =
        this.selectedBedrooms === '' ||
        property.bedrooms === Number(this.selectedBedrooms);

      const propertyAmenities = (property.amenities ?? []).map(
        amenity => amenity.toLowerCase()
      );

      const matchesAmenities = this.selectedAmenities.every(
        amenity => propertyAmenities.includes(amenity.toLowerCase())
      );

      return (
        matchesQuery &&
        matchesCity &&
        matchesMinRent &&
        matchesMaxRent &&
        matchesBedrooms &&
        matchesAmenities
      );
    });

    return filtered.sort((a, b) => {
      if (this.sortBy === 'rent-low') {
        return a.monthlyRent - b.monthlyRent;
      }

      if (this.sortBy === 'rent-high') {
        return b.monthlyRent - a.monthlyRent;
      }

      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.filteredProperties.length / this.pageSize);
  }

  get paginatedProperties(): Property[] {
    const start = (this.currentPage - 1) * this.pageSize;

    return this.filteredProperties.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get firstVisibleResult(): number {
    return this.filteredProperties.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get lastVisibleResult(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredProperties.length
    );
  }

  applyFilters(): void {
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  changePageSize(value: string | number): void {
    const size = Number(value);

    if (![3, 6, 9].includes(size)) {
      return;
    }

    this.pageSize = size;
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCity = '';
    this.minRent = null;
    this.maxRent = null;
    this.selectedBedrooms = '';
    this.selectedAmenities = [];
    this.amenityInput = '';
    this.sortBy = 'newest';
    this.currentPage = 1;
    this.showAllSelectedAmenities = false;
  }

  // Property details
  viewDetails(propertyId: string): void {
    this.router.navigate(['/property-details', propertyId]);
  }

  // Landlord promotion request
  requestPromotion(): void {
    if (!this.isLoggedIn) {
      this.requireLogin();
      return;
    }

    const message = this.promotionMessage.trim();

    if (message.length < 10) {
      this.feedback = 'Please enter at least 10 characters.';
      this.feedbackError = true;
      return;
    }

    const result = this.auth.requestLandlordPromotion(message);

    this.feedback = result.message;
    this.feedbackError = !result.success;

    if (result.success) {
      this.promotionMessage = '';
    }
  }

  logout(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
