namespace miniProjet.DTOs
{
    public class ClientDTO
    {
        public int Id { get; set; }

        public string Nom { get; set; } = null!;

        public string PrenomOuRaisonSociale { get; set; } = null!;

        public string Email { get; set; } = null!;

        public string? Telephone { get; set; }

        public required AdresseDto Address { get; set; }


    }
}
