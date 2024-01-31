import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkerComponent } from './marker/marker.component';
import { RouterModule, Routes } from '@angular/router';
import { MapWithMarkersComponent } from './map-with-markers/map-with-markers.component';
import { MarkerListComponent } from './marker-list/marker-list.component';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'map-with-markers',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'marker',
    component: MarkerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'marker/:id',
    component: MarkerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'map-with-markers',
    component: MapWithMarkersComponent,
  },
  {
    path: 'marker-list',
    component: MarkerListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'map-with-markers',
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(routes)],
})
export class AppRoutingModule {}
