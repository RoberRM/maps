import { Injectable } from '@angular/core';
import { initializeApp } from '@angular/fire/app';
import { Firestore, collectionData, getFirestore } from '@angular/fire/firestore';
import { addDoc, collection } from 'firebase/firestore';
import { BehaviorSubject, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { JsonService } from './json.service';

@Injectable({
  providedIn: 'root'
}) 
export class LocalizationsService {

  private localizationsSubject = new BehaviorSubject<any>(null);
  localizations$ = this.localizationsSubject.asObservable();

  private app = initializeApp(environment.firebaseConfig);
  private db = getFirestore(this.app);

  constructor(private firestore: Firestore, private jsonService: JsonService) { }

  /**
   * Get localizations
   */
  public getLocalizations(): Observable<any> {
    const placesRef = collection(this.db, 'localizations');
    const otro = collectionData(placesRef, {idField: 'id'})
    return otro.pipe(
      tap(response => this.localizationsSubject.next(response)),
      switchMap(() => this.localizationsSubject.asObservable())
    )
  }

  /**
   * Get localizations from Firestore
   */
    public postFirestoreLocalization(): Observable<any> {

      return of(this.jsonService.getJsonData().pipe(
        tap(response => {
          const locTest = response;
    
          const fixedLocations: any = [];
          locTest.forEach((item: any) => {
            const coordenadas = item.coords.split(', ').map(parseFloat);
            item.coords = [coordenadas[1], coordenadas[0]] as any;
            fixedLocations.push(item)
          })
          console.log('fixedLocations: ', fixedLocations)
    
          const localizationRef = collection(this.firestore, 'localizations');
          fixedLocations.forEach((item: any) => {
            addDoc(localizationRef, item)
          }) 
    
          return of(null)
        })
      ).subscribe());

    }

}
