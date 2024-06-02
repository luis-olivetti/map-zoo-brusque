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

  private durationInSeconds = 1;
  private centerMe: boolean = false;

  public optionsMap: google.maps.MapOptions = {
    center: { lat: -27.094245073541256, lng: -48.92152550568243 },
    zoom: 25,
    minZoom: 20,
    maxZoom: 30,
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
    { value: 'assets/images/icons/bird.png', label: 'Pássaro' },
    { value: 'assets/images/icons/block.png', label: 'Bloqueado' },
    { value: 'assets/images/icons/cat.png', label: 'Gato' },
    { value: 'assets/images/icons/clock.png', label: 'Relógio' },
    { value: 'assets/images/icons/duck.png', label: 'Pato' },
    { value: 'assets/images/icons/food.png', label: 'Comida' },
    { value: 'assets/images/icons/fox.png', label: 'Raposa' },
    { value: 'assets/images/icons/monkey.png', label: 'Macaco' },
    { value: 'assets/images/icons/owl.png', label: 'Coruja' },
    { value: 'assets/images/icons/paw.png', label: 'Pata' },
    { value: 'assets/images/icons/pig.png', label: 'Porco' },
    { value: 'assets/images/icons/snake.png', label: 'Cobra' },
    { value: 'assets/images/icons/star.png', label: 'Estrela' },
    { value: 'assets/images/icons/tree.png', label: 'Árvore' },
    { value: 'assets/images/icons/wc.png', label: 'Banheiro' },
    { value: 'assets/images/icons/wood.png', label: 'Madeira' },
    { value: 'assets/images/icons/turtle.png', label: 'Tartaruga' },
    { value: 'assets/images/icons/trip.png', label: 'Trilha' },
    { value: 'assets/images/icons/ticket.png', label: 'Ingresso' },
    { value: 'assets/images/icons/peacock.png', label: 'Pavão' },
    { value: 'assets/images/icons/anteater.png', label: 'Tamanduá' },
    { value: 'assets/images/icons/cave.png', label: 'Gruta' },
    { value: 'assets/images/icons/crocodile.png', label: 'Jacaré' },
    { value: 'assets/images/icons/furao.png', label: 'Furão' },
    { value: 'assets/images/icons/handgrip.png', label: 'Balanço' },
    { value: 'assets/images/icons/iguana.png', label: 'Iguana' },
    { value: 'assets/images/icons/jabuti.png', label: 'Jabuti' },
    { value: 'assets/images/icons/macaw.png', label: 'Arara' },
    { value: 'assets/images/icons/monkey2.png', label: 'Macaco 2' },
    { value: 'assets/images/icons/parrot.png', label: 'Papagaio' },
    { value: 'assets/images/icons/tapir.png', label: 'Anta' },
    { value: 'assets/images/icons/toucan.png', label: 'Tucano' },
    { value: 'assets/images/icons/alpaca.png', label: 'Lhama' },
    { value: 'assets/images/icons/bird2.png', label: 'Pássaro 2' },
    { value: 'assets/images/icons/capybara.png', label: 'Capivara' },
    { value: 'assets/images/icons/gaviao.png', label: 'Gavião' },
    { value: 'assets/images/icons/golden-lion-tamarin.png', label: 'Mico Leão' },
    { value: 'assets/images/icons/hedgehog.png', label: 'Ouriço' },
    { value: 'assets/images/icons/parrot2.png', label: 'Papagaio 2' },
    { value: 'assets/images/icons/parrot3.png', label: 'Papagaio 3' },
    { value: 'assets/images/icons/parrot4.png', label: 'Papagaio 4' },
    { value: 'assets/images/icons/puma.png', label: 'Puma' },
    { value: 'assets/images/icons/piramide.png', label: 'Pirâmide' },
    { value: 'assets/images/icons/sundial.png', label: 'Relógio de Sol' },
    { value: 'assets/images/icons/quati.png', label: 'Quati' },
    { value: 'assets/images/icons/cat2.png', label: 'Gato 2' },
    { value: 'assets/images/icons/monkey3.png', label: 'Macaco 3' },
    { value: 'assets/images/icons/monkey4.png', label: 'Macaco 4' },
    { value: 'assets/images/icons/plant.png', label: 'Planta' },
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

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadMarkerDetails(id);
        this.operation = 'EDIT';
      }
    });

    this.orderImages();
  }

  onMapReady() {
    if (this.mapContainer.googleMap) {

      this.addCustomControl();

      this.mapContainer.googleMap.setZoom(30);

      const mapContainerElement = this.mapContainer.googleMap?.getDiv();

      const ctaLayer = new google.maps.KmlLayer({
        url: 'https://raw.githubusercontent.com/luis-olivetti/map-zoo-brusque/main/src/assets/final5.kml',
        map: this.mapContainer.googleMap,
        clickable: false,
      });

      ctaLayer.setMap(this.mapContainer.googleMap);

      const resizeMap = () => {
        if (mapContainerElement) {
          mapContainerElement.style.height = this.isMobile() ? '300px' : '500px';
          mapContainerElement.style.width = window.innerWidth + 'px';
        }
      };

      window.addEventListener('resize', resizeMap);
      resizeMap();
    } else {
      console.log('streetViewLayer not set');
    }

    this.centerOnMe();
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
          () => {
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
          () => {
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
    return window.innerWidth <= 768;
  }

  private nonZeroValidator(control: any) {
    const value = control.value;

    if (value === 0) {
      return { nonZero: true };
    }

    return null;
  }

  private addCustomControl() {
    const controlDiv = document.createElement('div');
    const controlUI = document.createElement('div');
    controlDiv.appendChild(controlUI);

    const controlImage = document.createElement('img');
    controlImage.src = 'assets/images/focus-out.png';
    controlImage.style.width = '48px';
    controlImage.style.height = '48px';
    controlImage.style.padding = '5px';
    controlUI.appendChild(controlImage);

    controlUI.addEventListener('click', () => {
      this.toggleCenterMe();
      controlImage.src = this.centerMe ? 'assets/images/focus-in.png' : 'assets/images/focus-out.png';
    });

    if (this.mapContainer.googleMap) {
      this.mapContainer.googleMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
    }
  }

  private toggleCenterMe() {
    this.centerMe = !this.centerMe;
  }

  private centerOnMe() {
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
      watchId = navigator.geolocation.watchPosition((pos) => {
        const me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        myloc.setPosition(me);

        if (this.mapContainer.googleMap && this.centerMe) {
          this.mapContainer.googleMap.setCenter(me);
        }
      }, (error) => {
        console.log(error);
      }, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      });
    } else {
      this.openSnackBar("Geolocalização não suportada neste navegador.");
    }
  }

  private orderImages() {
    this.imageOptions.sort((a, b) => {
      return a.label.localeCompare(b.label);
    });
  }
}
