import { Routes } from '@angular/router';
import { AlbumListComponent } from './components/album-list/album-list.component';
import { AlbumDetailComponent } from './components/album-detail/album-detail.component';
import { PhotoViewerComponent } from './components/photo-viewer/photo-viewer.component';

export const routes: Routes = [
    { path: 'albums', component: AlbumListComponent },
  { path: 'albums/:id', component: AlbumDetailComponent },
  { path: 'viewer/:albumId/:photoId', component: PhotoViewerComponent },
  { path: '', redirectTo: '/albums', pathMatch: 'full' }
];
