import { EventEmitter, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AnySourceData, LngLatBounds, LngLatLike, Map, Marker, Popup } from 'mapbox-gl';
import { tap } from 'rxjs';
import { CURRENTCOLORS, imageBaseUrl, imageTypeMapping } from '../consts/util.const';
import { ILocation } from '../interfaces/data.interface';
import { IDayData } from '../interfaces/day.interface';
import { DirectionsResponse, Route } from '../interfaces/directions.interface';
import { Localization } from '../interfaces/localizations.interface';
import { Whishlist } from '../interfaces/whishlist.interface';
import { DirectionsApiClient } from '../maps/api';
import { LocalizationsService } from './localizations.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private _map: Map | undefined;
  private _markers: Marker[] = [];
  private _routeMarkers: Marker[] = [];
  private _addedRouteIds = new Set<string>();
  private _selectedDay!: IDayData;
  private _dates: IDayData[] = [];
  private _places!: ILocation[];
  private _userLocation!: [number, number];
  private _wishlist: Whishlist[] = [];
  private _route: Route[] = [];
  private _saveChanges: boolean = false;
  private _imageBaseUrl = imageBaseUrl;

  public showArrows = new EventEmitter<number>();

  get isMapReady() {
    return !!this._map;
  }

  public set selectedDay(day: IDayData) {
    this._selectedDay = day;
    if (this._addedRouteIds.size !== 0) {
      this.clearRouteIds();
    }
    document.querySelector('.mapboxgl-popup')?.remove();
    this._dates.filter(d => d !== this._selectedDay).forEach(date => {
      date.isSelected = false
    })
    const currentDate = this._dates.find(d => d === this._selectedDay);
    if (currentDate) currentDate.isSelected = true;
    if (currentDate && currentDate.wishlist.length > 1) {
      this._checkDirections();
    } else {
      this._centerMap();
    }
  }

  public get selectedDay() {
    return this._selectedDay
  }

  public get selectedDayIndex() {
    return this.dates.findIndex(date => date.isSelected);
  }

  public get dates() {
    return this._dates;
  }

  public get whishlist() {
    return this._wishlist;
  }

  public set whishlist(value: Whishlist[]) {
    this._wishlist = value;
  }

  public set dates(dates: IDayData[]) {
    this._dates = dates;
  }

  public set allowSave(value: boolean) {
    this._saveChanges = value;
  }

  public set routeMarkers(routeMarkers: Marker[]) {
    this._routeMarkers = routeMarkers;
  }
  
  constructor( 
    private directionsApiClient: DirectionsApiClient, 
    private snackBar: MatSnackBar, 
    private localizationsService: LocalizationsService ) {}
  
  setMap(map: Map) {
    this._map = map;
  }
  
  flyTo(coords: LngLatLike) {
    if(!this.isMapReady) throw Error('El mapa no está inicializado');
    
    this._map?.flyTo({
      zoom: 14,
      center: coords
    })
  }

  public saveSelection() {
    const currentUserEmail = localStorage.getItem('email');
    if (!currentUserEmail || !this._saveChanges) {
      return
    }

    const selectionToSave = this._dates.map(date => {
      return {
        date: date.date, 
        isSelected: date.isSelected, 
        weekDay: date.weekDay, 
        wishlist: JSON.stringify(date.wishlist.map((item: any) => {
          return { coords: JSON.stringify(item.coords), name: item.name, placeType: item.type, placeId: item.placeId ?? item.id, description: item.description }
        })),
        markers: JSON.stringify(date.markers)
      }
    })

    const whishlistToSave = this.whishlist.map((whish: Whishlist) => {
      return {
        placeName: whish.placeName,
        customId: whish.customId,
        description: whish.description ?? '',
        coords: JSON.stringify(whish.coords),
        marker: {}
      } as unknown as Whishlist
    })

    this.localizationsService.saveSelection(selectionToSave, whishlistToSave, currentUserEmail).pipe(
      tap(() => {
        this._saveChanges = false;
        localStorage.removeItem("favorites");
      })
    ).subscribe();
  }

  public wishlistFromSelectedDay(wishlist: Whishlist[]) {
    const currentDate = this._dates.find(d => d === this._selectedDay);
    if (currentDate) {
      currentDate.wishlist = wishlist;
    } 
  }

  public resetMarkersFromPlaces() {
    this._markers.forEach(marker => marker.remove());
  }

  public addToRouteFromWhishlist(item: Whishlist, day: IDayData) {
    this._saveChanges = true;
    const currentItem: any = this._places.find(place => place.name === item.placeName)
    this._checkDirections(item.coords, item.placeName, item.marker, day, currentItem!.type, currentItem!.customId);
  }

  public getPlaceData(placeName: string) {
    const place = this._places.find(place => place.name === placeName);
    if (place) {
      return place
    }
    return
  }

  public createMarkersFromPlaces(places: any[], userLocation: [number, number]) {
    if (!this._map) throw Error('Mapa no inicializado');
    this._markers.forEach(marker => marker.remove());
    const newMarkers = [];
    this._places = places;
    this._userLocation = userLocation;

    const addToRoute = (coords: [number, number][], placeName: string, marker: Marker, placeType: string, placeId: string, description: string, hasImage: boolean) => {
      if (!this._selectedDay) {
        this._showNotification('Añade al menos dos puntos a la lista de deseos para calcular la ruta.');
        return
      }
      this._saveChanges = true;
      this._checkDirections(coords, placeName, marker, undefined,  placeType, placeId, description, hasImage);
    };

    const addToWhishlist = (id: string, coords: [number, number][], placeName: string, marker: Marker, address: string, location: string, type: string, customId: string, description: string, hasImage: boolean) => {
      const idx = this._wishlist.findIndex(item => item.id === id);
      if (idx !== -1) {
        return
      }
      this._wishlist.push({id, coords, placeName, marker, address, location, type, customId, description, hasImage});
      this._saveChanges = true;
      this.saveSelection();
    }

    for (const place of places) {

      const [lng, lat] = [place.coords[0], place.coords[1]];
      let el = document.createElement('div');
      el.id  = place.id;
      const placeType = place.type;
      el.className = `marker ${placeType}-marker`;

      let popupContent = place.description ? 
       `<h6 id="placeName">${place.name}</h6>
        <span class="description">${place.description}</span>
        <span>${place.adress}</span>
        <br>
        <span>${place.phoneNumber}</span>
         ${place.infoUrl ? 
          `<span class="center-button">
            <button target onclick="window.open('${place.infoUrl}','_blank')">Ver más</button>
          </span>` : ''}
        <div class="popup-buttons">
          <button id="add-to-route" disabled>Añadir a día seleccionado</button>
          <span class="material-icons heart" id="add-to-wishlist" title="Añadir a favoritos" style="cursor: not-allowed;">favorite</span>
        </div>`
      : `<h6 id="placeName">${place.name}</h6>
        ${place.description ? `<span class="description">${place.description}</span>` : ''}
        <span>${place.adress}</span>
        <br>
        <span>${place.phoneNumber}</span>
        ${place.infoUrl ? 
          `<span class="center-button">
            <button target onclick="window.open('${place.infoUrl}','_blank')">Ver más</button>
          </span>`
          : ''}
        <div class="popup-buttons">
          <button id="add-to-route" disabled>Añadir a día seleccionado</button>
          <span class="material-icons heart" id="add-to-wishlist" title="Añadir a favoritos" style="cursor: not-allowed;">favorite</span>
        </div>
      `;

      let popup = new Popup().setHTML(`<div class="custom-popup">${popupContent}</div>`)

      // TODO ver como se comporta el marcador de Mapbox al hacer zoom para que los custom funcionen igual
      const newMarker = new Marker(/* this._createCustomMarker(place.type) */)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(this._map);

      newMarker.getElement()
        .addEventListener('click', () => {
            setTimeout(() => {
              const placeName = document.getElementById('placeName');
              let hasImage = true;
              if (placeName) {
                const imgElement = document.createElement('img');
                imgElement.src = `${this._imageBaseUrl}/${imageTypeMapping[place.type]}/${place.customId}.jpg`;
                imgElement.id = place.customId;
                placeName.parentNode?.insertBefore(imgElement, placeName.nextSibling);

                const slowLoadTimeout = setTimeout(() => {
                  // console.warn("Carga lenta: la imagen está tardando en cargarse.");
                  imgElement.src = '';
                  imgElement.remove();
                  hasImage = false;
                  this._enableButtons();
                }, 1500);

                imgElement.onload = () => {
                  clearTimeout(slowLoadTimeout);
                  placeName.parentNode?.insertBefore(imgElement, placeName.nextSibling);
                  const handleClickOutside = function (event: any) {
                      const customPopup = document.querySelector('.custom-popup');
                      if (customPopup && !customPopup.contains(event.target)) {
                          imgElement.remove();
                          document.removeEventListener('click', handleClickOutside);
                      }
                  };
                  document.addEventListener('click', handleClickOutside);
                  this._enableButtons();
                };
              }

              setTimeout(() => {
                const checkImage = document.getElementsByTagName("img")[0];
                if (checkImage) {
                  const currentWidth = checkImage.clientWidth || checkImage.width;
                  const currentHeight = checkImage.clientHeight || checkImage.height;
                  if (!checkImage.id || checkImage.id === 'logo' || (currentWidth !== 100 && currentHeight < 50)) {
                    checkImage.parentNode?.removeChild(checkImage);
                    hasImage = false;
                  }
                } else {
                  hasImage = false;
                }
                place.hasImage = hasImage;
              }, 60)

              const add = document.querySelector("#add-to-route");
              if (add instanceof HTMLButtonElement) {
                add.onclick = function() {
                  addToRoute([[lng, lat]], place.name, newMarker, place.type, place.customId, place.description, place.hasImage);
                  document.querySelector('.mapboxgl-popup')?.remove();
                }
              }
              const whishlist = document.querySelector("#add-to-wishlist");
              if (whishlist instanceof HTMLElement) {
                whishlist.onclick = function() {
                  addToWhishlist(place.id, [[lng, lat]], place.name, newMarker, place.adress, place.location, place.type, place.customId, place.description, place.hasImage)
                  document.querySelector('.mapboxgl-popup')?.remove();
                }
              }
              if (!placeName) {
                this._enableButtons();
              }
            }, 160)
        });
      newMarkers.push(newMarker);
    }
    this._markers = newMarkers;

    const currentUserWhishlist = localStorage.getItem('favorites');
    if (currentUserWhishlist) {
      const list: string[] = JSON.parse(currentUserWhishlist);
      list.forEach((element: string) => {
        const place: Localization = this.getPlaceData(element) as unknown as Localization;
        if (place) {
          const favorite: Whishlist = {
            id: place.id,
            coords: place.coords,
            placeName: place.name,
            address: place.adress,
            location: place.location,
            type: place.type,
            customId: place.customId,
            description: place.description,
            marker: this.getMarker(place.coords as unknown as number[])!,
            hasImage: place.hasImage
          }
          this.whishlist.push(favorite)
        }
      });
      this._saveChanges = true;
    }

    if (places.length === 0) return;
    // * Ajustar mapa a los marcadores mostrados
    this._centerMap();
  }

  public getMarker(coords: number[]) {
    const idx = this._markers.findIndex((marker: Marker) => marker.getLngLat().lat === coords[1] && marker.getLngLat().lng === coords[0])
    if (idx !== -1) {
      return this._markers[idx]
    }
    return undefined
  }

  private _enableButtons() {
    setTimeout(() => {
      const addToRouteBtn = document.getElementById('add-to-route') as HTMLButtonElement;
      const addToWishlistSpan = document.getElementById('add-to-wishlist') as HTMLSpanElement;
      if (addToRouteBtn) {
          addToRouteBtn.disabled = false;
      }
      if (addToWishlistSpan) {
          addToWishlistSpan.style.cursor = 'pointer';
          addToWishlistSpan.classList.remove('disabled');
      }
    }, 80);
  }

  private _centerMap() {
    const bounds = new LngLatBounds();
    this._markers.forEach(marker => bounds.extend(marker.getLngLat()));
    bounds.extend(this._userLocation);

    this._map?.fitBounds(bounds, {
      padding: 100
    });
  }

  public _showNotification(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000, 
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }

  private _checkDirections(coords?: [number, number][], placeName?: string, marker?: Marker, day?: IDayData, placeType?: string, placeId?: string, description?: string, hasImage?: boolean) {
    const dayToHandle = day ?? this._selectedDay;
    const currentDayIndex = this._dates.findIndex(d => d === dayToHandle);
    const currentDate = this._dates[currentDayIndex];
    const colorIndex = (currentDayIndex % 6 + 6) % 6;
    
    if (currentDate) {
      if (!!coords && !!placeName) {
        currentDate.wishlist.push({coords: coords, name: placeName, marker: marker!, type: placeType, id: placeId, description: description, hasImage: hasImage});
        if (marker) this._routeMarkers.push(marker);
      }
      this.showArrows.emit(currentDate.wishlist.length);
      if (currentDate.wishlist.length > 1) {
        if (this._addedRouteIds.size !== 0) {
          this.clearRouteIds();
        }
        currentDate.wishlist.forEach((item: Whishlist) => {
          const found = this._routeMarkers.find(marker => marker === item.marker)
          if (!found) this._routeMarkers.push(item.marker)
        });
        this._calculateRouteRecursively(currentDate.wishlist.map((item: Whishlist) => item.coords), colorIndex);
        setTimeout(() => {
          this.generateReport();
        }, 800);
      }
    }
  }

  private _createCustomMarker(placeType: string) {
    const marker = document.createElement('div');
    marker.className = `${placeType}-marker`;
    return marker as HTMLElement;
  }

  public recalculateDirections() {
     this._checkDirections(); 
  }

  public clearRouteIds() {
    this._route = [];
    this._routeMarkers = [];
    this._addedRouteIds.forEach(id => {
      if (this._map?.getLayer(id)) {
          this._map.removeLayer(id);
          this._map.removeSource(id);
      }
    });
    this._addedRouteIds.clear();
  }

  private _calculateRouteRecursively(routeList: [number, number][], colorIndex: number) {
    if (routeList.length < 2) return;

    const start = routeList[0];
    const end = routeList[1];
    if (start && end) {
      const id = `RouteString_${start.join(',')}_${end.join(',')}`;
      this.getRouteBetweenPoints(start, end, id, CURRENTCOLORS[colorIndex]);
      this._calculateRouteRecursively(routeList.slice(1), colorIndex);
    }
  }

  public getRouteBetweenPoints( start: [number, number], end: [number, number], id: string, color: string) {
    this._route = [];
    this.directionsApiClient.get<DirectionsResponse>(`/${start.join(',')};${end.join(',')}`)
      .pipe(
        tap(resp => {
          this._route.push(resp.routes[0]);
          this.drawPolyline(id, color);
          const bounds = new LngLatBounds();
          this._routeMarkers.forEach(routeMarker => bounds.extend(routeMarker?.getLngLat()));
          this._map?.fitBounds(bounds, {
            padding: 200,
          });
        })
      )
      .subscribe()
  }

  private drawPolyline(id: string, color: string ) {
    if( !this._map ) throw Error('Mapa no inicializado');
    this._route.forEach((route: Route) => {
      this._addedRouteIds.add(id);  
      const sourceData: AnySourceData = {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: route.geometry.coordinates,
              },
            },
          ],
        },
      };
  
      // * Limpia la ruta previa
      if (this._map?.getLayer(id)) {
        this._map.removeLayer(id);
        this._map.removeSource(id);
      }
      this._map?.addSource(id, sourceData);
      this._map?.addLayer({
        id: id,
        type: 'line',
        source: id,
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': color,
          'line-width': 3,
        },
      });
    });
  }

  public generateReport() {
    const explainedRoute: { route: number, instructions?: {duration: number, distance: number, maneuver: string}, totalDistance: number, totalDuration: number, destination?: string }[] = [];
    this._route = this.removeDuplicatedByProperty(this._route);
    this._route.forEach((route, index) => {
      route.legs.forEach(element => {
        element.steps.forEach(step => {
          const instruction: {
            duration: number, 
            distance: number, 
            maneuver: string
          } = {
            duration: step.duration,
            distance: step.distance / 1000, // km
            maneuver: step.maneuver.instruction
          }
          // * totalDistance en km, totalDuration en minutos
          explainedRoute.push({route: index, instructions: instruction, totalDistance: route.distance/1000, totalDuration: route.duration})
        })
      });
    })
    return explainedRoute
  }

  public removeDuplicatedByProperty(arrayOfObjects: any[]) {
    const uniqueArray = arrayOfObjects.filter((obj, index, self) => {
      return index === self.findIndex((innerObj) => {
        return JSON.stringify(innerObj) === JSON.stringify(obj);
      });
    });
  
    return uniqueArray;
  }
}
