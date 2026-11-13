using miniProjet.Models;

namespace miniProjet.DTOs
{
    public class CommandeDto
    {
        public int Id { get; set; }

        public int Numero { get; set; }

        public int ClientId { get; set; }

        public DateTime? DateCommande { get; set; }

        public CommandeStatus Status { get; set; } = CommandeStatus.Brouillon;

        public decimal TotalHt { get; set; }

        public decimal TotalTtc { get; set; }

        public List<LigneCommandeDto> LigneCommandes { get; set; } = new();
    }

}
