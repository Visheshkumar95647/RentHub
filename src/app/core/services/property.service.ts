
import { Injectable } from '@angular/core';
import {
  Property,
  PropertyComment,
  PropertyFormData
} from '../models/property.model';

export interface PropertyQuery {
  id: string;
  propertyId: string;
  propertyTitle: string;
  tenantId: string;
  tenantName: string;
  landlordId: string;
  message: string;
  createdAt: string;
  status: 'open' | 'answered';
  reply: string | null;
  repliedAt: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private readonly PROPERTIES_KEY = 'renthub_properties';
  private readonly FAVOURITES_KEY = 'renthub_favourites';
  private readonly COMMENTS_KEY = 'renthub_property_comments';
  private readonly QUERIES_KEY = 'renthub_property_queries';

  // ---------- PROPERTIES ----------

  getAllProperties(): Property[] {
    try {
      const stored = localStorage.getItem(this.PROPERTIES_KEY);

      if (!stored) {
        return [];
      }

      const properties: unknown = JSON.parse(stored);
      return Array.isArray(properties) ? properties as Property[] : [];
    } catch {
      return [];
    }
  }

  getPropertyById(propertyId: string): Property | null {
    return this.getAllProperties().find(
      property => property.id === propertyId
    ) ?? null;
  }

  getPropertiesByLandlord(landlordId: string): Property[] {
    return this.getAllProperties().filter(
      property => property.landlordId === landlordId
    );
  }

  createProperty(
    data: PropertyFormData,
    landlordId: string,
    landlordName: string
  ): Property {
    const properties = this.getAllProperties();

    const property: Property = {
      ...data,
      id: this.createId(),
      landlordId,
      landlordName,
      createdAt: new Date().toISOString()
    };

    properties.unshift(property);

    localStorage.setItem(
      this.PROPERTIES_KEY,
      JSON.stringify(properties)
    );

    return property;
  }

  updateProperty(
    propertyId: string,
    data: PropertyFormData
  ): Property | null {
    const properties = this.getAllProperties();

    const index = properties.findIndex(
      property => property.id === propertyId
    );

    if (index === -1) {
      return null;
    }

    properties[index] = {
      ...properties[index],
      ...data,
      id: properties[index].id,
      landlordId: properties[index].landlordId,
      landlordName: properties[index].landlordName,
      createdAt: properties[index].createdAt
    };

    localStorage.setItem(
      this.PROPERTIES_KEY,
      JSON.stringify(properties)
    );

    return properties[index];
  }

  deleteProperty(propertyId: string, landlordId: string): boolean {
    const properties = this.getAllProperties();
    const property = properties.find(item => item.id === propertyId);

    if (!property || property.landlordId !== landlordId) {
      return false;
    }

    localStorage.setItem(
      this.PROPERTIES_KEY,
      JSON.stringify(
        properties.filter(item => item.id !== propertyId)
      )
    );

    // Remove the deleted property from every user's favourites.
    const favouritesMap = this.getFavouritesMap();

    for (const userId of Object.keys(favouritesMap)) {
      favouritesMap[userId] = favouritesMap[userId].filter(
        id => id !== propertyId
      );
    }

    this.saveFavouritesMap(favouritesMap);

    localStorage.setItem(
      this.COMMENTS_KEY,
      JSON.stringify(
        this.readAllComments().filter(
          comment => comment.propertyId !== propertyId
        )
      )
    );

    localStorage.setItem(
      this.QUERIES_KEY,
      JSON.stringify(
        this.getAllQueries().filter(
          query => query.propertyId !== propertyId
        )
      )
    );

    return true;
  }

  // ---------- PER-USER FAVOURITES ----------

