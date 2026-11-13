import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ApiService } from '../core/api.service';
import { NotifyService } from '../core/notify.service';
import { Client, Commande, statusLabel } from '../core/models';

@Component({
  selector: 'app-commandes-list',
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="toolbar">
      <h1>Commandes</h1>
      <a class="btn" routerLink="/commandes/new">+ Nouvelle commande</a>
    </div>
    <div class="card">
      <table>
        <thead>
          <tr><th>N°</th><th>Client</th><th>Date</th><th>Statut</th><th class="right">Total HT</th><th class="right">Total TTC</th><th></th></tr>
        </thead>
        <tbody>
          @for (c of commandes(); track c.id) {
            <tr>
              <td>{{ c.numero }}</td>
              <td>{{ clientName(c.clientId) }}</td>
              <td>{{ c.dateCommande | date: 'dd/MM/yyyy' }}</td>
              <td><span class="badge" [class]="'badge ' + label(c)">{{ label(c) }}</span></td>
              <td class="right">{{ c.totalHt | number: '1.2-2' }}</td>
              <td class="right">{{ c.totalTtc | number: '1.2-2' }}</td>
              <td class="actions">
                <a class="btn sm" [routerLink]="['/commandes', c.id]">Détail</a>
                @if (label(c) !== 'Validee') {
                  <a class="btn sm sec" [routerLink]="['/commandes', c.id, 'edit']">Modifier</a>
                }
                <button class="btn sm danger" (click)="remove(c)">Supprimer</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="7" class="empty">{{ loading() ? 'Chargement…' : 'Aucune commande.' }}</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class CommandesList {
  private api = inject(ApiService);
  private notify = inject(NotifyService);
  commandes = signal<Commande[]>([]);
  clients = signal<Client[]>([]);
  loading = signal(true);

  constructor() {
    this.load();
  }

  label = (c: Commande) => statusLabel(c.status);

  clientName(id: number) {
    const c = this.clients().find((x) => x.id === id);
    return c ? `${c.nom} ${c.prenomOuRaisonSociale}` : `#${id}`;
  }

  load() {
    forkJoin({ commandes: this.api.getCommandes(), clients: this.api.getClients() }).subscribe({
      next: (r) => {
        this.commandes.set(r.commandes);
        this.clients.set(r.clients);
        this.loading.set(false);
      },
      error: (e) => { this.loading.set(false); this.notify.error(e, 'Chargement des commandes impossible.'); },
    });
  }

  remove(c: Commande) {
    if (!confirm(`Supprimer la commande n°${c.numero} ?`)) return;
    this.api.deleteCommande(c.id!).subscribe({
      next: (r) => { this.notify.success(r.message); this.load(); },
      error: (e) => this.notify.error(e, 'Suppression impossible.'),
    });
  }
}
