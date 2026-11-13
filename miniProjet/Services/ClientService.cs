
using Microsoft.EntityFrameworkCore;
using miniProjet.DTOs;
using miniProjet.Models;

namespace miniProjet.Services
{
    public class ClientService
    {
        private readonly MiniProjetContext _context;

        public ClientService(MiniProjetContext context)
        {
            _context = context;
        }

        // Map Client entity to ClientDTO
        private ClientDTO MapToDTO(Client client)
        {
            return new ClientDTO
            {
                Id = client.Id,
                Nom = client.Nom,
                PrenomOuRaisonSociale = client.PrenomOuRaisonSociale,
                Email = client.Email,
                Telephone = client.Telephone,

                Address = new AdresseDto
                {
                    Id = client.Adresse?.Id ?? 0,
                    Rue = client.Adresse?.Rue,
                    Ville = client.Adresse?.Ville,
                    CodePostal = client.Adresse?.CodePostal,
                    Pays = client.Adresse?.Pays
                }
            };
        }

        // Get all clients
        public async Task<List<ClientDTO>> GetAllClients()
        {
            var clients = await _context.Clients
                .Include(c => c.Adresse)
                .ToListAsync();

            return clients.Select(MapToDTO).ToList();
        }

        // Get client by ID
        public async Task<ClientDTO?> GetClient(int clientID)
        {
            var client = await _context.Clients
                .Include(c => c.Adresse)
                .FirstOrDefaultAsync(c => c.Id == clientID);

            if (client == null)
                return null;

            return MapToDTO(client);
        }

        // Delete client
        public async Task<bool> DeleteClient(int clientID)
        {
            var client = await _context.Clients.FindAsync(clientID);

            if (client == null)
                return false;

            _context.Clients.Remove(client);

            await _context.SaveChangesAsync();

            return true;
        }

        // Add client
        public async Task<ClientDTO> AddClient(ClientDTO c)
        {
            var client = new Client
            {
                Nom = c.Nom,
                PrenomOuRaisonSociale = c.PrenomOuRaisonSociale,
                Email = c.Email,
                Telephone = c.Telephone,

                Adresse = new Adresse
                {
                    Rue = c.Address.Rue,
                    Ville = c.Address.Ville,
                    CodePostal = c.Address.CodePostal,
                    Pays = c.Address.Pays
                }
            };

            _context.Clients.Add(client);

            await _context.SaveChangesAsync();

            return MapToDTO(client);
        }

        // Update client
        public async Task<ClientDTO?> UpdateClient(int id, ClientDTO c)
        {
            var client = await _context.Clients
                .Include(x => x.Adresse)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (client == null)
                return null;

            client.Nom = c.Nom;
            client.PrenomOuRaisonSociale = c.PrenomOuRaisonSociale;
            client.Email = c.Email;
            client.Telephone = c.Telephone;

            if (client.Adresse != null)
            {
                client.Adresse.Rue = c.Address.Rue;
                client.Adresse.Ville = c.Address.Ville;
                client.Adresse.CodePostal = c.Address.CodePostal;
                client.Adresse.Pays = c.Address.Pays;
            }
            else
            {
                client.Adresse = new Adresse
                {
                    Rue = c.Address.Rue,
                    Ville = c.Address.Ville,
                    CodePostal = c.Address.CodePostal,
                    Pays = c.Address.Pays
                };
            }

            await _context.SaveChangesAsync();

            return MapToDTO(client);
        }
    }
}
