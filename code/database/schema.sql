-- Base de données pour le système de gestion d'emprunt de matériel MIT/MISA
-- Version: 1.0.0
-- Date: 2024

CREATE DATABASE IF NOT EXISTS emprunt_materiel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE emprunt_materiel;

-- Table des utilisateurs
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    role ENUM('etudiant', 'professeur', 'responsable') NOT NULL DEFAULT 'etudiant',
    numero_etudiant VARCHAR(20) UNIQUE NULL,
    telephone VARCHAR(20) NULL,
    adresse TEXT NULL,
    statut ENUM('actif', 'inactif', 'suspendu') NOT NULL DEFAULT 'actif',
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_numero_etudiant (numero_etudiant),
    INDEX idx_statut (statut)
);

-- Table des catégories de matériel
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    description TEXT NULL,
    couleur VARCHAR(7) DEFAULT '#6B7280',
    icone VARCHAR(50) DEFAULT 'Package',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_nom (nom)
);

-- Table des matériels
CREATE TABLE materiels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    numero_serie VARCHAR(100) UNIQUE NULL,
    marque VARCHAR(100) NULL,
    modele VARCHAR(100) NULL,
    categorie_id INT NOT NULL,
    quantite_totale INT NOT NULL DEFAULT 1,
    quantite_disponible INT NOT NULL DEFAULT 1,
    prix_unitaire DECIMAL(10,2) NULL,
    etat ENUM('excellent', 'bon', 'moyen', 'mauvais', 'hors_service') NOT NULL DEFAULT 'excellent',
    localisation VARCHAR(200) NULL,
    date_acquisition DATE NULL,
    garantie_fin DATE NULL,
    image_url VARCHAR(500) NULL,
    qr_code VARCHAR(200) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_nom (nom),
    INDEX idx_categorie (categorie_id),
    INDEX idx_etat (etat),
    INDEX idx_numero_serie (numero_serie),
    INDEX idx_disponibilite (quantite_disponible)
);

-- Table des demandes d'emprunt
CREATE TABLE demandes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    materiel_id INT NOT NULL,
    quantite_demandee INT NOT NULL DEFAULT 1,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    motif TEXT NOT NULL,
    projet VARCHAR(200) NOT NULL,
    urgence ENUM('faible', 'normale', 'elevee', 'urgente') NOT NULL DEFAULT 'normale',
    statut ENUM('en_attente', 'approuvee', 'refusee', 'annulee') NOT NULL DEFAULT 'en_attente',
    commentaire_responsable TEXT NULL,
    approuve_par INT NULL,
    date_approbation TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (materiel_id) REFERENCES materiels(id) ON DELETE CASCADE,
    FOREIGN KEY (approuve_par) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_materiel (materiel_id),
    INDEX idx_statut (statut),
    INDEX idx_dates (date_debut, date_fin),
    INDEX idx_urgence (urgence)
);

-- Table des emprunts
CREATE TABLE emprunts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    demande_id INT NOT NULL,
    user_id INT NOT NULL,
    materiel_id INT NOT NULL,
    quantite INT NOT NULL,
    date_emprunt DATE NOT NULL,
    date_retour_prevue DATE NOT NULL,
    date_retour_effective DATE NULL,
    statut ENUM('en_cours', 'termine', 'en_retard', 'perdu', 'endommage') NOT NULL DEFAULT 'en_cours',
    etat_retour ENUM('excellent', 'bon', 'moyen', 'mauvais', 'endommage') NULL,
    commentaire_retour TEXT NULL,
    frais_retard DECIMAL(10,2) DEFAULT 0.00,
    frais_degats DECIMAL(10,2) DEFAULT 0.00,
    responsable_emprunt INT NOT NULL,
    responsable_retour INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (demande_id) REFERENCES demandes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (materiel_id) REFERENCES materiels(id) ON DELETE CASCADE,
    FOREIGN KEY (responsable_emprunt) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (responsable_retour) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_materiel (materiel_id),
    INDEX idx_statut (statut),
    INDEX idx_dates (date_emprunt, date_retour_prevue),
    INDEX idx_demande (demande_id)
);

