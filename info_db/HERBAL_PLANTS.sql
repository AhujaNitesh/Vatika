-- ============================================================
-- VIRTUAL HERBAL GARDEN (AYUSH) — COMPLETE MASTER SQL SCRIPT
-- Problem Statement: PSS03
-- Engine: MySQL 8.0+
-- ============================================================

DROP DATABASE IF EXISTS virtual_herbal_garden;
CREATE DATABASE virtual_herbal_garden 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE virtual_herbal_garden;

-- ============================================================
-- 1. SCHEMA DEFINITIONS (DDL)
-- ============================================================

-- AYUSH Traditional Systems
CREATE TABLE TraditionalSystem (
    system_id INT AUTO_INCREMENT PRIMARY KEY,
    system_name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Themed Medicinal Use Categories
CREATE TABLE MedicinalUse (
    use_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB;

-- Core Plant Information
CREATE TABLE Plant (
    plant_id INT AUTO_INCREMENT PRIMARY KEY,
    common_name VARCHAR(150) NOT NULL,
    botanical_name VARCHAR(200) NOT NULL UNIQUE,
    sanskrit_name VARCHAR(150),
    hindi_regional_name VARCHAR(150),
    plant_family VARCHAR(100),
    plant_type VARCHAR(100),
    average_height VARCHAR(100),
    habitat TEXT,
    geographic_distribution TEXT,
    climate VARCHAR(150),
    soil_requirements TEXT,
    overall_traditional_uses TEXT,
    cultivation_method TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Plant x Traditional System (Many-to-Many)
CREATE TABLE Plant_TraditionalSystem (
    plant_id INT NOT NULL,
    system_id INT NOT NULL,
    PRIMARY KEY (plant_id, system_id),
    CONSTRAINT fk_pts_plant FOREIGN KEY (plant_id) REFERENCES Plant(plant_id) ON DELETE CASCADE,
    CONSTRAINT fk_pts_system FOREIGN KEY (system_id) REFERENCES TraditionalSystem(system_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Plant x Medicinal Use (Many-to-Many)
CREATE TABLE Plant_MedicinalUse (
    plant_id INT NOT NULL,
    use_id INT NOT NULL,
    PRIMARY KEY (plant_id, use_id),
    CONSTRAINT fk_pmu_plant FOREIGN KEY (plant_id) REFERENCES Plant(plant_id) ON DELETE CASCADE,
    CONSTRAINT fk_pmu_use FOREIGN KEY (use_id) REFERENCES MedicinalUse(use_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Botanical Parts
CREATE TABLE Leaf (
    leaf_id INT AUTO_INCREMENT PRIMARY KEY,
    plant_id INT NOT NULL,
    leaf_shape VARCHAR(100),
    leaf_size VARCHAR(100),
    leaf_colour VARCHAR(100),
    leaf_arrangement VARCHAR(100),
    leaf_texture VARCHAR(100),
    leaf_margin VARCHAR(100),
    leaf_surface VARCHAR(100),
    leaf_aroma VARCHAR(150),
    stem_attachment VARCHAR(150),
    leaf_seasonality VARCHAR(100),
    traditional_uses TEXT,
    traditional_preparations TEXT,
    is_traditionally_consumed BOOLEAN DEFAULT FALSE,
    interesting_fact TEXT,
    CONSTRAINT fk_leaf_plant FOREIGN KEY (plant_id) REFERENCES Plant(plant_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Flower (
    flower_id INT AUTO_INCREMENT PRIMARY KEY,
    plant_id INT NOT NULL,
    flower_colour VARCHAR(100),
    flower_shape VARCHAR(100),
    flower_size VARCHAR(100),
    petal_count VARCHAR(50),
    flowering_season VARCHAR(100),
    fragrance VARCHAR(150),
    inflorescence_type VARCHAR(150),
    pollination_info VARCHAR(150),
    traditional_uses TEXT,
    is_used_traditionally BOOLEAN DEFAULT FALSE,
    interesting_fact TEXT,
    CONSTRAINT fk_flower_plant FOREIGN KEY (plant_id) REFERENCES Plant(plant_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Stem (
    stem_id INT AUTO_INCREMENT PRIMARY KEY,
    plant_id INT NOT NULL,
    stem_type VARCHAR(150),
    stem_colour VARCHAR(100),
    stem_texture VARCHAR(100),
    stem_thickness VARCHAR(100),
    growth_pattern VARCHAR(150),
    woody_or_herbaceous VARCHAR(50),
    special_characteristics TEXT,
    traditional_uses TEXT,
    is_used_traditionally BOOLEAN DEFAULT FALSE,
    interesting_fact TEXT,
    CONSTRAINT fk_stem_plant FOREIGN KEY (plant_id) REFERENCES Plant(plant_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Bark (
    bark_id INT AUTO_INCREMENT PRIMARY KEY,
    plant_id INT NOT NULL,
    bark_colour VARCHAR(100),
    bark_texture VARCHAR(100),
    bark_thickness VARCHAR(100),
    bark_pattern VARCHAR(150),
    age_related_change TEXT,
    traditional_use TEXT,
    traditional_preparations TEXT,
    interesting_fact TEXT,
    CONSTRAINT fk_bark_plant FOREIGN KEY (plant_id) REFERENCES Plant(plant_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Root (
    root_id INT AUTO_INCREMENT PRIMARY KEY,
    plant_id INT NOT NULL,
    root_type VARCHAR(150),
    root_appearance TEXT,
    root_colour VARCHAR(100),
    root_structure TEXT,
    root_depth VARCHAR(100),
    aroma_taste VARCHAR(150),
    traditional_use TEXT,
    traditional_preparations TEXT,
    harvesting_method TEXT,
    interesting_fact TEXT,
    CONSTRAINT fk_root_plant FOREIGN KEY (plant_id) REFERENCES Plant(plant_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Fruit (
    fruit_id INT AUTO_INCREMENT PRIMARY KEY,
    plant_id INT NOT NULL,
    fruit_type VARCHAR(100),
    fruit_shape VARCHAR(100),
    fruit_size VARCHAR(100),
    colour_immature VARCHAR(100),
    colour_mature VARCHAR(100),
    fruit_texture VARCHAR(100),
    taste_description VARCHAR(150),
    fruiting_season VARCHAR(100),
    seed_arrangement VARCHAR(150),
    traditional_use TEXT,
    traditional_preparations TEXT,
    interesting_fact TEXT,
    CONSTRAINT fk_fruit_plant FOREIGN KEY (plant_id) REFERENCES Plant(plant_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Seed (
    seed_id INT AUTO_INCREMENT PRIMARY KEY,
    plant_id INT NOT NULL,
    seed_shape VARCHAR(100),
    seed_size VARCHAR(100),
    seed_colour VARCHAR(100),
    seed_texture VARCHAR(100),
    seed_dispersal VARCHAR(150),
    germination_conditions TEXT,
    propagation_method VARCHAR(150),
    traditional_uses TEXT,
    interesting_fact TEXT,
    CONSTRAINT fk_seed_plant FOREIGN KEY (plant_id) REFERENCES Plant(plant_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Requirement (a) & (c): 3D Models and Multimedia
CREATE TABLE Media (
    media_id INT AUTO_INCREMENT PRIMARY KEY,
    plant_id INT NOT NULL,
    plant_part ENUM('General', 'Leaf', 'Flower', 'Stem', 'Bark', 'Root', 'Fruit', 'Seed') DEFAULT 'General',
    media_type ENUM('Image', 'Video', '3D_Model', 'Audio') NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    CONSTRAINT fk_media_plant FOREIGN KEY (plant_id) REFERENCES Plant(plant_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Requirement (e): Guided Virtual Themed Tours
CREATE TABLE VirtualTour (
    tour_id INT AUTO_INCREMENT PRIMARY KEY,
    tour_name VARCHAR(150) NOT NULL UNIQUE,
    theme VARCHAR(100),
    description TEXT
) ENGINE=InnoDB;

CREATE TABLE Tour_Plant (
    tour_id INT NOT NULL,
    plant_id INT NOT NULL,
    sequence_order INT NOT NULL,
    PRIMARY KEY (tour_id, plant_id),
    CONSTRAINT fk_tp_tour FOREIGN KEY (tour_id) REFERENCES VirtualTour(tour_id) ON DELETE CASCADE,
    CONSTRAINT fk_tp_plant FOREIGN KEY (plant_id) REFERENCES Plant(plant_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Requirement (f): User Interaction
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE Bookmark (
    bookmark_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plant_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_plant_bookmark UNIQUE (user_id, plant_id),
    CONSTRAINT fk_bm_user FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_bm_plant FOREIGN KEY (plant_id) REFERENCES Plant(plant_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Note (
    note_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plant_id INT NOT NULL,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_note_user FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_note_plant FOREIGN KEY (plant_id) REFERENCES Plant(plant_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 2. SEED SYSTEMS & MEDICINAL CATEGORIES
-- ============================================================

INSERT INTO TraditionalSystem (system_name) VALUES
('Ayurveda'), ('Yoga & Naturopathy'), ('Unani'), ('Siddha'), ('Homeopathy');

INSERT INTO MedicinalUse (use_id, category_name, description) VALUES
(1, 'Digestive Health', 'Plants promoting gut health, digestion, appetite, and metabolic support'),
(2, 'Immunity & General Wellness', 'Rasayana herbs that strengthen the immune response and vitality'),
(3, 'Skin Care', 'Herbs that cleanse the blood, reduce inflammation, and enhance skin radiance'),
(4, 'Mental Wellness & Stress', 'Medhya Rasayanas that reduce anxiety, boost memory, and relieve stress'),
(5, 'Respiratory Wellness', 'Plants used for throat relief, bronchodilation, and respiratory immunity');

-- ============================================================
-- 3. INSERT 39 MEDICINAL PLANTS
-- ============================================================

INSERT INTO Plant (plant_id, common_name, botanical_name, sanskrit_name, hindi_regional_name, plant_family, plant_type, geographic_distribution, climate, soil_requirements, overall_traditional_uses, cultivation_method) VALUES
(1, 'Ginger', 'Zingiber officinale', 'Shunthi / Ardraka', 'Adrak', 'Zingiberaceae', 'Herb', 'India; tropical and subtropical regions', 'Warm and humid', 'Rich, well-drained loamy soil', 'Digestive stimulant, anti-nausea, cold relief', 'Propagated from rhizome bits; harvested after 8-10 months'),
(2, 'Turmeric', 'Curcuma longa', 'Haridra', 'Haldi', 'Zingiberaceae', 'Herb', 'India; South and Southeast Asia', 'Tropical warm and humid', 'Well-drained fertile loam', 'Potent anti-inflammatory, wound-healing, complexion tonic', 'Propagated by rhizomes; harvested when leaves yellow'),
(3, 'Amla', 'Phyllanthus emblica', 'Amalaki', 'Amla', 'Phyllanthaceae', 'Tree', 'Indian subcontinent and Southeast Asia', 'Tropical and subtropical', 'Well-drained light loamy soil', 'Rich natural Vitamin C source, immunity booster, digestion', 'Grown by grafting or seeds; requires full sunlight'),
(4, 'Mint', 'Mentha spp.', 'Pudina', 'Pudina', 'Lamiaceae', 'Herb', 'Temperate and subtropical regions', 'Subtropical / Temperate', 'Moist, rich, well-drained soil', 'Cooling digestive aid, carminative, respiratory relief', 'Propagated by stem cuttings/runners in moist soil'),
(5, 'Bael', 'Aegle marmelos', 'Bilva', 'Bel / Bael', 'Rutaceae', 'Tree', 'Indian subcontinent and Southeast Asia', 'Subtropical / Tropical', 'Tolerant of sandy to clayey soils', 'Traditional cure for digestive disorders and dysentery', 'Propagated from seeds; highly drought tolerant'),
(6, 'Fennel', 'Foeniculum vulgare', 'Shatapushpa', 'Saunf', 'Apiaceae', 'Herb', 'Mediterranean origin; widely cultivated in India', 'Temperate to subtropical', 'Fertile, well-drained loam', 'Carminative, improves digestion and freshener', 'Direct sowing of seeds in sunny beds'),
(7, 'Ajwain', 'Trachyspermum ammi', 'Yavani', 'Ajwain', 'Apiaceae', 'Herb', 'Indian subcontinent and Middle East', 'Arid and semi-arid', 'Sandy loam to clay loam', 'Relieves gas, colic, bloating, and indigestion', 'Grown from seeds during winter months'),
(8, 'Cumin', 'Cuminum cyminum', 'Jeeraka', 'Jeera', 'Apiaceae', 'Herb', 'Mediterranean and South Asian cultivation', 'Dry, warm climate', 'Well-drained sandy loam', 'Metabolic booster, carminative, and digestive enhancer', 'Propagated from seeds; requires low moisture'),
(9, 'Licorice / Mulethi', 'Glycyrrhiza glabra', 'Yashtimadhu', 'Mulethi', 'Fabaceae', 'Herb', 'Europe, West Asia and South Asia', 'Dry, temperate / subtropical', 'Deep, rich, sandy-loam soil', 'Soothes throat, relieves acidity, ulcers, and cough', 'Propagated from root stolons; harvested in 3-4 years'),
(10, 'Pippali / Long Pepper', 'Piper longum', 'Pippali', 'Pippali', 'Piperaceae', 'Climber', 'Indian subcontinent and Southeast Asia', 'Warm, humid tropical', 'Well-drained fertile rich soil', 'Deep bio-enhancer (yogavahi), respiratory and digestive stimulant', 'Propagated from vine cuttings in shaded areas'),
(11, 'Tulsi', 'Ocimum tenuiflorum', 'Tulasi', 'Tulsi', 'Lamiaceae', 'Herb', 'Indian subcontinent and Southeast Asia', 'Tropical and subtropical', 'Fertile, well-drained soil', 'Sacred adaptogen, immunity booster, respiratory support', 'Propagated by seeds; requires full sun and pruning'),
(12, 'Ashwagandha', 'Withania somnifera', 'Ashvagandha', 'Asgandh', 'Solanaceae', 'Shrub', 'Indian subcontinent, Middle East and Africa', 'Arid and semi-arid', 'Sandy, well-drained soil', 'Supreme adaptogen, stress reliever, stamina and vitality builder', 'Propagated by seed; low water requirement'),
(13, 'Neem', 'Azadirachta indica', 'Nimba', 'Neem', 'Meliaceae', 'Tree', 'Indian subcontinent and tropical regions', 'Tropical, drought-tolerant', 'Thrives in poor, rocky, and dry soils', 'Natural antiseptic, blood purifier, anti-microbial skin cure', 'Propagated easily by seeds; fast growing'),
(14, 'Moringa', 'Moringa oleifera', 'Shigru', 'Sahjan / Drumstick', 'Moringaceae', 'Tree', 'Indian subcontinent; widely cultivated in tropics', 'Tropical and subtropical', 'Sandy loam soil', 'Superfood nutrient powerhouse, anti-inflammatory', 'Direct seeding or stem cuttings; very fast growing'),
(15, 'Garlic', 'Allium sativum', 'Lashuna', 'Lahsun', 'Amaryllidaceae', 'Herb', 'Central Asia; widely cultivated in India', 'Mild temperate / subtropical', 'Rich, loose, well-drained soil', 'Cardiovascular support, immune defence, cholesterol balance', 'Propagated by planting individual cloves in autumn'),
(16, 'Shatavari', 'Asparagus racemosus', 'Shatavari', 'Shatavar', 'Asparagaceae', 'Climber', 'Indian subcontinent and tropical Asia', 'Tropical and subtropical', 'Rocky, gravelly, well-drained loam', 'Rejuvenating female reproductive tonic, vitality builder', 'Grown from seeds or root crowns'),
(17, 'Aloe Vera', 'Aloe vera', 'Ghritakumari', 'Ghritkumari', 'Asphodelaceae', 'Succulent herb', 'North Africa and Arabian Peninsula; cultivated in India', 'Arid to semi-arid', 'Sandy, porous, well-drained soil', 'Soothes burns, rejuvenates skin, improves digestion', 'Propagated by offsets ("pups"); requires minimal water'),
(18, 'Manjistha', 'Rubia cordifolia', 'Manjistha', 'Manjit', 'Rubiaceae', 'Climber', 'Indian subcontinent and Southeast Asia', 'Subtropical hill zones', 'Moist, humus-rich soil', 'Premier blood-purifying herb for radiant skin and detox', 'Propagated via root cuttings or seeds'),
(19, 'Sandalwood', 'Santalum album', 'Chandana', 'Chandan', 'Santalaceae', 'Tree', 'Indian subcontinent and Southeast Asia', 'Tropical semi-arid', 'Red sandy loam or gravelly soil', 'Cooling, skin-brightening, mental calming agent', 'Hemi-parasitic tree; grown with host plants'),
(20, 'Rose', 'Rosa spp.', 'Shatapatri', 'Gulab', 'Rosaceae', 'Shrub', 'Temperate regions; widely cultivated', 'Temperate to mild subtropical', 'Rich, loamy, well-drained soil', 'Cooling toner, mood elevator, heart tonic', 'Propagated by stem cuttings or budding'),
(21, 'Jasmine', 'Jasminum spp.', 'Malti / Mallika', 'Chameli / Mogra', 'Oleaceae', 'Climber/Shrub', 'Tropical and subtropical regions', 'Warm tropical climate', 'Fertile, well-drained sandy loam', 'Uplifts mood, soothes nervous tension, skin fragrance', 'Propagated from semi-hardwood stem cuttings'),
(22, 'Hibiscus', 'Hibiscus rosa-sinensis', 'Japa', 'Gudhul', 'Malvaceae', 'Shrub', 'Tropical Asia; widely cultivated', 'Tropical and warm subtropical', 'Moist, fertile, well-drained soil', 'Promotes hair growth, cools the body, balances cycles', 'Propagated readily from stem cuttings'),
(23, 'Calendula', 'Calendula officinalis', 'Zergul', 'Genda / Calendula', 'Asteraceae', 'Herb', 'Mediterranean region; widely cultivated', 'Cool temperate to subtropical', 'Moderately fertile, well-drained garden soil', 'Skin healing, soothing rashes, anti-fungal care', 'Grown from seeds sown in autumn/spring'),
(24, 'Bhringraj', 'Eclipta prostrata', 'Bhringaraja', 'Bhringraj', 'Asteraceae', 'Herb', 'Tropical and subtropical regions worldwide', 'Warm, moist tropical', 'Moist, marshy, organic-rich soil', 'Supreme hair rejuvenator (Keshya), liver detoxifier', 'Direct seed sowing in moist soil'),
(25, 'Brahmi', 'Bacopa monnieri', 'Brahmi', 'Brahmi / Jalneem', 'Plantaginaceae', 'Herb', 'Wetlands of tropical and subtropical regions', 'Tropical wetland', 'Waterlogged or constantly wet soil', 'Medhya Rasayana for memory, cognition, and stress relief', 'Propagated easily by stem cuttings in muddy soil'),
(26, 'Shankhpushpi', 'Convolvulus pluricaulis', 'Shankhapushpi', 'Shankhpushpi', 'Convolvulaceae', 'Herb', 'Indian subcontinent', 'Arid and semi-arid', 'Dry, sandy, rocky soils', 'Calms the nervous system, supports memory and sleep', 'Propagated by seeds; thrives in dry open ground'),
(27, 'Jatamansi', 'Nardostachys jatamansi', 'Jatamansi', 'Jatamansi', 'Caprifoliaceae', 'Herb', 'Himalayan alpine region', 'Alpine high altitude (3000-5000m)', 'Humus-rich alpine soil', 'Deeply calming nervine sedative, promotes restful sleep', 'Grown from rhizome cuttings in cold climates'),
(28, 'Chamomile', 'Matricaria chamomilla', 'Babuna', 'Chamomile / Babunah', 'Asteraceae', 'Herb', 'Europe and western Asia; cultivated in India', 'Cool temperate', 'Light, well-drained sandy loam', 'Soothes nerves, promotes sleep, relieves colic', 'Grown from tiny seeds sown in spring/autumn'),
(29, 'Lavender', 'Lavandula angustifolia', 'Ustukhuddus (allied)', 'Lavender', 'Lamiaceae', 'Shrub', 'Mediterranean region; cultivated in hill stations', 'Cool, dry, sunny climate', 'Porous, alkaline, well-drained soil', 'Relieves tension, anxiety, and enhances sleep quality', 'Propagated from cuttings in sunny, dry beds'),
(30, 'Lemon Balm', 'Melissa officinalis', 'Billi-lotan', 'Lemon Balm', 'Lamiaceae', 'Herb', 'Mediterranean region and western Asia', 'Temperate to mild subtropical', 'Moist, rich, well-drained soil', 'Lifts melancholy, calms agitation, improves memory', 'Propagated by division or seed'),
(31, 'Gotu Kola / Mandukaparni', 'Centella asiatica', 'Mandukaparni', 'Brahmi / Gotu Kola', 'Apiaceae', 'Herb', 'Tropical and subtropical Asia', 'Tropical humid wetland', 'Damp, marshy soil near streams', 'Brain tonic, microcirculation enhancer, longevity herb', 'Grown from rooted stolons/runners'),
(32, 'Vasaka / Adusa', 'Justicia adhatoda', 'Vasa / Vasaka', 'Adusa', 'Acanthaceae', 'Shrub', 'Indian subcontinent and Southeast Asia', 'Tropical and subtropical plains', 'Well-drained loamy soil', 'Powerful bronchodilator, expectorant for cough and asthma', 'Propagated easily by stem cuttings'),
(33, 'Black Pepper', 'Piper nigrum', 'Maricha', 'Kali Mirch', 'Piperaceae', 'Climber', 'South and Southeast Asia (Western Ghats)', 'Warm, humid tropical rainforest', 'Humus-rich, well-drained forest loam', 'Respiratory decongestant, digestive fire enhancer (Deepana)', 'Propagated from runner shoots on support trees'),
(34, 'Clove', 'Syzygium aromaticum', 'Lavanga', 'Laung', 'Myrtaceae', 'Tree', 'Maluku Islands; cultivated in South India', 'Humid tropical maritime', 'Rich, deep volcanic or loamy soil', 'Soothes throat infections, eases dental pain, expectorant', 'Propagated by fresh ripe seeds in shaded nurseries'),
(35, 'Eucalyptus', 'Eucalyptus globulus', 'Nilgiri Taila plant', 'Nilgiri', 'Myrtaceae', 'Tree', 'Southeastern Australia; widely planted in India', 'Subtropical to temperate hills', 'Deep, well-drained fertile soil', 'Inhalation clears sinuses, clears chest congestion', 'Propagated from seeds; very tall rapid growth'),
(36, 'Thyme', 'Thymus vulgaris', 'Ipar', 'Thyme / Ajwain ke phool plant', 'Lamiaceae', 'Shrub', 'Mediterranean region; cultivated in hills', 'Warm, dry, sunny temperate', 'Light, dry, well-drained alkaline soil', 'Antimicrobial respiratory herb for bronchospasms and cough', 'Propagated by cuttings or seeds in sunny spots'),
(37, 'Oregano', 'Origanum vulgare', 'Sathra', 'Oregano', 'Lamiaceae', 'Herb', 'Europe and western Asia', 'Sunny, dry temperate', 'Dry, well-drained gravelly soil', 'Antiviral, antimicrobial for chest colds and gut health', 'Propagated by seeds or division'),
(38, 'Kalmegh', 'Andrographis paniculata', 'Bhunimba / Kalmegha', 'Kalmegh', 'Acanthaceae', 'Herb', 'Indian subcontinent and Southeast Asia', 'Tropical and subtropical', 'Well-drained sandy loam', 'Potent liver tonic, reduces fevers, boosts viral defense', 'Propagated by seeds; thrives in partial sun'),
(39, 'Giloy', 'Tinospora cordifolia', 'Guduchi / Amrita', 'Giloy', 'Menispermaceae', 'Climber', 'Throughout tropical India', 'Tropical and subtropical', 'Light, well-drained sandy loam', 'Ultimate immune modulator, antipyretic for chronic fevers', 'Propagated effortlessly via stem cuttings');

-- ============================================================
-- 4. LINK TO AYUSH SYSTEMS
-- ============================================================

INSERT INTO Plant_TraditionalSystem (plant_id, system_id)
SELECT p.plant_id, s.system_id FROM Plant p, TraditionalSystem s
WHERE s.system_name = 'Ayurveda';

INSERT IGNORE INTO Plant_TraditionalSystem (plant_id, system_id)
SELECT p.plant_id, s.system_id FROM Plant p, TraditionalSystem s
WHERE p.plant_id IN (1, 2, 9, 10, 11, 13, 15, 17, 33, 34, 38, 39) AND s.system_name IN ('Unani', 'Siddha');

-- ============================================================
-- 5. LINK TO MEDICINAL CATEGORIES
-- ============================================================

INSERT INTO Plant_MedicinalUse (plant_id, use_id) VALUES
-- Category 1: Digestive Health
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (8, 1), (9, 1), (10, 1),
-- Category 2: Immunity & General Wellness
(11, 2), (12, 2), (3, 2), (13, 2), (14, 2), (2, 2), (15, 2), (16, 2), (38, 2), (17, 2), (39, 2),
-- Category 3: Skin Care
(13, 3), (2, 3), (18, 3), (19, 3), (20, 3), (21, 3), (22, 3), (23, 3), (24, 3), (17, 3),
-- Category 4: Mental Wellness & Stress
(25, 4), (12, 4), (26, 4), (27, 4), (11, 4), (28, 4), (29, 4), (30, 4), (20, 4), (31, 4),
-- Category 5: Respiratory Wellness
(11, 5), (1, 5), (9, 5), (32, 5), (10, 5), (33, 5), (34, 5), (35, 5), (36, 5), (37, 5);

-- ============================================================
-- 6. BOTANICAL PARTS INSERTS (CORRECTED COLUMN NAMES)
-- ============================================================

-- Leaves (38 rows)
INSERT INTO `Leaf` (`plant_id`, `leaf_shape`, `leaf_colour`, `leaf_arrangement`, `leaf_texture`, `leaf_aroma`, `traditional_uses`, `is_traditionally_consumed`) VALUES
(1, 'Lanceolate', 'Green', 'Alternate', 'Smooth', 'Aromatic', 'Juice used in digestive teas', TRUE),
(2, 'Lanceolate', 'Green', 'Alternate', 'Smooth', 'Aromatic', 'Wraps for steamed medicinal foods', FALSE),
(3, 'Oblong', 'Green', 'Alternate', 'Smooth', 'Mild', 'Minor use in cooling teas', FALSE),
(4, 'Ovate', 'Green', 'Opposite', 'Soft', 'Minty', 'Digestion, chutney, herbal tea', TRUE),
(5, 'Oblong', 'Green', 'Alternate', 'Smooth', 'Aromatic', 'Sacred leaves used for fever and diabetes', TRUE),
(6, 'Linear', 'Green', 'Alternate', 'Fine', 'Aromatic', 'Digestive flavoring', TRUE),
(7, 'Pinnate', 'Green', 'Alternate', 'Fine', 'Spicy', 'Flavours digestive foods', TRUE),
(8, 'Linear', 'Green', 'Alternate', 'Fine', 'Aromatic', 'Culinary herb', TRUE),
(9, 'Compound', 'Green', 'Alternate', 'Smooth', 'Sweet/aromatic', 'Throat soother', FALSE),
(10, 'Heart-shaped', 'Green', 'Alternate', 'Smooth', 'Peppery', 'Respiratory relief', TRUE),
(11, 'Ovate', 'Green', 'Opposite', 'Slightly textured', 'Aromatic', 'Holy Basil tea for immunity and cold', TRUE),
(12, 'Ovate', 'Green', 'Alternate', 'Velvety', 'Mild', 'Topical paste for joint swelling', FALSE),
(13, 'Pinnate', 'Green', 'Alternate', 'Smooth', 'Bitter/aromatic', 'Blood purification and skin healing', TRUE),
(14, 'Tripinnate', 'Green', 'Alternate', 'Soft', 'Mild', 'Nutritional powerhouse, cooked as curry', TRUE),
(15, 'Linear', 'Green', 'Alternate', 'Flat', 'Strong', 'Digestive and seasoning', TRUE),
(16, 'Needle-like', 'Green', 'Alternate', 'Fine', 'Mild', 'Minor traditional use', FALSE),
(17, 'Lanceolate', 'Green', 'Rosette', 'Fleshy', 'Mild', 'Skin gel, digestive juice', TRUE),
(18, 'Ovate', 'Green', 'Opposite', 'Rough', 'Mild', 'Detoxifying decoctions', FALSE),
(19, 'Lanceolate', 'Green', 'Opposite', 'Smooth', 'Aromatic', 'Cooling pastes', FALSE),
(20, 'Ovate', 'Green', 'Alternate', 'Smooth', 'Floral', 'Gulkand, rose water, eye drops', TRUE),
(21, 'Ovate', 'Green', 'Opposite', 'Smooth', 'Fragrant', 'Skin soothing pastes', FALSE),
(22, 'Ovate', 'Green', 'Alternate', 'Soft', 'Mild', 'Hair wash paste for conditioning', TRUE),
(23, 'Oblong', 'Green', 'Alternate', 'Slightly hairy', 'Mild', 'Skin wound healing', FALSE),
(24, 'Lanceolate', 'Green', 'Opposite', 'Hairy', 'Mild', 'Ayurvedic oil for hair growth', FALSE),
(25, 'Oblong', 'Green', 'Opposite', 'Smooth', 'Mild', 'Medhya Rasayana memory booster', TRUE),
(26, 'Linear', 'Green', 'Alternate', 'Smooth', 'Mild', 'Brain tonic, calms insomnia', TRUE),
(27, 'Pinnate', 'Green', 'Opposite', 'Rough', 'Strong', 'Sedative preparations', FALSE),
(28, 'Bipinnate', 'Green', 'Alternate', 'Fine', 'Sweet', 'Calming bedtime infusion', TRUE),
(29, 'Linear', 'Grey-green', 'Opposite', 'Narrow', 'Strong', 'Aromatherapy for headaches', FALSE),
(30, 'Ovate', 'Green', 'Opposite', 'Soft', 'Lemon-like', 'Nervous stomach, sleep tea', TRUE),
(31, 'Reniform', 'Green', 'Alternate', 'Smooth', 'Mild', 'Cognition enhancer, longevity herb', TRUE),
(32, 'Lanceolate', 'Green', 'Opposite', 'Rough', 'Aromatic', 'Expectorant for chronic bronchitis', TRUE),
(33, 'Ovate', 'Green', 'Alternate', 'Smooth', 'Peppery', 'Digestive spices', FALSE),
(34, 'Lanceolate', 'Green', 'Opposite', 'Leathery', 'Aromatic', 'Essential oil source', FALSE),
(35, 'Lanceolate', 'Green', 'Alternate', 'Leathery', 'Eucalyptus-like', 'Steam inhalation for blocked sinus', FALSE),
(36, 'Linear', 'Green', 'Opposite', 'Fine', 'Thyme-like', 'Relieves dry spasmodic cough', TRUE),
(37, 'Ovate', 'Green', 'Opposite', 'Slightly hairy', 'Oregano-like', 'Antiviral seasoning, throat gargle', TRUE),
(38, 'Lanceolate', 'Green', 'Opposite', 'Smooth', 'Bitter', 'Liver protector, viral fever remedy', TRUE);

-- Flowers (38 rows - fixed flower_colour & flower_shape)
INSERT INTO `Flower` (`plant_id`, `flower_colour`, `flower_shape`, `fragrance`, `is_used_traditionally`) VALUES
(1, 'Yellow-green', 'Small', 'Mild', FALSE),
(2, 'Pale yellow', 'Funnel-shaped', 'Mild', FALSE),
(3, 'Greenish-yellow', 'Small', 'Mild', FALSE),
(4, 'White/purple', 'Small', 'Minty', TRUE),
(5, 'Greenish-white', 'Small', 'Fragrant', TRUE),
(6, 'Yellow', 'Umbel', 'Aromatic', TRUE),
(7, 'White', 'Small', 'Mild', FALSE),
(8, 'White', 'Small', 'Mild', FALSE),
(9, 'Pale purple', 'Small', 'Sweet', FALSE),
(10, 'White', 'Spike', 'Aromatic', FALSE),
(11, 'Purple/white', 'Small', 'Strong', TRUE),
(12, 'Green-yellow', 'Small', 'Mild', FALSE),
(13, 'White', 'Small', 'Mild', TRUE),
(14, 'White', 'Small', 'Mild', TRUE),
(15, 'White', 'Small', 'Mild', FALSE),
(16, 'White', 'Small', 'Mild', FALSE),
(17, 'Yellow', 'Spike', 'Mild', FALSE),
(18, 'Greenish-white', 'Small', 'Mild', FALSE),
(19, 'Greenish-white', 'Small', 'Fragrant', FALSE),
(20, 'Pink/red/white', 'Rosette', 'Fragrant', TRUE),
(21, 'White', 'Star-shaped', 'Highly fragrant', TRUE),
(22, 'Red/pink/yellow', 'Large bell-shaped', 'Mild', TRUE),
(23, 'Yellow/orange', 'Daisy-like', 'Mild', TRUE),
(24, 'White', 'Small', 'Mild', FALSE),
(25, 'Blue/purple', 'Small', 'Mild', FALSE),
(26, 'White/purple', 'Funnel-shaped', 'Mild', FALSE),
(27, 'Purple', 'Clustered', 'Strong', FALSE),
(28, 'White/yellow', 'Daisy-like', 'Sweet', TRUE),
(29, 'Purple', 'Spike', 'Strong', TRUE),
(30, 'White/pale pink', 'Small', 'Lemon-like', TRUE),
(31, 'White/pink', 'Small', 'Mild', FALSE),
(32, 'White', 'Spike', 'Mild', TRUE),
(33, 'White', 'Spike', 'Peppery', FALSE),
(34, 'White/Crimson', 'Buds dried as cloves', 'Fragrant', TRUE),
(35, 'White', 'Umbel', 'Mild', FALSE),
(36, 'Pink/purple', 'Clustered', 'Thyme-like', TRUE),
(37, 'White/pink', 'Clustered', 'Oregano-like', TRUE),
(38, 'White', 'Small', 'Mild', FALSE);

-- Stems (38 rows - fixed stem_colour)
INSERT INTO `Stem` (`plant_id`, `stem_type`, `stem_colour`, `growth_pattern`, `woody_or_herbaceous`, `is_used_traditionally`) VALUES
(1, 'Rhizomatous herb', 'Green', 'Upright', 'Herbaceous', TRUE),
(2, 'Rhizomatous herb', 'Green', 'Upright', 'Herbaceous', TRUE),
(3, 'Woody trunk', 'Brown/green', 'Arborescent', 'Woody', FALSE),
(4, 'Soft herbaceous', 'Green', 'Creeping', 'Herbaceous', TRUE),
(5, 'Woody tree', 'Brown/green', 'Upright', 'Woody', FALSE),
(6, 'Hollow herbaceous', 'Green', 'Upright', 'Herbaceous', FALSE),
(7, 'Branched herbaceous', 'Green', 'Upright', 'Herbaceous', FALSE),
(8, 'Slender herbaceous', 'Green', 'Upright', 'Herbaceous', FALSE),
(9, 'Woody herbaceous', 'Green', 'Subshrub', 'Herbaceous', FALSE),
(10, 'Climbing vine', 'Green', 'Twining', 'Herbaceous', TRUE),
(11, 'Erect quadrangular herb', 'Green/Purple', 'Upright', 'Herbaceous', TRUE),
(12, 'Woody subshrub', 'Green', 'Erect', 'Herbaceous', FALSE),
(13, 'Woody tree trunk', 'Brown/green', 'Spreading', 'Woody', TRUE),
(14, 'Soft-wooded tree', 'Brown/green', 'Rapid', 'Woody', TRUE),
(15, 'Bulbous herb', 'Green', 'Basal', 'Herbaceous', TRUE),
(16, 'Thorny climbing stem', 'Green', 'Climbing', 'Woody', FALSE),
(17, 'Acaulescent short stem', 'Green', 'Rosette', 'Herbaceous', FALSE),
(18, '4-angled climbing vine', 'Green/Red', 'Climbing', 'Herbaceous', TRUE),
(19, 'Scented woody trunk', 'Dark brown', 'Erect', 'Woody', TRUE),
(20, 'Thorny woody shrub', 'Brown/green', 'Erect', 'Woody', FALSE),
(21, 'Climbing shrub', 'Brown/green', 'Twining', 'Woody', FALSE),
(22, 'Woody shrub branches', 'Brown/green', 'Upright', 'Woody', FALSE),
(23, 'Erect herb', 'Green', 'Erect', 'Herbaceous', FALSE),
(24, 'Prostrate/erect herb', 'Green', 'Spreading', 'Herbaceous', TRUE),
(25, 'Creeping succulent', 'Green', 'Prostrate', 'Herbaceous', TRUE),
(26, 'Prostrate hairy stem', 'Green', 'Prostrate', 'Herbaceous', TRUE),
(27, 'Short rhizomatous herb', 'Green', 'Basal', 'Herbaceous', TRUE),
(28, 'Erect herb', 'Green', 'Branching', 'Herbaceous', FALSE),
(29, 'Woody shrub', 'Brown/green', 'Erect', 'Woody', FALSE),
(30, 'Four-angled herb', 'Green', 'Erect', 'Herbaceous', FALSE),
(31, 'Creeping stolon runner', 'Green', 'Stoloniferous', 'Herbaceous', TRUE),
(32, 'Woody shrub', 'Brown/green', 'Erect', 'Woody', FALSE),
(33, 'Climbing woody vine', 'Green', 'Climbing', 'Woody', FALSE),
(34, 'Woody tree trunk', 'Brown/green', 'Erect', 'Woody', FALSE),
(35, 'Tall woody trunk', 'Brown/green', 'Erect', 'Woody', FALSE),
(36, 'Woody subshrub', 'Brown/green', 'Bushy', 'Woody', FALSE),
(37, 'Herbaceous square stem', 'Green', 'Erect', 'Herbaceous', FALSE),
(38, 'Erect 4-angled herb', 'Green', 'Erect', 'Herbaceous', TRUE);

-- Barks (7 rows - fixed bark_colour, bark_texture, bark_thickness)
INSERT INTO `Bark` (`plant_id`, `bark_colour`, `bark_texture`, `bark_thickness`, `traditional_use`) VALUES
(3, 'Grey-brown', 'Rough', 'Thin to moderate', 'Digestive astringent'),
(5, 'Grey-brown', 'Rough', 'Moderate', 'Digestive decoctions'),
(13, 'Dark grey-brown', 'Rough', 'Thick', 'Antiseptic toothbrush twig (Datun) and skin wash'),
(14, 'Pale grey', 'Smooth to rough', 'Moderate', 'Anti-inflammatory decoction'),
(19, 'Dark brown', 'Rough', 'Moderate', 'Chandan paste for meditation and skin radiance'),
(34, 'Grey-brown', 'Rough', 'Moderate', 'Dental analgesic oil distillation'),
(35, 'Grey-brown', 'Fibrous/stringy', 'Thick', 'Distillation of eucalyptus oil');

-- Roots (38 rows)
INSERT INTO `Root` (`plant_id`, `root_type`, `traditional_use`) VALUES
(1, 'Rhizome', 'Fresh and dry ginger for digestion and colds'),
(2, 'Rhizome', 'Curcumin-rich rhizome used as anti-inflammatory tonic'),
(3, 'Taproot', 'Grounding support'),
(4, 'Fibrous', 'Spreading stolon root network'),
(5, 'Taproot', 'Root bark used in Dashamula formulations'),
(6, 'Taproot', 'Deep nutrient tapping'),
(7, 'Fibrous', 'Fibrous soil-binding roots'),
(8, 'Taproot', 'Taproot system'),
(9, 'Long taproot', 'Sweet root/stolon is the active medicinal Mulethi'),
(10, 'Fibrous', 'Pippali root (Pippalimoola) used for insomnia and bloating'),
(11, 'Fibrous', 'Fine fibrous root system'),
(12, 'Tuberous roots', 'Ashwagandha root is the primary rejuvenative adaptogen'),
(13, 'Taproot', 'Neem root bark is used as a bitter tonic and fever remedy'),
(14, 'Taproot', 'Pungent root used as digestive stimulant'),
(15, 'Bulb', 'Lashuna bulb reduces cholesterol and builds immunity'),
(16, 'Tuberous roots', 'Shatavari tuber cluster is the supreme reproductive rasayana'),
(17, 'Fibrous', 'Shallow fibrous anchor roots'),
(18, 'Long reddish roots', 'Manjistha root gives red dye and purifies the blood'),
(19, 'Taproot', 'Sandalwood fragrant heartwood and root'),
(20, 'Fibrous', 'Fibrous shrub roots'),
(21, 'Fibrous', 'Fibrous roots'),
(22, 'Fibrous', 'Fibrous roots'),
(23, 'Fibrous', 'Fibrous roots'),
(24, 'Fibrous', 'Bhringraj root paste used for jaundice and liver support'),
(25, 'Fibrous', 'Fibrous roots emerging at leaf nodes'),
(26, 'Fibrous', 'Deep anchoring root system'),
(27, 'Rhizome/rootstock', 'Jatamansi aromatic rhizome is the key nervous sedative'),
(28, 'Fibrous', 'Fibrous roots'),
(29, 'Fibrous', 'Spreading woody root system'),
(30, 'Fibrous', 'Fibrous root mass'),
(31, 'Fibrous', 'Fibrous root clusters at nodes'),
(32, 'Taproot', 'Vasaka root used for cough decoctions'),
(33, 'Adventitious', 'Climbing support roots'),
(34, 'Fibrous', 'Deep tree root network'),
(35, 'Strong woody root system', 'Extensive water-absorbing root network'),
(36, 'Fibrous', 'Fibrous roots'),
(37, 'Fibrous', 'Fibrous roots'),
(38, 'Fibrous', 'Kalmegh root used in bitter fever remedies');

-- Fruits (12 rows - fixed colour_mature, taste_description)
INSERT INTO `Fruit` (`plant_id`, `fruit_type`, `colour_mature`, `taste_description`, `traditional_use`) VALUES
(3, 'Berry-like drupe', 'Green to yellow-green', 'Sour/astringent', 'Key ingredient in Chyawanprash & Triphala'),
(5, 'Berry', 'Green to yellow-brown', 'Sweet/aromatic', 'Bael sherbet for dysentery and bowel health'),
(6, 'Dry schizocarp', 'Green to brown', 'Aromatic', 'Chewed after meals as digestive saunf'),
(7, 'Dry schizocarp', 'Green to brown', 'Aromatic', 'Carminative seeds for stomach colic'),
(8, 'Dry schizocarp', 'Green to brown', 'Aromatic', 'Jeera water for digestive wellness'),
(10, 'Multiple spike-like fruit', 'Green to dark brown', 'Pungent', 'Catkin-like fruit used for lung congestion'),
(13, 'Drupe', 'Green to yellow', 'Bitter', 'Pressed for neem seed oil (skin/biopesticide)'),
(14, 'Capsule', 'Green to brown', 'Mild', 'Drumsticks cooked for high nutrient content'),
(20, 'Rose hip', 'Green to red/orange', 'Slightly sour', 'Rich Vitamin C source for infusions'),
(22, 'Capsule', 'Green to brown', 'Mild', 'Minor seed capsule use'),
(33, 'Drupe', 'Green to red/black', 'Pungent', 'Black peppercorns for respiratory bio-enhancement'),
(35, 'Woody capsule', 'Green to brown', 'Mild', 'Eucalyptus seed gum');

-- Seeds (33 rows)
INSERT INTO `Seed` (`plant_id`, `seed_colour`, `propagation_method`) VALUES
(3, 'Brown', 'Seed'), (5, 'Brown', 'Seed'), (6, 'Greenish-brown', 'Seed'),
(7, 'Brown', 'Seed'), (8, 'Brown', 'Seed'), (9, 'Brown', 'Seed/cuttings'),
(10, 'Black/brown', 'Seed/cuttings'), (11, 'Black', 'Seed'), (12, 'Yellow-brown', 'Seed'),
(13, 'Brown', 'Seed'), (14, 'Brown', 'Seed'), (16, 'Black', 'Seed'),
(18, 'Brown', 'Seed/cuttings'), (19, 'Brown', 'Seed'), (20, 'Brown', 'Seed/cuttings'),
(21, 'Brown', 'Cuttings/layering'), (22, 'Brown', 'Seed/cuttings'), (23, 'Brown', 'Seed'),
(24, 'Black', 'Seed'), (25, 'Tiny brown', 'Seed/cuttings'), (26, 'Brown', 'Seed'),
(27, 'Brown', 'Seed/rhizome'), (28, 'Tiny brown', 'Seed'), (29, 'Brown', 'Seed/cuttings'),
(30, 'Brown', 'Seed/cuttings'), (31, 'Brown', 'Seed/vegetative'), (32, 'Brown', 'Seed/cuttings'),
(33, 'Black/brown', 'Seed/cuttings'), (34, 'Brown', 'Seed'), (35, 'Brown', 'Seed'),
(36, 'Brown', 'Seed/cuttings'), (37, 'Brown', 'Seed/cuttings'), (38, 'Brown', 'Seed');

-- ============================================================
-- 7. 3D MODELS & MULTIMEDIA
-- ============================================================

INSERT INTO Media (plant_id, plant_part, media_type, file_url, caption) VALUES
(11, 'General', '3D_Model', '/assets/models/tulsi_full.glb', 'Interactive 3D model of Holy Basil shrub'),
(11, 'Leaf', '3D_Model', '/assets/models/tulsi_leaf.glb', 'Zoomable 3D mesh of Tulsi serrated leaf'),
(12, 'General', '3D_Model', '/assets/models/ashwagandha.glb', '3D structure of Ashwagandha plant and berries'),
(13, 'General', '3D_Model', '/assets/models/neem_tree.glb', '3D representation of mature Neem tree'),
(22, 'Flower', '3D_Model', '/assets/models/hibiscus_flower.glb', 'Detailed 3D model of Hibiscus flower and staminal column'),
(39, 'General', '3D_Model', '/assets/models/giloy_vine.glb', '3D climbing vine structure of Giloy'),
(1, 'Root', 'Image', '/assets/images/ginger_rhizome.jpg', 'Fresh Ginger rhizomes'),
(3, 'Fruit', 'Image', '/assets/images/amla_fruit.jpg', 'Ripe Amla gooseberries on branch'),
(11, 'General', 'Audio', '/assets/audio/tulsi_ayurveda_guide.mp3', 'Spoken audio description of Tulsi properties'),
(12, 'Root', 'Image', '/assets/images/ashwagandha_root.jpg', 'Harvested dried Ashwagandha roots'),
(19, 'Bark', 'Image', '/assets/images/sandalwood_wood.jpg', 'Cross-section of fragrant sandalwood'),
(25, 'Leaf', 'Image', '/assets/images/brahmi_leaves.jpg', 'Succulent Brahmi leaves in wetland bed');

-- ============================================================
-- 8. VIRTUAL THEMED TOURS
-- ============================================================

INSERT INTO VirtualTour (tour_name, theme, description) VALUES
('Digestive Wellness Trail', 'Digestive Health', 'Explore the premier spices and herbs used in Ayurveda to ignite digestive fire (Agni).'),
('Immunity & Rasayana Walk', 'Immunity & General Wellness', 'Discover ancient adaptogens that fortify the immune system and build Ojas.'),
('Radiant Skin & Detox Journey', 'Skin Care', 'Tour through cooling, blood-purifying plants that promote skin vitality.'),
('Mind, Memory & Tranquility Path', 'Mental Wellness & Stress', 'Learn about Medhya Rasayanas that soothe anxiety and sharpen intellect.'),
('Breathe Free Respiratory Walk', 'Respiratory Wellness', 'Guided exploration of nature’s best bronchodilators and throat soothers.');

INSERT INTO Tour_Plant (tour_id, plant_id, sequence_order) VALUES
(1, 1, 1), (1, 2, 2), (1, 3, 3), (1, 4, 4), (1, 5, 5),
(2, 11, 1), (2, 12, 2), (2, 39, 3), (2, 13, 4), (2, 14, 5),
(3, 17, 1), (3, 13, 2), (3, 18, 3), (3, 19, 4), (3, 20, 5),
(4, 25, 1), (4, 26, 2), (4, 27, 3), (4, 31, 4),
(5, 11, 1), (5, 32, 2), (5, 10, 3), (5, 34, 4), (5, 35, 5);

-- ============================================================
-- 9. USER BOOKMARKS & NOTES
-- ============================================================

INSERT INTO User (username, email, password_hash) VALUES
('ayush_student', 'student@ayush.edu.in', '$2b$12$e80YvVEXAMPLEHASHFORSECURITY0001'),
('ayurveda_doc', 'dr.sharma@ayushclinic.org', '$2b$12$e80YvVEXAMPLEHASHFORSECURITY0002');

INSERT INTO Bookmark (user_id, plant_id) VALUES
(1, 11),
(1, 25),
(2, 39),
(2, 32);

INSERT INTO Note (user_id, plant_id, note_text) VALUES
(1, 11, 'Tulsi leaf tea with black pepper works best for seasonal cough.'),
(1, 25, 'Take Brahmi with warm ghee in the morning for memory retention.'),
(2, 39, 'Giloy stem extract (Guduchi Satva) dosage: 500mg twice daily for fever.');

SELECT * FROM FLOWER