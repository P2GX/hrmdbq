import { Component, computed, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { Reporter, ReporterAssay, ReporterRegulation } from "../../service/models";
import { MatListModule } from "@angular/material/list";


export const ReporterAssayLabels: Record<ReporterAssay, string> = {
  qpcr: 'qPCR / Expression',
  luciferase: 'Luciferase Reporter',
  emsa: 'EMSA (Gel Shift)',
  westernBlot: 'Western Blot',
  splicing: 'Splicing Assay',
  clinicalRna: 'Patient RNA-seq',
  clinicalProtein: 'Patient Protein Analysis',
  clinicalEnzymeActivity: 'Enzyme Activity Assay',
  inSilicoSplicePredictor: 'Splice Predictor (SpliceAI/MaxEntScan)',
  inSilicoMissensePredictor: 'Missense Predictor (REVEL/CADD)',
  tfbsChangePrediction: 'TFBS Binding Prediction',
  conservationScore: 'Conservation (PhyloP/GERP)',
  chromatinAccessibility: 'Chromatin Accessibility (ATAC-seq)',
  promoterEnhancerAnalysis: 'Promoter/Enhancer Analysis',
  otherExperimental: 'Other Experimental Evidence',
  otherComputational: 'Other Computational Evidence'
};

export const EVIDENCE_GROUPS = [
  {
    label: 'Experimental / Functional',
    options: ['qpcr', 'luciferase', 'emsa', 'westernBlot', 'splicing']
  },
  {
    label: 'Clinical / Patient Derived',
    options: ['clinicalRna', 'clinicalProtein', 'clinicalEnzymeActivity']
  },
  {
    label: 'Computational (In Silico)',
    options: ['inSilicoSplicePredictor', 'inSilicoMissensePredictor', 'tfbsChangePrediction', 'conservationScore']
  },
  {
    label: 'Regulatory / Other',
    options: ['chromatinAccessibility', 'promoterEnhancerAnalysis', 'otherExperimental', 'otherComputational']
  }
];


@Component({
  selector: 'app-reporter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    MatListModule
],
  templateUrl: './reporter.html',
  styleUrl: './reporter.scss'
})
export class ReporterWidgetComponent {

    stepComplete = output<Reporter[]>();
    submitted = signal<boolean>(false);
    private readonly DEFAULT_ASSAYS = ['luciferase', 'qpcr', 'emsa', 'westernBlot', 'splicing', 'clinicalRna', 'clinicalProtein', 'clinicalEnzymeActivity'];
    reporters = signal<Reporter[]>(
        this.DEFAULT_ASSAYS.map(assay => ({ assay, regulation: 'unchanged' } as Reporter))
    );
   
    clinicalAssays: ReporterAssay[] = ['clinicalRna', 'clinicalProtein', 'clinicalEnzymeActivity'];
    experimentalAssays: ReporterAssay[]  = ['qpcr', 'luciferase', 'emsa', 'westernBlot', 'splicing'];
    computationalAssays: ReporterAssay[] = [ 'inSilicoSplicePredictor',  'inSilicoMissensePredictor',   'tfbsChangePrediction',  'conservationScore'];
    regulatoryAssays: ReporterAssay[] = ['chromatinAccessibility', 'promoterEnhancerAnalysis'];

    evidenceGroups = EVIDENCE_GROUPS;
    labels = ReporterAssayLabels;

    hasAnyData = computed(() => 
        this.reporters().some(r => r.regulation !== 'unchanged')
    );

    getReporter(assay: ReporterAssay) {
        return this.reporters().find(r => r.assay === assay) || { assay, regulation: 'unchanged' };
    }

    getDisplayLabel(assay: ReporterAssay): string {
        return this.labels[assay];
    }

    setReg(assay: ReporterAssay, reg: ReporterRegulation) {
        this.reporters.update(list => 
            list.map(r => r.assay === assay ? { ...r, regulation: reg } : r)
        );
        //this.stepComplete.emit(this.reporters());
    }

   
    submit() {
        const activeReporters = this.reporters().filter(
            rep => rep.regulation !== 'unchanged'
        );
        this.submitted.set(true);
        this.stepComplete.emit(activeReporters);
    }

    reset() {
         this.submitted.set(false);
        this.reporters.update(list => list.map(r => ({...r, regulation: 'unchanged'})));
    }
}