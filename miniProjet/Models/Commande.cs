using System;
using System.Collections.Generic;

namespace miniProjet.Models;

public partial class Commande
{
    public int Id { get; set; }

    public int Numero { get; set; }

    public int ClientId { get; set; }

    public DateTime? DateCommande { get; set; }

    public CommandeStatus Status { get; set; } 

    public decimal TotalHt { get; set; }

    public decimal TotalTtc { get; set; }

    public virtual Client Client { get; set; } = null!;

    public virtual ICollection<LigneCommande> LigneCommandes { get; set; } = new List<LigneCommande>();
}
