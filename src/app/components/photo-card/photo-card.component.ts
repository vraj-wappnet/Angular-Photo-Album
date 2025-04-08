import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Photo } from '../../models/album.model';

@Component({
  selector: 'app-photo-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './photo-card.component.html',
})
export class PhotoCardComponent {
  @Input() photo!: Photo;
  @Input() albumId!: string;
  @Output() favoriteToggled = new EventEmitter<string>();

  toggleFavorite(): void {
    this.favoriteToggled.emit(this.photo.id);
  }
}
