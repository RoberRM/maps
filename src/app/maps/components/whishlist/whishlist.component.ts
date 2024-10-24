import { DatePipe } from '@angular/common';
import { Component, LOCALE_ID } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { IDayData } from 'src/app/interfaces/day.interface';
import { Whishlist } from 'src/app/interfaces/whishlist.interface';
import { MapService } from 'src/app/services';

@Component({
  selector: 'app-whishlist',
  templateUrl: './whishlist.component.html',
  styleUrls: ['./whishlist.component.scss'],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'es' }
  ]
})
export class WhishlistComponent {
  public whishlist: Whishlist[] = this._mapService.whishlist;
  public dates = this._mapService.dates;
  public showDatesMap: { [key: string]: boolean } = {};
  private _shouldSave: boolean = false;
  constructor(public dialogRef: MatDialogRef<WhishlistComponent>, private readonly _mapService: MapService) {}

  public addToRoute(item: Whishlist, day: IDayData) {
    this._mapService.addToRouteFromWhishlist(item, day);
  }

  public showAvailableDates(item: Whishlist) {
    this.showDatesMap[item.placeName] = !this.showDatesMap[item.placeName];
  }

  public remove(index: number) {
    if (index >= 0 && index < this.whishlist.length) {
      this.whishlist.splice(index, 1);
      this._shouldSave = true;
    }
  }

  public close(): void {
    if (this._shouldSave) {
      this._mapService.whishlist = this.whishlist;
      this._mapService.allowSave = true;
      this._mapService.saveSelection();
    }
    this.dialogRef.close();
  }

}
