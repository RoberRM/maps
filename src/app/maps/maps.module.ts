import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapScreenComponent } from './map-screen/map-screen.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { LoadingComponent } from './components/loading/loading.component';
import { BtnMyLocationComponent } from './components/btn-my-location/btn-my-location.component';
import { AngularLogoComponent } from './components/angular-logo/angular-logo.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { FilterComponent } from './components/filter/filter.component';
import { UserConfigComponent } from './user-config/user-config.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { DayComponent } from './components/day/day.component';

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
