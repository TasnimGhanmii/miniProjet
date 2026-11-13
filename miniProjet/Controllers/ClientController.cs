using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using miniProjet.DTOs;
using miniProjet.Services;

namespace miniProjet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientsController : ControllerBase
    {
        private readonly ClientService _service;

        public ClientsController(ClientService service)
        {
            _service = service;
        }

        // GET: api/clients
        [HttpGet]
        public async Task<IActionResult> GetAllClients()
        {
            var clients = await _service.GetAllClients();
            return Ok(clients);
        }

        // GET: api/clients/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetClient(int id)
        {
            var client = await _service.GetClient(id);

            if (client == null)
                return NotFound();

            return Ok(client);
        }

        // POST: api/clients
        [HttpPost]
        public async Task<IActionResult> AddClient(ClientDTO dto)
        {
            var client = await _service.AddClient(dto);

            return CreatedAtAction(
                nameof(GetClient),
                new { id = client.Id },
                client
            );
        }

        // PUT: api/clients/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClient(int id, ClientDTO dto)
        {
            var client = await _service.UpdateClient(id, dto);

            if (client == null)
                return NotFound();

            return Ok(client);
        }

        // DELETE: api/clients/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClient(int id)
        {
            var deleted = await _service.DeleteClient(id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
    }
