import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  moveItemInArray,
  CdkDragHandle,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { Album, Photo } from '../../models/album.model'; // Single import for both interfaces
import { StorageService } from '../../services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-photo-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './photo-viewer.component.html',
})
export class PhotoViewerComponent {
  album?: Album;
  showModal: boolean = false;
  currentPhoto?: Photo;
  photoIndex: number = 0;
  isSlideshowActive: boolean = false;
  slideshowInterval?: any;
  scale: number = 1;
  translateX: number = 0;
  translateY: number = 0;
  isDragging: boolean = false;
  startX: number = 0;
  startY: number = 0;
  albumId: string | null = null; // To store the album ID
  newTag: string = ''; // For tag input

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService,
    private router: Router
  ) {
    this.loadPhoto();
  }

  openModal(): void {
    this.showModal = true;
  }

  // Method to close the modal
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  closeModal(event: Event): void {
    event.stopPropagation(); // Prevent closing when clicking inside modal content
    this.showModal = false;
  }

  private loadPhoto(): void {
    this.albumId = this.route.snapshot.paramMap.get('albumId');
    const photoId = this.route.snapshot.paramMap.get('photoId');
    console.log('Loading photo - albumId:', this.albumId, 'photoId:', photoId); // Debug log

    if (this.albumId && photoId) {
      this.album = this.storageService
        .getAlbums()
        .find((a) => a.id === this.albumId);
      if (this.album) {
        console.log('Album found:', this.album); // Debug log
        this.photoIndex = this.album.photos.findIndex((p) => p.id === photoId);
        if (this.photoIndex !== -1) {
          this.currentPhoto = { ...this.album.photos[this.photoIndex] }; // Create a copy for editing
          console.log('Current Photo:', this.currentPhoto); // Debug log
        } else {
          console.warn('Photo not found in album:', photoId);
          this.router.navigate(['albums', this.albumId]); // Redirect if photo not found
        }
      } else {
        console.warn('Album not found:', this.albumId);
        this.router.navigate(['/albums']); // Redirect if album not found
      }
    } else {
      console.warn('Invalid albumId or photoId:', this.albumId, photoId);
      this.router.navigate(['/albums']); // Redirect if parameters are invalid
    }
  }

  nextPhoto(): void {
    if (this.album && this.currentPhoto) {
      this.photoIndex = (this.photoIndex + 1) % this.album.photos.length;
      this.currentPhoto = { ...this.album.photos[this.photoIndex] };
      if (this.isSlideshowActive) {
        this.resetZoom(); // Keep zoom reset during slideshow
      }
    }
  }

  previousPhoto(): void {
    if (this.album && this.currentPhoto) {
      this.photoIndex =
        (this.photoIndex - 1 + this.album.photos.length) %
        this.album.photos.length;
      this.currentPhoto = { ...this.album.photos[this.photoIndex] };
      if (this.isSlideshowActive) {
        this.resetZoom(); // Keep zoom reset during slideshow
      }
    }
  }
  toggleFavorite(): void {
    if (this.currentPhoto && this.album) {
      this.currentPhoto.isFavorite = !this.currentPhoto.isFavorite;
      this.updatePhotoInAlbum();
    }
  }

  toggleSlideshow(): void {
    if (!this.isSlideshowActive) {
      this.startSlideshow();
    } else {
      this.stopSlideshow();
    }
  }

  startSlideshow(): void {
    this.isSlideshowActive = true;
    this.photoIndex = 0; // Reset to first photo
    this.currentPhoto = { ...this.album!.photos[this.photoIndex] }; // Update to first photo
    this.resetZoom(); // Ensure image is at default size
    this.slideshowInterval = setInterval(() => {
      this.nextPhoto();
    }, 2000);
  }

  stopSlideshow(): void {
    this.isSlideshowActive = false;
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
      this.slideshowInterval = undefined; // Clear reference
    }
    this.resetZoom(); // Reset zoom when stopping
  }

  zoomIn(): void {
    this.scale += 0.1;
    if (this.scale > 3) this.scale = 3;
  }

  zoomOut(): void {
    this.scale -= 0.1;
    if (this.scale < 1) this.scale = 1;
  }

  resetZoom(): void {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
  }

  goBack(): void {
    if (this.albumId) {
      this.router.navigate(['albums', this.albumId]);
    }
  }

  addTag(): void {
    if (this.newTag.trim() && this.currentPhoto && this.album) {
      if (!this.currentPhoto.tags) this.currentPhoto.tags = [];
      if (!this.currentPhoto.tags.includes(this.newTag.trim())) {
        this.currentPhoto.tags.push(this.newTag.trim());
        this.updatePhotoInAlbum();
      }
      this.newTag = ''; // Reset input
    }
  }

  removeTag(tag: string): void {
    if (this.currentPhoto && this.album) {
      this.currentPhoto.tags = this.currentPhoto.tags?.filter((t) => t !== tag);
      this.updatePhotoInAlbum();
    }
  }

  drop(event: CdkDragDrop<Photo[]>): void {
    if (this.album) {
      moveItemInArray(
        this.album.photos,
        event.previousIndex,
        event.currentIndex
      );
      this.updateStorage();
      this.currentPhoto = { ...this.album.photos[this.photoIndex] }; // Update current photo
    }
  }

  private updatePhotoInAlbum(): void {
    if (this.album && this.currentPhoto) {
      this.album.photos[this.photoIndex] = { ...this.currentPhoto };
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

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') this.nextPhoto();
    if (event.key === 'ArrowLeft') this.previousPhoto();
    if (event.key === ' ') {
      event.preventDefault();
      this.toggleSlideshow();
    }
    if (event.key === '+') this.zoomIn();
    if (event.key === '-') this.zoomOut();
    if (event.key === '0') this.resetZoom();
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.startX = event.clientX - this.translateX;
    this.startY = event.clientY - this.translateY;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging && this.scale > 1) {
      this.translateX = event.clientX - this.startX;
      this.translateY = event.clientY - this.startY;
    }
  }

  @HostListener('mouseup')
  onMouseUp(): void {
    this.isDragging = false;
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.isDragging = false;
  }
}
