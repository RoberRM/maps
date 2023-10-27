import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  
  public userLocation?: [number, number];
  
  get isUserLocationReady() : boolean {
    return !!this.userLocation;
  }

  constructor() {
    this.getUserLocation();
  }

  public async getUserLocation(): Promise<[number, number]> {
    return new Promise((resolve) => {
      this.userLocation = [ -6.047249409973052, 40.236932582801046 ];
      resolve(this.userLocation)
    })
  }

}
