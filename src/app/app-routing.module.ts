import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkerComponent } from './marker/marker.component';
import { RouterModule, Routes } from '@angular/router';
import { MapWithMarkersComponent } from './map-with-markers/map-with-markers.component';
import { MarkerListComponent } from './marker-list/marker-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'map-with-markers',
    pathMatch: 'full',
  },
  {
    path: 'marker',
    component: MarkerComponent,
  },
  {
    path: 'marker/:id',
    component: MarkerComponent,
  },
  {
    path: 'map-with-markers',
    component: MapWithMarkersComponent,
  },
  {
    path: 'marker-list',
    component: MarkerListComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(routes)],
})
export class AppRoutingModule {}
