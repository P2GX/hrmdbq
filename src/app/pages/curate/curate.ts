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
      MatLabel],
    templateUrl: './curate.html',
    styleUrl: './curate.css'
  })
  export class CurationWidget {

  // Local state for the gene search
  geneSymbol = signal('');
  hgncRawResult = signal<string | null>(null);
  isSearching = signal(false);

  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);


  /* Reach out the the HGNC API to get the MANE transcript */
  async onSearchGene() {
    const symbol = this.geneSymbol().trim();
    if (!symbol) return;

    this.isSearching.set(true);
    try {
      const data = await invoke<any>('fetch_gene_data_from_hgnc', { symbol });
      this.hgncRawResult.set(JSON.stringify(data, null, 2));
    } catch (err) {
      this.hgncRawResult.set(`Error: ${err}`);
    } finally {
      this.isSearching.set(false);
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
