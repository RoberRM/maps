import { Component } from '@angular/core';
import { tap } from 'rxjs';
import { LocalizationsService } from 'src/app/services';

@Component({
  selector: 'app-add-locations',
  templateUrl: './add-locations.component.html',
  styleUrls: ['./add-locations.component.scss']
})
export class AddLocationsComponent {
  // TODO añadir un formulario que permita guardar un archivo json de localizaciones
  public acceptTerms = false;

  constructor(private localizationService: LocalizationsService) {}

  public goToMyLocation() {    
    this.localizationService.postFirestoreLocalization().pipe(
      tap(response => console.log('LOCALIZACIONES AÑADIDAS -> ', response))
    ).subscribe();
  }

  public onCheckboxChange() {
    this.acceptTerms = !this.acceptTerms;
  }

}
