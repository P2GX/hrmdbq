import { Component, inject, signal } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { invoke } from '@tauri-apps/api/core';
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { VariantDto, VariantKind } from '../../service/models';
import { AddVariantComponent } from '../../addvariant/addvariant.component';
import { VariantType } from '../../service/models';
import { NotificationService } from '../../service/notification.service';

import { MatDialog } from '@angular/material/dialog';
import { GeneStepResult, GeneCurationWidget } from '../../widgets/genecuration/genesymbolcuration';


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
    GeneCurationWidget
],
    templateUrl: './curate.html',
    styleUrl: './curate.css'
  })
  export class CurationWidget {

    currentStep = signal(1); // Start at step 1 (Gene)

    // 2. Data collection from steps
  geneData = signal<GeneStepResult | null>(null);
  variantData = signal<any>(null);

  // Local state for the gene search
  geneSymbol = signal('');
  hgncRawResult = signal<string | null>(null);
  isSearching = signal(false);

  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  onGeneStepComplete(result: GeneStepResult) {
    this.geneData.set(result);
    this.currentStep.set(2); // Reveal Step 2
  }

  // 4. Reset logic (if user goes back)
  resetToStep(step: number) {
    this.currentStep.set(step);
    if (step === 1) {
      this.geneData.set(null);
      this.variantData.set(null);
    }
  }

  openVariantEditor(varKind: VariantKind) {
    const dialogRef = this.dialog.open(AddVariantComponent, {
      data: {  kind: varKind},  width: '600px' });
    
      dialogRef.afterClosed().subscribe((result: VariantDto | undefined) => {
        if (! result) return;
        const { variantKey, count: alleleCount, isValidated } = result;
        if ( variantKey == null) {
          this.notificationService.showError("Could not retrieve variantKey");
          return;
        }
        if (! isValidated) {
          this.notificationService.showError("Variant could not be validated");
          return;
        }
        const typeMapping: Record<VariantKind, string> = {
          [VariantKind.HGVS]: 'HGVS',
          [VariantKind.SV]: 'SV',
          [VariantKind.INTERGENIC]: 'INTERGENICHGVS'
        };
        const variantType = typeMapping[varKind];      
         if (!variantType) {
          return this.notificationService.showError(`Could not identify variant kind ${varKind}`);
        }
      let dto: VariantDto = {
           ...result,
           variantType: variantType as VariantType,
           transcript: variantType === "INTERGENIC" ? '' : result.transcript,
            isValidated: false,
          };
       
          const entriesToAdd = alleleCount === 2 ? [dto, dto] : [dto];
          
      });
    }


  }
