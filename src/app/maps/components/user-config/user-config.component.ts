import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CURRENTCOLORS } from 'src/app/consts/util.const';
import { IDayData } from 'src/app/interfaces/day.interface';
import { MapService } from 'src/app/services';
import { MatDialog } from '@angular/material/dialog';
import { WhishlistComponent } from '../whishlist/whishlist.component';

@Component({
  selector: 'app-user-config',
  templateUrl: './user-config.component.html',
  styleUrls: ['./user-config.component.scss']
})
export class UserConfigComponent implements OnChanges {
  @Input() dates: IDayData[] = [];
  public colors = CURRENTCOLORS;
  public isUserInfoVisible: boolean = true;
  public isWhishlistVisible: boolean = false;

  constructor(private mapService: MapService, public dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dates']?.currentValue && this.dates.length > 0) {
      this.dates[0].isSelected = true;
      this.mapService.dates = this.dates;
      this.mapService.selectedDay = this.dates[0];
    }
  }

  public toggleUserInfoVisibility() {
    this.isUserInfoVisible = !this.isUserInfoVisible;
  }

  public showWhishlistPopup() {
    this.isWhishlistVisible = !this.isWhishlistVisible;
    const dialogRef = this.dialog.open(WhishlistComponent, {
      width: '40%',
      height: '50%',
      minWidth: '290px'
    });
  }
}
