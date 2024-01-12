import { Injectable } from '@angular/core';
import { initializeApp } from '@angular/fire/app';
import { GoogleAuthProvider } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, collectionData, getFirestore } from '@angular/fire/firestore';
import { addDoc, collection } from 'firebase/firestore';
import { BehaviorSubject, Observable, catchError, from, of, switchMap, tap } from 'rxjs';
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

  constructor(private afAuth: AngularFireAuth, private firestore: Firestore, private jsonService: JsonService) { }

  /**
   * Get localizations
   */
  public getLocalizations(): Observable<any> {
    const placesRef = collection(this.db, 'localizations');
    const data = collectionData(placesRef, {idField: 'id'})
    return data.pipe(
      tap(response => this.localizationsSubject.next(response)),
      switchMap(() => this.localizationsSubject.asObservable())
    )
  }

  /**
   * Get localizations from Firestore
   */
  public postFirestoreLocalization(): Observable<any> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.handleAuthenticatedUser();
        } else {
          return this.signInAndRetry();
        }
      }),
      catchError(error => {
        console.error('Error en la autenticación o subida de datos: ', error);
        return of(null);
      })
    );
  }

  private handleAuthenticatedUser(): Observable<any> {
    return this.jsonService.getJsonData().pipe(
      tap(response => {
        const locTest = response;
            
        const fixedLocations: any = [];
        locTest.forEach((item: any) => {
          const coordenadas = item.coords.split(', ').map(parseFloat);
          item.coords = [coordenadas[1], coordenadas[0]] as any;
          fixedLocations.push(item)
        })
        const localizationRef = collection(this.firestore, 'localizations');
        fixedLocations.forEach((item: any) => {
          addDoc(localizationRef, item)
        }) 
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  private signInAndRetry(): Observable<any> {
    return from(this.afAuth.signInWithPopup(new GoogleAuthProvider())).pipe(
      switchMap(() => {
        return this.postFirestoreLocalization();
      }),
      catchError(() => {
        return of(null);
      })
    );
  }
}
