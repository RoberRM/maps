import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { tap } from 'rxjs';
import { ILocation } from 'src/app/interfaces/data.interface';
// import { ILocation } from 'src/app/interfaces/data.interface';
import { LocalStorageService, LocalizationsService } from 'src/app/services';

export interface FormData {
  textData?: string;
  jsonData?: File;
}

@Component({
  selector: 'app-add-locations',
  templateUrl: './add-locations.component.html',
  styleUrls: ['./add-locations.component.scss']
})
export class AddLocationsComponent {
  public form: FormGroup;
  public formData: FormData = {};
  public acceptTerms = false;
  public showError = false;
  public showSuccess = false;
  public errorMessage = '';
  private _fileContent: any;
  private _prevLocations = this.localStorageService.get('localizations');

  constructor(private localizationService: LocalizationsService, private formBuilder: FormBuilder, private localStorageService: LocalStorageService) {
    this.form = this.formBuilder.group({
      useText: [false],
      textData: [''],
      jsonData: ['']
    });
    
  }

  public postLocation(location: any) {    
    this.localizationService.postFirestoreLocalization(location).pipe(
      tap(response => console.log('LOCALIZACION AÑADIDA -> ', response))
    ).subscribe();
  }

  public onCheckboxChange() {
    this.acceptTerms = !this.acceptTerms;
  }

  public firestoreLogout() {
    this.localizationService.firestoreLogout();
  }

  public onSubmit() {
    if (!this.acceptTerms) return

    if (this.form.valid) {
      this.formData = {
        textData: this.form.value.useText ? this.form.value.textData : undefined,
        jsonData: !this.form.value.useText ? this.form.value.jsonData : undefined
      };
      if (this.form.value.useText && this.formData.textData) {
        try {
          this.showError = false;
          this.showSuccess = false;
          const parsedText = JSON.parse(this.formData.textData);
          const isLocationsArray = Array.isArray(parsedText);
          if (!isLocationsArray) {
            this._manageObject(parsedText);
          }
          if (isLocationsArray) {
            parsedText.forEach(item => {
              this._manageObject(item);
            })
          }

        } catch (error) {
          this.showError = true;
          this.showSuccess = false;
          this.errorMessage = 'Error en el formato JSON';
        }
      }
      if (!this.form.value.useText && this.formData.jsonData) {
        const fileInput: any = document.getElementById('fileInput');
        const file = fileInput.files[0];
        
        if (file) {
          const reader = new FileReader();
          try {
            reader.onload = (e) => {
              this._fileContent = JSON.parse(reader.result as string);
              if (Array.isArray(this._fileContent)) {
                this._fileContent.forEach((location: ILocation) => {
                  this._manageObject(location);
                })
              } else {
                this._manageObject(location);
              }
            };
          } catch (error) {
            this.showError = true;
            this.showSuccess = false;
            this.errorMessage = 'Error al analizar el archivo JSON';
          }

          reader.onerror = (e) => {
            console.error('Filereader error: ', reader.error)
          }
          reader.readAsText(file);
        }
      }
    }
  }

  private _manageObject(item: any) {
    if (this._checkLocationProperties(item)) {
      this._handleLocation(item);
    } else {
      this.showError = true;
      this.showSuccess = false;
      this.errorMessage = 'Error en el formato JSON';
    }
  }

  private _handleLocation(input: any) {
    const lat = input.coords[0] < 0 ? input.coords[0] : input.coords[1];
    const lng = input.coords[0] > 0 ? input.coords[0] : input.coords[1];
    const exist = this._prevLocations.filter((location: any) => location.coords[0] === lat && location.coords[1] === lng)
    this.showError = exist.length > 0 && !this._checkLocationProperties(input);
    if (this.showError) this.errorMessage = 'Esta localización ya existe';

    if (!this.showError) {
      this.postLocation(input);
      this.showError = false;
      this.errorMessage = '';
      this.showSuccess = true;
    }
  }

  private _checkLocationProperties(location: any) {
    const toReturn = (
      'coords' in location && Array.isArray(location.coords) && typeof location.coords[0] === 'number' && typeof location.coords[1] === 'number' &&
      'id' in location && typeof location.id === 'string' &&
      'location' in location && typeof location.location === 'string' &&
      'name' in location && typeof location.name === 'string' &&
      'type' in location && typeof location.type === 'string'
    )
    return toReturn
  }

  toggleCheckbox() {
    const currentValue = this.form.get('useText')?.value;
    this.form.get('useText')?.setValue(!currentValue);
  }

}
