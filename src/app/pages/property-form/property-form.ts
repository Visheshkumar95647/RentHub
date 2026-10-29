
import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { PropertyService } from '../../core/services/property.service';
import {
  Property,
  PropertyFormData
} from '../../core/models/property.model';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './property-form.html'
})
export class PropertyForm implements OnInit {
  // Form feedback and submission state.
  feedback = '';
  feedbackError = false;
  submitted = false;
  isSubmitting = false;

  // Preview state required by property-form.html.
  showPreview = false;
  previewImages: string[] = [];

  // Property selection options.
  readonly propertyTypes = [
    'Apartment',
    'Independent House',
    'Builder Floor',
    'Studio Apartment',
    'Villa',
    'Penthouse',
    'Room'
  ];

  readonly leaseTypes = [
    'Monthly',
    'Long-term',
    'Short-term'
  ];

  readonly priceModes = [
    'Per month',
    'Per day',
    'Per person'
  ];

  readonly furnishingOptions = [
    'Fully Furnished',
    'Semi Furnished',
    'Unfurnished'
  ];

  readonly availableAmenities = [
    'Parking',
    'Wi-Fi',
    'Balcony',
    'Air Conditioning',
    'Power Backup',
    'Lift',
    'Security',
    'Gym',
    'Swimming Pool',
    'Washing Machine',
    'Refrigerator',
    'Water Supply'
  ];

  // Property form fields.
  propertyType = 'Apartment';
  buildingName = '';
  isShared = false;

  streetAddress = '';
  location = '';
  city = '';

  areaSqFt: number | null = null;
  bedrooms: number | null = 1;
  bathrooms: number | null = 1;

  leaseType = 'Monthly';
  monthlyRent: number | null = null;
  priceMode = 'Per month';
  negotiable = false;

  furnished = 'Unfurnished';
  vegetarianPreference = false;

  selectedAmenities: string[] = [];
  amenitiesText = '';

  title = '';
  description = '';
  imagesText = '';

  // Used to prevent duplicate submissions.
  private existingPropertyId: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    // Only landlords can create or edit property listings.
    const user = this.authService.getCurrentUser();

    if (!user || user.role !== 'landlord') {
      this.router.navigate(['/login']);
      return;
    }

    // Load an existing listing when an ID is present in the URL.
    const propertyId = this.route.snapshot.paramMap.get('id');

