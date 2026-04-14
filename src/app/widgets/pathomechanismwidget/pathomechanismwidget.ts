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

    constructor() {
        effect(() => {
            const initPM = this.initialPathomechanisms();
            // Only set if we haven't touched the local state yet
            if (initPM && initPM.length > 0 && this.pathomechanisms().length === 0 && !this.submitted()) {
                this.pathomechanisms.set(initPM);
                this.submitted.set(true);;
            }
        });
    }

     togglePathomechanism(pm: Pathomechanism): void {
        this.pathomechanisms.update(current => {
                const exists = current.includes(pm);
                return exists ? current.filter(p => p !==pm) : [...current, pm];
        });
        // since we are toggling, stay in edit mode
        this.submitted.set(false);
    }

    activeGroupLabel = computed(() => {
        const vc = this.variantClass();
        if (!vc) return 'General / Protein-level';
        if (vc === 'utr5') return "Translational Control (5' UTR)";
        if (vc === 'utr3' || vc === 'snRNA' || vc === 'snoRNA') 
            return "RNA Processing & Stability (3' UTR/Introns)";
        if (vc === 'promoter' || vc === 'enhancer' || vc === 'ICR') 
            return "Transcriptional Control";
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

    edit(): void {
        this.submitted.set(false);
    }

    clearAll() {
        this.pathomechanisms.set([]);
        this.submitted.set(false);
    }

    cancel() {
        this.pathomechanisms.set([]);
        this.submitted.set(false);
    }

    allPathoGroups: PathoGroup[] = [
        {
            label: 'General / Protein-level',
            icon: 'rebase_edit',
            options: ['lossOfFunction', 'gainOfFunction', 'dominantNegative',  'reducedExpression', 'increasedExpression', 'unknown']
        },
        {
            label: 'Transcriptional Control',
            icon: 'settings_input_component',
            options: ['reducedTranscription', 'increasedTranscription', 'enhancerHijacking', 'insulatorLoss', 'tfbsDisruption', 'polyadenlyation']
        },
        {
            label: 'Translational Control',
            icon: 'translate',
            options: ['uORFCreation', 'uORFDisruption', 'kozakCreation', 'kozakDisruption', 'reducedTranslation', 'increasedTranslation', 'iRESdisruption']
        },
        {
            label: 'RNA Processing & Stability',
            icon: 'Inventory_2',
            options: ['spliceDefect', 'mrnaStability', 'secondaryStructure', 'impairedRnaProcessing', 'microRNAbindingSiteDisruption', 'microRNAbindingSiteCreation', 'iREdisruption', 'rBPbindingSiteDisruption']
        }
    ];

    private readonly CLASS_MAPPING: Record<VariantClass, string[]> = {
        'promoter': ['General / Protein-level', 'Transcriptional Control'],
        'enhancer': ['General / Protein-level', 'Transcriptional Control'],
        'ICR':      ['General / Protein-level', 'Transcriptional Control'],
        'utr5':     ['General / Protein-level', 'Translational Control','Transcriptional Control', 'RNA Processing & Stability'],
        'utr3':     ['General / Protein-level', 'Transcriptional Control', 'RNA Processing & Stability'],
        'snRNA':    ['General / Protein-level', 'RNA Processing & Stability'],
        'snoRNA':   ['General / Protein-level', 'RNA Processing & Stability'],
        'microRNA': ['General / Protein-level', 'RNA Processing & Stability'],
        // Add defaults for others
        'lncRNA':   ['General / Protein-level','RNA Processing & Stability'],
        'tRNA':     ['General / Protein-level','RNA Processing & Stability'],
        'multiGene': ['General / Protein-level']
    };




}