import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Album, Photo } from '../../models/album.model';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './album-detail.component.html',
})
export class AlbumDetailComponent {
  album?: Album;
  sortBy: 'date' | 'name' = 'date';
  newPhotoUrl: string = '';
  newPhotoTitle: string = '';
  newPhotoTags: string = '';
  editingPhotoId: string | null = null;
  editTitle: string = '';
  editUrl: string = '';
  editTags: string = '';
  filterTag: string = '';
  selectedPhotoIds: string[] = [];
  showModal: boolean = false; // For another modal if needed (e.g., delete confirmation)
  showEditModal: boolean = false; // For the edit modal
  selectedPhoto: Photo | null = null;
  dragPhotoId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService
  ) {
    this.loadAlbum();
  }

  private loadAlbum(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.album = this.storageService.getAlbums().find((a) => a.id === id);
    }
  }

  openModal(photo: Photo): void {
    this.selectedPhoto = { ...photo };
    this.showModal = true;
  }

  closeModal(event: MouseEvent): void {
    event.stopPropagation();
    this.showModal = false;
    this.selectedPhoto = null;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  addPhoto(): void {
    if (this.album && this.newPhotoUrl && this.newPhotoTitle) {
      const photo: Photo = {
        id: Date.now().toString(),
        url: this.newPhotoUrl,
        title: this.newPhotoTitle,
        dateAdded: new Date(),
        isFavorite: false,
        tags: this.getTagsFromString(this.newPhotoTags),
      };
      this.album.photos.push(photo);
      this.updateStorage();
      this.newPhotoUrl = '';
      this.newPhotoTitle = '';
      this.newPhotoTags = '';
    }
  }

  deletePhoto(photoId: string): void {
    if (this.album) {
      this.album.photos = this.album.photos.filter(
        (photo) => photo.id !== photoId
      );
      this.selectedPhotoIds = this.selectedPhotoIds.filter(
        (id) => id !== photoId
      );
      this.updateStorage();
    }
  }

  openEditModal(photo: Photo): void {
    this.editingPhotoId = photo.id;
    this.editTitle = photo.title;
    this.editUrl = photo.url;
    this.editTags = photo.tags?.join(', ') || '';
    this.showEditModal = true;
  }

  closeEditModal(event?: MouseEvent): void {
    if (
      event &&
      (event.target as HTMLElement).classList.contains('edit-modal')
    ) {
      this.showEditModal = false;
      this.editingPhotoId = null;
      this.editTitle = '';
      this.editUrl = '';
      this.editTags = '';
    } else if (!event) {
      this.showEditModal = false;
      this.editingPhotoId = null;
      this.editTitle = '';
      this.editUrl = '';
      this.editTags = '';
    }
  }

  saveEdit(): void {
    if (this.album && this.editingPhotoId) {
      const photo = this.album.photos.find((p) => p.id === this.editingPhotoId);
      if (photo) {
        photo.title = this.editTitle;
        photo.url = this.editUrl;
        photo.tags = this.getTagsFromString(this.editTags);
        this.updateStorage();
      }
      this.closeEditModal();
    }
  }

  sortPhotos(): void {
    if (this.album) {
      this.album.photos.sort((a, b) =>
        this.sortBy === 'date'
          ? b.dateAdded.getTime() - a.dateAdded.getTime()
          : a.title.localeCompare(b.title)
      );
      this.updateStorage();
    }
  }

  filterPhotos(): Photo[] {
    if (!this.album || !this.filterTag) return this.album?.photos ?? [];
    const filterTagLower = this.filterTag.toLowerCase().trim();
    return this.album.photos.filter(
      (photo) =>
        photo.tags?.some((tag) => tag.toLowerCase().includes(filterTagLower)) ??
        false
    );
  }

  togglePhotoSelection(photoId: string): void {
    const index = this.selectedPhotoIds.indexOf(photoId);
    if (index === -1) {
      this.selectedPhotoIds.push(photoId);
    } else {
      this.selectedPhotoIds.splice(index, 1);
    }
  }

  bulkDelete(): void {
    if (this.album && this.selectedPhotoIds.length > 0) {
      this.album.photos = this.album.photos.filter(
        (photo) => !this.selectedPhotoIds.includes(photo.id)
      );
      this.selectedPhotoIds = [];
      this.updateStorage();
    }
  }

  private updateStorage(): void {
    if (this.album) {
      const albums = this.storageService.getAlbums();
      const index = albums.findIndex((a) => a.id === this.album!.id);
      if (index !== -1) {
        albums[index] = this.album;
        this.storageService.saveAlbums(albums);
      }
    }
  }

  onDragStart(event: DragEvent, photoId: string): void {
    this.dragPhotoId = photoId;
    event.dataTransfer?.setData('text/plain', photoId);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetPhotoId: string): void {
    event.preventDefault();
    if (this.album && this.dragPhotoId && this.dragPhotoId !== targetPhotoId) {
      const draggedPhotoIndex = this.album.photos.findIndex(
        (p) => p.id === this.dragPhotoId
      );
      const targetPhotoIndex = this.album.photos.findIndex(
        (p) => p.id === targetPhotoId
      );

      if (draggedPhotoIndex !== -1 && targetPhotoIndex !== -1) {
        const [draggedPhoto] = this.album.photos.splice(draggedPhotoIndex, 1);
        this.album.photos.splice(targetPhotoIndex, 0, draggedPhoto);
        this.updateStorage();
      }
    }
    this.dragPhotoId = null;
  }

  removeTag(tagToRemove: string): void {
    const tagsArray = this.getTagsFromString(this.editTags);
    const index = tagsArray.indexOf(tagToRemove);
    if (index !== -1) {
      tagsArray.splice(index, 1);
      this.editTags = tagsArray.join(', ');
    }
  }

  updateTags(): void {
    // No need to update storage here; handled in saveEdit()
  }

  removeNewTag(tagToRemove: string): void {
    const tagsArray = this.getTagsFromString(this.newPhotoTags);
    const index = tagsArray.indexOf(tagToRemove);
    if (index !== -1) {
      tagsArray.splice(index, 1);
      this.newPhotoTags = tagsArray.join(', ');
    }
  }

  updateNewTags(): void {
    // Display-only update; saving happens in addPhoto()
  }

  private getTagsFromString(tagsString: string): string[] {
    return tagsString
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  get newTagsArray(): string[] {
    return this.getTagsFromString(this.newPhotoTags);
  }

  get editTagsArray(): string[] {
    return this.getTagsFromString(this.editTags);
  }
}
