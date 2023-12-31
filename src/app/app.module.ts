import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapsModule } from './maps/maps.module';
import { RootAccessComponent } from './maps/components/root-access/root-access.component';
import { AddLocationsComponent } from './maps/components/add-locations/add-locations.component';

@NgModule({
  declarations: [
    AppComponent,
    RootAccessComponent,
    AddLocationsComponent
  ],
  imports: [
    BrowserModule,
    MapsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