  /**
   * Storage format:
   * {
   *   "user-id-1": ["property-id-1", "property-id-2"],
   *   "user-id-2": ["property-id-3"]
   * }
   */
  private getFavouritesMap(): Record<string, string[]> {
    try {
      const stored = localStorage.getItem(this.FAVOURITES_KEY);

      if (!stored) {
        return {};
      }

      const parsed: unknown = JSON.parse(stored);

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        // Preserve compatibility with the old shared-array format.
        // Do not assign old favourites to an arbitrary user.
        return {};
      }

      const result: Record<string, string[]> = {};

      for (const [userId, ids] of Object.entries(parsed)) {
        if (Array.isArray(ids)) {
          result[userId] = [
            ...new Set(
              ids.filter((id): id is string => typeof id === 'string')
            )
          ];
        }
      }

      return result;
    } catch {
      return {};
    }
  }

  private saveFavouritesMap(
    favouritesMap: Record<string, string[]>
  ): void {
    localStorage.setItem(
      this.FAVOURITES_KEY,
      JSON.stringify(favouritesMap)
    );
  }

  getFavourites(userId: string): string[] {
    if (!userId) {
      return [];
    }

    return [...(this.getFavouritesMap()[userId] ?? [])];
  }

  toggleFavourite(userId: string, propertyId: string): void {
    if (!userId || !this.getPropertyById(propertyId)) {
      return;
    }

    const favouritesMap = this.getFavouritesMap();
    const userFavourites = favouritesMap[userId] ?? [];

    favouritesMap[userId] = userFavourites.includes(propertyId)
      ? userFavourites.filter(id => id !== propertyId)
      : [...userFavourites, propertyId];

    this.saveFavouritesMap(favouritesMap);
  }

  isFavourite(userId: string, propertyId: string): boolean {
    return this.getFavourites(userId).includes(propertyId);
  }

  getFavouriteProperties(userId: string): Property[] {
    const favouriteIds = new Set(this.getFavourites(userId));

    return this.getAllProperties().filter(
      property => favouriteIds.has(property.id)
    );
  }

  // ---------- PUBLIC COMMENTS AND REPLIES ----------

  getComments(propertyId: string): PropertyComment[] {
    return this.readAllComments().filter(
      comment => comment.propertyId === propertyId
    );
  }

  addComment(
    propertyId: string,
    userId: string,
    userName: string,
    message: string,
    parentId: string | null = null
  ): PropertyComment {
    if (!this.getPropertyById(propertyId)) {
      throw new Error('Property not found.');
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      throw new Error('Comment cannot be empty.');
    }

    const allComments = this.readAllComments();

    if (
      parentId &&
      !allComments.some(
        comment =>
          comment.id === parentId &&
          comment.propertyId === propertyId
      )
    ) {
      throw new Error('Parent comment not found.');
    }

    const comment: PropertyComment = {
      id: this.createId(),
      propertyId,
      userId,
      userName,
      message: trimmedMessage,
      createdAt: new Date().toISOString(),
      parentId
    };

    allComments.push(comment);

    localStorage.setItem(
      this.COMMENTS_KEY,
      JSON.stringify(allComments)
    );

    return comment;
  }

  private readAllComments(): PropertyComment[] {
    try {
      const stored = localStorage.getItem(this.COMMENTS_KEY);

      if (!stored) {
        return [];
      }

      const comments: unknown = JSON.parse(stored);

      return Array.isArray(comments)
        ? comments as PropertyComment[]
        : [];
    } catch {
      return [];
    }
  }

  // ---------- PRIVATE PROPERTY QUERIES ----------

  getAllQueries(): PropertyQuery[] {
    try {
      const stored = localStorage.getItem(this.QUERIES_KEY);

      if (!stored) {
        return [];
      }

      const queries: unknown = JSON.parse(stored);

      return Array.isArray(queries)
        ? queries as PropertyQuery[]
        : [];
    } catch {
      return [];
    }
  }

  getQueriesForProperty(propertyId: string): PropertyQuery[] {
    return this.getAllQueries().filter(
      query => query.propertyId === propertyId
    );
  }

  createQuery(
    propertyId: string,
    tenantId: string,
    tenantName: string,
    message: string
  ): PropertyQuery {
    const property = this.getPropertyById(propertyId);
    const trimmedMessage = message.trim();

    if (!property) {
      throw new Error('Property not found.');
    }

    if (!trimmedMessage) {
      throw new Error('Query cannot be empty.');
    }

    const query: PropertyQuery = {
      id: this.createId(),
      propertyId: property.id,
      propertyTitle: property.title,
      tenantId,
      tenantName,
      landlordId: property.landlordId,
      message: trimmedMessage,
      createdAt: new Date().toISOString(),
      status: 'open',
      reply: null,
      repliedAt: null
    };

    const queries = this.getAllQueries();

    queries.push(query);
    this.saveQueries(queries);

    return query;
  }

  replyToQuery(
    queryId: string,
    landlordId: string,
    reply: string
  ): PropertyQuery | null {
    const trimmedReply = reply.trim();

    if (!trimmedReply) {
      throw new Error('Reply cannot be empty.');
    }

    const queries = this.getAllQueries();

    const index = queries.findIndex(
      query =>
        query.id === queryId &&
        query.landlordId === landlordId
    );

    if (index === -1) {
      return null;
    }

    queries[index] = {
      ...queries[index],
      status: 'answered',
      reply: trimmedReply,
      repliedAt: new Date().toISOString()
    };

    this.saveQueries(queries);

    return queries[index];
  }

  private saveQueries(queries: PropertyQuery[]): void {
    localStorage.setItem(
      this.QUERIES_KEY,
      JSON.stringify(queries)
    );
  }

  private createId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  
  // Get all property queries submitted by a particular user.
  // Works for both normal users and landlords.
  getQueriesByUser(userId: string): PropertyQuery[] {
    if (!userId) {
      return [];
    }

    return this.getAllQueries()
      .filter(query => query.tenantId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }

  // Get queries for every property owned by a landlord.
  // This avoids opening each property individually.
  getQueriesForLandlord(
    landlordId: string,
    status: 'open' | 'answered' | 'all' = 'all'
  ): PropertyQuery[] {
    if (!landlordId) {
      return [];
    }

    return this.getAllQueries()
      .filter(query =>
        query.landlordId === landlordId &&
        (status === 'all' || query.status === status)
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }

}
