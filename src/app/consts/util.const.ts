export const DATABASE = 'new-localizations';
export const OLD_DATABASE = 'localizations';

export enum SERVICES {
    ALL = 'Todos los contenidos',
    RESOURCE = 'Recurso turístico',
    SERVICE = 'Servicio turístico',
    ROUTE = 'Ruta'
}

export enum COLORS {
    BLUE = '#07a8b7',
    CORAL = '#DB795E',
    LIGHTSLATEGRAY = '#778899',
    GREEN = '#91c792',
    YELLOW = '#f0bd67',
    LIGHTGREY = '#d3d3d3',
    FOREST = '#228B22',
    BROWNIERED = '#8B2121',
    BLACK = '#000000'
}

export enum ORDER {
    UPWARD = 'upward',
    DOWNWARD = 'downward'
}

export const CURRENTCOLORS = [
    COLORS.BLUE, COLORS.CORAL, COLORS.LIGHTSLATEGRAY, COLORS.GREEN, COLORS.YELLOW, COLORS.LIGHTGREY, COLORS.BROWNIERED
]

export const TYPE_COLORS = [
    COLORS.BLUE, COLORS.CORAL, COLORS.LIGHTSLATEGRAY, COLORS.GREEN, COLORS.YELLOW, COLORS.LIGHTGREY, COLORS.FOREST, COLORS.BROWNIERED
]

export const imageBaseUrl = 'https://turismoambrozcaparra.es//planificador/imagenes';

export const typesMapping: { [key: string]: string } = {
    'Dónde dormir': 'where-to-sleep',
    'Dónde comer': 'where-to-eat',
    'Museos, Centros de Interpretación y oficinas de turismo': 'culture-resource',
    /* 'Experiencias': 'experiences', */
    'Recursos acuáticos': 'aquatic-resources',
    'Astroturismo': 'astrotourism',
    /* 'Naturaleza': 'nature', */
    'Monumentos': 'monuments',
    'Empresas de actividad': 'activity'
};

export const optionsMapping: { [key: string]: string } = {
    'Restablecer': 'restore',
    'Dónde dormir': 'where-to-sleep',
    'Dónde comer': 'where-to-eat',
    'Museos, Centros de Interpretación y oficinas de turismo': 'culture-resource',
    /* 'Experiencias': 'experiences', */
    'Recursos acuáticos': 'aquatic-resources',
    'Astroturismo': 'astrotourism',
    /* 'Naturaleza': 'nature', */
    'Monumentos': 'monuments',
    'Empresas de actividad': 'activity',
    /* 'Lista de deseos': 'wishlist', */
};

export const imageTypeMapping: { [key: string]: string } = {
    'where-to-sleep': 'alojamiento',
    'where-to-eat': 'restauracion',
    'culture-resource': 'museos-ci',
    /* 'experiences': '', */
    'aquatic-resources': 'agua',
    'astrotourism': 'astroturismo',
    'nature': '',
    'monuments': 'monumentos',
    'activity': 'actividades'
};

// * Only for development purpose
export const sitios = [
    {
      "type": "where-to-sleep",
      "coords": [
          -5.948773764843039,
          40.22383019046418
      ],
      "location": "Segura de Toro",
      "id": "uMd3Arlbi6UttgPuNc80",
      "name": "Casa Rural La Tasca"
  },
  {
    "type": "where-to-sleep",
    "location": "Segura de Toro",
    "name": "Casa Rural Los Vettones",
    "id": "zylYSHy4beiqWuQKV7GP",
    "coords": [
        -5.9484,
        40.2236
    ]
  },
  {
    "location": "Hervás",
    "type": "where-to-eat",
    "coords": [
        -5.85902839178069,
        40.274635698912405
    ],
    "name": "Mesón El 60",
    "id": "ugr4RQpTUUnsd5IlUn9m"
  }]