import { Injectable } from "@angular/core";
import { HttpClient, HttpHandler, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class DirectionsApiClient extends HttpClient {

    public baseUrl: string = 'https://api.mapbox.com/directions/v5/mapbox/driving';
    constructor( handler: HttpHandler ) {
        super(handler)
    }

    public override get<T>(url: string) {
        url = this.baseUrl + url;

        return super.get<T>(url, {
            params: {
                alternatives: false,
                geometries: 'geojson',
                language: 'es',
                overview: 'simplified',
                steps: true,
                access_token: 'pk.eyJ1IjoiaGFzY2hlbGwiLCJhIjoiY2xvOGRkc2I5MDA1ZTJrcXFvY3Y4czB6eiJ9.SLGgLTFgBhwDoK_eiQBBxw'
            }
        })
    }
}