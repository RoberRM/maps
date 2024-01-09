import { Marker } from "mapbox-gl";

export interface IDayData {
    date: Date,
    weekDay: string,
    isSelected: boolean,
    wishlist: any,
    markers: Marker[]
}