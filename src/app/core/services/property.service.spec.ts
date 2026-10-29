
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PropertyService } from './property.service';
import { Property } from '../models/property.model';

describe('PropertyService', () => {
  let service: PropertyService;

  const property1 = {
    id: 'property-1',
    title: 'Modern Apartment',
    landlordId: 'landlord-1',
    landlordName: 'Landlord One',
    city: 'Gurgaon',
    monthlyRent: 20000,
    createdAt: '2026-01-01T00:00:00.000Z'
  } as Property;

  const property2 = {
    id: 'property-2',
    title: 'Family Home',
    landlordId: 'landlord-2',
    landlordName: 'Landlord Two',
    city: 'Delhi',
    monthlyRent: 30000,
    createdAt: '2026-01-02T00:00:00.000Z'
  } as Property;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [PropertyService]
    });

    service = TestBed.inject(PropertyService);
  });

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return an empty array when no properties exist', () => {
    expect(service.getAllProperties()).toEqual([]);
  });

  it('should return all stored properties', () => {
    localStorage.setItem(
      'renthub_properties',
      JSON.stringify([property1, property2])
    );

    expect(service.getAllProperties()).toHaveLength(2);
  });

  it('should return an empty array when stored property data is invalid', () => {
    localStorage.setItem('renthub_properties', 'invalid-json');

    expect(service.getAllProperties()).toEqual([]);
  });

  it('should find a property by its ID', () => {
    localStorage.setItem(
      'renthub_properties',
      JSON.stringify([property1, property2])
    );

    expect(service.getPropertyById('property-1')?.title)
      .toBe('Modern Apartment');
  });

  it('should return null when a property does not exist', () => {
    expect(service.getPropertyById('unknown-property')).toBeNull();
  });

  it('should return properties belonging to a specific landlord', () => {
    localStorage.setItem(
      'renthub_properties',
      JSON.stringify([property1, property2])
    );

    expect(service.getPropertiesByLandlord('landlord-1'))
      .toHaveLength(1);

    expect(
      service.getPropertiesByLandlord('landlord-1')[0].id
    ).toBe('property-1');
  });

  it('should return an empty array for a landlord without properties', () => {
    localStorage.setItem(
      'renthub_properties',
      JSON.stringify([property1, property2])
    );

    expect(service.getPropertiesByLandlord('landlord-3'))
      .toEqual([]);
  });

  it('should return an empty favourites list for a new user', () => {
    expect(service.getFavourites('user-1')).toEqual([]);
  });

  it('should add a property to a user favourites list', () => {
    localStorage.setItem(
      'renthub_properties',
      JSON.stringify([property1])
    );

    service.toggleFavourite('user-1', 'property-1');

    expect(service.getFavourites('user-1'))
      .toContain('property-1');
  });

  it('should remove a property from favourites when toggled again', () => {
    localStorage.setItem(
      'renthub_properties',
      JSON.stringify([property1])
    );

    service.toggleFavourite('user-1', 'property-1');
    service.toggleFavourite('user-1', 'property-1');

    expect(service.getFavourites('user-1')).toEqual([]);
  });

  it('should keep favourites separate for different users', () => {
    localStorage.setItem(
      'renthub_properties',
      JSON.stringify([property1])
    );

    service.toggleFavourite('user-1', 'property-1');

    expect(service.getFavourites('user-1')).toContain('property-1');
    expect(service.getFavourites('user-2')).toEqual([]);
  });

  it('should not add a nonexistent property to favourites', () => {
    service.toggleFavourite('user-1', 'unknown-property');

    expect(service.getFavourites('user-1')).toEqual([]);
  });
});
