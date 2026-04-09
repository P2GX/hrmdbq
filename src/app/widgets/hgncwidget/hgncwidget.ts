import { Component, Inject } from '@angular/core';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HgncBundle } from '../../service/models';
import { MatInputModule } from "@angular/material/input";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 
import { MatFormFieldModule } from '@angular/material/form-field';



@Component({
  templateUrl:'./hgncwidget.html',
  styleUrl: './hgncwidget.html',
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule]
})
export class ManualHgncDialog {
   data: HgncBundle = { hgncId: '', maneSelect: '' };
  constructor(
    public dialogRef: MatDialogRef<ManualHgncDialog>,
    @Inject(MAT_DIALOG_DATA) public dialogData: { symbol: string }
  ) {}
    
   
    onNoClick(): void { this.dialogRef.close(); }
}