using System;
using System.Collections.Generic;

namespace miniProjet.Models;

public partial class LigneCommande
{
    public int Id { get; set; }

    public int ProduitId { get; set; }

    public int CommandeId { get; set; }

    public decimal PrixUnitaire { get; set; }

    public int Quantite { get; set; }

    public virtual Commande Commande { get; set; } = null!;

    public virtual Produit Produit { get; set; } = null!;
}
