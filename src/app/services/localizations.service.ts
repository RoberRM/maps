import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
}) 
export class LocalizationsService {

  private localizationsSubject = new BehaviorSubject<any>(null);
  localizations$ = this.localizationsSubject.asObservable();

  private backendUrl = 'http://localhost:3000/';
  private localizationsUrl = this.backendUrl + 'localizations';
  // private localizationsWithFilterUrl = this.backendUrl + 'localizations' + '?type=';

  // private headers = { 'content-type': 'application/json'};

  constructor(private http: HttpClient) { }

  /**
   * Get localizations
   */
  public getLocalizations(): Observable<any> {
    return this.http.get(this.localizationsUrl).pipe(
      tap(response => this.localizationsSubject.next(response)),
      switchMap(() => this.localizationsSubject.asObservable())
    );
  }

}
