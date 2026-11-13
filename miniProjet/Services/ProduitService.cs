using Microsoft.EntityFrameworkCore;
using miniProjet.Models;
using miniProjet.DTOs;

namespace miniProjet.Services
{
    public class ProduitService
    {
        private readonly MiniProjetContext _context;

        public ProduitService(MiniProjetContext context)
        {
            _context = context;
        }

        // GET: Get all products
        public async Task<List<ProduitDto>> GetAllProduits()
        {
            return await _context.Produits
                .Select(p => new ProduitDto
                {
                    Id = p.Id,
                    Reference = p.Reference,
                    Nom = p.Nom,
                    Description = p.Description,
                    Prix = p.Prix,
                    DateCreation = p.DateCreation
                })
                .ToListAsync();
        }

        // GET: Get product by ID
        public async Task<ProduitDto?> GetProduit(int id)
        {
            var produit = await _context.Produits.FindAsync(id);

            if (produit == null)
                return null;

            return new ProduitDto
            {
                Id = produit.Id,
                Reference = produit.Reference,
                Nom = produit.Nom,
                Description = produit.Description,
                Prix = produit.Prix,
                DateCreation = produit.DateCreation
            };
        }

        // POST: Add a product
        public async Task<ProduitDto> AddProduit(ProduitDto dto)
        {
            var produit = new Produit
            {
                Reference = dto.Reference,
                Nom = dto.Nom,
                Description = dto.Description,
                Prix = dto.Prix,
                DateCreation = dto.DateCreation ?? DateTime.Now
            };

            _context.Produits.Add(produit);

            await _context.SaveChangesAsync();

            dto.Id = produit.Id;
            dto.DateCreation = produit.DateCreation;

            return dto;
        }

        // PUT: Update a product
        public async Task<bool> UpdateProduit(int id, ProduitDto dto)
        {
            var produit = await _context.Produits.FindAsync(id);

            if (produit == null)
                return false;

            produit.Reference = dto.Reference;
            produit.Nom = dto.Nom;
            produit.Description = dto.Description;
            produit.Prix = dto.Prix;

            await _context.SaveChangesAsync();

            return true;
        }

        // DELETE: Delete a product
        public async Task<bool> DeleteProduit(int id)
        {
            var produit = await _context.Produits.FindAsync(id);

            if (produit == null)
                return false;

            _context.Produits.Remove(produit);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}