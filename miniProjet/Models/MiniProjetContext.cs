using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace miniProjet.Models;

public partial class MiniProjetContext : DbContext
{
    public MiniProjetContext()
    {
    }

    public MiniProjetContext(DbContextOptions<MiniProjetContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Adresse> Adresses { get; set; }

    public virtual DbSet<Client> Clients { get; set; }

    public virtual DbSet<Commande> Commandes { get; set; }

    public virtual DbSet<LigneCommande> LigneCommandes { get; set; }

    public virtual DbSet<Produit> Produits { get; set; }

//    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
//        => optionsBuilder.UseMySql("server=localhost;port=3306;database=mini_projet;user=root", Microsoft.EntityFrameworkCore.ServerVersion.Parse("10.4.28-mariadb"));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_general_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<Adresse>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("adresse");

            entity.HasIndex(e => e.ClientId, "client_id");

            entity.Property(e => e.Id)
                .HasColumnType("int(11)")
                .HasColumnName("id");
            entity.Property(e => e.ClientId)
                .HasColumnType("int(11)")
                .HasColumnName("client_id");
            entity.Property(e => e.CodePostal)
                .HasMaxLength(20)
                .HasColumnName("code_postal");
            entity.Property(e => e.Pays)
                .HasMaxLength(100)
                .HasColumnName("pays");
            entity.Property(e => e.Rue)
                .HasMaxLength(255)
                .HasColumnName("rue");
            entity.Property(e => e.Ville)
                .HasMaxLength(100)
                .HasColumnName("ville");

            entity.HasOne(d => d.Client).WithOne(p => p.Adresse)
    .HasForeignKey<Adresse>(d => d.ClientId)
    .OnDelete(DeleteBehavior.ClientSetNull)
    .HasConstraintName("adresse_ibfk_1");
        });

        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("client");

            entity.Property(e => e.Id)
                .HasColumnType("int(11)")
                .HasColumnName("id");
            entity.Property(e => e.DateCreation)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime")
                .HasColumnName("date_creation");
            entity.Property(e => e.Email)
                .HasMaxLength(150)
                .HasColumnName("email");
            entity.Property(e => e.Nom)
                .HasMaxLength(100)
                .HasColumnName("nom");
            entity.Property(e => e.PrenomOuRaisonSociale)
                .HasMaxLength(150)
                .HasColumnName("prenom_ou_raison_sociale");
            entity.Property(e => e.Telephone)
                .HasMaxLength(20)
                .HasColumnName("telephone");
        });

        modelBuilder.Entity<Commande>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("commande");

            entity.HasIndex(e => e.ClientId, "client_id");

            entity.Property(e => e.Id)
                .HasColumnType("int(11)")
                .HasColumnName("id");
            entity.Property(e => e.ClientId)
                .HasColumnType("int(11)")
                .HasColumnName("client_id");
            entity.Property(e => e.DateCommande)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime")
                .HasColumnName("date_commande");
            entity.Property(e => e.Numero)
                .HasColumnType("int(11)")
                .HasColumnName("numero");
            entity.Property(e => e.Status)
                .HasColumnType("enum('Brouillon','Validee','Annulee')")
                .HasColumnName("status");
            entity.Property(e => e.TotalHt)
                .HasPrecision(10, 2)
                .HasColumnName("total_ht");
            entity.Property(e => e.TotalTtc)
                .HasPrecision(10, 2)
                .HasColumnName("total_ttc");

            entity.HasOne(d => d.Client).WithMany(p => p.Commandes)
                .HasForeignKey(d => d.ClientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("commande_ibfk_1");
        });

        modelBuilder.Entity<LigneCommande>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("ligne_commande");

            entity.HasIndex(e => e.CommandeId, "commande_id");

            entity.HasIndex(e => e.ProduitId, "produit_id");

            entity.Property(e => e.Id)
                .HasColumnType("int(11)")
                .HasColumnName("id");
            entity.Property(e => e.CommandeId)
                .HasColumnType("int(11)")
                .HasColumnName("commande_id");
            entity.Property(e => e.PrixUnitaire)
                .HasPrecision(10, 2)
                .HasColumnName("prix_unitaire");
            entity.Property(e => e.ProduitId)
                .HasColumnType("int(11)")
                .HasColumnName("produit_id");
            entity.Property(e => e.Quantite)
                .HasColumnType("int(11)")
                .HasColumnName("quantite");

            entity.HasOne(d => d.Commande).WithMany(p => p.LigneCommandes)
                .HasForeignKey(d => d.CommandeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ligne_commande_ibfk_2");

            entity.HasOne(d => d.Produit).WithMany(p => p.LigneCommandes)
                .HasForeignKey(d => d.ProduitId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ligne_commande_ibfk_1");
        });

        modelBuilder.Entity<Produit>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("produit");

            entity.Property(e => e.Id)
                .HasColumnType("int(11)")
                .HasColumnName("id");
            entity.Property(e => e.DateCreation)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime")
                .HasColumnName("date_creation");
            entity.Property(e => e.Description)
                .HasColumnType("text")
                .HasColumnName("description");
            entity.Property(e => e.Nom)
                .HasMaxLength(20)
                .HasColumnName("nom");
            entity.Property(e => e.Prix).HasColumnName("prix");
            entity.Property(e => e.Reference)
                .HasColumnType("int(11)")
                .HasColumnName("reference");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
