/**
 * Interactive Virtual Herbal Garden - Botanical & AYUSH Knowledge Base
 * Detailed dataset covering classical taxonomy, phytochemistry, morphology, and AYUSH wisdom.
 */

export const PLANTS_DATA = [
  {
    id: "tulsi",
    name: "Tulsi",
    commonName: "Holy Basil / Queen of Herbs",
    botanicalName: "Ocimum sanctum (syn. Ocimum tenuiflorum)",
    family: "Lamiaceae (Mint family)",
    sanskritName: "तुलसी (Tulasī - Incomparable One)",
    category: "immunity",
    categories: ["immunity", "respiratory", "mental"],
    image: "assets/images/tulsi.jpg",
    heroHighlight: "Adaptogenic & Respiratory Elixir",
    shortDescription: "Revered in Ayurveda as 'The Incomparable One', Tulsi is a sacred adaptogenic herb known for balancing Vata and Kapha, supporting respiratory health, and modulating stress resilience.",
    ayushSystems: ["Ayurveda", "Siddha", "Unani"],
    ayurvedicProfile: {
      rasa: "Katu (Pungent), Tikta (Bitter)",
      guna: "Laghu (Light), Ruksha (Dry)",
      virya: "Ushna (Heating)",
      vipaka: "Katu (Pungent)",
      doshaKarma: "Pacifies Kapha and Vata; mild Pitta aggravating in excess",
      prabhava: "Hridya (Cardioprotective & Uplifting), Vishaghna (Detoxifying)"
    },
    chemicalConstituents: [
      { name: "Eugenol (up to 71%)", role: "Potent antioxidant, antimicrobial, and analgesic essential oil terpene." },
      { name: "Ursolic Acid", role: "Triterpenoid with anti-inflammatory and cellular longevity benefits." },
      { name: "Rosmarinic Acid", role: "Polyphenol with profound immunomodulatory and neuroprotective qualities." },
      { name: "Caryophyllene", role: "Binds to CB2 receptors to modulate balanced immune responses." }
    ],
    plantParts: {
      leaf: "Rich in volatile essential oils (eugenol, camphor). Used fresh in herbal teas (Swarasa) for acute respiratory clarity.",
      flower: "Delicate purple-pink racemes packed with nectar and aromatic monoterpenes used in calming steam inhalations.",
      seed: "Mucilaginous when soaked; traditionally used as cooling demulcent for urinary tract and digestive balance.",
      root: "Contains concentrated triterpenes; used in classical decoctions for vitality and steady mental endurance.",
      stem: "Aromatic woody stem used to carve sacred meditational beads (Kanthi mala) emitting subtle protective phytoncides."
    },
    traditionalFormulations: ["Tulsi Swarasa", "Tribhuvan Kirti Rasa", "Surasadigana Kashayam", "Tulsi Arka"],
    safetyNote: "Generally safe for daily culinary infusion. Due to mild warming action and anti-platelet tendencies, moderate usage if on anticoagulant medications."
  },
  {
    id: "aloe-vera",
    name: "Aloe Vera",
    commonName: "Ghritkumari / True Aloe",
    botanicalName: "Aloe barbadensis Miller",
    family: "Asphodelaceae",
    sanskritName: "घृतकुमारी (Ghṛtakumārī - Maiden with Youthful Vitality)",
    category: "skin",
    categories: ["skin", "digestion", "immunity"],
    image: "assets/images/aloe_vera.jpg",
    heroHighlight: "Cooling Cellular Regenerator",
    shortDescription: "Prized for millennia across Ayurvedic, Unani, and Siddha traditions for its deep cooling (Sheeta) potency, tissue-soothing mucilage, and cellular rejuvenating prowess.",
    ayushSystems: ["Ayurveda", "Unani", "Siddha", "Yoga & Naturopathy"],
    ayurvedicProfile: {
      rasa: "Tikta (Bitter), Madhura (Sweet)",
      guna: "Guru (Heavy), Snigdha (Unctuous), Picchila (Mucilaginous)",
      virya: "Sheeta (Cooling)",
      vipaka: "Madhura (Sweet)",
      doshaKarma: "Pacifies all three Doshas (Tridoshahara), especially Pitta and Vata",
      prabhava: "Rasayana (Anti-aging rejuvenator), Vranaropana (Wound healer)"
    },
    chemicalConstituents: [
      { name: "Acemannan", role: "Long-chain bioactive polysaccharide that stimulates macrophage immune defense and collagen synthesis." },
      { name: "Aloin (Barbaloin)", role: "Anthraquinone glycoside found in outer latex with stimulatory digestive action." },
      { name: "Gibberellins & Auxins", role: "Phytohormones accelerating epithelial wound healing and reducing skin erythema." },
      { name: "Enzymes (Bradykinase)", role: "Reduces excessive skin inflammation when applied topically." }
    ],
    plantParts: {
      leaf: "Succulent thick leaves containing over 99% structured hydration bound with healing mucopolysaccharides.",
      flower: "Tubular yellow-orange blossoms rich in nectar and gentle polyphenolic antioxidants.",
      root: "Fibrous anchoring root system containing phytosterols and minerals used in classical tonic preparations.",
      stem: "Short condensed rhizomatous stem storing vitality reserves for drought endurance."
    },
    traditionalFormulations: ["Kumaryasava", "Kumkumadi Taila", "Ghritkumari Swarasa", "Raja Pravartani Vati"],
    safetyNote: "Pure inner gel is soothing and non-toxic. The yellow outer exudate (aloin latex) has strong laxative properties and should be drained before raw culinary use."
  },
  {
    id: "ashwagandha",
    name: "Ashwagandha",
    commonName: "Indian Ginseng / Winter Cherry",
    botanicalName: "Withania somnifera",
    family: "Solanaceae (Nightshade family)",
    sanskritName: "अश्वगन्धा (Aśvagandhā - Imparts Horse-like Strength)",
    category: "mental",
    categories: ["mental", "immunity", "vitality"],
    image: "assets/images/ashwagandha.jpg",
    heroHighlight: "Premier Adaptogen & Nervous System Tonic",
    shortDescription: "The flagship Rasayana of Ayurveda, Ashwagandha modulates cortisol, nourishes the Majja Dhatu (nervous system), restores Ojas (vital vigor), and fosters deep restorative sleep.",
    ayushSystems: ["Ayurveda", "Unani", "Siddha"],
    ayurvedicProfile: {
      rasa: "Tikta (Bitter), Kashaya (Astringent), Madhura (Sweet)",
      guna: "Laghu (Light), Snigdha (Unctuous)",
      virya: "Ushna (Heating)",
      vipaka: "Madhura (Sweet)",
      doshaKarma: "Balances Vata and Kapha; calms neuro-endocrine excitation",
      prabhava: "Medhya (Cognitive enhancer), Balya (Strength builder), Nidrajanana (Sleep inducer)"
    },
    chemicalConstituents: [
      { name: "Withanolide A & D", role: "Steroidal lactones key in promoting neurite outgrowth and synaptic plasticity." },
      { name: "Withaferin A", role: "Potent anti-inflammatory agent that inhibits NF-κB inflammatory cascade." },
      { name: "Sitoindosides IX & X", role: "Glycowithanolides responsible for pronounced anti-stress adaptogenic activities." },
      { name: "Somniferine", role: "Mild alkaloid contributing to calm neuromuscular relaxation." }
    ],
    plantParts: {
      root: "The primary medicinal powerhouse. Earthy, stout taproots loaded with adaptogenic withanolides, traditionally boiled in milk.",
      fruit: "Bright red-orange berries enclosed in papery calyx lanterns; rich in carotenes and clotting enzymes.",
      leaf: "Bitter leaves used topically for joint inflammation and skin boils (Kushtahara).",
      flower: "Small bell-shaped greenish-yellow flowers blooming throughout temperate seasons."
    },
    traditionalFormulations: ["Ashwagandharishta", "Ashwagandha Ghrita", "Chyawanprash", "Balarishta"],
    safetyNote: "Use with caution during active pregnancy due to mild uterine stimulation. Best taken with nourishing vehicles (Anupana) such as warm milk or ghee."
  },
  {
    id: "neem",
    name: "Neem",
    commonName: "Indian Lilac / Nature's Pharmacy",
    botanicalName: "Azadirachta indica",
    family: "Meliaceae (Mahogany family)",
    sanskritName: "निम्ब (Nimba - Bestower of Good Health / Arishta)",
    category: "skin",
    categories: ["skin", "immunity", "digestion"],
    image: "assets/images/neem.jpg",
    heroHighlight: "Supreme Blood Purifier & Skin Guardian",
    shortDescription: "Described in classical texts as 'Sarva Roga Nivarini' (curer of all ailments), Neem is an intense bitter alterative that purifies blood (Rakta Shodhana) and cleanses skin pathogens.",
    ayushSystems: ["Ayurveda", "Unani", "Siddha", "Homoeopathy (Azadirachta)"],
    ayurvedicProfile: {
      rasa: "Tikta (Bitter), Kashaya (Astringent)",
      guna: "Laghu (Light), Ruksha (Dry)",
      virya: "Sheeta (Cooling)",
      vipaka: "Katu (Pungent)",
      doshaKarma: "Pacifies Pitta and Kapha; increases Vata in prolonged high doses",
      prabhava: "Krimighna (Antiparasitic), Kandughna (Anti-pruritic), Rakta Shodhaka (Blood purifier)"
    },
    chemicalConstituents: [
      { name: "Azadirachtin", role: "Complex tetranortriterpenoid limonoid famous for insecticidal and antimicrobial defense." },
      { name: "Nimbin & Nimbidin", role: "Bitter triterpenes exhibiting potent anti-inflammatory, anti-fungal, and anti-pyretic action." },
      { name: "Gedunin", role: "Bioactive limonoid with proven antimalarial and antibacterial properties." },
      { name: "Quercetin", role: "Flavonoid antioxidant protecting epidermal integrity from free radicals." }
    ],
    plantParts: {
      leaf: "Serrated pinnate leaves used for medicinal decoction baths, skin poultices, and internal micro-dosing for blood detox.",
      bark: "Extremely bitter, astringent outer stem bark (Nimbatwak) used in oral hygiene, tooth twigs, and wound healing.",
      flower: "Sweet-scented delicate white star blossoms; traditionally sautéed with jaggery during Ugadi/New Year to balance spring bile.",
      seed: "Dense oil-rich seeds pressed for Neem Oil (pungent sulfurous scent), supreme natural antifungal for scalp and foliage.",
      fruit: "Fleshy drupes whose pulp is consumed by birds and processed for natural bio-pesticides."
    },
    traditionalFormulations: ["Nimbadi Kashayam", "Mahatiktaka Ghrita", "Neem Taila", "Jatyadi Taila"],
    safetyNote: "High doses should not be taken long term by individuals with dry Vata constitution or those trying to conceive due to strong contraceptive and cooling properties."
  },
  {
    id: "amla",
    name: "Amla",
    commonName: "Indian Gooseberry / Amalaki",
    botanicalName: "Phyllanthus emblica (syn. Emblica officinalis)",
    family: "Phyllanthaceae",
    sanskritName: "आमलकी (Āmalakī - The Sustainer / Dhatri)",
    category: "immunity",
    categories: ["immunity", "digestion", "skin", "vitality"],
    image: "assets/images/amla.jpg",
    heroHighlight: "Unrivaled Antioxidant & Longevity Berry",
    shortDescription: "Recognized as 'Dhatri' (the divine mother nurse), Amla embodies five of the six classical Ayurvedic tastes (all except salty) and offers natural, heat-stable bioavailable Vitamin C.",
    ayushSystems: ["Ayurveda", "Unani", "Siddha", "Homoeopathy (Emblica)"],
    ayurvedicProfile: {
      rasa: "Amla (Sour), Kashaya (Astringent), Tikta (Bitter), Madhura (Sweet), Katu (Pungent)",
      guna: "Guru (Heavy), Ruksha (Dry), Sheeta (Cooling)",
      virya: "Sheeta (Cooling)",
      vipaka: "Madhura (Sweet - rare for a sour fruit)",
      doshaKarma: "Tridoshahara (Balances Vata, Pitta, and Kapha equally)",
      prabhava: "Rasayana (Ultimate rebuilder of all seven bodily tissue layers / Dhatus), Chakshushya (Promotes visual acuity)"
    },
    chemicalConstituents: [
      { name: "Emblicanin A & B", role: "Low molecular weight hydrolyzable tannins that protect against cellular lipid peroxidation." },
      { name: "Bio-chelated Ascorbic Acid", role: "Vitamin C naturally bound to complex gallotannins, making it remarkably stable against heat." },
      { name: "Ellagic Acid & Gallic Acid", role: "Phenolic compounds delivering liver-protective and cellular DNA safeguarding effects." },
      { name: "Superoxide Dismutase (SOD)", role: "Endogenous antioxidant enzyme stimulant that neutralizes free radicals." }
    ],
    plantParts: {
      fruit: "Translucent green ribbed drupe with crisp, juicy flesh containing the highest natural density of vitamin C in nature.",
      leaf: "Feathery light foliage used in cooling decoctions for mouth ulcers and inflammatory fevers.",
      seed: "Hard central stone contains polyphenolic fixed oils used in classical hair revitalizing formulations.",
      bark: "Rich in astringent tannins used traditionally for mucosal repair and natural dye."
    },
    traditionalFormulations: ["Triphala Churna (Chief Ingredient)", "Chyawanprash (Core Base)", "Dhatri Rasayana", "Brahma Rasayana"],
    safetyNote: "Exceptionally safe for long-term daily rejuvenation. Those with excessive acid reflux can take it with honey or warm water."
  },
  {
    id: "ginger-turmeric",
    name: "Ginger & Turmeric",
    commonName: "Sacred Golden Rhizomes / Ardraka & Haridra",
    botanicalName: "Zingiber officinale & Curcuma longa",
    family: "Zingiberaceae (Ginger family)",
    sanskritName: "आर्द्रक & हरिद्रा (Ardraka & Haridrā - Golden Radiance)",
    category: "digestion",
    categories: ["digestion", "immunity", "skin"],
    image: "assets/images/ginger_turmeric.jpg",
    heroHighlight: "Digestive Fire (Agni) & Golden Anti-Inflammatory Synergy",
    shortDescription: "The twin golden roots of ancient healing: Ginger kindles the metabolic digestive fire (Deepana-Pachana) while Turmeric clears inflammatory toxins (Ama) and illuminates the skin.",
    ayushSystems: ["Ayurveda", "Siddha", "Unani", "Yoga & Naturopathy", "Homoeopathy"],
    ayurvedicProfile: {
      rasa: "Katu (Pungent), Tikta (Bitter - Turmeric)",
      guna: "Laghu (Light), Snigdha (Fresh Ginger) / Ruksha (Turmeric & Dry Ginger)",
      virya: "Ushna (Heating)",
      vipaka: "Madhura (Sweet - Fresh Ginger) / Katu (Turmeric)",
      doshaKarma: "Ginger balances Vata & Kapha; Turmeric balances all three Doshas",
      prabhava: "Agni Deepana (Stokes enzymatic digestion), Vishaghna (Antitoxic), Varnya (Imparts golden skin complexion)"
    },
    chemicalConstituents: [
      { name: "Curcuminoids (Curcumin, Demethoxycurcumin)", role: "Potent polyphenol targeting COX-2, TNF-alpha, and inflammatory cytokines." },
      { name: "Gingerols & Shogaols", role: "Pungent volatile principles promoting gastric motility, thermogenesis, and easing nausea." },
      { name: "Turmerones", role: "Sesquiterpenes in turmeric essential oil aiding neurogenesis and stem cell regeneration." },
      { name: "Zingiberene", role: "Monoterpene responsible for ginger's distinctive spicy aroma and antispasmodic action." }
    ],
    plantParts: {
      root: "Underground fleshy rhizomes storing bioactive oleoresins, volatile oils, and vibrant golden curcuminoids.",
      leaf: "Aromatic lanceolate foliage used in traditional culinary steaming to infuse delicate herbal terpenes into dishes.",
      flower: "Ornamental white-yellow bract inflorescences emerging from the base of pseudostems."
    },
    traditionalFormulations: ["Trikatu Churna", "Haridra Khanda", "Golden Milk (Haldi Doodh)", "Saubhagya Sunthi"],
    safetyNote: "High supplementary doses of curcumin should be paired with black pepper (piperine) or healthy fats for absorption. Avoid high therapeutic doses during active gallstones."
  },
  {
    id: "brahmi",
    name: "Brahmi",
    commonName: "Water Hyssop / Herb of Grace",
    botanicalName: "Bacopa monnieri",
    family: "Plantaginaceae",
    sanskritName: "ब्राह्मी (Brāhmī - Bestowed by Brahma / Goddess of Wisdom)",
    category: "mental",
    categories: ["mental", "immunity", "vitality"],
    image: "assets/images/brahmi.jpg",
    heroHighlight: "Master Cognitive & Memory Enhancer (Medhya)",
    shortDescription: "A wetland succulent venerated in Vedic traditions for elevating intellect (Dhi), memory retention (Dhriti), and recollection (Smriti) while quieting mental agitation and stress.",
    ayushSystems: ["Ayurveda", "Siddha", "Unani"],
    ayurvedicProfile: {
      rasa: "Tikta (Bitter), Kashaya (Astringent), Madhura (Sweet)",
      guna: "Laghu (Light), Sara (Flowing / Penetrating)",
      virya: "Sheeta (Cooling)",
      vipaka: "Madhura (Sweet)",
      doshaKarma: "Tridoshahara; especially pacifies Pitta and Vata in the nervous system",
      prabhava: "Medhya Rasayana (Supreme brain elixir), Hridya (Heart tonic), Ayushya (Promotes longevity)"
    },
    chemicalConstituents: [
      { name: "Bacosides A & B", role: "Steroidal saponins that repair damaged neurons, enhance kinase activity, and restore synaptic transmission." },
      { name: "Bacopasides I - XII", role: "Triterpenoid saponins offering potent free-radical scavenging in the prefrontal cortex." },
      { name: "Luteolin & Apigenin", role: "Neuroprotective flavonoids that promote calm focus and inhibit neuroinflammation." },
      { name: "Brahmine & Herpestine", role: "Trace therapeutic alkaloids providing mild tranquilizing qualities." }
    ],
    plantParts: {
      leaf: "Small, fleshy oblong leaves loaded with bacoside glycosides, traditionally chewed fresh or infused in ghee.",
      flower: "Delicate solitary white-to-pale-blue four-petaled flowers blooming in moist marshlands.",
      stem: "Creeping prostrate succulent stems rooting at nodes to absorb nutrient-rich wetland minerals."
    },
    traditionalFormulations: ["Brahmi Ghrita", "Saraswatarishta", "Brahmi Vati", "Manasamitra Vatakam"],
    safetyNote: "Best consumed with healthy lipids (ghee or sesame oil) for optimal neurological bioavailability. Highly well tolerated across all ages."
  }
];