-- Table des notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    titre VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') NOT NULL DEFAULT 'info',
    categorie ENUM('emprunt', 'retour', 'demande', 'systeme', 'rappel') NOT NULL,
    lu BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500) NULL,
    metadata JSON NULL,
    expire_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_lu (lu),
    INDEX idx_type (type),
    INDEX idx_categorie (categorie),
    INDEX idx_created (created_at)
);

-- Table des logs d'activité
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_table (table_name),
    INDEX idx_created (created_at)
);

-- Table des paramètres système
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cle VARCHAR(100) UNIQUE NOT NULL,
    valeur TEXT NOT NULL,
    description TEXT NULL,
    type ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string',
    updated_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_cle (cle)
);

-- Table des sessions utilisateur
CREATE TABLE user_sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_expires (expires_at),
    INDEX idx_last_activity (last_activity)
);

-- Table des fichiers uploadés
CREATE TABLE uploads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INT NOT NULL,
    path VARCHAR(500) NOT NULL,
    uploaded_by INT NOT NULL,
    related_table VARCHAR(50) NULL,
    related_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_related (related_table, related_id)
);

-- Vues pour les statistiques

-- Vue des statistiques utilisateurs
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.nom,
    u.prenom,
    u.role,
    COUNT(DISTINCT e.id) as total_emprunts,
    COUNT(DISTINCT CASE WHEN e.statut = 'en_cours' THEN e.id END) as emprunts_actifs,
    COUNT(DISTINCT CASE WHEN e.statut = 'en_retard' THEN e.id END) as emprunts_retard,
    COALESCE(SUM(e.frais_retard + e.frais_degats), 0) as total_frais,
    MAX(e.date_emprunt) as dernier_emprunt
FROM users u
LEFT JOIN emprunts e ON u.id = e.user_id
WHERE u.statut = 'actif'
GROUP BY u.id, u.nom, u.prenom, u.role;

-- Vue des statistiques matériels
CREATE VIEW materiel_stats AS
SELECT 
    m.id,
    m.nom,
    c.nom as categorie,
    m.quantite_totale,
    m.quantite_disponible,
    COUNT(DISTINCT e.id) as total_emprunts,
    COUNT(DISTINCT CASE WHEN e.statut = 'en_cours' THEN e.id END) as emprunts_actifs,
    AVG(DATEDIFF(COALESCE(e.date_retour_effective, CURDATE()), e.date_emprunt)) as duree_moyenne,
    MAX(e.date_emprunt) as dernier_emprunt
FROM materiels m
LEFT JOIN categories c ON m.categorie_id = c.id
LEFT JOIN emprunts e ON m.id = e.materiel_id
GROUP BY m.id, m.nom, c.nom, m.quantite_totale, m.quantite_disponible;

-- Vue du tableau de bord
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE statut = 'actif') as total_users,
    (SELECT COUNT(*) FROM materiels) as total_materiels,
    (SELECT SUM(quantite_disponible) FROM materiels) as materiels_disponibles,
    (SELECT COUNT(*) FROM emprunts WHERE statut = 'en_cours') as emprunts_actifs,
    (SELECT COUNT(*) FROM emprunts WHERE statut = 'en_retard') as emprunts_retard,
    (SELECT COUNT(*) FROM demandes WHERE statut = 'en_attente') as demandes_attente,
    (SELECT COUNT(*) FROM notifications WHERE lu = FALSE) as notifications_non_lues;

-- Triggers pour la gestion automatique

-- Trigger pour mettre à jour la quantité disponible lors d'un emprunt
DELIMITER //
CREATE TRIGGER update_quantite_emprunt 
AFTER INSERT ON emprunts
FOR EACH ROW
BEGIN
    UPDATE materiels 
    SET quantite_disponible = quantite_disponible - NEW.quantite
    WHERE id = NEW.materiel_id;
