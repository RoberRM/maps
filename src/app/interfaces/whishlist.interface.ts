import { Marker } from "mapbox-gl";

export interface Whishlist {
    coords: [number, number][],
    placeName: string,
    marker: Marker
}