export const PLANT_PARTS_DETAILS = {
  leaf: {
    name: "Leaf (पत्र - Patra)",
    icon: "🍃",
    short: "The primary solar photosynthetic and volatile essential oil factory of the plant.",
    scienceDescription: "Plant leaves synthesize carbohydrates via chlorophyll while packing specialized secretory trichomes with volatile terpenes, flavonoids, and essential oils.",
    ayushWisdom: "In classical Ayurveda, leaves possess light (Laghu) and dry (Ruksha) attributes. They are predominantly used in fresh juice form (Swarasa), herbal teas (Phanta), and herbal poultices (Upanaha).",
    keyMedicinalUses: [
      "Respiratory clearance via volatile terpene steam inhalation (Tulsi, Eucalyptus)",
      "Blood purification and topical antimicrobial cleansing (Neem, Betel leaf)",
      "Hydration and mucosal repair (Aloe vera, Adhatoda vasica)"
    ],
    extractionMethods: ["Swarasa (Cold express juice)", "Phanta (Hot aromatic infusion)", "Kalka (Fresh leaf paste)"]
  },
  flower: {
    name: "Flower (पुष्प - Pushpa)",
    icon: "🌸",
    short: "The reproductive blossom, laden with delicate aromatics, pigments, and heart-opening flavonoids.",
    scienceDescription: "Floral tissues are rich in delicate phenolic acids, anthocyanins, carotenoids, and volatile esters that interact synergistically with human olfactory and limbic receptors.",
    ayushWisdom: "Flowers are inherently cooling (Sheeta Virya), uplifting to the spirit (Hridya), and pacify fiery Pitta dosha. They calm agitated emotional states and beautify the skin.",
    keyMedicinalUses: [
      "Nervous system relaxation and restful sleep (Chamomile, Jasmine, Lotus)",
      "Pitta fever reduction and cardiac vitality (Rose / Shatapatri, Hibiscus / Japa)",
      "Eye and vision rejuvenation (Palasha, Marigold lutein)"
    ],
    extractionMethods: ["Hima (Cold nocturnal infusion)", "Gulkand (Sun-cured floral preserve)", "Arka (Gentle floral hydrosol distillation)"]
  },
  root: {
    name: "Root (मूल - Moola)",
    icon: "🌱",
    short: "The anchoring energetic reservoir containing concentrated adaptogens and alkaloids.",
    scienceDescription: "Roots draw vital trace minerals, humic compounds, and water from the soil, storing complex secondary metabolites, saponins, withanolides, and inulin prebiotics.",
    ayushWisdom: "Roots represent the Earth element (Prithvi Mahabhuta). They possess heavy (Guru), unctuous (Snigdha), and grounding qualities, nourishing deep bodily tissues (Dhatus) and building Ojas (vital vigor).",
    keyMedicinalUses: [
      "Deep endocrine and nervous system adaptogenic rejuvenation (Ashwagandha, Shatavari)",
      "Digestive fire enhancement and joint mobility (Ginger, Licorice / Yashtimadhu)",
      "Hepatic detox and metabolic optimization (Kutki, Punarnava)"
    ],
    extractionMethods: ["Kwatha (Concentrated boiled decoction)", "Ghrita (Lipid-soluble medicated ghee)", "Churna (Micro-pulverized root powder)"]
  },
  stem: {
    name: "Stem & Bark (काण्ड / त्वक् - Kanda & Twak)",
    icon: "🌿",
    short: "The structural vascular highway packed with astringent tannins, resins, and protective resins.",
    scienceDescription: "The outer suberized bark and inner vascular cambium defend the plant against pests and weather through dense polymer networks of tannins, lignans, and antimicrobial resins.",
    ayushWisdom: "Barks are primarily astringent (Kashaya Rasa) and cooling/drying. They act as natural coagulants (Stambhana), wound healers (Ropana), and gut astringents.",
    keyMedicinalUses: [
      "Cardioprotective vascular tone & endothelial repair (Arjuna bark - Terminalia arjuna)",
      "Metabolic blood sugar balance and microbial defense (Cinnamon / Tvak, Neem bark)",
      "Gut lining repair and diarrhea cessation (Kutaja bark, Lodhra)"
    ],
    extractionMethods: ["Kashayam (Decoction)", "Asava / Arishta (Naturally bio-fermented herbal wine)", "Lepa (Topical bark paste)"]
  },
  fruit: {
    name: "Fruit (फल - Phala)",
    icon: "🍎",
    short: "The nutrient-dense seed guardian overflowing with bioavailable vitamins, enzymes, and antioxidants.",
    scienceDescription: "Fruits pack concentrated sugars, organic fruit acids (citric, malic, ascorbic), pectin dietary fibers, and bioflavonoids designed to nourish and protect nascent genetic material.",
    ayushWisdom: "Fruits represent the pinnacle of plant maturation. Many are revered as Rasayanas (cellular restorers) capable of harmonizing all three doshas without creating metabolic toxins (Ama).",
    keyMedicinalUses: [
      "Cellular longevity, collagen renewal, and immunity (Amla / Amalaki)",
      "Digestive regulation, peristalsis, and colon detox (Haritaki, Bibhitaki in Triphala)",
      "Liver protection and cellular hydration (Draksha / Raisins, Bilva)"
    ],
    extractionMethods: ["Churna (Dehydrated fruit powder)", "Avaleha (Medicated herbal fruit jam like Chyawanprash)", "Swarasa (Fresh pulp extract)"]
  },
  seed: {
    name: "Seed (बीज - Beeja)",
    icon: "🌰",
    short: "The embryonic seed of life containing concentrated essential fatty acids, proteins, and phytosterols.",
    scienceDescription: "Seeds hold the full genetic blueprint of future flora, packing high-density energy in the form of omega lipids, amino acids, tocopherols, and enzymatic inhibitors.",
    ayushWisdom: "Seeds carry the Shukra Dhatu (reproductive and generative vitality) resonance. They nourish sexual vitality (Vrishya), nourish the brain (Medhya), and lubricate dry joints.",
    keyMedicinalUses: [
      "Hormonal balance and reproductive vitality (Kapikacchu / Mucuna pruriens, Gokshura)",
      "Brain lipid replenishment and cognitive retention (Jyotishmati, Flaxseed / Atasi)",
      "Digestive spasm relief and carminative support (Fennel / Mishreya, Ajwain / Yavani)"
    ],
    extractionMethods: ["Taila (Cold-pressed medicated oil)", "Modaka (Energy seed confectionery)", "Churna (Freshly ground seed powder)"]
  }
};

