import { Component, OnDestroy } from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { Subject, takeUntil, tap } from 'rxjs';
import { IDayData } from 'src/app/interfaces/day.interface';
import { LocalizationsService, MapService } from 'src/app/services';
import { PlacesService } from '../../services/places.service';

@Component({
  selector: 'app-map-screen',
  templateUrl: './map-screen.component.html',
  styleUrls: ['./map-screen.component.scss']
})
export class MapScreenComponent implements OnDestroy {
  private unsubscribe$ = new Subject<void>();
  public showLoading: boolean = true;

  constructor( private placesService: PlacesService, private readonly _localizationsService: LocalizationsService, private readonly _mapService: MapService ) {
    this._localizationsService.checkUserSession().pipe(
      takeUntil(this.unsubscribe$),
      tap((response: {email: string, data: IDayData[], whishlist: any}) => {
        this.showLoading = false;
        if (response?.data && response?.data?.length > 0) {
          const parsed: IDayData[] = this._handleData(response.data);
          this.datesSelected = parsed;
          this._mapService.allowSave = false;
          this.showModal = false;
        }
        if (response.whishlist) {
          const listParsed = response.whishlist.map((list: any) => {
            const item = {
              coords: JSON.parse(list.coords),
              placeName: list.placeName,
              marker: this._mapService.getMarker(JSON.parse(list.coords)[0], 'whishlist')
            }
            return item
          });
          this._mapService.whishlist = listParsed;
        }
      }),
    ).subscribe();
  }

  public showModal: boolean = true;
  public datesSelected!: IDayData[];

  get isUserLocationReady() {
    return this.placesService.isUserLocationReady;
  }

  public selectDates(event: any) {
    this.showModal = false;
    this.datesSelected = event;
  }

  public mouseLeave() {
    this._mapService.saveSelection();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private _handleData(data: IDayData[]): IDayData[] {
    const parsedData: IDayData[] = data;

    parsedData.map(data => {
      if (data.date instanceof Timestamp) {
        data.date = new Date(data.date.seconds * 1000);
      }
      if (data.wishlist) {
        data.wishlist = JSON.parse(data.wishlist);
        data.wishlist.map((item: any) => {
          item.coords = JSON.parse(item.coords);
          item.marker = this._mapService.getMarker(item.coords[0], 'location')
        })
      }
      data.markers = [];
    });
    return parsedData
  }
}
