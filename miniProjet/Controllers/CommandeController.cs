
using Microsoft.AspNetCore.Mvc;
using miniProjet.DTOs;
using miniProjet.Services;

namespace miniProjet.Controllers
{
    [Route("api/orders")]
    [ApiController]
    public class CommandeController : ControllerBase
    {
        private readonly CommandeService _commandeService;

        public CommandeController(CommandeService commandeService)
        {
            _commandeService = commandeService;
        }

        // GET: api/orders
        [HttpGet]
        public async Task<ActionResult<List<CommandeDto>>> GetAllCommandes()
        {
            var commandes = await _commandeService.GetAllCommandes();

            return Ok(commandes);
        }

        // GET: api/orders/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<CommandeDto>> GetCommande(int id)
        {
            var commande = await _commandeService.GetCommande(id);

            if (commande == null)
                return NotFound(new { message = "Commande introuvable." });

            return Ok(commande);
        }

        // POST: api/orders
        [HttpPost]
        public async Task<ActionResult<CommandeDto>> AddCommande(
            [FromBody] CommandeDto dto)
        {
            var commande = await _commandeService.AddCommande(dto);

            if (commande == null)
                return BadRequest(new
                {
                    message = "Impossible de créer la commande. Vérifiez le client, les produits et les quantités en stock."
                });

            return CreatedAtAction(
                nameof(GetCommande),
                new { id = commande.Id },
                commande
            );
        }

        // PUT: api/orders/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCommande(
            int id,
            [FromBody] CommandeDto dto)
        {
            var result = await _commandeService.UpdateCommande(id, dto);

            if (!result.Found)
                return NotFound(new { message = "Commande introuvable." });

            if (!result.Valid)
                return BadRequest(new
                {
                    message = "Impossible de modifier la commande. Vérifiez son statut, le client, les produits et les quantités."
                });

            return Ok(new { message = "Commande modifiée avec succès." });
        }

        // DELETE: api/orders/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCommande(int id)
        {
            bool deleted = await _commandeService.DeleteCommande(id);

            if (!deleted)
                return NotFound(new { message = "Commande introuvable." });

            return Ok(new { message = "Commande supprimée avec succès." });
        }

        // POST: api/orders/{id}/validate
        [HttpPost("{id}/validate")]
        public async Task<IActionResult> ValidateCommande(int id)
        {
            var result = await _commandeService.ValidateCommande(id);

            if (!result.Found)
                return NotFound(new { message = "Commande introuvable." });

            if (!result.Valid)
                return BadRequest(new
                {
                    message = "Impossible de valider la commande. Vérifiez son statut, ses lignes et les stocks disponibles."
                });

            return Ok(new { message = "Commande validée avec succès." });
        }
    }
}
