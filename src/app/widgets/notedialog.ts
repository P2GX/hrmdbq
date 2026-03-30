// note-dialog.component.ts
import { Component, signal } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TextFieldModule } from '@angular/cdk/text-field'; // For autosize

@Component({
  standalone: true,
  imports: [
    MatDialogModule, 
    FormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    TextFieldModule
  ],
  template: `
    <h2 mat-dialog-title>Add Curator Note</h2>
    <mat-dialog-content>
      <div style="display: flex; flex-direction: column; gap: 15px; min-width: 400px; padding-top: 10px;">
        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput [(ngModel)]="title" placeholder="e.g., Literature Review Summary">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Note Content</mat-label>
          <textarea matInput 
                    [(ngModel)]="content" 
                    cdkTextareaAutosize 
                    cdkAutosizeMinRows="5" 
                    cdkAutosizeMaxRows="15"
                    placeholder="Enter detailed observations...">
          </textarea>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-flat-button color="primary" 
              [disabled]="!title() || !content()" 
              (click)="onSave()">Save Note</button>
    </mat-dialog-actions>
  `
})
export class NoteDialogComponent {
  title = signal('');
  content = signal('');

  constructor(private dialogRef: MatDialogRef<NoteDialogComponent>) {}

  onCancel() { this.dialogRef.close(); }

  onSave() {
    this.dialogRef.close({ 
        title: this.title(), 
        content: this.content() 
    });
  }
}