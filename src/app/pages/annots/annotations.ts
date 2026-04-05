import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { CurationService } from '../../service/curation_service'; 
import { NcVariant, NcVariantAssessment, EvidenceSource } from '../../service/models';
import { MatIconModule } from "@angular/material/icon";
import { ConfigService } from '../../service/configService';
import { NotificationService } from '../../service/notification.service';
import { MatSelectModule } from "@angular/material/select";
import { FormsModule } from '@angular/forms'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatDialog } from '@angular/material/dialog';
import { ResourceDialogComponent } from '../../widgets/resourcedialog';
import { MatCardModule } from "@angular/material/card";
import { NoteDialogComponent } from '../../widgets/notedialog';
import { Router } from '@angular/router';




@Component({
  selector: 'app-about',
  imports: [
    CommonModule,
    FormsModule,
    MatDividerModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatSelectModule,
    MatCardModule
],
  templateUrl: './annotations.html',
  styleUrl: './annotations.css'
})
export class AnnotationTable {



    public curationService = inject(CurationService);
    private configService = inject(ConfigService);
    private notificationService = inject(NotificationService);
    private dialog = inject(MatDialog);
    private router = inject(Router);
    // for adding a new resource
    resName = signal('');
    resUrl = signal('');

    displayedColumns: string[] = ['label', 'category', 'alias', 'actions'];
    editingVariant = signal<NcVariantAssessment | null>(null);

   

    readonly activeGeneSymbol = computed(() => 
      this.curationService.currentCuration()?.geneData.symbol ?? 'No Gene Selected'
    );
    readonly dataSource = computed(() => 
      new MatTableDataSource<NcVariantAssessment>(this.curationService.variants())
    );

 

  constructor() {
    if (!this.curationService.isGeneLoaded()) {
      this.notificationService.showError("No active curation found. Return to setup to initialize gene.");
    }
  }
  

  /**
   * Helper to extract a display label from the variant enum
   */
  getVariantLabel(variant: NcVariant): string {
    if ('hgvs' in variant) return variant.hgvs.hgvs;
    if ('structural' in variant) return variant.structural.label;
    if ('intergenic' in variant) return variant.intergenic.gHgvs;
    return 'Unknown Variant';
  }

  /**
   * Helper to get the gene symbol safely
   */
  getGeneSymbol(variant: NcVariant): string {
    if ('hgvs' in variant) return variant.hgvs.symbol;
    if ('structural' in variant) return variant.structural.geneSymbol;
    if ('intergenic' in variant) return variant.intergenic.symbol || 'n/a';
    return "n/a"  
  }

   
  exportData(): void {
    const curation = this.curationService.currentCuration();
    if (! curation) {
      this.notificationService.showError("Could not save curation because GeneCuration object was null");
      return;
    }
    this.configService.serializeGeneCuration(curation)
      .then(() => {
        this.notificationService.showSuccess(`Saved Curation for ${curation.geneData.symbol}.`);
        this.curationService.clearChanges();
      })
      .catch((error) => {
        this.notificationService.showError(`Failed to save curation: ${error}.`);
      });
  }


 openAddResourceDialog() {
    const dialogRef = this.dialog.open(ResourceDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Result contains { name, url } from the dialog
        this.curationService.addWebResource(result.name, result.url);
      }
    });
  }

  openAddNoteDialog() {
    const dialogRef = this.dialog.open(NoteDialogComponent, {
      width: '600px', // Wider for the text area
      disableClose: true // Prevent accidental closing while typing long notes
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.curationService.addGeneNote(result.title, result.content);
      }
    });
  }

  deleteNote(noteId: string): void {
    this.curationService.removeGeneNote(noteId);
  }

  addNewVariantCuration() {
     this.router.navigate(["/curate"]);
  }

  gotToSetup() {
    this.router.navigate(["/setup"]);
  }

  editVariant(row: NcVariantAssessment) {
    this.editingVariant.set(row);
    this.curationService.setEditingVariant(row);
    this.router.navigate(["curate"]);
  } 

  deleteVariant(row: NcVariantAssessment): void {
    const label = this.getVariantLabel(row.variantCoordinates);
    const confirmed = confirm(`Are you sure you want to delete the curation for ${label}? This action cannot be undone until you reload the file.`);
    if (confirmed) {
      this.curationService.deleteVariant(row.id);
    }
  }

}
