export const DATABASE = 'new-localizations';

export enum SERVICES {
    ALL = 'Todos los contenidos',
    RESOURCE = 'Recurso turístico',
    SERVICE = 'Servicio turístico',
    ROUTE = 'Ruta'
}

export enum COLORS {
    BLUE = '#07a8b7',
    CORAL = '#DB795E',
    LIGHTBLUE = '#75c5c3',
    GREEN = '#91c792',
    YELLOW = '#f0bd67',
    LIGHTGREY = '#d3d3d3',
    BLACK = '#000000'
}

export enum ORDER {
    UPWARD = 'upward',
    DOWNWARD = 'downward'
}

export const CURRENTCOLORS = [
    COLORS.BLUE, COLORS.CORAL, COLORS.LIGHTBLUE, COLORS.GREEN, COLORS.YELLOW, COLORS.LIGHTGREY
]

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