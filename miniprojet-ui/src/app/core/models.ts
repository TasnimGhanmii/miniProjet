export interface Adresse {
  id?: number;
  rue: string | null;
  ville: string | null;
  codePostal: string | null;
  pays: string | null;
}

export interface Client {
  id?: number;
  nom: string;
  prenomOuRaisonSociale: string;
  email: string;
  telephone: string | null;
  address: Adresse;
}

export interface Produit {
  id?: number;
  reference: number;
  nom: string | null;
  description: string | null;
  prix: number | null;
  quantiteStock: number;
  dateCreation?: string | null;
}

export interface LigneCommande {
  id?: number;
  produitId: number;
  commandeId?: number;
  prixUnitaire?: number;
  quantite: number;
}

// L'API renvoie l'enum soit en nombre (0,1,2) soit en texte selon la configuration JSON
export type StatusRaw = number | string;

export interface Commande {
  id?: number;
  numero: number;
  clientId: number;
  dateCommande?: string | null;
  status?: StatusRaw;
  totalHt?: number;
  totalTtc?: number;
  ligneCommandes: LigneCommande[];
}

const LABELS = ['Brouillon', 'Validee', 'Annulee'];

export function statusLabel(s: StatusRaw | undefined): string {
  if (typeof s === 'number') return LABELS[s] ?? String(s);
  return s ?? 'Brouillon';
}
