import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NcVariant, NcVariantAssessment, Pathomechanism, VariantClass, VariantKind } from '../../service/models';
import { AddVariantComponent } from '../../addvariant/addvariant.component';
import { NotificationService } from '../../service/notification.service';
import { GeneStepResult, GeneCurationWidget } from '../../widgets/genecuration/genesymbolcuration';
import { VariantCategorySelectorComponent } from "../../widgets/variantcategory/variantcategory";
import { PathomechanismCurationComponent } from "../../widgets/pathomechanismwidget/pathomechanismwidget";
import { ConfigService } from '../../service/configService';
import { CurationService } from '../../service/curation_service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import {  CitationListComponent } from "../../widgets/citationwidget/citation";
import { MatIconModule } from "@angular/material/icon"; 
import { CitationEntry } from '../../service/models';
import { CitationFormComponent } from "../../widgets/citationform/citationform";

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
    GeneCurationWidget,
    AddVariantComponent,
    VariantCategorySelectorComponent,
    PathomechanismCurationComponent,
    MatIconModule,
    CitationListComponent,
    CitationFormComponent
],
  templateUrl: './curate.html',
  styleUrl: './curate.css'
})
export class CurationWidget implements OnInit {

  readonly VariantKind = VariantKind;
  currentStep = signal(1); 

    // 2. Data collection from steps
  geneData = signal<GeneStepResult | null>(null);
  variantData = signal<NcVariant | null>(null);
  variantClass = signal<VariantClass | null>(null);
  pathomechanism = signal<Pathomechanism[]>([]);
  citations = signal<CitationEntry[]>([]);
  currentCitation = signal<CitationEntry | null>(null);
  editIndex = signal<number | null>(null);
  addingOrEditingCitation = signal<{ index?: number; entry?: CitationEntry } | null>(null);



  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.editingId.set(id);
      this.loadExistingCuration(id);
    } else {
      this.isEditMode.set(false);
      this.handleNewCuration();
    }
  }

  private handleNewCuration(): void {
     const activeCuration = this.curationService.currentCuration();
    if (activeCuration) {
      const initialGene: GeneStepResult = {
        symbol: activeCuration.geneData.symbol,
        hgncId: activeCuration.geneData.hgncId,
        maneId: activeCuration.geneData.maneId
      };
      this.geneData.set(initialGene);
      this.currentStep.set(2); 
      this.notificationService.showSuccess(`Initialized workspace for ${initialGene.symbol}`);
    } else {
      this.notificationService.showError("Could not initialize gene curation. Go back to setup page!")
    }
  }

  private loadExistingCuration(id: string): void{
    this.notificationService.showError(`IMPLEMENT ME- handle existing ${id}`)
  }

  private notificationService = inject(NotificationService);
  private configService = inject(ConfigService);
  private curationService = inject(CurationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  isEditMode = signal(false);
  editingId = signal<string | null>(null);

  onGeneStepComplete(result: GeneStepResult) {
    this.geneData.set(result);
    this.currentStep.set(2); 
    this.notificationService.showSuccess(`Retrieved HGNC data for ${this.geneData()?.symbol}`)
  }

  onVariantStepComplete(variant: NcVariant) {
    this.variantData.set(variant);
    this.currentStep.set(3); 
  }

  onCategoryStepComplete(category: VariantClass) {
    this.variantClass.set(category);
    this.currentStep.set(4);
  }

  onPathomechanismStepComplete(pathomechanism: Pathomechanism): void {
    this.pathomechanism.update((lst) => [...lst, pathomechanism]);
    console.log("setting path", pathomechanism);
    this.currentStep.set(5);
  }

  onCitationSaved(entry: CitationEntry) {
    // If the citation already exists, replace it, otherwise push
    this.citations.update(list => {
        const index = list.findIndex(e => e.citation.pmid === entry.citation.pmid);
        if (index >= 0) {
            list[index] = entry;
        } else {
            list.push(entry);
        }
        return [...list]; // return new array to trigger signals
    });
}

onCitationRemoved(entry: CitationEntry) {
    this.citations.update(list => list.filter(e => e.citation.pmid !== entry.citation.pmid));
}


// Called when user clicks "Add"
onAddCitation() {
  this.addingOrEditingCitation.set({}); // new entry
}

  // Called when user clicks "Edit"
  onEditCitation(event: { index: number; entry: CitationEntry }) {
    this.addingOrEditingCitation.set(event);
  }

  onDeleteCitation(index: number) {
    this.citations.update(list => list.filter((_, i) => i !== index));
  }

  // Called when form saves
  onCitationFormSave(entry: CitationEntry) {
    const edit = this.addingOrEditingCitation();
    this.citations.update(list => {
      if (edit?.index != null) {
        list[edit.index] = entry; // edit existing
      } else {
        list.push(entry); // add new
      }
      return [...list];
    });
    this.addingOrEditingCitation.set(null);
    this.currentStep.set(7);
  }

  // Called when form cancels
  onCitationFormCancel() {
    this.addingOrEditingCitation.set(null);
  }


  goToReview() {
    if (this.citations().length === 0) {
      this.notificationService.showError("Add at least one citation");
      return;
    }
    this.currentStep.set(6);
  }

  resetToStep(step: number) {
    //if (step <= 6) this.cite_packet.set(null);
    //if (step <= 5) this.evidenceList.set([]);
    if (step <= 4) this.pathomechanism.set([]);
    if (step <= 3) this.variantClass.set(null);
    if (step <= 2) this.variantData.set(null);
    if (step <= 1) this.geneData.set(null);
    this.currentStep.set(step);
  }

  resetForm() {
    // Navigates to the "New" version of this page and clears signals
    this.router.navigate(['/curate']); 
    this.resetToStep(1);
  }

  async onFinalSave() {
    const cat = this.variantClass();
    if (! cat) {
      this.notificationService.showError("Cannot save without variant category");
      return;
    }
    const variant = this.variantData();
    if (! variant) {
       this.notificationService.showError("Cannot save without variant data");
      return;
    }
    const pathomechanism = this.pathomechanism();
    if (! pathomechanism) {
      this.notificationService.showError("Cannot save without variant pathomechanism");
      return;
    }

  
    const citations = this.citations();
    if (! citations || citations.length === 0 ) {
       this.notificationService.showError("Cannot save without citation");
      return;
    }
    const currentOrcid = this.configService.getOrcid();
    if (! currentOrcid) {
         this.notificationService.showError("Cannot save without valid ORCID");
      return;
    }
    const curation = this.configService.createCurationEvent(currentOrcid);

    const ncAssess: NcVariantAssessment = {
      id: crypto.randomUUID(),
      variantCoordinates: variant,
      variantCategory: cat,
      pathomechanisms: pathomechanism,
      citation: citations,
      biocuration: [curation],
    };
    console.log("Adding ncAsses=", ncAssess);
    try {
        await this.curationService.saveVariant(ncAssess);
        this.notificationService.showSuccess("Variant assessment saved.");
        this.router.navigate(["/annots"]);
    } catch (err) {
        this.notificationService.showError(`Save failed: ${err}`);
    }

  }



}
