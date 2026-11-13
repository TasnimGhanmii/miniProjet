namespace miniProjet.DTOs
{
    public class ProduitDto
    {
        public int Id { get; set; }

        public int Reference { get; set; }

        public string? Nom { get; set; }

        public string? Description { get; set; }

        public float? Prix { get; set; }
        public int QuantiteStock { get; set; } = 0;


        public DateTime? DateCreation { get; set; }
    }
}