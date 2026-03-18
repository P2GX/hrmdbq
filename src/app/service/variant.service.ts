import { Injectable, signal, computed } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { NcVariantAssessment } from './models';

@Injectable({ providedIn: 'root' })
export class VariantService {
  // 1. The "Source of Truth" (Private)
  private _variants = signal<NcVariantAssessment[]>([]);

  // 2. The Public Read-Only view
  variants = this._variants.asReadonly();

  // 3. A Derived Signal (Example: Count)
  variantCount = computed(() => this._variants().length);

  constructor() {
    // Optionally load data immediately on app start
    this.loadVariants();
  }

  async loadVariants() {
    try {
      // Calling your Rust #[tauri::command]
      const data = await invoke<NcVariantAssessment[]>('get_variant_assessments');
      this._variants.set(data);
    } catch (err) {
      console.error("Failed to fetch variants from Rust:", err);
    }
  }

  // Example: Add a new curation event locally
  addVariant(newVariant: NcVariantAssessment) {
    this._variants.update(current => [...current, newVariant]);
  }
}