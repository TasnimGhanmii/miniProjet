import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client, Commande, Produit } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // Clients  -> /api/clients
  getClients = () => this.http.get<Client[]>('/api/clients');
  getClient = (id: number) => this.http.get<Client>(`/api/clients/${id}`);
  addClient = (c: Client) => this.http.post<Client>('/api/clients', c);
  updateClient = (id: number, c: Client) => this.http.put<Client>(`/api/clients/${id}`, c);
  deleteClient = (id: number) => this.http.delete<void>(`/api/clients/${id}`);

  // Produits -> /api/produit
  getProduits = () => this.http.get<Produit[]>('/api/produit');
  getProduit = (id: number) => this.http.get<Produit>(`/api/produit/${id}`);
  addProduit = (p: Produit) => this.http.post<Produit>('/api/produit', p);
  updateProduit = (id: number, p: Produit) => this.http.put<void>(`/api/produit/${id}`, p);
  deleteProduit = (id: number) => this.http.delete<void>(`/api/produit/${id}`);

  // Commandes -> /api/orders
  getCommandes = () => this.http.get<Commande[]>('/api/orders');
  getCommande = (id: number) => this.http.get<Commande>(`/api/orders/${id}`);
  addCommande = (c: Commande) => this.http.post<Commande>('/api/orders', c);
  updateCommande = (id: number, c: Commande) =>
    this.http.put<{ message: string }>(`/api/orders/${id}`, c);
  deleteCommande = (id: number) => this.http.delete<{ message: string }>(`/api/orders/${id}`);
  validateCommande = (id: number) =>
    this.http.post<{ message: string }>(`/api/orders/${id}/validate`, {});
}