export const AYUSH_SYSTEMS_INFO = [
  {
    id: "ayurveda",
    name: "Ayurveda",
    tagline: "The Ancient Science of Life & Longevity",
    origin: "India (>5,000 Years Tradition)",
    coreConcept: "Tridosha Balance (Vata, Pitta, Kapha) & Panchamahabhuta (Five Great Elements: Ether, Air, Fire, Water, Earth)",
    description: "Ayurveda views health as dynamic equilibrium between mind, body, senses, and environment. Medicinal herbs are classified not merely by chemical parts, but through functional bio-energetics: Rasa (Taste), Guna (Qualities), Virya (Potency), Vipaka (Post-digestive effect), and Prabhava (Unique therapeutic action).",
    keyTexts: "Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, Bhavaprakasha Nighantu",
    color: "#2F6B4F"
  },
  {
    id: "yoga-naturopathy",
    name: "Yoga & Naturopathy",
    tagline: "Inner Harmony Through Nature's Five Elements",
    origin: "Vedic Tradition & Nature Cure",
    coreConcept: "Pancha Kosha (Five Sheaths of Existence) & Vis Medicatrix Naturae (Healing Power of Nature)",
    description: "Naturopathy works with the innate self-healing capability of the human physiology through diet, sun therapy, fresh living botanicals, hydrotherapy, and conscious breath (Pranayama) to eliminate morbid toxins without synthetic intervention.",
    keyTexts: "Patanjali Yoga Sutras, Hatha Yoga Pradipika, Philosophy of Nature Cure",
    color: "#C9A227"
  },
  {
    id: "unani",
    name: "Unani Medicine",
    tagline: "Greco-Arabic Humoral Balance & Natural Temperament",
    origin: "Greece & Indo-Persian Golden Age (Ibn Sina / Avicenna)",
    coreConcept: "Arkan (Elements), Mizaj (Temperament), and Akhlat (Four Humors: Dam/Blood, Balgham/Phlegm, Safra/Yellow Bile, Sauda/Black Bile)",
    description: "Unani medicine emphasizes the body's natural defense mechanism, known as Quwwat-e-Mudabbira-e-Badan. Herbal therapies restore humoral equilibrium tailored to an individual's unique temperament (Sanguine, Phlegmatic, Choleric, Melancholic).",
    keyTexts: "Al-Qanun fi al-Tibb (Canon of Medicine), Kitab al-Hawi (Rhazes)",
    color: "#1E5E4E"
  },
  {
    id: "siddha",
    name: "Siddha Medicine",
    tagline: "The Mystical Dravidian Alchemy of Longevity & Kayakalpa",
    origin: "Ancient Tamil Nadu (Founded by Agastya & the 18 Siddhars)",
    coreConcept: "Mukkuttram (Vali, Azhal, Iyyam) & 96 Tattvas (Constituents of Life)",
    description: "Siddha is one of the world's oldest codified medical systems, celebrated for Kayakalpa (cellular immortality/rejuvenation science), botanical alchemy, and pulse diagnosis (Nadi Pariksha) utilizing coastal and mountain flora of the Western Ghats.",
    keyTexts: "Theraiyar Sekarappa, Agathiyar Gunavagadam, Bogar 7000",
    color: "#A87920"
  },
  {
    id: "homoeopathy",
    name: "Homoeopathy",
    tagline: "Like Cures Like & High-Dilution Energetic Resonance",
    origin: "Founded by Dr. Samuel Hahnemann (1796), deeply integrated in Indian AYUSH",
    coreConcept: "Similia Similibus Curentur (Like Cures Like) & Minimum Potentized Dose",
    description: "Utilizes infinitesimal potentized tinctures derived from botanical sources (e.g. Azadirachta, Ocimum, Withania) to stimulate the biological 'Vital Force' and provoke an innate immune recovery response without toxic residue.",
    keyTexts: "Organon of Medicine, Materia Medica Pura, Boericke's Repertory",
    color: "#3F755F"
  }
];

