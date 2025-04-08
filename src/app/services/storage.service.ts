// src/app/services/storage.service.ts
import { Injectable } from '@angular/core';
import { Album } from '../models/album.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly ALBUMS_KEY = 'photo_gallery_albums';

  getAlbums(): Album[] {
    return JSON.parse(localStorage.getItem(this.ALBUMS_KEY) || '[]');
  }

  saveAlbums(albums: Album[]): void {
    localStorage.setItem(this.ALBUMS_KEY, JSON.stringify(albums));
  }

  // Add helper methods for CRUD operations
}