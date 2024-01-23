import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, mapTo } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { SnackBarComponent } from '../shared/snack-bar/snack-bar.component';
import { TruckService } from '../services/truck.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-truck',
  templateUrl: './truck.component.html',
  styleUrls: ['./truck.component.css'],
})
export class TruckComponent implements OnInit {
  public truckForm: FormGroup;
  public apiLoaded: Observable<boolean>;

  public markerOptions: google.maps.MarkerOptions = { draggable: true };
  public markerPosition: google.maps.LatLngLiteral | null = null;

  private durationInSeconds = 2;

  public truckTypes = [
    'Caseira',
    'Italiana',
    'Cafeteria',
    'Bar',
    'Oriental',
    'Mineira',
    'Hamburgueria',
    'Churrascaria',
    'Vegetariana',
    'Lanches',
  ];

  public optionsMap: google.maps.MapOptions = {
    center: { lat: -27.094225, lng: -48.921469 },
    zoom: 15,
    styles: [
      {
        featureType: 'all',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ visibility: 'simplified' }]
      }
    ],
  };

  public operation: string = 'NEW';

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private truckService: TruckService,
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

    this.truckForm = this.formBuilder.group({
      id: [''],
      name: ['', Validators.required],
      address: ['', Validators.required],
      phone: [''],
      email: ['', [Validators.required, Validators.email]],
      lat: ['', Validators.required],
      lng: ['', Validators.required],
      type: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const truckId = params['id'];
      if (truckId) {
        this.loadTruckDetails(truckId);
        this.operation = 'EDIT';
      }
    });
  }

  public addMarker(event: google.maps.MapMouseEvent) {
    if (!event.latLng) {
      return;
    }

    this.markerPosition = event.latLng.toJSON();

    this.truckForm.get('lat')?.setValue(this.markerPosition.lat);
    this.truckForm.get('lng')?.setValue(this.markerPosition.lng);

    this.truckService
      .getAddressFromLatLng(this.markerPosition.lat, this.markerPosition.lng)
      .subscribe(
        (address) => {
          this.truckForm.get('address')?.setValue(address);
        },
        (error) => {
          this.openSnackBar('Ops, ocorreu uma falha ao definir o endereço.');
        }
      );
  }

  private openSnackBar(message: string) {
    const snackBarRef: MatSnackBarRef<SnackBarComponent> =
      this.snackBar.openFromComponent(SnackBarComponent, {
        duration: this.durationInSeconds * 1000,
      });

    const snackBarComponent: SnackBarComponent = snackBarRef.instance;

    snackBarComponent.message = message;
  }

  public onSubmit() {
    if (this.truckForm.valid) {
      if (this.operation === 'EDIT') {
        this.truckService.updateTruck(this.truckForm.value).subscribe(
          () => {
            this.openSnackBar('Truck alterado!');
            setTimeout(() => {
              this.router.navigate(['/truck-list']);
            }, this.durationInSeconds * 1000);
          },
          (error) => {
            this.openSnackBar('Ops, ocorreu uma falha ao alterar.');
          }
        );
      } else {
        this.truckService.createTruck(this.truckForm.value).subscribe(
          () => {
            this.openSnackBar('Truck cadastrado!');
            setTimeout(() => {
              this.router.navigate(['/truck-list']);
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

  private loadTruckDetails(truckId: number): void {
    this.truckService.getTruckById(truckId).subscribe(
      (truck) => {
        this.truckForm.patchValue(truck);
        this.markerPosition = {
          lat: truck.lat,
          lng: truck.lng,
        };
      },
      (error) => {
        console.error('Error loading truck details:', error);
      }
    );
  }
}
