CREATE DATABASE IF NOT EXISTS mini_projet CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE mini_projet;

CREATE TABLE client (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom_ou_raison_sociale VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  telephone VARCHAR(20) NULL,
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE adresse (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL UNIQUE,
  rue VARCHAR(255) NULL,
  ville VARCHAR(100) NULL,
  code_postal VARCHAR(20) NULL,
  pays VARCHAR(100) NULL,
  CONSTRAINT adresse_ibfk_1 FOREIGN KEY (client_id) REFERENCES client(id)
);

CREATE TABLE produit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference INT NOT NULL,
  nom VARCHAR(20) NULL,
  description TEXT NULL,
  prix FLOAT NULL,
  QuantiteStock INT NOT NULL DEFAULT 0,
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE commande (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero INT NOT NULL,
  client_id INT NOT NULL,
  date_commande DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Brouillon','Validee','Annulee') NOT NULL DEFAULT 'Brouillon',
  total_ht DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_ttc DECIMAL(10,2) NOT NULL DEFAULT 0,
  CONSTRAINT commande_ibfk_1 FOREIGN KEY (client_id) REFERENCES client(id)
);

CREATE TABLE ligne_commande (
  id INT AUTO_INCREMENT PRIMARY KEY,
  commande_id INT NOT NULL,
  produit_id INT NOT NULL,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  quantite INT NOT NULL,
  CONSTRAINT ligne_commande_ibfk_1 FOREIGN KEY (produit_id) REFERENCES produit(id),
  CONSTRAINT ligne_commande_ibfk_2 FOREIGN KEY (commande_id) REFERENCES commande(id)
);