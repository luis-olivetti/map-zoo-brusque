import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, mapTo } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { SnackBarComponent } from '../shared/snack-bar/snack-bar.component';
import { MarkerService } from '../services/marker.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { GoogleMap } from '@angular/google-maps';

@Component({
  selector: 'app-marker',
  templateUrl: './marker.component.html',
  styleUrls: ['./marker.component.css'],
})
export class MarkerComponent implements OnInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: GoogleMap;

  public markerForm: FormGroup;
  public apiLoaded: Observable<boolean>;

  public markerOptions: google.maps.MarkerOptions = { draggable: false };
  public markerPosition: google.maps.LatLngLiteral | null = null;

  private durationInSeconds = 2;

  public optionsMap: google.maps.MapOptions = {
    center: { lat: -27.094245073541256, lng: -48.92152550568243 },
    zoom: 19,
    streetViewControl: false,
    disableDefaultUI: true,
    restriction: {
      latLngBounds: {
        north: -27.093225,
        south: -27.095225,
        west: -48.924777834607745,
        east: -48.920469,
      },
      strictBounds: true,
    },
    styles: [
      {
        featureType: 'poi',
        stylers: [{ visibility: 'off' }],
      },
    ],
  };

  public operation: string = 'NEW';

  public imageOptions = [
    { value: 'assets/images/clock.png', url: 'assets/images/clock.png', label: 'Relógio' },
    { value: 'assets/images/star.png', url: 'assets/images/star.png', label: 'Estrela' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private markerService: MarkerService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.apiLoaded = this.httpClient
      .jsonp(
        `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsKey}`,
        'callback'
      )
      .pipe(
        mapTo(true),
        catchError(() => of(false))
      );

    this.markerForm = this.formBuilder.group({
      id: [''],
      name: ['', Validators.required],
      description: ['', Validators.required],
      lat: [0, [Validators.required, this.nonZeroValidator]],
      lng: [0, [Validators.required, this.nonZeroValidator]],
      icon: ['', Validators.required],
    });
  }

  private nonZeroValidator(control: any) {
    const value = control.value;

    if (value === 0) {
      return { nonZero: true };
    }

    return null;
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadMarkerDetails(id);
        this.operation = 'EDIT';
      }
    });
  }

  onMapReady() {
    if (this.mapContainer.googleMap) {
      const mapContainerElement = this.mapContainer.googleMap?.getDiv();

      const ctaLayer = new google.maps.KmlLayer({
        url: 'https://raw.githubusercontent.com/luis-olivetti/map-zoo-brusque/main/src/assets/zoo.kml',
        map: this.mapContainer.googleMap,
        clickable: false,
      });

      ctaLayer.setMap(this.mapContainer.googleMap);

      if (mapContainerElement) {
        if (this.isMobile()) {
          mapContainerElement.style.height = '300px';
          mapContainerElement.style.width = window.innerWidth + 'px';
        } else {
          mapContainerElement.style.height = '500px';
          mapContainerElement.style.width = window.innerWidth + 'px';
        }
      }
    } else {
      console.log('streetViewLayer not set');
    }

    var myloc = new google.maps.Marker({
      clickable: false,
      zIndex: 999,
      map: this.mapContainer.googleMap,
      icon: {
        url: "assets/images/guy.png",
      }
    });

    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(function (pos) {
        const me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        myloc.setPosition(me);
      }, (error) => {
        console.log(error);
      }, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      });
    } else {
      alert("Geolocalização não suportada neste navegador.");
    }
  }

  public addMarker(event: google.maps.MapMouseEvent) {
    if (!event.latLng) {
      return;
    }

    this.markerPosition = event.latLng.toJSON();

    this.markerForm.get('lat')?.setValue(this.markerPosition.lat);
    this.markerForm.get('lng')?.setValue(this.markerPosition.lng);
  }

  private openSnackBar(message: string) {
    const snackBarRef: MatSnackBarRef<SnackBarComponent> =
      this.snackBar.openFromComponent(SnackBarComponent, {
        duration: this.durationInSeconds * 1000,
      });

    const snackBarComponent: SnackBarComponent = snackBarRef.instance;

    snackBarComponent.message = message;
  }

  public definePositionOnLatLngChange() {
    this.markerPosition = {
      lat: this.markerForm.get('lat')?.value,
      lng: this.markerForm.get('lng')?.value,
    };
  }

  public onSubmit() {
    if (this.markerForm.valid) {

      this.definePositionOnLatLngChange();

      if (this.operation === 'EDIT') {
        this.markerService.updateMarker(this.markerForm.value).subscribe(
          () => {
            this.openSnackBar('Registro alterado!');
            setTimeout(() => {
              this.router.navigate(['/marker-list']);
            }, this.durationInSeconds * 1000);
          },
          (error) => {
            this.openSnackBar('Ops, ocorreu uma falha ao alterar.');
          }
        );
      } else {
        this.markerService.createMarker(this.markerForm.value).subscribe(
          () => {
            this.openSnackBar('Registro cadastrado!');
            setTimeout(() => {
              this.router.navigate(['/marker-list']);
            }, this.durationInSeconds * 1000);
          },
          (error) => {
            this.openSnackBar('Ops, ocorreu uma falha ao cadastrar.');
          }
        );
      }
    } else {
      this.openSnackBar('Por favor, preencha todos os campos obrigatórios.');
    }
  }

  private loadMarkerDetails(markerId: number): void {
    this.markerService.getMarkerById(markerId).subscribe(
      (marker) => {
        this.markerForm.patchValue(marker);
        this.markerPosition = {
          lat: marker.lat,
          lng: marker.lng,
        };
      },
      (error) => {
        console.error('Error loading details:', error);
      }
    );
  }

  private isMobile(): boolean {
    return window.innerWidth <= 768; // Defina um ponto de quebra adequado para dispositivos móveis
  }
}
