import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
}) 
export class LocalStorageService {
    CryptoJS = require("crypto-js");
    private readonly _secretKey = 'superSecretKeyThatShouldBeStoredSecurely';
    constructor(private readonly http: HttpClient) {}

    set(id: string, data: string) {
        localStorage.setItem(id, this.CryptoJS.AES.encrypt(data, this._secretKey).toString())
    }

    get(id: string) {
        const encryptedData = localStorage.getItem(id);

        if (!encryptedData) {
            // console.error(`No se encontró el valor con el id: ${id} en localStorage.`);
            return [];
        }

        try {
            const bytesFromStorage = this.CryptoJS.AES.decrypt(encryptedData, this._secretKey);
            const decryptedData = bytesFromStorage.toString(this.CryptoJS.enc.Utf8);

            return JSON.parse(decryptedData);
        } catch (error) {
            // console.error('Error al desencriptar o parsear el dato de localStorage:', error);
            return [];
        }
    }

    getJsonData(): Observable<any> {
        return this.http.get<any>('assets/files/new-localizations.json');
    }
}