    if (propertyId) {
      this.existingPropertyId = propertyId;

      const property = this.propertyService.getPropertyById(propertyId);

      if (!property || property.landlordId !== user.id) {
        this.router.navigate(['/my-listings']);
        return;
      }

      this.populateForm(property);
    }
  }

  // Indicates whether the form is editing an existing listing.
  get isEditMode(): boolean {
    return this.existingPropertyId !== null;
  }

  // Character counter used by the template.
  get descriptionLength(): number {
    return this.description.length;
  }

  // Data displayed in the preview.
  get previewTitle(): string {
    return this.title.trim() || 'Untitled Property';
  }

  get previewAddress(): string {
    return [
      this.streetAddress,
      this.location,
      this.city
    ]
      .filter((part) => part.trim().length > 0)
      .join(', ');
  }

  get previewDescription(): string {
    return this.description.trim();
  }

  get previewAmenities(): string[] {
    return this.getAmenities();
  }

  // Populate the form when editing a saved property.
  private populateForm(property: Property): void {
    const data = property as Property & Record<string, unknown>;

    this.propertyType = String(data['propertyType'] ?? 'Apartment');
    this.buildingName = String(data['buildingName'] ?? '');
    this.isShared = Boolean(data['isShared'] ?? false);

    this.streetAddress = String(data['streetAddress'] ?? '');
    this.location = String(data['location'] ?? '');
    this.city = String(data['city'] ?? '');

    this.areaSqFt = Number(data['areaSqFt'] ?? 0) || null;
    this.bedrooms = Number(data['bedrooms'] ?? 1);
    this.bathrooms = Number(data['bathrooms'] ?? 1);

    this.leaseType = String(data['leaseType'] ?? 'Monthly');
    this.monthlyRent = Number(data['monthlyRent'] ?? 0) || null;
    this.priceMode = String(data['priceMode'] ?? 'Per month');
    this.negotiable = Boolean(data['negotiable'] ?? false);

    this.furnished = String(data['furnished'] ?? 'Unfurnished');
    this.vegetarianPreference = Boolean(
      data['vegetarianPreference'] ?? false
    );

    const amenities = Array.isArray(data['amenities'])
      ? data['amenities'] as string[]
      : [];

    this.selectedAmenities = [...amenities];
    this.amenitiesText = amenities.join(', ');

    this.title = property.title ?? '';
    this.description = property.description ?? '';

    const images = Array.isArray(property.images)
      ? property.images
      : [];

    this.imagesText = images.join('\n');
  }

  // Keep checkbox selections and the text field synchronized.
  isAmenitySelected(amenity: string): boolean {
    return this.selectedAmenities.includes(amenity);
  }

  toggleAmenity(amenity: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedAmenities.includes(amenity)) {
        this.selectedAmenities = [
          ...this.selectedAmenities,
          amenity
        ];
      }
    } else {
      this.selectedAmenities = this.selectedAmenities.filter(
        (item) => item !== amenity
      );
    }

    this.amenitiesText = this.selectedAmenities.join(', ');
  }

  onAmenitiesTextChange(value: string): void {
    this.amenitiesText = value;

    this.selectedAmenities = [
      ...new Set(
        value
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      )
    ];
  }

  private getAmenities(): string[] {
    return [
      ...new Set(
        [
          ...this.selectedAmenities,
          ...this.amenitiesText
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
        ]
      )
    ];
  }

  private getImageUrls(): string[] {
    return this.imagesText
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);
  }

  private areImageUrlsValid(urls: string[]): boolean {
    if (urls.length === 0) {
      return false;
    }

    return urls.every((url) => {
      try {
        const parsed = new URL(url);

        return (
          parsed.protocol === 'http:' ||
          parsed.protocol === 'https:'
        );
      } catch {
        return false;
      }
    });
  }

  // Validate the form before displaying the listing preview.
  openPreview(form: NgForm): void {
    this.submitted = true;
    this.feedback = '';

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.feedback = 'Please complete all required fields before previewing.';
      this.feedbackError = true;
      return;
    }

    const imageUrls = this.getImageUrls();

    if (!this.areImageUrlsValid(imageUrls)) {
      this.feedback =
        'Please provide at least one valid HTTP or HTTPS image URL.';
      this.feedbackError = true;
      return;
    }

    this.previewImages = imageUrls;
    this.showPreview = true;
    this.feedback = '';
  }

  // Return to editing without losing entered values.
  backToEdit(): void {
    this.showPreview = false;
  }

  // Save the property after the landlord confirms the preview.
  submit(form: NgForm): void {
    if (!this.showPreview) {
      this.openPreview(form);
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.submitted = true;

    if (form.invalid) {
      this.showPreview = false;
      form.control.markAllAsTouched();
      this.feedback = 'Please correct the required fields.';
      this.feedbackError = true;
      return;
    }

    const user = this.authService.getCurrentUser();

    if (!user || user.role !== 'landlord') {
      this.feedback = 'Please log in with a landlord account.';
      this.feedbackError = true;
      return;
    }

    const imageUrls = this.getImageUrls();

    if (!this.areImageUrlsValid(imageUrls)) {
      this.showPreview = false;
      this.feedback = 'Please provide valid property image URLs.';
      this.feedbackError = true;
      return;
    }

    // Match the property data shape expected by PropertyService.
    const propertyData = {
      propertyType: this.propertyType,
      buildingName: this.buildingName.trim(),
      isShared: this.isShared,

      streetAddress: this.streetAddress.trim(),
      location: this.location.trim(),
      city: this.city.trim(),

      areaSqFt: Number(this.areaSqFt),
      bedrooms: Number(this.bedrooms),
      bathrooms: Number(this.bathrooms),

      leaseType: this.leaseType,
      monthlyRent: Number(this.monthlyRent),
      priceMode: this.priceMode,
      negotiable: this.negotiable,

      furnished: this.furnished,
      vegetarianPreference: this.vegetarianPreference,

      amenities: this.getAmenities(),
      title: this.title.trim(),
      description: this.description.trim(),
      images: imageUrls
    } as unknown as PropertyFormData;

    this.isSubmitting = true;
    this.feedback = '';

    try {
      if (this.existingPropertyId) {
        const updated = this.propertyService.updateProperty(
          this.existingPropertyId,
          propertyData
        );

        if (!updated) {
          this.feedback = 'Unable to update the property. Please try again.';
          this.feedbackError = true;
          return;
        }

        this.feedback = 'Property updated successfully.';
      } else {
        this.propertyService.createProperty(
          propertyData,
          user.id,
          user.fullName
        );

        this.feedback = 'Property created successfully.';
      }

      // Return to the landlord's listings after a successful save.
      this.router.navigate(['/my-listings']);
    } catch (error) {
      console.error('Unable to save property:', error);
      this.feedback = 'Something went wrong while saving the property.';
      this.feedbackError = true;
    } finally {
      this.isSubmitting = false;
    }
  }

  // Cancel editing or creating and return to the listings page.
  cancel(): void {
    this.router.navigate(['/my-listings']);
  }
}
