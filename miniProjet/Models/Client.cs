using System;
using System.Collections.Generic;

namespace miniProjet.Models;

public partial class Client
{
    public int Id { get; set; }

    public string Nom { get; set; } = null!;

    public string PrenomOuRaisonSociale { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Telephone { get; set; }

    public DateTime? DateCreation { get; set; }

    public virtual Adresse? Adresse { get; set; }

    public virtual ICollection<Commande> Commandes { get; set; } = new List<Commande>();
}
