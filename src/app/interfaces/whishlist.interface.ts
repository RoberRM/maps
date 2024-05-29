import { Marker } from "mapbox-gl";

export interface Whishlist {
    id: string,
    coords: [number, number][],
    placeName: string,
    address: string,
    location: string,
    marker: Marker,
    type: string,
    description: string,
    customId: string
}