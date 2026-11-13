import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { NotifyService } from '../core/notify.service';
import { Client } from '../core/models';

@Component({
  selector: 'app-clients-list',
  imports: [RouterLink],
  template: `
    <div class="toolbar">
      <h1>Clients</h1>
      <a class="btn" routerLink="/clients/new">+ Nouveau client</a>
    </div>
    <div class="card">
      <table>
        <thead>
          <tr><th>Nom</th><th>Prénom / Raison sociale</th><th>Email</th><th>Téléphone</th><th>Ville</th><th></th></tr>
        </thead>
        <tbody>
          @for (c of clients(); track c.id) {
            <tr>
              <td>{{ c.nom }}</td>
              <td>{{ c.prenomOuRaisonSociale }}</td>
              <td>{{ c.email }}</td>
              <td>{{ c.telephone }}</td>
              <td>{{ c.address?.ville }}</td>
              <td class="actions">
                <a class="btn sm" [routerLink]="['/clients', c.id, 'edit']">Modifier</a>
                <button class="btn sm danger" (click)="remove(c)">Supprimer</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="6" class="empty">{{ loading() ? 'Chargement…' : 'Aucun client.' }}</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class ClientsList {
  private api = inject(ApiService);
  private notify = inject(NotifyService);
  clients = signal<Client[]>([]);
  loading = signal(true);

  constructor() {
    this.load();
  }

  load() {
    this.api.getClients().subscribe({
      next: (data) => { this.clients.set(data); this.loading.set(false); },
      error: (e) => { this.loading.set(false); this.notify.error(e, 'Chargement des clients impossible.'); },
    });
  }

  remove(c: Client) {
    if (!confirm(`Supprimer le client ${c.nom} ?`)) return;
    this.api.deleteClient(c.id!).subscribe({
      next: () => { this.notify.success('Client supprimé.'); this.load(); },
      error: (e) => this.notify.error(e, 'Suppression impossible (le client a peut-être des commandes).'),
    });
  }
}
