import { Component, computed, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { EvidenceRecord, EvidenceSource, EvidenceType } from "../../service/models";
import { MatListModule } from "@angular/material/list";


export const ReporterAssayLabels: Record<EvidenceSource, string> = {
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

    stepComplete = output<EvidenceRecord[]>();
    submitted = signal<boolean>(false);
   
   
    clinicalAssays: EvidenceSource[] = ['clinicalRna', 'clinicalProtein', 'clinicalEnzymeActivity'];
    experimentalAssays: EvidenceSource[]  = ['qpcr', 'luciferase', 'emsa', 'westernBlot', 'splicing'];
    computationalAssays: EvidenceSource[] = [ 'inSilicoSplicePredictor',  'inSilicoMissensePredictor',   'tfbsChangePrediction',  'conservationScore'];
    regulatoryAssays: EvidenceSource[] = ['chromatinAccessibility', 'promoterEnhancerAnalysis'];

    private readonly all_assays = [
      ...this.clinicalAssays,
      ...this.experimentalAssays,
      ...this.computationalAssays,
      ...this.regulatoryAssays
    ];

    reporters = signal<EvidenceRecord[]>(
        this.all_assays.map(assay => ({ source: assay, assessment: 'na' } as EvidenceRecord))
    );

    evidenceGroups = EVIDENCE_GROUPS;
    labels = ReporterAssayLabels;

    hasAnyData = computed(() => 
        this.reporters().some(r => r.assessment !== 'na')
    );

    activeReporters = computed(() => {
      return this.reporters().filter(r => r.assessment !== 'na');
    })

    getEvidenceSource(evsource: EvidenceSource) {
        return this.reporters().find(r => r.source === evsource) || { source: evsource, assessment: 'na' };
    }

    getDisplayLabel(evsource: EvidenceSource): string {
        return this.labels[evsource];
    }

    setReg(evsource: EvidenceSource, evtype: EvidenceType) {
        this.reporters.update(list => 
            list.map(r => r.source === evsource ? { ...r, assessment: evtype } : r)
        );
    }

   
    submit() {
        const activeReporters = this.activeReporters();
        console.log("submit-evidence=", activeReporters);
        this.submitted.set(true);
        this.stepComplete.emit(activeReporters);
    }

    reset() {
        this.submitted.set(false);
        this.reporters.update(list => list.map(r => ({...r, regulation: 'unchanged'})));
    }
}