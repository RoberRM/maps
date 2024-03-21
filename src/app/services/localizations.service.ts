import { Injectable } from '@angular/core';
import { GoogleAuthProvider } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { addDoc, collection } from 'firebase/firestore';
import { BehaviorSubject, Observable, catchError, from, of, switchMap, tap } from 'rxjs';
import { DATABASE } from '../consts/util.const';
import { ILocation } from '../interfaces/data.interface';
import { LocalStorageService } from './local-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
}) 
export class LocalizationsService {
  private localizationsSubject = new BehaviorSubject<any>(null);
  private currentLocation!: ILocation | null;
  localizations$ = this.localizationsSubject.asObservable();

  constructor(
    private afAuth: AngularFireAuth, 
    private firestore: Firestore, 
    private angularFirestore: AngularFirestore,
    private localStorageService: LocalStorageService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  public checkUserSession(): Observable<any> {
    const currentUserEmail = localStorage.getItem('email');
    if (currentUserEmail) {
      const localizationRef = this.angularFirestore.collection('user-session', ref => ref.where('email', '==', currentUserEmail));
      return from(localizationRef.get()).pipe(
        catchError(error => {
          console.error('Error fetching documents:', error);
          return of(null);
        }),
        switchMap(snapshot => {
          const doc = snapshot?.docs[0];
          if (doc) {
            return of(doc.data());
          } else {
            console.error('No document found with email:', currentUserEmail);
            return of(null);
          }
        }),
        catchError(error => {
          console.error('Error fetching user session data:', error);
          return of(null);
        })
      );
    } else {
      return of(null);
    }
  }

  public saveSelection(selection: any, whishlist: any, currentUserEmail: string) {
    const newData = {
      email: currentUserEmail,
      data: selection,
      whishlist,
      updatedAt: new Date().toISOString()
    }
    const localizationRef = this.angularFirestore.collection('user-session', ref => ref.where('email', '==', currentUserEmail));
    return this._updateRef(localizationRef, newData, currentUserEmail)
  }

  private _updateRef(localizationRef: AngularFirestoreCollection<unknown>, newData: { email: string, data: any }, currentUserEmail: string) {
    return from(localizationRef.get()).pipe(
      catchError(error => {
        console.error('Error fetching documents:', error);
        return of(null);
      }),
      switchMap(snapshot => {
        const doc = snapshot?.docs[0];
        if (doc) {
          return from(doc.ref.update(newData));
        } else {
          return of(this._addRef(newData))
        }
      }),
      tap(() => {
        // * this._showNotification(`Localización actualizada correctamente: ${newData.email}`);
      }),
      catchError(error => {
        console.error('Error updating document:', error);
        return of(null);
      })
    );
  }

  private _addRef( newData: { email: string, data: any }) {
    const localizationRef = collection(this.firestore, 'user-session');

    return from(addDoc(localizationRef, newData)).pipe(
      tap(() => {
        // this._showNotification(`Localización añadida correctamente: ${location.name}`);
      }),
      catchError(e => {
        console.error(' No se ha añadido -> ', e);
        return of(null);
      })
    );
  }

  /* public getLocalizations(): Observable<any> {
    const cacheDuration = 60 * 60 * 1000; // 60 minutos en milisegundos
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
      return this.angularFirestore.collection('localizations').valueChanges().pipe(
        tap(response => {
          this.localStorageService.set('localizations', JSON.stringify(response));
          this.localStorageService.set('lastUpdateTimestamp', JSON.stringify(Date.now()));
      })
    );
  } */

  /**
   * Get real time localizations
   */
  public getPlaces(): Observable<any> {
    const cacheDuration = 180 * 60 * 1000; // 60 minutos en milisegundos
    if (localStorage.getItem('lastUpdateTimestamp')) {

      const lastUpdateTimestamp = this.localStorageService.get('lastUpdateTimestamp');
      const isCacheExpired = Date.now() - lastUpdateTimestamp > cacheDuration;      
      if (localStorage.getItem(DATABASE) && this.localStorageService.get(DATABASE) && this.localStorageService.get(DATABASE).length > 0 && !isCacheExpired) {
        const localizations = this.localStorageService.get(DATABASE);
        return of(localizations).pipe(
          tap(response => {
            this.localizationsSubject.next(response)
          }),
          switchMap(() => this.localizationsSubject.asObservable())
        )
      }
    }
    const placesRef = collection(this.firestore, DATABASE);
    return (collectionData(placesRef, { idField: 'id' }) as Observable<any>).pipe(
      tap(response => {
        this.localStorageService.set(DATABASE, JSON.stringify(response));
        this.localStorageService.set('lastUpdateTimestamp', JSON.stringify(Date.now()));
        this.localizationsSubject.next(response);
      })
    )

    /* return this.localStorageService.getJsonData().pipe(
      tap(response => {
        console.log('GET FROM JSON -> ', response);
        this.localStorageService.set(DATABASE, JSON.stringify(response));
        this.localStorageService.set('lastUpdateTimestamp', JSON.stringify(Date.now()));
      })
    ) */
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

  public updateFirestoreLocalization(customId: string, newData: any) {
    const localizationRef = this.angularFirestore.collection(DATABASE, ref => ref.where('customId', '==', customId));
    return from(localizationRef.get()).pipe(
      catchError(error => {
        console.error('Error fetching documents:', error);
        return of(null);
      }),
      switchMap(snapshot => {
        const doc = snapshot?.docs[0]; // Tomar el primer documento si hay coincidencias
        if (doc) {
          return from(doc.ref.update(newData)); // Actualizar el documento con los nuevos datos
        } else {
          console.error('No document found with customId:', customId);
          return of(null);
        }
      }),
      tap(() => {
        this._showNotification(`Localización actualizada correctamente: ${newData.name}`);
      }),
      catchError(error => {
        console.error('Error updating document:', error);
        return of(null);
      })
    );
  }

  public deleteFirestoreLocalization(customId: string, name: string) {
    const localizationRef = this.angularFirestore.collection(DATABASE, ref => ref.where('customId', '==', customId));
    return from(localizationRef.get()).pipe(
      catchError(error => {
        console.error('Error fetching documents:', error);
        return of(null);
      }),
      switchMap(snapshot => {
        const doc = snapshot?.docs[0]; // Tomar el primer documento si hay coincidencias
        if (doc) {
          return from(doc.ref.delete());
        } else {
          console.error('No document found with customId:', customId);
          return of(null);
        }
      }),
      tap(() => {
        this._showNotification(`Localización eliminada correctamente: ${name}`);
      }),
      catchError(error => {
        console.error('Error deleting document:', error);
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
    fixedLocations.push(location);
    const localizationRef = collection(this.firestore, DATABASE);

    return from(
      Promise.all(
        fixedLocations.map((item: ILocation) => addDoc(localizationRef, item))
      )
    ).pipe(
      tap(() => {
        this._showNotification(`Localización añadida correctamente: ${location.name}`);
      }),
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

  private _showNotification(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000, 
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }

  async eliminarDuplicados() {
    interface localization {
      id: string;
      coords: number[];
      name: string;
      location: string;
      type: string;
    }
    /* const collectionRef = this.angularFirestore.collection<localization>(DATABASE);
    
    const querySnapshot = await collectionRef.get();
    const documentosDuplicados = new Map<string, string[]>(); */
  
    /* querySnapshot.forEach((doc: any) => {
      const data = doc.data();
      const key = data.campoUnico; // Campo único que identifica cada documento
      if (documentosDuplicados.has(key)) {
        documentosDuplicados.get(key)?.push(doc.id); // Almacena el ID del documento duplicado
      } else {
        documentosDuplicados.set(key, [doc.id]);
      }
    }); */
  
    // Elimina los documentos duplicados
    /* documentosDuplicados.forEach(async (ids, key) => {
      if (ids.length > 1) {
        // Conserva el primer documento y elimina los duplicados restantes
        const [primerId, ...otrosIds] = ids;
        for (const id of otrosIds) {
          await collectionRef.doc(id).delete();
        }
      }
    });
  
    console.log('Documentos duplicados eliminados.'); */
  }

  // ? Función para añadir atributo a item de colección
  /* public updateCollection(): void {
    const localizationRef = this.angularFirestore.collection(DATABASE)
    localizationRef.get().subscribe(querySnapshot => {
      querySnapshot.forEach(doc => {
        const docId = doc.id;
        const data = doc.data() as { [key: string]: any };
        const newData = {
          ...data,
          estimatedTime: ''
        };

        localizationRef.doc(docId).update(newData)
          .then(() => console.log(`Documento ${docId} actualizado correctamente.`))
          .catch(error => console.error(`Error al actualizar el documento ${docId}:`, error));
      });
    });
  } */
}
