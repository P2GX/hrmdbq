import { Injectable, signal, computed } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { NcVariantAssessment, NcVariantEvaluation } from './models';


@Injectable({
  providedIn: 'root'
})
export class CurationService {
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
        console.log("loadCurationFile, this variants", this.variants());
      } catch (err) {
        console.error('Failed to load file:', err);
        throw err;
      }
    }

  updateNcVariantAssessmentList(list: NcVariantAssessment[]): void {
    this._variants.set(list);
  }

  // Helper to clear state if needed
  clear() {
    this._variants.set([]);
  }
}