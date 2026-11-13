import { Observable } from 'rxjs';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ApiService } from '../core/api.service';
import { NotifyService } from '../core/notify.service';
import { Client, Produit, statusLabel } from '../core/models';

const TVA = 0.19; // identique au back-end

@Component({
  selector: 'app-commande-form',
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe],
  template: `
    <div class="toolbar"><h1>{{ id ? 'Modifier la commande' : 'Nouvelle commande' }}</h1></div>

    @if (locked()) {
      <div class="alert ko">Cette commande est validée : elle ne peut plus être modifiée.</div>
    }

    <form class="card" [formGroup]="form" (ngSubmit)="submit()">
      <div class="form-grid">
        <div class="field">
          <label>Numéro de commande *</label>
          <input type="number" formControlName="numero" [class.invalid]="bad('numero')" />
          @if (bad('numero')) { <span class="err">Numéro obligatoire (entier positif).</span> }
        </div>
        <div class="field">
          <label>Client *</label>
          <select formControlName="clientId" [class.invalid]="bad('clientId')">
            <option [ngValue]="null">-- Choisir un client --</option>
            @for (c of clients(); track c.id) {
              <option [ngValue]="c.id">{{ c.nom }} {{ c.prenomOuRaisonSociale }}</option>
            }
          </select>
          @if (bad('clientId')) { <span class="err">Veuillez choisir un client.</span> }
        </div>
      </div>

      <h2>Lignes de commande</h2>
      <table>
        <thead>
          <tr><th>Produit</th><th class="right">Prix unitaire</th><th>Quantité</th><th class="right">Total ligne</th><th></th></tr>
        </thead>
        <tbody formArrayName="lignes">
          @for (l of lignes.controls; track l; let i = $index) {
            <tr [formGroupName]="i">
              <td>
                <select formControlName="produitId" [class.invalid]="badLine(i, 'produitId')">
                  <option [ngValue]="null">-- Produit --</option>
                  @for (p of produits(); track p.id) {
                    <option [ngValue]="p.id">{{ p.nom }} (stock : {{ p.quantiteStock }})</option>
                  }
                </select>
              </td>
              <td class="right">{{ prix(i) | number: '1.2-2' }}</td>
              <td>
                <input type="number" formControlName="quantite" style="width:90px" [class.invalid]="badLine(i, 'quantite')" />
                @if (badLine(i, 'quantite')) { <div class="err">≥ 1</div> }
                @if (overStock(i)) { <div class="err">Stock insuffisant</div> }
              </td>
              <td class="right">{{ prix(i) * qte(i) | number: '1.2-2' }}</td>
              <td><button type="button" class="btn sm danger" (click)="removeLine(i)">✕</button></td>
            </tr>
          }
        </tbody>
      </table>
      @if (submitted() && lignes.length === 0) {
        <div class="err">Ajoutez au moins une ligne.</div>
      }
      <p><button type="button" class="btn sm sec" (click)="addLine()">+ Ajouter une ligne</button></p>

      <div class="totals">
        <div>Total HT : <strong>{{ totalHt() | number: '1.2-2' }}</strong></div>
        <div>Total TTC (TVA 19 %) : <strong>{{ totalHt() * (1 + tva) | number: '1.2-2' }}</strong></div>
      </div>

      <div class="form-actions">
        <button class="btn" type="submit" [disabled]="saving() || locked()">Enregistrer</button>
        <a class="btn sec" routerLink="/commandes">Annuler</a>
      </div>
    </form>
  `,
})
export class CommandeForm {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private notify = inject(NotifyService);
  private router = inject(Router);
  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || 0;
  tva = TVA;

  clients = signal<Client[]>([]);
  produits = signal<Produit[]>([]);
  saving = signal(false);
  locked = signal(false);
  submitted = signal(false);

  form = this.fb.group({
    numero: [null as number | null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
    clientId: [null as number | null, Validators.required],
    lignes: this.fb.array([]),
  });

  get lignes() {
    return this.form.get('lignes') as FormArray;
  }

  constructor() {
    forkJoin({ clients: this.api.getClients(), produits: this.api.getProduits() }).subscribe({
      next: (r) => {
        this.clients.set(r.clients);
        this.produits.set(r.produits);
        if (this.id) this.loadCommande();
        else this.addLine();
      },
      error: (e) => this.notify.error(e, 'Chargement des données impossible.'),
    });
  }

  private loadCommande() {
    this.api.getCommande(this.id).subscribe({
      next: (c) => {
        this.locked.set(statusLabel(c.status) === 'Validee');
        this.form.patchValue({ numero: c.numero, clientId: c.clientId });
        c.ligneCommandes.forEach((l) => this.addLine(l.produitId, l.quantite));
        if (c.ligneCommandes.length === 0) this.addLine();
      },
      error: (e) => this.notify.error(e, 'Commande introuvable.'),
    });
  }

  addLine(produitId: number | null = null, quantite = 1) {
    this.lignes.push(
      this.fb.group({
        produitId: [produitId, Validators.required],
        quantite: [quantite, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
      }),
    );
  }

  removeLine(i: number) {
    this.lignes.removeAt(i);
  }

  private produitOf(i: number) {
    const pid = this.lignes.at(i).value.produitId;
    return this.produits().find((p) => p.id === pid);
  }
  prix(i: number) {
    return this.produitOf(i)?.prix ?? 0;
  }
  qte(i: number) {
    return Number(this.lignes.at(i).value.quantite) || 0;
  }
  overStock(i: number) {
    const p = this.produitOf(i);
    return !!p && this.qte(i) > p.quantiteStock;
  }
  totalHt() {
    let t = 0;
    for (let i = 0; i < this.lignes.length; i++) t += this.prix(i) * this.qte(i);
    return t;
  }

  bad(name: string) {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty || this.submitted());
  }
  badLine(i: number, name: string) {
    const c = this.lignes.at(i).get(name);
    return !!c && c.invalid && (c.touched || c.dirty || this.submitted());
  }

  submit() {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.lignes.length === 0) return;

    const v = this.form.getRawValue();
    const body = {
      numero: v.numero!,
      clientId: v.clientId!,
      ligneCommandes: v.lignes.map((l: any) => ({ produitId: l.produitId, quantite: Number(l.quantite) })),
    } as any;

    this.saving.set(true);
    const req: Observable<unknown> = this.id ? this.api.updateCommande(this.id, body) : this.api.addCommande(body);
    req.subscribe({
      next: () => {
        this.notify.success(this.id ? 'Commande modifiée.' : 'Commande créée (brouillon).');
        this.router.navigate(['/commandes']);
      },
      error: (e) => { this.saving.set(false); this.notify.error(e, "Enregistrement de la commande impossible."); },
    });
  }
}
