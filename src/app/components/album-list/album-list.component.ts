// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { RouterModule } from '@angular/router';
// import { Album } from '../../models/album.model';
// import { StorageService } from '../../services/storage.service';

// @Component({
//   selector: 'app-album-list',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterModule],
//   templateUrl: './album-list.component.html',
// })
// export class AlbumListComponent {
//   albums: Album[] = [];
//   newAlbumName: string = '';
//   showDeleteDialog: boolean = false;
//   albumToDelete: Album | null = null;
//   editingAlbumId: string | null = null; // Track which album is being edited
//   albumEditName: string = ''; // Temporary storage for editing name

//   constructor(private storageService: StorageService) {
//     this.albums = this.storageService.getAlbums();
//   }

//   addAlbum(): void {
//     if (this.newAlbumName.trim()) {
//       const newAlbum: Album = {
//         id: Date.now().toString(),
//         name: this.newAlbumName.trim(),
//         createdDate: new Date(),
//         photos: [],
//       };
//       this.albums.push(newAlbum);
//       this.storageService.saveAlbums(this.albums);
//       this.newAlbumName = '';
//     }
//   }

//   startEditing(album: Album): void {
//     this.editingAlbumId = album.id;
//     this.albumEditName = album.name; // Pre-fill with current name
//   }

//   saveEdit(album: Album): void {
//     if (this.albumEditName.trim() && this.editingAlbumId === album.id) {
//       album.name = this.albumEditName.trim();
//       this.storageService.saveAlbums(this.albums);
//     }
//     this.cancelEdit();
//   }

//   cancelEdit(): void {
//     this.editingAlbumId = null;
//     this.albumEditName = '';
//   }

//   openDeleteDialog(album: Album): void {
//     this.albumToDelete = album;
//     this.showDeleteDialog = true;
//   }

//   confirmDelete(): void {
//     if (this.albumToDelete) {
//       this.albums = this.albums.filter((a) => a.id !== this.albumToDelete!.id);
//       this.storageService.saveAlbums(this.albums);
//       this.closeDeleteDialog();
//     }
//   }

//   closeDeleteDialog(): void {
//     this.showDeleteDialog = false;
//     this.albumToDelete = null;
//   }
// }
import { Component, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Album } from '../../models/album.model';
import { StorageService } from '../../services/storage.service';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-album-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './album-list.component.html',
})
export class AlbumListComponent implements AfterViewInit {
  albums: Album[] = [];
  newAlbumName: string = '';
  showEditModal: boolean = false;
  albumToEdit: Album | null = null;
  albumEditName: string = '';
  editModalInstance: Modal | null = null;

  constructor(private storageService: StorageService) {
    this.albums = this.storageService.getAlbums();
  }

  ngAfterViewInit(): void {
    const editModalElement = document.getElementById('editModal');
    if (editModalElement) {
      this.editModalInstance = new Modal(editModalElement);
    }
  }

  addAlbum(): void {
    if (this.newAlbumName.trim()) {
      const newAlbum: Album = {
        id: Date.now().toString(),
        name: this.newAlbumName.trim(),
        createdDate: new Date(),
        photos: [],
      };
      this.albums.push(newAlbum);
      this.storageService.saveAlbums(this.albums);
      this.newAlbumName = '';
    }
  }

  openEditModal(album: Album): void {
    this.albumToEdit = album;
    this.albumEditName = album.name;
    this.showEditModal = true;
    if (this.editModalInstance) {
      this.editModalInstance.show();
    }
  }

  saveEdit(): void {
    if (this.albumToEdit && this.albumEditName.trim()) {
      this.albumToEdit.name = this.albumEditName.trim();
      this.storageService.saveAlbums(this.albums);
      this.closeEditModal();
    }
  }

  closeEditModal(): void {
    this.showEditModal = false;
    if (this.editModalInstance) {
      this.editModalInstance.hide();
    }
    this.albumToEdit = null;
    this.albumEditName = '';
  }

  closeEditModalOnBackdrop(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.closeEditModal();
    }
  }

  deleteAlbum(album: Album): void {
    this.albums = this.albums.filter((a) => a.id !== album.id);
    this.storageService.saveAlbums(this.albums);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.showEditModal) {
      if (event.key === 'Enter') {
        this.saveEdit();
      } else if (event.key === 'Escape') {
        this.closeEditModal();
      }
    }
  }
}
