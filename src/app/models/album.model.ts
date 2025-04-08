// src/app/models/album.model.ts
export interface Album {
    id: string;
    name: string;
    createdDate: Date;
    photos: Photo[];
  }
  
  // src/app/models/photo.model.ts
  export interface Photo {
    id: string;
    url: string;
    title: string;
    dateAdded: Date;
    isFavorite: boolean;
    tags?: string[];
  }