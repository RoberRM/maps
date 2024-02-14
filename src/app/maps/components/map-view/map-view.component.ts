import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Map } from 'mapbox-gl';
import { Subject, delay, finalize, of, switchMap, take, takeUntil } from 'rxjs';
import { LocalizationsService } from 'src/app/services';
import { MapService } from '../../../services/map.service';
import { PlacesService } from '../../services/places.service';


@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'C2O Maps';
  lat = 51.678418;
  lng = 7.809007;

  @ViewChild('mapDiv', {static: true}) mapDivElement!: ElementRef;
  private unsubscribe$ = new Subject<void>();

  constructor( 
    private placesService: PlacesService, 
    private mapService: MapService, 
    private localizationsService: LocalizationsService ) {}

  ngOnInit(): void {
    this._getLocalizations();
  }

  ngAfterViewInit(): void {
    if (!this.placesService.userLocation) throw Error('No hay placesService.userLocation');
    const map = new Map({
      container: this.mapDivElement.nativeElement,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: this.placesService.userLocation,
      zoom: 14
    });
    this.mapService.setMap(map);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private _getLocalizations() {
    // this.localizationsService.getLocalizations().pipe(
    this.localizationsService.getPlaces().pipe(
      takeUntil(this.unsubscribe$),
      take(1),
      delay(10),
      switchMap(resp => {
        this.mapService.createMarkersFromPlaces(resp, this.placesService.userLocation!)
        return of(resp)
      }),
      finalize(() => {})
    ).subscribe();
  }

}
