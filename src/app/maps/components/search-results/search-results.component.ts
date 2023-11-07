import { Component } from '@angular/core';
import { MapService } from 'src/app/services';
import { PlacesService } from '../../services/places.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent {

  constructor( private mapService: MapService, private placesService: PlacesService ) {}

  public getDirections(place?: any) {
    if (!this.placesService.userLocation) throw Error('No hay userLocation');

    const start = this.placesService.userLocation!;
    const end = place.center as [number, number];
    this.mapService.getRouteBetweenPoints(start, end, 'RouteStringSearch', 'black');
  }
}
