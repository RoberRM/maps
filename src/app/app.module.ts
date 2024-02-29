import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AddLocationsComponent } from './maps/components/add-locations/add-locations.component';
import { EditLocationComponent } from './maps/components/edit-location/edit-location.component';
import { RootAccessComponent } from './maps/components/root-access/root-access.component';
import { MapsModule } from './maps/maps.module';

@NgModule({
  declarations: [
    AppComponent,
    RootAccessComponent,
    AddLocationsComponent,
    EditLocationComponent
  ],
  imports: [
    BrowserModule,
    MapsModule,
    MatIconModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
