import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, tap } from 'rxjs';
import { DATABASE } from 'src/app/consts/util.const';
import { ILocation } from 'src/app/interfaces/data.interface';
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
export class AddLocationsComponent implements OnDestroy {
  public form: FormGroup;
  public formData: FormData = {};
  public acceptTerms = false;
  public showError = false;
  public showSuccess = false;
  public errorMessage = '';
  private _prevLocations = this.localStorageService.get(DATABASE);
  public currentTab: string = 'add-locations';
  public currentPage: number = 1;
  public itemsPerPage: number = 20;
  public currentItems: any[] = [];
  public totalPages!: number;
  public showFilters = false;
  public activeButtonIndex: number | null = null;
  public isChecked: boolean = false;

  public optionsMapping: { [key: string]: string } = {
    'Restablecer': 'restore',
    'Dónde dormir': 'where-to-sleep',
    'Dónde comer': 'where-to-eat',
    'Museos, Centros de Interpretación y oficinas de turismo': 'culture-resource',
    'Experiencias': 'experiences',
    /* 'Lista de deseos': 'wishlist', */
  };
  public options = Object.keys(this.optionsMapping);

  private _fileContent: any;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private localizationsService: LocalizationsService, 
    private formBuilder: FormBuilder, 
    private localStorageService: LocalStorageService 
  ) {
    this.form = this.formBuilder.group({
      useText: [false],
      textData: [''],
      jsonData: [''],
      isChecked: [false]
    });
    if (this._prevLocations.length <= 0) {
      this.firestoreLogout();
    }
    this._splitItemsIntoPages();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public postLocation(location: any) {    
    const auxStorage = this.localStorageService.get(DATABASE);

    this.localizationsService.postFirestoreLocalization(location).pipe(
      takeUntil(this.unsubscribe$),
      tap(() => {
        auxStorage.push(location);
        this._prevLocations = [...auxStorage];
        this.localStorageService.set(DATABASE, JSON.stringify(this._prevLocations));
        this.currentPage = 1;
        this._splitItemsIntoPages();
      })
    ).subscribe();
  }

  public onCheckboxChange() {
    this.acceptTerms = !this.acceptTerms;
  }

  public firestoreLogout() {
    this.localizationsService.firestoreLogout();
  }

  public onSubmit() {
    if (!this.acceptTerms) return

    if (this.form.valid) {
      this.isChecked = false;
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

  public toggleFilters() {
    this.showFilters = !this.showFilters;
  }
  
  public setFilter(option: string, index: number) {
    this.activeButtonIndex = index === 0 ? null : index;
    option === 'Restablecer' ? this._restoreLocalizations() : this._getLocalizationsWithFilter(this.optionsMapping[option]);
  }

  private _restoreLocalizations() {
    this._prevLocations = this.localStorageService.get(DATABASE);
    this.currentPage = 1;
    this._splitItemsIntoPages();
  }
  
  private _getLocalizationsWithFilter(filter: string) {
    this._prevLocations = this.localStorageService.get(DATABASE);
    this._prevLocations = this._prevLocations.filter((item: any) => item.type.includes(filter));
    this.currentPage = 1;
    this._splitItemsIntoPages();
  }

  public openEditForm(item: any) {
    console.log("OPEN EDIT FORM MODAL")
  }

  public editItem(locationId: string, newData: any) {
    this.localizationsService.updateFirestoreLocalization(locationId, newData).pipe(
      takeUntil(this.unsubscribe$),
      tap(() => {
        const locationUpdated = this._prevLocations.find((item: any) => item.customId === locationId);
        const index = this._prevLocations.findIndex((item: any) => item.customId === locationId);
        if (index !== -1) {
          this._prevLocations.splice(index, 1);
          this._prevLocations.push(locationUpdated);
          this.localStorageService.set(DATABASE, JSON.stringify(this._prevLocations));
        }
      })
    ).subscribe();
  }
  
  public removeItem(customId: string) {
    const auxStorage = this.localStorageService.get(DATABASE);
    const indexToRemove = auxStorage.findIndex((item: any) => item.customId === customId);

    if (indexToRemove !== -1) {
      this.localizationsService.deleteFirestoreLocalization(customId).pipe(
        takeUntil(this.unsubscribe$),
        tap(() => {
          this._prevLocations = auxStorage.filter((item: any) => item.customId !== customId);
          this.currentPage = 1;
          this.localStorageService.set(DATABASE, JSON.stringify(this._prevLocations));
          this._splitItemsIntoPages();
        })
      ).subscribe();
    }
  }

  public previousPage() {
    if (this.currentPage > 1) {
        this.currentPage--;
        this._splitItemsIntoPages();
    }
  }

  public nextPage() {
    if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this._splitItemsIntoPages();
    }
  }

  goToFirstPage() {
    this.currentPage = 1;
    this._splitItemsIntoPages();
  }

  goToLastPage() {
      this.currentPage = this.totalPages;
      this._splitItemsIntoPages();
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
      this.acceptTerms = false;
      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
        this.form.patchValue({
          isChecked: false
        });
        this.toggleCheckbox();
      }, 900)
    }
  }

  private _checkLocationProperties(location: any) {
    const toReturn = (
      'coords' in location && Array.isArray(location.coords) && typeof location.coords[0] === 'number' && typeof location.coords[1] === 'number' &&
      'customId' in location && typeof location.customId === 'string' &&
      'location' in location && typeof location.location === 'string' &&
      'name' in location && typeof location.name === 'string' &&
      'type' in location && typeof location.type === 'string'
    )

    return toReturn
  }

  private _splitItemsIntoPages() {
    const totalItems = this._prevLocations.length;
    this.totalPages = Math.ceil(totalItems / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, totalItems);
    this.currentItems = this._prevLocations.slice(startIndex, endIndex);
  }

  toggleCheckbox() {
    const currentValue = this.form.get('useText')?.value;
    this.form.get('useText')?.setValue(!currentValue);
  }

}
