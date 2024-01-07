import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RootAccessComponent } from './maps/components/root-access/root-access.component';
import { AddLocationsComponent } from './maps/components/add-locations/add-locations.component';
import { MapViewComponent } from './maps/components/map-view/map-view.component';
import { AuthGuard } from './maps/guards/auth-guard';

const routes: Routes = [
  { path: '', component: MapViewComponent },
  { path: 'root-access', component: RootAccessComponent },
  { path: 'add-locations', component: AddLocationsComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
