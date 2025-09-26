
export const LOCAL_STORAGE_KEYS = {
  MATERIALS: 'cotiza3d_materials',
  MACHINES: 'cotiza3d_machines',
  SETTINGS: 'cotiza3d_settings',
  QUOTES: 'cotiza3d_quotes',
  DESIGNS: 'cotiza3d_designs',
  INVESTMENTS: 'cotiza3d_investments',
  FUTURE_PURCHASES: 'cotiza3d_future_purchases',
  CLIENTS: 'cotiza3d_clients',
  LINKS: 'cotiza3d_links',
};

export const FILAMENT_TYPES = [
  { 
    value: 'PLA', 
    label: 'PLA (Ácido Poliláctico)', 
    description: 'Biodegradable, fácil de imprimir, bajo warping. Buena rigidez y acabado superficial. No soporta bien altas temperaturas ni esfuerzos mecánicos prolongados. Ideal para piezas decorativas, prototipos y juguetes.' 
  },
  { 
    value: 'ABS', 
    label: 'ABS (Acrilonitrilo Butadieno Estireno)', 
    description: 'Resistente a impactos y temperaturas. Duro y duradero. Tiende a deformarse (warping), requiere cama caliente y ventilación por emisiones. Usado en piezas mecánicas y carcasas.' 
  },
  { 
    value: 'PETG', 
    label: 'PETG (Tereftalato de polietileno glicol)', 
    description: 'Resistente, flexible y con buena adherencia capa a capa. Menos warping que ABS. Buen equilibrio entre dureza y elasticidad. Apto para piezas funcionales y recipientes de contacto con alimentos (dependiendo del fabricante).' 
  },
  { 
    value: 'TPU/TPE', 
    label: 'TPU/TPE (Flexibles)',
    description: 'Filamentos flexibles. Muy resistentes a abrasión, aceite y químicos. Piezas elásticas como fundas, ruedas, juntas. Difíciles de imprimir a alta velocidad.'
  },
  { 
    value: 'Nylon', 
    label: 'Nylon (Poliamida)',
    description: 'Alta resistencia mecánica y química, buena flexibilidad. Absorbe humedad fácilmente, lo que afecta la calidad de impresión. Ideal para engranajes, bisagras y piezas estructurales.'
  },
  { 
    value: 'ASA', 
    label: 'ASA (Acrilonitrilo Estireno Acrilato)',
    description: 'Similar al ABS pero con mejor resistencia a rayos UV y a la intemperie. Usado para piezas exteriores (automotriz, cartelería).'
  },
  { 
    value: 'PC', 
    label: 'PC (Policarbonato)',
    description: 'Muy resistente al impacto y al calor. Duro, fuerte y duradero, pero difícil de imprimir (requiere temperaturas altas y cámara cerrada). Usado en piezas industriales y de ingeniería.'
  },
  { 
    value: 'HIPS', 
    label: 'HIPS (Poliestireno de alto impacto)',
    description: 'Material fuerte pero ligero. Se usa muchas veces como material de soporte porque se disuelve en limoneno.'
  },
  { 
    value: 'PVA', 
    label: 'PVA (Alcohol polivinílico)',
    description: 'Soluble en agua, usado principalmente como material de soporte en impresoras multimaterial.'
  },
  { 
    value: 'Wood', 
    label: 'Compuesto: Madera',
    description: 'PLA con fibras de madera que le dan un aspecto y olor similar a la madera.'
  },
  { 
    value: 'CarbonFiber', 
    label: 'Compuesto: Fibra de Carbono',
    description: 'Añade más rigidez y resistencia al material base (ej. PLA o PETG), pero es abrasivo para la boquilla.'
  },
  { 
    value: 'Metal', 
    label: 'Compuesto: Metal',
    description: 'Mezcla de PLA con polvo de metal (bronce, aluminio) para un aspecto y peso metálico, aunque suelen ser más frágiles.'
  },
  { value: 'Other', label: 'Otro', description: 'Cualquier otro tipo de filamento no listado.' },
];

export const LATAM_CURRENCIES = [
  { value: 'ARS', label: 'Argentina - Peso Argentino', locale: 'es-AR' },
  { value: 'BOB', label: 'Bolivia - Boliviano', locale: 'es-BO' },
  { value: 'BRL', label: 'Brasil - Real Brasileño', locale: 'pt-BR' },
  { value: 'CLP', label: 'Chile - Peso Chileno', locale: 'es-CL' },
  { value: 'COP', label: 'Colombia - Peso Colombiano', locale: 'es-CO' },
  { value: 'CRC', label: 'Costa Rica - Colón', locale: 'es-CR' },
  { value: 'CUP', label: 'Cuba - Peso Cubano', locale: 'es-CU' },
  { value: 'DOP', label: 'Rep. Dominicana - Peso Dominicano', locale: 'es-DO' },
  { value: 'GTQ', label: 'Guatemala - Quetzal', locale: 'es-GT' },
  { value: 'HNL', label: 'Honduras - Lempira', locale: 'es-HN' },
  { value: 'MXN', label: 'México - Peso Mexicano', locale: 'es-MX' },
  { value: 'NIO', label: 'Nicaragua - Córdoba', locale: 'es-NI' },
  { value: 'PAB', label: 'Panamá - Balboa', locale: 'es-PA' },
  { value: 'PYG', label: 'Paraguay - Guaraní', locale: 'es-PY' },
  { value: 'PEN', label: 'Perú - Sol', locale: 'es-PE' },
  { value: 'USD', label: 'Puerto Rico - Dólar Estadounidense', locale: 'en-PR' },
  { value: 'UYU', label: 'Uruguay - Peso Uruguayo', locale: 'es-UY' },
  { value: 'VES', label: 'Venezuela - Bolívar Soberano', locale: 'es-VE' },
];
