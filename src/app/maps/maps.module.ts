import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
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
import { MapsRoutingModule } from './maps-routing.module';

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
    MapsRoutingModule,
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    AngularFirestoreModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
  ],
  exports: [
    MapScreenComponent
  ]
})
export class MapsModule { }
