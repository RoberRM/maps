import { CommonModule, registerLocaleData } from '@angular/common';
import localeES from "@angular/common/locales/es";
import { NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxPrintModule } from 'ngx-print';
import { environment } from 'src/environments/environment';
import { SecondsToHmsPipe } from '../pipes/seconds-to-hms.pipe';
import { AngularLogoComponent } from './components/angular-logo/angular-logo.component';
import { BtnMyLocationComponent } from './components/btn-my-location/btn-my-location.component';
import { DateSelectorComponent } from './components/date-selector/date-selector.component';
import { DayComponent } from './components/day/day.component';
import { FilterComponent } from './components/filter/filter.component';
import { LoadingComponent } from './components/loading/loading.component';
import { MapScreenComponent } from './components/map-screen/map-screen.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { UserConfigComponent } from './components/user-config/user-config.component';
import { WhishlistComponent } from './components/whishlist/whishlist.component';
import { MapsRoutingModule } from './maps-routing.module';
registerLocaleData(localeES, "es");

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
    DayComponent,
    DateSelectorComponent,
    SecondsToHmsPipe,
    WhishlistComponent
  ],
  imports: [
    MapsRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatCardModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatIconModule,
    MatDialogModule,
    NgxPrintModule,
    AngularFirestoreModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
  ],
  exports: [
    MapScreenComponent
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
  ]
})
export class MapsModule { }
