import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NcVariant, NcVariantAssessment, Pathomechanism, VariantClass, VariantKind } from '../../service/models';
import { AddVariantComponent, NcVariantBundle } from '../../addvariant/addvariant.component';
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
  private curationService = inject(CurationService);
  private notificationService = inject(NotificationService);
  private configService = inject(ConfigService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  isEditMode = signal(false);
  editingId = signal<string | null>(null);
  readonly VariantKind = VariantKind;
  currentStep = signal(1); 

    // 2. Data collection from steps
  geneData = signal<GeneStepResult | null>(null);
  //variantData = signal<NcVariant | null>(null);
  //clinVarIdentifier = signal<number|null>(null);
  variantClass = signal<VariantClass | null>(null);
  pathomechanisms = signal<Pathomechanism[]>([]);
  citations = signal<CitationEntry[]>([]);
  currentCitation = signal<CitationEntry | null>(null);
  editIndex = signal<number | null>(null);
  addingOrEditingCitation = signal<{ index?: number; entry?: CitationEntry } | null>(null);

  ncVariantBundle = signal<NcVariantBundle|null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.editingId.set(id);
      this.loadExistingCuration(id);
      return;
    } 
    const variantToEdit = this.curationService.editingVariant();
    if (variantToEdit) {
      this.initializeEdit(variantToEdit);
    } else {
      this.isEditMode.set(false);
      this.handleNewCuration();
    }
  }

  /* This is used if we are editing an existing variant. Usually, we will be adding a Citation, so 
    * let's add all of the data and open the corresponding step */
  initializeEdit(assessment: NcVariantAssessment) {
    this.curationService.activeSymbol();
    const activeCuration = this.curationService.currentCuration();
    if (!activeCuration) {
      this.notificationService.showError("Cannot edit because we could not retrieve currently active gene");
      return;
    }
    this.geneData.set( activeCuration.geneData);
    this.ncVariantBundle.set({ncvariant: assessment.variantCoordinates, clinvarId: assessment.variationId});
    this.variantClass.set(assessment.variantCategory);
    this.pathomechanisms.set(assessment.pathomechanisms);
    this.citations.set(assessment.citation);
    this.currentStep.set(5);
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

 

  onGeneStepComplete(result: GeneStepResult) {
    this.geneData.set(result);
    this.currentStep.set(2); 
    this.notificationService.showSuccess(`Retrieved HGNC data for ${this.geneData()?.symbol}`)
  }

  onVariantStepComplete(variantAccepted: NcVariantBundle) {
    this.ncVariantBundle.set(variantAccepted);
    this.currentStep.set(3); 
  }

  onCategoryStepComplete(category: VariantClass) {
    this.variantClass.set(category);
    this.currentStep.set(4);
  }

  onPathomechanismStepComplete(pathomechanisms: Pathomechanism[]): void {
    this.pathomechanisms.update((lst) => [...lst, ...pathomechanisms]);
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

  // Called when PMID form cancels
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
    if (step <= 5) this.citations.set([]);
    if (step <= 4) this.pathomechanisms.set([]);
    if (step <= 3) this.variantClass.set(null);
    if (step <= 2) this.ncVariantBundle.set(null);
    if (step <= 1) this.geneData.set(null);
    this.currentStep.set(step);
  }

  resetForm() {
    this.curationService.setEditingVariant(null);
    this.router.navigate(['/curate']); 
    this.resetToStep(1);
  }

  async onFinalSave() {
    const cat = this.variantClass();
    if (! cat) {
      this.notificationService.showError("Cannot save without variant category");
      return;
    }
    const variantBundle = this.ncVariantBundle();
    if (! variantBundle) {
       this.notificationService.showError("Cannot save without variant data");
      return;
    }
    const pathomechanism = this.pathomechanisms();
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
      variantCoordinates: variantBundle.ncvariant,
      variantCategory: cat,
      pathomechanisms: pathomechanism,
      citation: citations,
      biocuration: [curation],
    };
    console.log("final save=", ncAssess);
    const clinVarId = variantBundle.clinvarId;
    if (clinVarId) {
      ncAssess.variationId = clinVarId;
    }
    this.curationService.setEditingVariant(null);
    try {
        await this.curationService.upsertVariant(ncAssess);
        this.notificationService.showSuccess("Variant assessment saved.");
        this.router.navigate(["/annots"]);
    } catch (err) {
        this.notificationService.showError(`Save failed: ${err}`);
    }
  }



}
