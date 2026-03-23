import { Component, inject, signal } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { invoke } from '@tauri-apps/api/core';
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { NcVariant, VariantDto, VariantKind } from '../../service/models';
import { AddVariantComponent } from '../../addvariant/addvariant.component';
import { VariantType } from '../../service/models';
import { NotificationService } from '../../service/notification.service';

import { MatDialog } from '@angular/material/dialog';
import { GeneStepResult, GeneCurationWidget } from '../../widgets/genecuration/genesymbolcuration';
import { MatIcon } from "@angular/material/icon";



export interface AddVariantDialogData {
  rowId: string;
  kind: VariantKind;
}


  @Component({
    selector: 'app-about',
    imports: [
    CommonModule,
    FormsModule,
    MatDividerModule,
    MatFormField,
    MatLabel,
    GeneCurationWidget,
    AddVariantComponent,
    MatIcon
],
    templateUrl: './curate.html',
    styleUrl: './curate.css'
  })
  export class CurationWidget {
    readonly VariantKind = VariantKind;
    currentStep = signal(1); // Start at step 1 (Gene)

    // 2. Data collection from steps
  geneData = signal<GeneStepResult | null>(null);
  variantData = signal<NcVariant | null>(null);

  

  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  onGeneStepComplete(result: GeneStepResult) {
    this.geneData.set(result);
    this.currentStep.set(2); 
    console.log("onGeneStepComplete step is ", this.currentStep());
    this.notificationService.showSuccess(`Retrieved HGNC data for ${this.geneData()?.symbol}`)
  }

  onVariantStepComplete(variant: NcVariant) {
    this.variantData.set(variant);
    this.currentStep.set(3); 
  }

  // 4. Reset logic (if user goes back)
  resetToStep(step: number) {
    this.currentStep.set(step);
    if (step === 1) {
      this.geneData.set(null);
      this.variantData.set(null);
    } else if (step === 2) {
      this.variantData.set(null);
    }
  }



  }
