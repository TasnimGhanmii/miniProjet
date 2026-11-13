using Microsoft.AspNetCore.Mvc;
using miniProjet.DTOs;
using miniProjet.Services;

namespace miniProjet.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProduitController : ControllerBase
    {
        private readonly ProduitService _service;

        public ProduitController(ProduitService service)
        {
            _service = service;
        }

        // GET: api/products
        [HttpGet]
        public async Task<IActionResult> GetAllProduits()
        {
            var produits = await _service.GetAllProduits();

            return Ok(produits);
        }

        // GET: api/products/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduit(int id)
        {
            var produit = await _service.GetProduit(id);

            if (produit == null)
                return NotFound();

            return Ok(produit);
        }

        // POST: api/products
        [HttpPost]
        public async Task<IActionResult> AddProduit(ProduitDto dto)
        {
            var produit = await _service.AddProduit(dto);

            return CreatedAtAction(
                nameof(GetProduit),
                new { id = produit.Id },
                produit
            );
        }

        // PUT: api/products/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduit(int id, ProduitDto dto)
        {
            var success = await _service.UpdateProduit(id, dto);

            if (!success)
                return NotFound();

            return NoContent();
        }

        // DELETE: api/products/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduit(int id)
        {
            var success = await _service.DeleteProduit(id);

            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}