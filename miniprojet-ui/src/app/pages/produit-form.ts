import { Observable } from 'rxjs';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { NotifyService } from '../core/notify.service';

@Component({
  selector: 'app-produit-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="toolbar"><h1>{{ id ? 'Modifier' : 'Nouveau' }} produit</h1></div>
    <form class="card" [formGroup]="form" (ngSubmit)="submit()">
      <div class="form-grid">
        <div class="field">
          <label>Référence *</label>
          <input type="number" formControlName="reference" [class.invalid]="bad('reference')" />
          @if (bad('reference')) { <span class="err">Référence obligatoire (nombre entier positif).</span> }
        </div>
        <div class="field">
          <label>Nom * (20 caractères max)</label>
          <input formControlName="nom" [class.invalid]="bad('nom')" />
          @if (bad('nom')) { <span class="err">Nom obligatoire (20 caractères maximum).</span> }
        </div>
        <div class="field">
          <label>Prix *</label>
          <input type="number" step="0.01" formControlName="prix" [class.invalid]="bad('prix')" />
          @if (bad('prix')) { <span class="err">Prix obligatoire (≥ 0).</span> }
        </div>
        <div class="field">
          <label>Quantité en stock *</label>
          <input type="number" formControlName="quantiteStock" [class.invalid]="bad('quantiteStock')" />
          @if (bad('quantiteStock')) { <span class="err">Stock obligatoire (entier ≥ 0).</span> }
        </div>
        <div class="field full">
          <label>Description</label>
          <textarea rows="3" formControlName="description"></textarea>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn" type="submit" [disabled]="saving()">Enregistrer</button>
        <a class="btn sec" routerLink="/produits">Annuler</a>
      </div>
    </form>
  `,
})
export class ProduitForm {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private notify = inject(NotifyService);
  private router = inject(Router);
  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || 0;
  saving = signal(false);

  form = this.fb.group({
    reference: [null as number | null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
    nom: ['', [Validators.required, Validators.maxLength(20)]],
    prix: [null as number | null, [Validators.required, Validators.min(0)]],
    quantiteStock: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    description: [''],
  });

  constructor() {
    if (this.id) {
      this.api.getProduit(this.id).subscribe({
        next: (p) => this.form.patchValue({ ...p, description: p.description ?? '' } as any),
        error: (e) => this.notify.error(e, 'Produit introuvable.'),
      });
    }
  }

  bad(name: string) {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const body = { ...v, id: this.id || 0, description: v.description || null } as any;
    this.saving.set(true);
    const req: Observable<unknown> = this.id ? this.api.updateProduit(this.id, body) : this.api.addProduit(body);
    req.subscribe({
      next: () => {
        this.notify.success(this.id ? 'Produit modifié.' : 'Produit créé.');
        this.router.navigate(['/produits']);
      },
      error: (e) => { this.saving.set(false); this.notify.error(e, "Enregistrement du produit impossible."); },
    });
  }
}
