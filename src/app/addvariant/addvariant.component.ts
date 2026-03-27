import { ChangeDetectionStrategy, Component, inject, input, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { openUrl } from '@tauri-apps/plugin-opener';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { displayHgvs, displayIntergenic, displaySv, GeneTranscriptData, HgvsVariant, IntergenicHgvsVariant, NcVariant, StructuralType, StructuralVariant, VariantDto } from '../service/models';
import { ConfigService } from '../service/configService';
import { CurationService } from '../service/curation_service';
import { GeneStepResult } from '../widgets/genecuration/genesymbolcuration';
import { MatIconModule } from "@angular/material/icon";
import { NotificationService } from '../service/notification.service';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

/* This widget can validate small HGVS variants (e.g., small number of nucleotides, "c."("n.")),
structural variants (symbolic, e.g., DEL ex3), and intergenic variants (not located in transcripts,
represented using chromosomal accession numbers). */
export enum VariantKind {
  HGVS = 'HGVS',
  SV = 'SV',
  INTERGENIC = 'INTERGENIC'
}


export interface AddVariantDialogData {
  rowId: string;
  kind: VariantKind;
}


export interface VariantAcceptedEvent {
  variant: string;
  alleleCount: number; // mono or biallelic
}

type ValidatorFn = () => Promise<void>;

type VariantMode = 'HGVS' | 'SV' | 'IG';

/**
 * A modal component that pops up when the user clicks on Add Allele
 * It can enter HGVS or SV
 * The component validates each variant using VariantValidator and
 * creates either an HgvsVariant or a StructuralVariant object. It also 
 * creates a key (string) that is used to represent the variant in the
 * HGVS or SV maps of our CohortDto. 
 */
@Component({
  selector: 'app-addvariant',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule,
    MatCardModule, MatCheckboxModule, MatInputModule, MatFormFieldModule,
    MatOption, MatSelectModule, MatButtonToggleModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './addvariant.component.html',
  styleUrl: './addvariant.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddVariantComponent {
  
  // the following has symbol, transcript id, and HGNC id
  selected_gene = input.required<GeneStepResult>();
  currentMode: VariantMode = 'HGVS';
  rowId = input<string>();
  private configService = inject(ConfigService);
  private curationService = inject(CurationService);
  private notificationService = inject(NotificationService);
  stepComplete = output<NcVariant>();
  variantConfirmed = signal(false);
  variantValidated = false;
  isSubmitting = false;

  async handleAction() {
    if (!this.variantValidated) {
      await this.validate();
    } else {
      this.confirm();
    }
  }

  async validate() {
    if (!this.variant_string?.trim() || !this.selected_gene()) {
      return this.notificationService.showError('Please enter a variant and select a gene.');
    }
    this.isSubmitting = true;
    try {
      if (this.currentMode === 'HGVS') {
         await this.validateHgvsDto();
      } else if (this.currentMode === 'SV') {
        // Assuming you have a validateStructural method
        await this.validateStructuralVariant();
      } else if (this.currentMode === 'IG') {
        await this.validateIntergenicVariant();
      }
      this.variantValidated = true;
      this.errorMessage = '';
    } catch (error) {
      this.notificationService.showError(String(error));
      this.variantValidated = false;
    } finally {
      this.isSubmitting = false;
    }
  }

  confirm(): void {
    if (!this.variant_string?.trim()) {
      this.notificationService.showError("Please enter a variant string.");
      return;
    }
    console
    if (this.currentMode === 'HGVS' && this.currentHgvsVariant) {
      this.variantConfirmed.set(true);
      this.stepComplete.emit({hgvs: this.currentHgvsVariant});
      return;
    } else if (this.currentMode === 'SV' && this.currentStructuralVariant) {
      this.variantConfirmed.set(true);
      this.stepComplete.emit({ structural: this.currentStructuralVariant});
      return;
    } else if (this.currentMode === 'IG' && this.currentIntergenicVariant) {
      this.variantConfirmed.set(true);
      this.stepComplete.emit({ intergenic: this.currentIntergenicVariant});
      return;
    } else {
      this.notificationService.showError("Could not retrieve non-coding variant");
      return;
    }
  }

  private validators: Record<VariantMode, ValidatorFn> = {
    ['HGVS']: () => this.validateHgvsDto(),
    ['SV']: () => this.validateStructuralVariant(),
    ['IG']: () => this.validateIntergenicVariant(),
  };

  /* If the current variant was HGVS and was validated, this variant is non-null */
  currentHgvsVariant: HgvsVariant | null = null;
  /* If the current variant was structural and was validated, this variant is non-null */
  currentStructuralVariant: StructuralVariant | null = null;
  /* If the current variant was intergenic and was validated, this variant is non-null */
  currentIntergenicVariant: IntergenicHgvsVariant |null = null;

  isHgvs(): boolean {
    return this.currentMode === 'HGVS';
  }

  isStructural(): boolean {
    return this.currentMode === 'SV';
  }

  isIntergenic(): boolean {
    return this.currentMode == 'IG';
  }

  onModeChange(newMode: VariantMode) {
    this.currentMode = newMode;
    this.resetVars(); // Clear inputs when switching types
  }

 


  variant_string = '';
  errorMessage: string | null = null;



  structuralTypes: StructuralType[] = [
    {'label':'deletion', 'id':'DEL'},
    {'label':'insertion', 'id':'INS'},
    {'label':'duplication', 'id':'DUP'},
    {'label':'inversion', 'id':'INV'},
    {'label':'translocation', 'id':'TRANSL'},
    {'label':'sv (general)', 'id':'SV'},];

  geneOptions: GeneTranscriptData[] = []; 
  selectedStructuralType: StructuralType | null = null;

  validationMessage = '';
  validationComplete = false;

  /** This is called from -   (input)="onVariantInput()" -- everytime the value of the input field changes.
   * The main purpose is to determine if we have an HGVS variant or not. If we do, then the SV drop down is hidden,
   * if not, we show the Sv dropdown menu with the SV types.
   */
  onVariantInput(): void {
    this.resetVars();
    if (this.isHgvs()) {
      // we strip whitespace from HGVS variants because it is common for publications to add space e.c., c.123 A > T
      this.variant_string = this.variant_string.replace(/\s+/g, '');
    }
    if (!this.variant_string) {
      this.errorMessage = 'Empty variant not allowed';
    } else if (this.variant_string.startsWith('c.') || this.variant_string.startsWith('n.')){
      this.errorMessage = null;
    } else if (this.variant_string.startsWith("NC_")) {
      this.errorMessage = null;
    } else if (this.variant_string.startsWith("g.")) {
      this.errorMessage = "Intergenic variants should be formatted as chromosome accession (e.g., NC_000019.10), semicolon, genomic HGVS";
    } else {
      this.errorMessage = null;
    }
  }

  resetVars(): void {
    this.errorMessage = null;
    this.variantValidated = false;
  }

  /** This function is called if the user has entered data about a structural variant and
   * clicks on the "Submit SV" button. We send the current cohortDto to the backend so that
   * the backend calculates the variantKey and sees if we have already validated this variant,
   * in which case, we return a copy of it. Otherwise, the backend creates a new variant.
   * In either case, when the user activates addVariantToPpkt the new variant will be stored
   * in the HashMap. This function itself only initializes the variant currentStructuralVariant,
   * so that the user can cancel the variant for whatever reason.
   */
  async validateStructuralVariant(): Promise<void> {
    if (!this.variant_string || !this.selected_gene() || !this.selectedStructuralType) {
      this.errorMessage = 'Please enter a valid variant and select a gene and a SV type';
      this.variantValidated = false;
      return;
    }

    this.errorMessage = null;
    const vv_dto: VariantDto = {
      variantString: this.variant_string,
      transcript: this.selected_gene().maneId,
      hgncId: this.selected_gene().hgncId,
      geneSymbol: this.selected_gene().symbol,
      variantType: "SV",
      isValidated: false,
      count: 0
    };
   
    this.configService.validateSv(vv_dto)
      .then((sv) => {
        this.variantValidated = true;
        this.currentStructuralVariant = sv;
      })
      .catch((error) => {
        alert(String(error));
      });
  }


  
  private fail(message: string): void {
    this.errorMessage = message;
    this.variantValidated = false;
    return;
  }

  async submit(): Promise<void> {
    await this.validators[this.currentMode]();
  }

  async validateIntergenicVariant(): Promise<void> {
    if (!this.variant_string || !this.selected_gene()) {
      return this.fail('Please enter a valid variant and select a gene.');
    }
    console.log("submitIntergenicDto=", this.variant_string);
    this.configService.validateIntergenic(this.selected_gene().symbol, this.selected_gene().hgncId, this.variant_string).then((ig) => {
        this.currentIntergenicVariant = ig;
        this.variantValidated = true;
      })
      .catch((error) => {
        alert(String(error));
      });
  }
  

  /** This is called when the user has finished entering an HGVS variant 
   * and clicks on the "Submit HGVS" button. If we are successful, the methods
   * sets the currentHgvsVariant variable and adds it to the HGVS map
   */
  async validateHgvsDto(): Promise<void> {
     if (!this.variant_string || !this.selected_gene()) {
      return this.fail('Please enter a valid variant and select a gene.');
    }
    this.errorMessage = null;
    console.log("add variant, ", this.selected_gene());
    this.configService.validateHgvsVariant(this.selected_gene().symbol, this.selected_gene().hgncId, this.selected_gene().maneId, this.variant_string)
      .then((hgvs) => {
        this.currentHgvsVariant = hgvs;
        this.variantValidated = true;
      })
      .catch((error) => {
        alert(String(error));
      });
  }

  openHgvs($event: MouseEvent): void {
    $event.preventDefault();
    const url = "https://hgvs-nomenclature.org/"
    openUrl(url)
  }
  openVariantValidator($event: MouseEvent): void {
    $event.preventDefault();
    const url = "https://variantvalidator.org/";
    openUrl(url);
  }

  /**
   * Open a URL in the (external) system browser
  */
  async openLink(url: string): Promise<void> {
    await openUrl(url);
  }

  /**
   * Close the dialog without changing state
  */
  cancel(): void {
    console.log("todo reset")
  }

 
   getSubmitLabel() {
    if (this.isSubmitting) return 'Validating...';
    return `Validate ${this.currentMode}`;
  }

  /**
   * Emits the validated variant to the parent component so it can be added
   * to the current phenopacket row object.
   * Returns an NcVariant object to the parent component
   */
  confirmVariant(): void{
    if (! this.variantValidated) {
      alert("Could not add variant");
      return;
    }
    if (!this.variantValidated) {
      alert("Please validate the variant first");
      return;
    }

    let result: NcVariant | null = null;

    if (this.currentHgvsVariant) {
      result = { hgvs: this.currentHgvsVariant };
    } else if (this.currentStructuralVariant) {
      result = { structural: this.currentStructuralVariant };
    } else if (this.currentIntergenicVariant) {
      result = { intergenic: this.currentIntergenicVariant };
    }

    if (result) {
      // This now returns the object that matches the Rust enum structure
      this.stepComplete.emit(result);
    } else {
      alert("Unable to package variant data");
    }
  }

  async onSelectFile() {
    await this.curationService.selecteAndLoadCurationFile();
  }

}


