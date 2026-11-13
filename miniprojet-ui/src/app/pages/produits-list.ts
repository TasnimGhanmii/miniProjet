import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '../core/api.service';
import { NotifyService } from '../core/notify.service';
import { Produit } from '../core/models';

@Component({
  selector: 'app-produits-list',
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="toolbar">
      <h1>Produits</h1>
      <a class="btn" routerLink="/produits/new">+ Nouveau produit</a>
    </div>
    <div class="card">
      <table>
        <thead>
          <tr><th>Réf.</th><th>Nom</th><th>Description</th><th class="right">Prix</th><th class="right">Stock</th><th></th></tr>
        </thead>
        <tbody>
          @for (p of produits(); track p.id) {
            <tr>
              <td>{{ p.reference }}</td>
              <td>{{ p.nom }}</td>
              <td>{{ p.description }}</td>
              <td class="right">{{ p.prix | number: '1.2-2' }}</td>
              <td class="right">{{ p.quantiteStock }}</td>
              <td class="actions">
                <a class="btn sm" [routerLink]="['/produits', p.id, 'edit']">Modifier</a>
                <button class="btn sm danger" (click)="remove(p)">Supprimer</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="6" class="empty">{{ loading() ? 'Chargement…' : 'Aucun produit.' }}</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class ProduitsList {
  private api = inject(ApiService);
  private notify = inject(NotifyService);
  produits = signal<Produit[]>([]);
  loading = signal(true);

  constructor() {
    this.load();
  }

  load() {
    this.api.getProduits().subscribe({
      next: (d) => { this.produits.set(d); this.loading.set(false); },
      error: (e) => { this.loading.set(false); this.notify.error(e, 'Chargement des produits impossible.'); },
    });
  }

  remove(p: Produit) {
    if (!confirm(`Supprimer le produit ${p.nom} ?`)) return;
    this.api.deleteProduit(p.id!).subscribe({
      next: () => { this.notify.success('Produit supprimé.'); this.load(); },
      error: (e) => this.notify.error(e, 'Suppression impossible (produit utilisé dans une commande ?).'),
    });
  }
}