export const HERBAL_FORMULATIONS_SYNERGY = [
  {
    name: "Triphala (The Three Sacred Fruits)",
    category: "Metabolic & Cellular Rejuvenation",
    ingredients: ["Amla (Amalaki)", "Haritaki (Chebulic Myrobalan)", "Bibhitaki (Belleric Myrobalan)"],
    synergyAction: "Amla cools Pitta and nourishes tissues; Haritaki clears Vata digestive stagnancy; Bibhitaki liquifies Kapha mucus. Together, they create the most revered gentle colon purifier and cellular antioxidant in Asian medicine.",
    idealTiming: "Bedtime with warm water or morning with raw honey."
  },
  {
    name: "Golden Elixir (Haridra & Ardraka Kashayam)",
    category: "Immunity & Joint Vitality",
    ingredients: ["Turmeric (Curcuma)", "Ginger (Zingiber)", "Black Pepper (Piperine)", "Tulsi"],
    synergyAction: "Curcumin reduces inflammatory signaling, while piperine in black pepper boosts curcumin bioavailability by up to 2000%. Ginger fuels absorption through Agni, and Tulsi modulates stress hormones.",
    idealTiming: "Morning or post-exercise with warm plant milk or ghee."
  },
  {
    name: "Medhya Rasayana (Mind & Memory Tonic)",
    category: "Cognitive Endurance & Stress Relief",
    ingredients: ["Brahmi (Bacopa)", "Ashwagandha (Withania)", "Shankhpushpi", "Licorice"],
    synergyAction: "Brahmi stimulates synaptic plasticity and memory kinase, while Ashwagandha buffers adrenal cortisol depletion. The blend calms mental anxiety while sharpening daytime analytical focus.",
    idealTiming: "Morning with warm ghee or tea."
  }
];
