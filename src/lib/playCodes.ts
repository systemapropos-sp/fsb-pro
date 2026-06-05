// Códigos de jugada del sistema FSB original
// Fuente: página /jugadas del sistema

export interface PlayCode {
  code: string;
  description: string;
  category: string;
}

export const PLAY_CODES: PlayCode[] = [
  // Primera Mitad
  { code: 'HM', description: 'Primera Mitad Money Line', category: 'Primera Mitad' },
  { code: 'H', description: 'Primera mitad', category: 'Primera Mitad' },
  { code: 'H+', description: 'Primera mitad a mas', category: 'Primera Mitad' },
  { code: 'H-', description: 'Primera mitad a menos', category: 'Primera Mitad' },
  { code: 'AH+', description: 'Solo en primera mitad a mas', category: 'Primera Mitad' },
  { code: 'AH-', description: 'Solo en primera mitad a menos', category: 'Primera Mitad' },
  // Juego Completo
  { code: 'J', description: 'Juego Completo', category: 'Juego Completo' },
  { code: 'R', description: 'Run Line', category: 'Juego Completo' },
  { code: 'M', description: 'Money Line', category: 'Juego Completo' },
  { code: '+', description: 'Juego a mas', category: 'Juego Completo' },
  { code: '-', description: 'Juego a menos', category: 'Juego Completo' },
  { code: 'A+', description: 'Equipo solo a mas', category: 'Juego Completo' },
  { code: 'A-', description: 'Equipo solo a menos', category: 'Juego Completo' },
  { code: 'S', description: 'Super Run Line', category: 'Juego Completo' },
  { code: 'F', description: 'Primera carrera', category: 'Juego Completo' },
  { code: 'L', description: 'Ultima carrera', category: 'Juego Completo' },
  { code: 'Y', description: 'Anotan en 1er Inning', category: 'Juego Completo' },
  { code: 'N', description: 'No anotan en 1er Inning', category: 'Juego Completo' },
  { code: 'E', description: 'Empate', category: 'Juego Completo' },
  { code: 'K+', description: 'Pitcher ponches a mas', category: 'Juego Completo' },
  { code: 'K-', description: 'Pitcher ponches a menos', category: 'Juego Completo' },
  // Periodo 1
  { code: 'Q1ML', description: 'Periodo #1 Money Line', category: 'Periodo 1' },
  { code: 'Q1', description: 'Periodo #1', category: 'Periodo 1' },
  { code: 'Q1+', description: 'Periodo #1 a mas', category: 'Periodo 1' },
  { code: 'Q1-', description: 'Periodo #1 a menos', category: 'Periodo 1' },
  { code: 'Q1S+', description: 'Periodo #1 equipo solo a mas', category: 'Periodo 1' },
  { code: 'Q1S-', description: 'Periodo #1 equipo solo a menos', category: 'Periodo 1' },
  // Periodo 2
  { code: 'Q2ML', description: 'Periodo #2 Money Line', category: 'Periodo 2' },
  { code: 'Q2', description: 'Periodo #2', category: 'Periodo 2' },
  { code: 'Q2+', description: 'Periodo #2 a mas', category: 'Periodo 2' },
  { code: 'Q2-', description: 'Periodo #2 a menos', category: 'Periodo 2' },
  { code: 'Q2S+', description: 'Periodo #2 equipo solo a mas', category: 'Periodo 2' },
  { code: 'Q2S-', description: 'Periodo #2 equipo solo a menos', category: 'Periodo 2' },
  // Periodo 3
  { code: 'Q3ML', description: 'Periodo #3 Money Line', category: 'Periodo 3' },
  { code: 'Q3', description: 'Periodo #3', category: 'Periodo 3' },
  { code: 'Q3+', description: 'Periodo #3 a mas', category: 'Periodo 3' },
  { code: 'Q3-', description: 'Periodo #3 a menos', category: 'Periodo 3' },
  { code: 'Q3S+', description: 'Periodo #3 equipo solo a mas', category: 'Periodo 3' },
  { code: 'Q3S-', description: 'Periodo #3 equipo solo a menos', category: 'Periodo 3' },
  // Periodo 4
  { code: 'Q4ML', description: 'Periodo #4 Money Line', category: 'Periodo 4' },
  { code: 'Q4', description: 'Periodo #4', category: 'Periodo 4' },
  { code: 'Q4+', description: 'Periodo #4 a mas', category: 'Periodo 4' },
  { code: 'Q4-', description: 'Periodo #4 a menos', category: 'Periodo 4' },
  { code: 'Q4S+', description: 'Periodo #4 equipo solo a mas', category: 'Periodo 4' },
  { code: 'Q4S-', description: 'Periodo #4 equipo solo a menos', category: 'Periodo 4' },
];

