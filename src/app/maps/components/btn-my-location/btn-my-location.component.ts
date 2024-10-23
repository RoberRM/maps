import { Component } from '@angular/core';
import { LocalizationsService, MapService } from 'src/app/services';
import { PlacesService } from '../../services/places.service';

@Component({
  selector: 'app-btn-my-location',
  templateUrl: './btn-my-location.component.html',
  styleUrls: ['./btn-my-location.component.scss']
})
export class BtnMyLocationComponent {

  constructor( private readonly _placesService: PlacesService, private readonly _mapService: MapService, private localizationService: LocalizationsService ) {}

  public postNewLocation(location? : any) {

    if (!this._placesService.isUserLocationReady) throw Error('No hay ubicación de usuario');
    if (!this._mapService.isMapReady) throw Error('No hay mapa disponible');

    this._mapService.flyTo(this._placesService.userLocation!)

    if (!location) {
      console.log('No hay location para añadir')
      return
    }

    this.localizationService.postFirestoreLocalization(location).subscribe();
  }
}
