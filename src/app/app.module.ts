import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './angular-material/angular-material.module';
import { AppRoutingModule } from './app-routing.module';
import { TruckComponent } from './truck/truck.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { HTTP_INTERCEPTORS, HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { TrucksOnMapComponent } from './trucks-on-map/trucks-on-map.component';
import { SnackBarComponent } from './shared/snack-bar/snack-bar.component';
import { TruckListComponent } from './truck-list/truck-list.component';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { HeaderMenuComponent } from './header-menu/header-menu.component';
import { FooterComponent } from './footer/footer.component';
import { CorsInterceptor } from './cors.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    TruckComponent,
    TrucksOnMapComponent,
    SnackBarComponent,
    TruckListComponent,
    ConfirmDialogComponent,
    HeaderMenuComponent,
    FooterComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    AppRoutingModule,
    RouterModule,
    ReactiveFormsModule,
    GoogleMapsModule,
    HttpClientModule,
    HttpClientJsonpModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CorsInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
