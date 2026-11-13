
using Microsoft.EntityFrameworkCore;
using System.Data;
using miniProjet.Models;
using miniProjet.DTOs;

namespace miniProjet.Services
{
    public class CommandeService
    {
        private readonly MiniProjetContext _context;
        private const decimal TVA = 0.19m;

        public CommandeService(MiniProjetContext context)
        {
            _context = context;
        }

        // Convert a Commande object into a DTO
        private static CommandeDto MapToDto(Commande commande)
        {
            return new CommandeDto
            {
                Id = commande.Id,
                Numero = commande.Numero,
                ClientId = commande.ClientId,
                DateCommande = commande.DateCommande,
                Status = commande.Status,
                TotalHt = commande.TotalHt,
                TotalTtc = commande.TotalTtc,

                LigneCommandes = commande.LigneCommandes.Select(l => new LigneCommandeDto
                {
                    Id = l.Id,
                    ProduitId = l.ProduitId,
                    CommandeId = l.CommandeId,
                    PrixUnitaire = l.PrixUnitaire,
                    Quantite = l.Quantite
                }).ToList()
            };
        }

        // Calculate the order totals
        private static void CalculateTotals(Commande commande)
        {
            commande.TotalHt = commande.LigneCommandes.Sum(
                l => l.PrixUnitaire * l.Quantite
            );

            commande.TotalTtc = commande.TotalHt * (1 + TVA);
        }

        // Get products from the database and check their quantities
        private async Task<Dictionary<int, Produit>?> GetValidProducts(
            List<LigneCommandeDto> lignes)
        {
            if (lignes == null || lignes.Count == 0)
                return null;

            foreach (var ligne in lignes)
            {
                if (ligne.Quantite <= 0)
                    return null;
            }

            var ids = lignes.Select(l => l.ProduitId).Distinct().ToList();

            var produits = await _context.Produits
                .Where(p => ids.Contains(p.Id))
                .ToListAsync();

            if (produits.Count != ids.Count)
                return null;

            var produitsDictionary = produits.ToDictionary(p => p.Id);

            // Check the total quantity if a product appears more than once
            foreach (var group in lignes.GroupBy(l => l.ProduitId))
            {
                var produit = produitsDictionary[group.Key];
                int quantiteTotale = group.Sum(l => l.Quantite);

                if (produit.QuantiteStock < quantiteTotale)
                    return null;

                if (produit.Prix == null || produit.Prix < 0)
                    return null;
            }

            return produitsDictionary;
        }

        // Create order lines using the prices from the database
        private static List<LigneCommande> CreateOrderLines(
            List<LigneCommandeDto> lignes,
            Dictionary<int, Produit> produits)
        {
            var result = new List<LigneCommande>();

            foreach (var ligne in lignes)
            {
                var nouvelleLigne = new LigneCommande
                {
                    ProduitId = ligne.ProduitId,
                    Quantite = ligne.Quantite,
                    PrixUnitaire = Convert.ToDecimal(produits[ligne.ProduitId].Prix)
                };

                result.Add(nouvelleLigne);
            }

            return result;
        }

        // Get all orders
        public async Task<List<CommandeDto>> GetAllCommandes()
        {
            var commandes = await _context.Commandes
                .Include(c => c.LigneCommandes)
                .ToListAsync();

            return commandes.Select(c => MapToDto(c)).ToList();
        }

        // Get an order by ID
        public async Task<CommandeDto?> GetCommande(int id)
        {
            var commande = await _context.Commandes
                .Include(c => c.LigneCommandes)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (commande == null)
                return null;

            return MapToDto(commande);
        }

        // Add an order
        public async Task<CommandeDto?> AddCommande(CommandeDto dto)
        {
            bool clientExists = await _context.Clients
                .AnyAsync(c => c.Id == dto.ClientId);

            if (!clientExists)
                return null;

            var produits = await GetValidProducts(dto.LigneCommandes);

            if (produits == null)
                return null;

            var commande = new Commande
            {
                Numero = dto.Numero,
                ClientId = dto.ClientId,
                DateCommande = DateTime.Now,
                Status =CommandeStatus.Brouillon,
                LigneCommandes = CreateOrderLines(dto.LigneCommandes, produits)
            };

            CalculateTotals(commande);

            _context.Commandes.Add(commande);
            await _context.SaveChangesAsync();

            return MapToDto(commande);
        }

        // Update an order
        public async Task<(bool Found, bool Valid)> UpdateCommande(
            int id, CommandeDto dto)
        {
            var commande = await _context.Commandes
                .Include(c => c.LigneCommandes)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (commande == null)
                return (false, true);

            // A validated order cannot be modified
            if (commande.Status == CommandeStatus.Validee)
                return (true, false);

            bool clientExists = await _context.Clients
                .AnyAsync(c => c.Id == dto.ClientId);

            if (!clientExists)
                return (true, false);

            var produits = await GetValidProducts(dto.LigneCommandes);

            if (produits == null)
                return (true, false);

            commande.Numero = dto.Numero;
            commande.ClientId = dto.ClientId;
            commande.Status = CommandeStatus.Brouillon;

            _context.LigneCommandes.RemoveRange(commande.LigneCommandes);

            commande.LigneCommandes = CreateOrderLines(
                dto.LigneCommandes, produits
            );

            CalculateTotals(commande);

            await _context.SaveChangesAsync();

            return (true, true);
        }

        // Delete an order
        public async Task<bool> DeleteCommande(int id)
        {
            using var transaction = await _context.Database
                .BeginTransactionAsync(IsolationLevel.Serializable);

            var commande = await _context.Commandes
                .Include(c => c.LigneCommandes)
                .ThenInclude(l => l.Produit)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (commande == null)
                return false;

            // Restore stock if the order was already validated
            if (commande.Status == CommandeStatus.Validee)
            {
                foreach (var group in commande.LigneCommandes.GroupBy(l => l.ProduitId))
                {
                    var produit = group.First().Produit;
                    produit.QuantiteStock += group.Sum(l => l.Quantite);
                }
            }

            _context.LigneCommandes.RemoveRange(commande.LigneCommandes);
            _context.Commandes.Remove(commande);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return true;
        }

        // Validate an order
        public async Task<(bool Found, bool Valid)> ValidateCommande(int id)
        {
            using var transaction = await _context.Database
                .BeginTransactionAsync(IsolationLevel.Serializable);

            var commande = await _context.Commandes
                .Include(c => c.LigneCommandes)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (commande == null)
                return (false, true);

            if (commande.Status == CommandeStatus.Validee)
                return (true, false);

            if (commande.LigneCommandes.Count == 0)
                return (true, false);

            // Group lines by product to calculate the total quantity
            var quantities = commande.LigneCommandes
                .GroupBy(l => l.ProduitId)
                .Select(g => new
                {
                    ProduitId = g.Key,
                    Quantite = g.Sum(l => l.Quantite)
                })
                .ToList();

            var ids = quantities.Select(q => q.ProduitId).ToList();

            var produits = await _context.Produits
                .Where(p => ids.Contains(p.Id))
                .ToListAsync();

            // Check that all products exist and have enough stock
            foreach (var item in quantities)
            {
                var produit = produits.FirstOrDefault(p => p.Id == item.ProduitId);

                if (produit == null || produit.QuantiteStock < item.Quantite)
                    return (true, false);
            }

            // Deduct stock after checking all products
            foreach (var item in quantities)
            {
                var produit = produits.First(p => p.Id == item.ProduitId);
                produit.QuantiteStock -= item.Quantite;
            }

            commande.Status = CommandeStatus.Validee;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return (true, true);
        }
    }
}
