import { Injectable } from '@angular/core';
import { initializeApp } from '@angular/fire/app';
import { GoogleAuthProvider } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Firestore, collectionData, getFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { addDoc, collection } from 'firebase/firestore';
import { BehaviorSubject, Observable, catchError, from, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ILocation } from '../interfaces/data.interface';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
}) 
export class LocalizationsService {
  private localizationsSubject = new BehaviorSubject<any>(null);
  private currentLocation!: ILocation | null;
  localizations$ = this.localizationsSubject.asObservable();

  private app = initializeApp(environment.firebaseConfig);
  private db = getFirestore(this.app);

  constructor(
    private afAuth: AngularFireAuth, 
    private firestore: Firestore, 
    private localStorageService: LocalStorageService,
    private router: Router
  ) { }

  /**
   * Get localizations
   */
  public getLocalizations(): Observable<any> {
    const cacheDuration = 30 * 60 * 1000; // 30 minutos en milisegundos
    if (localStorage.getItem('lastUpdateTimestamp')) {

      const lastUpdateTimestamp = this.localStorageService.get('lastUpdateTimestamp');
      const isCacheExpired = Date.now() - lastUpdateTimestamp > cacheDuration;      
      if (localStorage.getItem('localizations') && this.localStorageService.get('localizations') && !isCacheExpired) {
        const localizations = this.localStorageService.get('localizations');
        return of(localizations).pipe(
          tap(response => {
            this.localizationsSubject.next(response)
          }),
          switchMap(() => this.localizationsSubject.asObservable())
        )
      }
    }
      
    const placesRef = collection(this.db, 'localizations');
    const data = collectionData(placesRef, {idField: 'id'})
    return data.pipe(
      tap(response => {
        this.localStorageService.set('localizations', JSON.stringify(response));
        this.localStorageService.set('lastUpdateTimestamp', JSON.stringify(Date.now()));
        this.localizationsSubject.next(response)
      }),
      catchError(() => {
        const fromLS = this.localStorageService.get('localizations')
        this.localizationsSubject.next(fromLS)
        return of(fromLS);
      }),
      switchMap(() => this.localizationsSubject.asObservable())
    )
  }

  /**
   * Get localizations from Firestore
   */
  public postFirestoreLocalization(location: ILocation): Observable<any> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          if (this.currentLocation) this.currentLocation = null;
          return this.handleAuthenticatedUser(location);
        } else {
          this.currentLocation = location;
          return this.signInAndRetry();
        }
      }),
      catchError(error => {
        console.error('Error en la autenticación: ', error);
        return of(null);
      })
    );
  }

  public firestoreLogout() {
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/']);
    })
    .catch(e => {
      console.error('No se pudo completar el logout -> ', e)
    })
  }

  private handleAuthenticatedUser(location: any): Observable<any> {
    const fixedLocations: any = [];
    const coordenadas = location.coords.split(', ').map(parseFloat);
    location.coords = [coordenadas[1], coordenadas[0]] as any;
    fixedLocations.push(location);

    const localizationRef = collection(this.firestore, 'localizations');

    return from(
      Promise.all(
        fixedLocations.map((item: ILocation) => addDoc(localizationRef, item))
      )
    ).pipe(
      catchError(e => {
        console.error(location.name, ' no se ha añadido -> ', e);
        return of(null);
      })
    );
  }

  private signInAndRetry(): Observable<any> {
    return from(this.afAuth.signInWithPopup(new GoogleAuthProvider())).pipe(
      switchMap(() => {
        return this.postFirestoreLocalization(this.currentLocation!);
      }),
      catchError(() => {
        return of(null);
      })
    );
  }
}
