import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-location',
  templateUrl: './edit-location.component.html',
  styleUrls: ['./edit-location.component.scss']
})
export class EditLocationComponent implements OnChanges {
  @Input() formData: any;
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() modalClosed = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnChanges() {
    if (this.formData) {
      this.form = this.formBuilder.group({
        name: [this.formData.name || '', Validators.required],
        type: [this.formData.type || '', Validators.required],
        location: [this.formData.location || '', Validators.required],
        coords: [this.formData.coords || [], Validators.required],
        customId: [this.formData.customId || '', Validators.required]
      });
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
}
