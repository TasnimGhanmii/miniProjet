import { Observable } from 'rxjs';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { NotifyService } from '../core/notify.service';

@Component({
  selector: 'app-client-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="toolbar"><h1>{{ id ? 'Modifier' : 'Nouveau' }} client</h1></div>
    <form class="card" [formGroup]="form" (ngSubmit)="submit()">
      <div class="form-grid">
        <div class="field">
          <label>Nom *</label>
          <input formControlName="nom" [class.invalid]="bad('nom')" />
          @if (bad('nom')) { <span class="err">Le nom est obligatoire.</span> }
        </div>
        <div class="field">
          <label>Prénom / Raison sociale *</label>
          <input formControlName="prenomOuRaisonSociale" [class.invalid]="bad('prenomOuRaisonSociale')" />
          @if (bad('prenomOuRaisonSociale')) { <span class="err">Ce champ est obligatoire.</span> }
        </div>
        <div class="field">
          <label>Email *</label>
          <input formControlName="email" type="email" [class.invalid]="bad('email')" />
          @if (bad('email')) { <span class="err">Email obligatoire et valide.</span> }
        </div>
        <div class="field">
          <label>Téléphone</label>
          <input formControlName="telephone" [class.invalid]="bad('telephone')" />
          @if (bad('telephone')) { <span class="err">Numéro invalide (chiffres, +, espaces).</span> }
        </div>
      </div>

      <h2>Adresse</h2>
      <div class="form-grid" formGroupName="address">
        <div class="field full"><label>Rue</label><input formControlName="rue" /></div>
        <div class="field">
          <label>Ville *</label>
          <input formControlName="ville" [class.invalid]="bad('address.ville')" />
          @if (bad('address.ville')) { <span class="err">La ville est obligatoire.</span> }
        </div>
        <div class="field"><label>Code postal</label><input formControlName="codePostal" /></div>
        <div class="field">
          <label>Pays *</label>
          <input formControlName="pays" [class.invalid]="bad('address.pays')" />
          @if (bad('address.pays')) { <span class="err">Le pays est obligatoire.</span> }
        </div>
      </div>

      <div class="form-actions">
        <button class="btn" type="submit" [disabled]="saving()">Enregistrer</button>
        <a class="btn sec" routerLink="/clients">Annuler</a>
      </div>
    </form>
  `,
})
export class ClientForm {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private notify = inject(NotifyService);
  private router = inject(Router);
  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || 0;
  saving = signal(false);

  form = this.fb.group({
    nom: ['', Validators.required],
    prenomOuRaisonSociale: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', Validators.pattern(/^[0-9+\s().-]{6,20}$/)],
    address: this.fb.group({
      rue: [''],
      ville: ['', Validators.required],
      codePostal: [''],
      pays: ['', Validators.required],
    }),
  });

  constructor() {
    if (this.id) {
      this.api.getClient(this.id).subscribe({
        next: (c) => this.form.patchValue({ ...c, telephone: c.telephone ?? '' } as any),
        error: (e) => this.notify.error(e, 'Client introuvable.'),
      });
    }
  }

  bad(path: string) {
    const c = this.form.get(path);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue() as any;
    const body = { ...v, telephone: v.telephone || null };
    this.saving.set(true);
    const req: Observable<unknown> = this.id ? this.api.updateClient(this.id, body) : this.api.addClient(body);
    req.subscribe({
      next: () => {
        this.notify.success(this.id ? 'Client modifié.' : 'Client créé.');
        this.router.navigate(['/clients']);
      },
      error: (e) => { this.saving.set(false); this.notify.error(e, "Enregistrement du client impossible."); },
    });
  }
}
