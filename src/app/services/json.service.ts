import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
}) 
export class JsonService {
    constructor(private http: HttpClient) {}

    getJsonData(): Observable<any> {
        return this.http.get<any>('assets/files/where-to-sleep.json');
    }
}
