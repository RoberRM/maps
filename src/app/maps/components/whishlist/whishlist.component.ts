import { DatePipe } from '@angular/common';
import { Component, LOCALE_ID } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
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
  public whishlist = this.mapService.whishlist;
  public dates = this.mapService.dates;
  public showDatesMap: { [key: string]: boolean } = {};
  constructor(public dialogRef: MatDialogRef<WhishlistComponent>, private mapService: MapService) {}

  public addToRoute(item: any, day: any) {
    this.mapService.addToRouteFromWhishlist(item, day);
  }

  public showAvailableDates(item: any) {
    this.showDatesMap[item.placeName] = !this.showDatesMap[item.placeName];
  }

  public remove(index: number) {
    if (index >= 0 && index < this.whishlist.length) {
      this.whishlist.splice(index, 1);
      this.mapService.whishlist.splice(index, 1);
    }
  }

  public close(): void {
    this.dialogRef.close();
  }
}