END//

-- Trigger pour restaurer la quantité lors d'un retour
CREATE TRIGGER update_quantite_retour
AFTER UPDATE ON emprunts
FOR EACH ROW
BEGIN
    IF OLD.statut != 'termine' AND NEW.statut = 'termine' THEN
        UPDATE materiels 
        SET quantite_disponible = quantite_disponible + NEW.quantite
        WHERE id = NEW.materiel_id;
    END IF;
END//

-- Trigger pour créer une notification lors d'une nouvelle demande
CREATE TRIGGER notification_nouvelle_demande
AFTER INSERT ON demandes
FOR EACH ROW
BEGIN
    INSERT INTO notifications (user_id, titre, message, type, categorie, action_url)
    SELECT 
        u.id,
        'Nouvelle demande d\'emprunt',
        CONCAT('Une nouvelle demande d\'emprunt a été soumise pour ', m.nom),
        'info',
        'demande',
        CONCAT('/admin/demandes/', NEW.id)
    FROM users u, materiels m
    WHERE u.role = 'responsable' 
    AND u.statut = 'actif'
    AND m.id = NEW.materiel_id;
END//

-- Trigger pour créer une notification de rappel de retour
CREATE TRIGGER notification_rappel_retour
AFTER UPDATE ON emprunts
FOR EACH ROW
BEGIN
    IF NEW.statut = 'en_retard' AND OLD.statut != 'en_retard' THEN
        INSERT INTO notifications (user_id, titre, message, type, categorie, action_url)
        SELECT 
            NEW.user_id,
            'Retour en retard',
            CONCAT('Le retour du matériel ', m.nom, ' est en retard'),
            'warning',
            'rappel',
            CONCAT('/emprunts/', NEW.id)
        FROM materiels m
        WHERE m.id = NEW.materiel_id;
    END IF;
END//

-- Trigger pour logger les activités
CREATE TRIGGER log_user_activity
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (
        NEW.id,
        'UPDATE',
        'users',
        NEW.id,
        JSON_OBJECT(
            'nom', OLD.nom,
            'prenom', OLD.prenom,
            'email', OLD.email,
            'role', OLD.role,
            'statut', OLD.statut
        ),
        JSON_OBJECT(
            'nom', NEW.nom,
            'prenom', NEW.prenom,
            'email', NEW.email,
            'role', NEW.role,
            'statut', NEW.statut
        )
    );
END//

DELIMITER ;

-- Procédures stockées

-- Procédure pour nettoyer les anciennes notifications
DELIMITER //
CREATE PROCEDURE CleanOldNotifications()
BEGIN
    DELETE FROM notifications 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND lu = TRUE;
    
    DELETE FROM notifications
    WHERE expire_at IS NOT NULL 
    AND expire_at < NOW();
END//

-- Procédure pour calculer les frais de retard
CREATE PROCEDURE CalculateLateFees(IN emprunt_id INT)
BEGIN
    DECLARE jours_retard INT DEFAULT 0;
    DECLARE frais_par_jour DECIMAL(10,2) DEFAULT 1000.00;
    
    SELECT DATEDIFF(CURDATE(), date_retour_prevue) INTO jours_retard
    FROM emprunts 
    WHERE id = emprunt_id AND statut = 'en_retard';
    
    IF jours_retard > 0 THEN
        UPDATE emprunts 
        SET frais_retard = jours_retard * frais_par_jour
        WHERE id = emprunt_id;
    END IF;
END//

