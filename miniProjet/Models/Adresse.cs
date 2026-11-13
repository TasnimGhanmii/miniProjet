using System;
using System.Collections.Generic;

namespace miniProjet.Models;

public partial class Adresse
{
    public int Id { get; set; }

    public int ClientId { get; set; }

    public string? Rue { get; set; }

    public string? Ville { get; set; }

    public string? CodePostal { get; set; }

    public string? Pays { get; set; }

    public virtual Client Client { get; set; } = null!;
}
