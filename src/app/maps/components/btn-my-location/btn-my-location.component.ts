import { Component } from '@angular/core';
import { LocalizationsService, MapService } from 'src/app/services';
import { PlacesService } from '../../services/places.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-btn-my-location',
  templateUrl: './btn-my-location.component.html',
  styleUrls: ['./btn-my-location.component.scss']
})
export class BtnMyLocationComponent {

  constructor( private placesService: PlacesService, private mapService: MapService, private localizationService: LocalizationsService ) {}

  public postNewLocation(location? : any) {

    if (!this.placesService.isUserLocationReady) throw Error('No hay ubicación de usuario');
    if (!this.mapService.isMapReady) throw Error('No hay mapa disponible');

    this.mapService.flyTo(this.placesService.userLocation!)

    if (!location) {
      console.log('No hay location para añadir')
      return
    }

    this.localizationService.postFirestoreLocalization(location).pipe(
      tap(response => console.log('HECHO -> ', response))
    ).subscribe();
  }
}
