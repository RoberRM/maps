import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
}) 
export class LocalStorageService {
    CryptoJS = require("crypto-js");
    constructor(private http: HttpClient) {}

    set(id: string, data: string) {
        localStorage.setItem(id, this.CryptoJS.AES.encrypt(data, 'secretKey').toString())
    }

    get(id: string) {
        const bytesFromStorage = this.CryptoJS.AES.decrypt(localStorage.getItem(id), 'secretKey');
        return JSON.parse(bytesFromStorage.toString(CryptoJS.enc.Utf8));
    }

    getJsonData(): Observable<any> {
        return this.http.get<any>('assets/files/where-to-sleep.json');
    }
}
