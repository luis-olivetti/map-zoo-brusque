import { Component, OnDestroy, OnInit } from '@angular/core';
import { MarkerService } from '../services/marker.service';
import { Marker } from '../models/marker';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { SnackBarComponent } from '../shared/snack-bar/snack-bar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-marker-list',
  templateUrl: './marker-list.component.html',
  styleUrls: ['./marker-list.component.css'],
})
export class MarkerListComponent implements OnInit, OnDestroy {
  private markersSubscription!: Subscription;
  private durationInSeconds = 5;
  public markers: Marker[] = [];
  public displayedColumns: string[] = [
    'id',
    'name',
    'actions',
  ];

  constructor(
    private markersService: MarkerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.markersSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.getMarkers();
  }

  private getMarkers(): void {
    this.markersSubscription = this.markersService
      .getMarkers()
      .subscribe((markers) => {
        this.markers = markers;
      });
  }

  public editMarker(marker: Marker): void {
    const id = marker.id;
    this.router.navigate(['/marker', id]);
  }

  public deleteMarker(marker: Marker): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: 'Tem certeza de que deseja excluir este registro?',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.markersService.deleteMarker(marker.id).subscribe(
          () => {
            this.openSnackBar('Registro removido.');
            this.getMarkers();
          },
          (error) => {
            this.openSnackBar('Ops, ocorreu uma falha ao excluir.');
          }
        );
      }
    });
  }

  private openSnackBar(message: string) {
    const snackBarRef: MatSnackBarRef<SnackBarComponent> =
      this.snackBar.openFromComponent(SnackBarComponent, {
        duration: this.durationInSeconds * 1000,
      });

    const snackBarComponent: SnackBarComponent = snackBarRef.instance;

    snackBarComponent.message = message;
  }
}
