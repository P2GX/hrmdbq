import { Injectable, signal, computed } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { NcVariantEvaluation } from './models';


@Injectable({
  providedIn: 'root'
})
export class CurationService {
  private _variants = signal<NcVariantEvaluation[]>([]);
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

 
  async loadCurationFile() {
    try {
      // This calls your Rust command select_curation_file
      const data = await invoke<NcVariantEvaluation[]>('select_curation_file');
      // Update the signal value
      this._variants.set(data);
      const settings = await invoke<any>('get_settings');
      this._currentPath.set(settings.curation_file || '');
      
      return data;
    } catch (err) {
      console.error('Failed to load file:', err);
      throw err;
    }
  }

  // Helper to clear state if needed
  clear() {
    this._variants.set([]);
  }
}