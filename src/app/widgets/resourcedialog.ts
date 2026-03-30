import { Component, signal } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [MatDialogModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Add External Resource</h2>
    <mat-dialog-content>
      <div style="display: flex; flex-direction: column; gap: 10px; padding-top: 10px;">
        <mat-form-field appearance="outline">
          <mat-label>Resource Name</mat-label>
          <input matInput [(ngModel)]="name" placeholder="e.g. ClinVar">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>URL</mat-label>
          <input matInput [(ngModel)]="url" placeholder="https://...">
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-flat-button color="primary" 
              [disabled]="!name() || !url()" 
              (click)="onSave()">Add Resource</button>
    </mat-dialog-actions>
  `
})
export class ResourceDialogComponent {
  name = signal('');
  url = signal('');

  constructor(private dialogRef: MatDialogRef<ResourceDialogComponent>) {}

  onCancel() { this.dialogRef.close(); }

  onSave() {
    this.dialogRef.close({ name: this.name(), url: this.url() });
  }
}