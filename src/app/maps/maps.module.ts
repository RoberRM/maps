import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AngularLogoComponent } from './components/angular-logo/angular-logo.component';
import { BtnMyLocationComponent } from './components/btn-my-location/btn-my-location.component';
import { DayComponent } from './components/day/day.component';
import { FilterComponent } from './components/filter/filter.component';
import { LoadingComponent } from './components/loading/loading.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { MapScreenComponent } from './map-screen/map-screen.component';
import { UserConfigComponent } from './user-config/user-config.component';

@NgModule({
  declarations: [
    MapScreenComponent,
    UserConfigComponent,
    MapViewComponent,
    LoadingComponent,
    BtnMyLocationComponent,
    AngularLogoComponent,
    SearchBarComponent,
    SearchResultsComponent,
    FilterComponent,
    DayComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  exports: [
    MapScreenComponent
  ]
})
export class MapsModule { }
