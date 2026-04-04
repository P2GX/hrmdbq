import { Component, computed, effect, inject, input, output, signal } from "@angular/core";
import { Pathomechanism, PATHOMECHANISM_LABELS, VariantClass } from "../../service/models";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatDividerModule } from "@angular/material/divider";
import {  MatIconModule } from "@angular/material/icon";
import {  MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from '@angular/material/checkbox'; // <--- Import this
import { NotificationService } from "../../service/notification.service";



export interface PathoGroup {
  label: string;
  icon: string;
  options: Pathomechanism[];
}

@Component({
  selector: 'app-pathomechanism',
  templateUrl: './pathomechanismwidget.html',
  styleUrl: './pathomechanismwidget.scss',
    imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatDividerModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
]
})
export class PathomechanismCurationComponent {
    variantClass = input.required<VariantClass>();
    stepComplete = output<Pathomechanism[]>();
    private notificationService = inject(NotificationService);
    initialPathomechanisms = input<Pathomechanism[]|null>(null);

    pathomechanisms = signal<Pathomechanism[]>([]);
    submitted = signal<boolean>(false);
    stepFinished = computed(() => {
        return this.submitted() && this.pathomechanisms().length > 0;
    });

    activeGroupLabel = computed(() => {
        const vc = this.variantClass();
        if (!vc) return 'General / Protein-level';
        if (vc === 'utr5') return "Translational Control (5' UTR)";
        if (vc === 'utr3' || vc === 'snRna' || vc === 'snoRna') 
            return "RNA Processing & Stability (3' UTR/Introns)";
        if (vc === 'promoter' || vc === 'enhancer' || vc === 'icr') 
            return "Transcriptional Control (Promoters/Enhancers)";
        return 'General / Protein-level';
    });
    pathomechanismOptions = Object.keys(PATHOMECHANISM_LABELS) as Pathomechanism[];
    pathomechanismLabels = computed(() => {
        return this.pathomechanisms()
            .map(pm => PATHOMECHANISM_LABELS[pm] || pm)
            .join(', ');
    });
    filteredGroups = computed(() => {
        const vc = this.variantClass();
        const allowedLabels = this.CLASS_MAPPING[vc] || ['General / Protein-level'];
        
        // Return only the groups that are in our allowed list
        return this.allPathoGroups.filter(group => allowedLabels.includes(group.label));
    });

    constructor() {
        effect(() => {
            const initPM = this.initialPathomechanisms();
            if (! initPM || initPM.length == 0) {
                return;
            }
            this.pathomechanisms.set(initPM);
            this.submitted.set(true);
        });
    }
  
    togglePathomechanism(pm: Pathomechanism): void {
        const current = this.pathomechanisms();
        if (current.includes(pm)) {
            this.pathomechanisms.set(current.filter(p => p !== pm));
        } else {
            // i.e., new
            this.pathomechanisms.set([...current, pm]);
        }
        this.submitted.set(false);
    }
 

    setPathomechanism(pm: Pathomechanism): void {
        this.pathomechanisms.update((lst) => [...lst, pm]);
    }


    confirmSelection() {
        if (this.pathomechanisms().length > 0) {
            this.submitted.set(true);
            this.stepComplete.emit(this.pathomechanisms());
        }
    }

    getPathoLabel(pm: Pathomechanism | undefined) {
        if (! pm) { return 'Unknown Pathomechanism'; }
        return PATHOMECHANISM_LABELS[pm]; 
    }

  

    cancel() {
        this.pathomechanisms.set([]);
        this.submitted.set(false);
    }

    allPathoGroups: PathoGroup[] = [
        {
            label: 'General / Protein-level',
            icon: 'rebase_edit',
            options: ['lossOfFunction', 'gainOfFunction', 'dominantNegative', 'unknown']
        },
        {
            label: 'Transcriptional Control (Promoters/Enhancers)',
            icon: 'settings_input_component',
            options: ['reducedTranscription', 'increasedTranscription', 'reducedExpression', 'increasedExpression', 'enhancerHijacking', 'insulatorLoss']
        },
        {
            label: 'Translational Control (5\' UTR)',
            icon: 'translate',
            options: ['uORFCreation', 'uORFDisruption', 'kozakDisruption', 'reducedTranslation', 'increasedTranslation', 'iRESdisruption']
        },
        {
            label: 'RNA Processing & Stability (3\' UTR/Introns)',
            icon: 'Inventory_2',
            options: ['spliceDefect', 'mrnaStability', 'secondaryStructure', 'impairedRnaProcessing', 'microRNAbindingSiteDisruption', 'microRNAbindingSiteCreation', 'iREdisruption', 'rBPbindingSiteDisruption']
        }
    ];

    private readonly CLASS_MAPPING: Record<VariantClass, string[]> = {
        'promoter': ['General / Protein-level', 'Transcriptional Control (Promoters/Enhancers)'],
        'enhancer': ['General / Protein-level', 'Transcriptional Control (Promoters/Enhancers)'],
        'icr':      ['General / Protein-level', 'Transcriptional Control (Promoters/Enhancers)'],
        'utr5':     ['General / Protein-level', 'Translational Control (5\' UTR)','Transcriptional Control (Promoters/Enhancers)'],
        'utr3':     ['General / Protein-level', 'RNA Processing & Stability (3\' UTR/Introns)'],
        'snRna':    ['General / Protein-level', 'RNA Processing & Stability (3\' UTR/Introns)'],
        'snoRna':   ['General / Protein-level', 'RNA Processing & Stability (3\' UTR/Introns)'],
        'microRna': ['General / Protein-level', 'RNA Processing & Stability (3\' UTR/Introns)'],
        // Add defaults for others
        'lncRna':   ['General / Protein-level','RNA Processing & Stability (3\' UTR/Introns)'],
        'tRna':     ['General / Protein-level','RNA Processing & Stability (3\' UTR/Introns)'],
        'multiGene': ['General / Protein-level']
    };




}