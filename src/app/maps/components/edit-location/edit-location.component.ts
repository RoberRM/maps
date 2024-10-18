import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { typesMapping } from 'src/app/consts/util.const';

@Component({
  selector: 'app-edit-location',
  templateUrl: './edit-location.component.html',
  styleUrls: ['./edit-location.component.scss']
})
export class EditLocationComponent implements OnInit, OnChanges {
  @Input() formData: any;
  @Input() isEditForm: boolean = false;
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() modalClosed = new EventEmitter<void>();

  form!: FormGroup;
  public typesMapping = typesMapping;
  public typesMappingKeys: string[] = [];

  constructor(private readonly formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.typesMappingKeys = Object.keys(this.typesMapping);
    this.initializeForm();
    this.toggleCustomIdValidation();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isEditForm'] && !changes['isEditForm'].isFirstChange()) {
      this.toggleCustomIdValidation();
    }
  }

  private initializeForm() {
    if (!this.formData.type) {
      this.formData.type = Object.values(this.typesMapping)[0];
    }
    if (this.formData) {
      this.form = this.formBuilder.group({
        name: [this.formData.name || '', Validators.required],
        type: [this.formData.type, Validators.required],
        location: [this.formData.location || ''],
        coords: [this.formData.coords || [], Validators.required],
        adress: [this.formData.adress || ''],
        phoneNumber: [this.formData.phoneNumber || ''],
        estimatedTime: [this.formData.estimatedTime || ''],
        description: [this.formData.description || ''],
        visible: [this.formData.visible ?? true],
        customId: [this.formData.customId || '']
      });
    }
  }

  toggleCustomIdValidation() {
    const customIdControl = this.form.get('customId');
    if (customIdControl) {
      if (!this.isEditForm) {
        customIdControl.setValidators([Validators.required]);
      } else {
        customIdControl.clearValidators();
      }
      customIdControl.updateValueAndValidity();
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.formSubmitted.emit(this.form.value);
    }
  }

  closeModal() {
    this.modalClosed.emit();
  }

  public resetAddMore() {
    this.form.reset();
  }
}
