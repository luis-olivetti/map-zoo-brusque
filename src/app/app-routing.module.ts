import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruckComponent } from './truck/truck.component';
import { RouterModule, Routes } from '@angular/router';
import { TrucksOnMapComponent } from './trucks-on-map/trucks-on-map.component';
import { TruckListComponent } from './truck-list/truck-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'trucks-on-map',
    pathMatch: 'full',
  },
  {
    path: 'truck',
    component: TruckComponent,
  },
  {
    path: 'truck/:id',
    component: TruckComponent,
  },
  {
    path: 'trucks-on-map',
    component: TrucksOnMapComponent,
  },
  {
    path: 'truck-list',
    component: TruckListComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(routes)],
})
export class AppRoutingModule {}
