import { LatLngExpression } from "leaflet";

export interface ILocation {
    coords: LatLngExpression,
    location: string,
    name: string,
    id: string,
    type: string,
}