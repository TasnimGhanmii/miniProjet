import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ApiService } from '../core/api.service';
import { NotifyService } from '../core/notify.service';
import { Client, Commande, Produit, statusLabel } from '../core/models';

@Component({
  selector: 'app-commande-detail',
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="toolbar">
      <h1>Commande {{ commande()?.numero }}</h1>
      <a class="btn sec" routerLink="/commandes">← Retour à la liste</a>
    </div>

    @if (commande(); as c) {
      <div class="card">
        <dl class="detail-grid">
          <dt>Numéro</dt><dd>{{ c.numero }}</dd>
          <dt>Client</dt>
          <dd>
            @if (client(); as cl) { {{ cl.nom }} {{ cl.prenomOuRaisonSociale }} ({{ cl.email }}) }
            @else { #{{ c.clientId }} }
          </dd>
          <dt>Date</dt><dd>{{ c.dateCommande | date: 'dd/MM/yyyy HH:mm' }}</dd>
          <dt>Statut</dt><dd><span class="badge" [class]="'badge ' + status()">{{ status() }}</span></dd>
        </dl>

        <h2>Lignes</h2>
        <table>
          <thead>
            <tr><th>Produit</th><th class="right">Prix unitaire</th><th class="right">Quantité</th><th class="right">Total</th></tr>
          </thead>
          <tbody>
            @for (l of c.ligneCommandes; track l.id) {
              <tr>
                <td>{{ produitName(l.produitId) }}</td>
                <td class="right">{{ l.prixUnitaire | number: '1.2-2' }}</td>
                <td class="right">{{ l.quantite }}</td>
                <td class="right">{{ (l.prixUnitaire ?? 0) * l.quantite | number: '1.2-2' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="empty">Aucune ligne.</td></tr>
            }
          </tbody>
        </table>

        <div class="totals">
          <div>Total HT : <strong>{{ c.totalHt | number: '1.2-2' }}</strong></div>
          <div>Total TTC : <strong>{{ c.totalTtc | number: '1.2-2' }}</strong></div>
        </div>

        <div class="form-actions">
          @if (status() !== 'Validee') {
            <button class="btn ok" (click)="validate()">Valider la commande</button>
            <a class="btn" [routerLink]="['/commandes', c.id, 'edit']">Modifier</a>
          }
          <button class="btn danger" (click)="remove()">Supprimer</button>
        </div>
      </div>
    } @else {
      <div class="card empty">Chargement…</div>
    }
  `,
})
export class CommandeDetail {
  private api = inject(ApiService);
  private notify = inject(NotifyService);
  private router = inject(Router);
  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  commande = signal<Commande | null>(null);
  client = signal<Client | null>(null);
  produits = signal<Produit[]>([]);

  constructor() {
    this.load();
    this.api.getProduits().subscribe({ next: (p) => this.produits.set(p) });
  }

  status() {
    return statusLabel(this.commande()?.status);
  }

  produitName(id: number) {
    return this.produits().find((p) => p.id === id)?.nom ?? `#${id}`;
  }

  load() {
    this.api.getCommande(this.id).subscribe({
      next: (c) => {
        this.commande.set(c);
        this.api.getClient(c.clientId).subscribe({ next: (cl) => this.client.set(cl) });
      },
      error: (e) => this.notify.error(e, 'Commande introuvable.'),
    });
  }

  validate() {
    this.api.validateCommande(this.id).subscribe({
      next: (r) => { this.notify.success(r.message); this.load(); },
      error: (e) => this.notify.error(e, 'Validation impossible.'),
    });
  }

  remove() {
    if (!confirm('Supprimer cette commande ?')) return;
    this.api.deleteCommande(this.id).subscribe({
      next: (r) => { this.notify.success(r.message); this.router.navigate(['/commandes']); },
      error: (e) => this.notify.error(e, 'Suppression impossible.'),
    });
  }
}