-- Procédure pour générer un rapport mensuel
CREATE PROCEDURE GenerateMonthlyReport(IN mois INT, IN annee INT)
BEGIN
    SELECT 
        'Emprunts du mois' as type,
        COUNT(*) as total,
        COUNT(CASE WHEN statut = 'termine' THEN 1 END) as termines,
        COUNT(CASE WHEN statut = 'en_retard' THEN 1 END) as retards,
        SUM(frais_retard + frais_degats) as total_frais
    FROM emprunts 
    WHERE MONTH(date_emprunt) = mois AND YEAR(date_emprunt) = annee
    
    UNION ALL
    
    SELECT 
        'Matériels les plus empruntés' as type,
        m.nom as nom,
        COUNT(e.id) as emprunts,
        '' as vide1,
        '' as vide2
    FROM materiels m
    JOIN emprunts e ON m.id = e.materiel_id
    WHERE MONTH(e.date_emprunt) = mois AND YEAR(e.date_emprunt) = annee
    GROUP BY m.id, m.nom
    ORDER BY emprunts DESC
    LIMIT 5;
END//

DELIMITER ;

-- Insertion des données par défaut

-- Catégories par défaut
INSERT INTO categories (nom, description, couleur, icone) VALUES
('Microcontrôleurs', 'Arduino, Raspberry Pi, ESP32, etc.', '#3B82F6', 'Cpu'),
('Capteurs', 'Capteurs de température, humidité, mouvement, etc.', '#10B981', 'Zap'),
('Audiovisuel', 'Projecteurs, écrans, caméras, micros', '#8B5CF6', 'Camera'),
('Instruments de mesure', 'Multimètres, oscilloscopes, générateurs', '#F59E0B', 'Activity'),
('Composants électroniques', 'Résistances, condensateurs, circuits intégrés', '#EF4444', 'Cpu'),
('Outils', 'Tournevis, pinces, fers à souder', '#6B7280', 'Wrench'),
('Informatique', 'Ordinateurs portables, tablettes, accessoires', '#06B6D4', 'Monitor');

-- Utilisateur administrateur par défaut
INSERT INTO users (email, password_hash, nom, prenom, role, statut, email_verified) VALUES
('admin@mit-misa.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G', 'Admin', 'Système', 'responsable', 'actif', TRUE);

-- Paramètres système par défaut
INSERT INTO settings (cle, valeur, description, type) VALUES
('app_name', 'MIT/MISA - Gestion Matériel', 'Nom de l\'application', 'string'),
('max_emprunt_duration', '30', 'Durée maximale d\'emprunt en jours', 'number'),
('late_fee_per_day', '1000', 'Frais de retard par jour en Ariary', 'number'),
('max_emprunts_per_user', '5', 'Nombre maximum d\'emprunts simultanés par utilisateur', 'number'),
('notification_retention_days', '30', 'Nombre de jours de rétention des notifications', 'number'),
('backup_enabled', 'true', 'Activation des sauvegardes automatiques', 'boolean'),
('maintenance_mode', 'false', 'Mode maintenance', 'boolean'),
('email_notifications', 'true', 'Notifications par email activées', 'boolean');

-- Index pour optimiser les performances
CREATE INDEX idx_emprunts_dates_statut ON emprunts(date_emprunt, date_retour_prevue, statut);
CREATE INDEX idx_notifications_user_lu ON notifications(user_id, lu, created_at);
CREATE INDEX idx_activity_logs_date ON activity_logs(created_at);
CREATE INDEX idx_materiels_search ON materiels(nom, description);

-- Événements planifiés pour la maintenance automatique

-- Nettoyage quotidien des anciennes sessions
CREATE EVENT IF NOT EXISTS cleanup_old_sessions
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
DELETE FROM user_sessions WHERE expires_at < NOW();

-- Mise à jour quotidienne du statut des emprunts en retard
CREATE EVENT IF NOT EXISTS update_late_loans
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
UPDATE emprunts 
SET statut = 'en_retard' 
WHERE statut = 'en_cours' 
AND date_retour_prevue < CURDATE();

-- Nettoyage hebdomadaire des anciennes notifications
CREATE EVENT IF NOT EXISTS cleanup_old_notifications
ON SCHEDULE EVERY 1 WEEK
STARTS CURRENT_TIMESTAMP
DO
CALL CleanOldNotifications();