// Busca un código de jugada (case insensitive)
export function findPlayCode(code: string): PlayCode | undefined {
  return PLAY_CODES.find(p => p.code.toUpperCase() === code.toUpperCase());
}

// Verifica si un código existe
export function isValidPlayCode(code: string): boolean {
  return PLAY_CODES.some(p => p.code.toUpperCase() === code.toUpperCase());
}

// Obtiene descripción de un código
export function getPlayDescription(code: string): string {
  const found = findPlayCode(code);
  return found ? found.description : code;
}

// Códigos de equipos por deporte
export const TEAM_CODES_MAP: Record<string, string> = {
  // NBA
  '2001': 'Lakers', '2002': 'Boston', '2003': 'Atlanta', '2004': 'Brooklyn',
  '2005': 'Charlotte', '2006': 'Chicago', '2007': 'Cleveland', '2008': 'Dallas',
  '2009': 'Denver', '2010': 'Detroit', '2011': 'Golden State', '2012': 'Houston',
  '2013': 'Indiana', '2014': 'LA Clippers', '2015': 'Memphis', '2016': 'Miami',
  '2017': 'Milwaukee', '2018': 'Minnesota', '2019': 'New Orleans', '2020': 'New York',
  '2021': 'Oklahoma City', '2022': 'Orlando', '2023': 'Philadelphia', '2024': 'Phoenix',
  '2025': 'Portland', '2026': 'Sacramento', '2027': 'San Antonio', '2028': 'Toronto',
  '2029': 'Utah', '2030': 'Washington',
  // MLB
  '4001': 'Arizona', '4002': 'Atlanta', '4003': 'Baltimore', '4004': 'Boston',
  '4005': 'Chicago Cubs', '4006': 'Chicago Sox', '4007': 'Cincinnati', '4008': 'Cleveland',
  '4009': 'Colorado', '4010': 'Detroit', '4011': 'Houston', '4012': 'Kansas City',
  '4013': 'LA Angels', '4014': 'LA Dodgers', '4015': 'Miami', '4016': 'Milwaukee',
  '4017': 'Minnesota', '4018': 'NY Mets', '4019': 'NY Yankees', '4020': 'Oakland',
  '4021': 'Philadelphia', '4022': 'Pittsburgh', '4023': 'San Diego', '4024': 'San Francisco',
  '4025': 'Seattle', '4026': 'St. Louis', '4027': 'Tampa Bay', '4028': 'Texas',
  '4029': 'Toronto', '4030': 'Washington',
  // NFL
  '3001': 'Arizona', '3002': 'Atlanta', '3003': 'Baltimore', '3004': 'Buffalo',
  '3005': 'Carolina', '3006': 'Chicago', '3007': 'Cincinnati', '3008': 'Cleveland',
  '3009': 'Dallas', '3010': 'Denver', '3011': 'Detroit', '3012': 'Green Bay',
  '3013': 'Houston', '3014': 'Indianapolis', '3015': 'Jacksonville', '3016': 'Kansas City',
  '3017': 'LA Chargers', '3018': 'LA Rams', '3019': 'Las Vegas', '3020': 'Miami',
  '3021': 'Minnesota', '3022': 'New England', '3023': 'New Orleans', '3024': 'NY Giants',
  '3025': 'NY Jets', '3026': 'Philadelphia', '3027': 'Pittsburgh', '3028': 'San Francisco',
  '3029': 'Seattle', '3030': 'Tampa Bay', '3031': 'Tennessee', '3032': 'Washington',
  // WNBA
  '2041': 'Atlanta', '2042': 'Chicago', '2043': 'Connecticut', '2044': 'Dallas',
  '2045': 'Indiana', '2046': 'Las Vegas', '2047': 'Los Angeles', '2048': 'Minnesota',
  '2049': 'New York', '2050': 'Phoenix', '2051': 'Seattle', '2052': 'Washington',
  // CFL
  '5001': 'BC Lions', '5002': 'Calgary', '5003': 'Edmonton', '5004': 'Hamilton',
  '5005': 'Montreal', '5006': 'Ottawa', '5007': 'Saskatchewan', '5008': 'Toronto',
  '5009': 'Winnipeg', '5010': 'Calgary 2',
};

// Busca equipo por código
export function findTeamByCode(code: string): string | undefined {
  return TEAM_CODES_MAP[code];
}

// Verifica si un código de equipo existe
export function isValidTeamCode(code: string): boolean {
  return code in TEAM_CODES_MAP;
}
