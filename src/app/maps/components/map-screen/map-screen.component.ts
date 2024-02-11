import { Component } from '@angular/core';
import { PlacesService } from '../../services/places.service';
import { IDayData } from 'src/app/interfaces/day.interface';

@Component({
  selector: 'app-map-screen',
  templateUrl: './map-screen.component.html',
  styleUrls: ['./map-screen.component.scss']
})
export class MapScreenComponent {

  constructor( private placesService: PlacesService ) {}

  public showModal: boolean = true;
  public datesSelected!: IDayData[];

  get isUserLocationReady() {
    return this.placesService.isUserLocationReady;
  }

  public selectDates(event: any) {
    this.showModal = false;
    this.datesSelected = event;
  }

}
