import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
}) 
export class LocalizationsService {

  private backendUrl = 'http://localhost:3000/';
  private localizationsUrl = this.backendUrl + 'localizations';

  private headers = { 'content-type': 'application/json'};

  constructor(private http: HttpClient) { }

  /**
   * Get localizations
   */
  public getLocalizations(): Observable<any> {
    return this.http.get(this.localizationsUrl);
  }

}
