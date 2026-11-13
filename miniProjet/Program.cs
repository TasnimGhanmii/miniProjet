using Microsoft.EntityFrameworkCore;
using miniProjet.Models;
using miniProjet.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<MiniProjetContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString!)
    )
);

builder.Services.AddScoped<ClientService>();
builder.Services.AddScoped<ProduitService>();
builder.Services.AddScoped<CommandeService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();