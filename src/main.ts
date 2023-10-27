import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

import Mapboxgl from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"
 
Mapboxgl.accessToken = 'pk.eyJ1IjoiaGFzY2hlbGwiLCJhIjoiY2xvOGRkc2I5MDA1ZTJrcXFvY3Y4czB6eiJ9.SLGgLTFgBhwDoK_eiQBBxw';

if (!navigator.geolocation) {
  alert('Navegador no soporta geolocalización');
  throw new Error('Navegador no soporta geolocalización');
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
