import { Injectable, signal, computed, inject, NgZone } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { NcVariantAssessment, NcVariantEvaluation } from './models';
import { NotificationService } from './notification.service';


@Injectable({
  providedIn: 'root'
})
export class CurationService {
  private ngZone = inject(NgZone);
  private notificationService = inject(NotificationService);
  private _variants = signal<NcVariantAssessment[]>([]);
  readonly variants = this._variants.asReadonly();
  private _currentPath = signal<string>('');
  readonly currentPath = this._currentPath.asReadonly();

  readonly fileName = computed(() => {
    const path = this._currentPath();
    return path ? path.split(/[/\\]/).pop() : '';
    });

  // 3. Computed signals (Optional, e.g., for a counter)
  readonly count = computed(() => this._variants().length);

  constructor() {}

  async initialize() {
    try {
      // Just fetch settings first to see if a file path already exists
      const settings = await invoke<any>('get_settings');
      if (settings.curation_file) {
        this._currentPath.set(settings.curation_file);
        // If your Rust backend has a separate command to load a known path:
        // const data = await invoke<NcVariantAssessment[]>('load_file_at_path', { path: settings.curation_file });
        // this._variants.set(data);
      }
    } catch (err) {
      console.error('Auto-load failed:', err);
    }
  }

 
  async selecteAndLoadCurationFile() {
    try {
      const data = await invoke<NcVariantAssessment[]>('select_curation_file');
      this._variants.set(data);
      const settings = await invoke<any>('get_settings');
      this._currentPath.set(settings.curation_file || '');
      
      return data;
    } catch (err) {
      console.error('Failed to load file:', err);
      throw err;
    }
  }

    async loadCurationFile(): Promise<void> {
      try {
        const data = await invoke<NcVariantAssessment[]>('load_variants_file');
        this._variants.set(data);
      } catch (err) {
        console.error('Failed to load file:', err);
        throw err;
      }
    }

    async saveVariant(assess: NcVariantAssessment) {
      try {
        // 1. Rust does the work and returns the final state
        const newVariantList = await invoke<NcVariantAssessment[]>('add_nc_variant_assessment', { assess });
        
        // 2. Update the Signal once. No more race conditions!
        this.ngZone.run(() => {
          this._variants.set(newVariantList);
        });
        
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    }


  // Helper to clear state if needed
  clear() {
     this.ngZone.run(() => {
        this._variants.set([]);
      });
  }
}