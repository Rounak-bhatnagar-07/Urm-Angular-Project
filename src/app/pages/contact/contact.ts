import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css'],
})
export class Contact {
  form: FormGroup;
  submitting = false;
  success = false;

  private apiUrl =
    'https://script.google.com/macros/s/AKfycbwW5o7Elu9UndfA5ZJGKCJlCfjrEVGVOSV-XyoekhqkTrkYVUdsWIitOQzq47QcoZSccg/exec';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.success = false;

    this.http.post(
      this.apiUrl,
      JSON.stringify(this.form.value),
      {
        headers: {
          'Content-Type': 'text/plain'
        },
        responseType: 'text'
      }
    ).subscribe({
      next: () => {
        this.success = true;
        this.submitting = false;
        this.form.reset();
      },
      error: (err) => {
        console.error('Submission failed:', err);
        this.success = false;
        this.submitting = false;
      }
    });
  }
}