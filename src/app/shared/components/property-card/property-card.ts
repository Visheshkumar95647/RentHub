
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Property } from '../../../core/models/property.model';

export type PropertyCardMode =
  | 'browse'
  | 'featured'
  | 'landlord'
  | 'favourites';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './property-card.html'
})
export class PropertyCard {
  @Input({ required: true }) property!: Property;
  @Input() mode: PropertyCardMode = 'browse';
  @Input() isFavourite = false;
  @Input() isDeleting = false;

  @Output() favouriteToggled = new EventEmitter<string>();
  @Output() detailsRequested = new EventEmitter<string>();
  @Output() editRequested = new EventEmitter<Property>();
  @Output() deleteRequested = new EventEmitter<Property>();

  toggleFavourite(): void {
    this.favouriteToggled.emit(this.property.id);
  }

  viewDetails(): void {
    this.detailsRequested.emit(this.property.id);
  }

  editProperty(): void {
    this.editRequested.emit(this.property);
  }

  deleteProperty(): void {
    this.deleteRequested.emit(this.property);
  }
}
