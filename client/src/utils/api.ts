export const API_BASE = 'http://localhost:3001/api';

// Failsafe Mock Data in case server is not running
export const MOCK_TEAMS = [
  { id: '1', name: 'Brazil', code: 'BRA', flagUrl: 'https://flagcdn.com/w320/br.png', group: 'G', fifaRanking: 1, eloRating: 2130, squadValueEur: 1020, attackRating: 89, defenseRating: 88, midfieldRating: 87 },
  { id: '2', name: 'Argentina', code: 'ARG', flagUrl: 'https://flagcdn.com/w320/ar.png', group: 'C', fifaRanking: 3, eloRating: 2085, squadValueEur: 750, attackRating: 89, defenseRating: 85, midfieldRating: 88 },
  { id: '3', name: 'Pháp', code: 'FRA', flagUrl: 'https://flagcdn.com/w320/fr.png', group: 'D', fifaRanking: 4, eloRating: 2060, squadValueEur: 1050, attackRating: 90, defenseRating: 87, midfieldRating: 86 },
  { id: '4', name: 'Anh', code: 'ENG', flagUrl: 'https://flagcdn.com/w320/gb-eng.png', group: 'B', fifaRanking: 5, eloRating: 2010, squadValueEur: 1100, attackRating: 88, defenseRating: 84, midfieldRating: 89 },
  { id: '5', name: 'Tây Ban Nha', code: 'ESP', flagUrl: 'https://flagcdn.com/w320/es.png', group: 'E', fifaRanking: 7, eloRating: 1990, squadValueEur: 870, attackRating: 86, defenseRating: 86, midfieldRating: 90 },
  { id: '6', name: 'Bồ Đào Nha', code: 'POR', flagUrl: 'https://flagcdn.com/w320/pt.png', group: 'H', fifaRanking: 9, eloRating: 1965, squadValueEur: 930, attackRating: 87, defenseRating: 85, midfieldRating: 87 },
  { id: '7', name: 'Hà Lan', code: 'NED', flagUrl: 'https://flagcdn.com/w320/nl.png', group: 'A', fifaRanking: 8, eloRating: 1950, squadValueEur: 660, attackRating: 84, defenseRating: 85, midfieldRating: 85 },
  { id: '8', name: 'Đức', code: 'GER', flagUrl: 'https://flagcdn.com/w320/de.png', group: 'E', fifaRanking: 11, eloRating: 1940, squadValueEur: 850.5, attackRating: 85, defenseRating: 82, midfieldRating: 88 },
  { id: '9', name: 'Maroc', code: 'MAR', flagUrl: 'https://flagcdn.com/w320/ma.png', group: 'F', fifaRanking: 22, eloRating: 1845, squadValueEur: 320, attackRating: 78, defenseRating: 83, midfieldRating: 80 }
];

export const MOCK_MATCHES = [
  {
    id: 'm1',
    homeTeam: MOCK_TEAMS[0], // Brazil
    awayTeam: MOCK_TEAMS[8], // Morocco
    stage: 'GROUP',
    groupName: 'G',
    date: new Date().toISOString(),
    status: 'LIVE',
    homeScore: 1,
    awayScore: 0,
    minute: 64,
    liveStats: JSON.stringify({
      possession: [60, 40],
      shots: [12, 5],
      shotsOnTarget: [4, 1],
      corners: [5, 2],
      fouls: [8, 10],
      yellowCards: [1, 2],
      redCards: [0, 0],
      xG: [1.45, 0.42]
    }),
    liveTicker: JSON.stringify([
      { min: 14, type: 'YELLOW', team: 'away', player: 'Tiền vệ tuyển Maroc' },
      { min: 38, type: 'GOAL', team: 'home', player: 'Vinícius Júnior', assist: 'Neymar Jr', detail: '[1] - 0' },
      { min: 55, type: 'YELLOW', team: 'home', player: 'Casemiro' }
    ]),
    prediction: {
      homeWinProb: 61,
      drawProb: 22,
      awayWinProb: 17,
      expectedHomeGoals: 1.88,
      expectedAwayGoals: 0.88,
      predictedHomeScore: 2,
      predictedAwayScore: 0,
      secondaryHomeScore: 1,
      secondaryAwayScore: 0,
      scoreProbabilities: JSON.stringify({
        '2-0': 15.2, '1-0': 13.5, '2-1': 11.5, '1-1': 10.2, '3-0': 9.1
      }),
      bettingTips: JSON.stringify([
        { market: 'Asian Handicap', recommendation: 'Brazil -0.5', confidence: 78, oddSim: 1.65, isValue: true },
        { market: 'Over/Under 2.5', recommendation: 'Over 2.5 Goals', confidence: 62, oddSim: 1.95, isValue: false }
      ]),
      confidenceScore: 78,
      riskLevel: 'LOW'
    }
  },
  {
    id: 'm2',
    homeTeam: MOCK_TEAMS[1], // Argentina
    awayTeam: MOCK_TEAMS[2], // France
    stage: 'GROUP',
    groupName: 'C',
    date: new Date(Date.now() + 86400000).toISOString(),
    status: 'SCHEDULED',
    homeScore: 0,
    awayScore: 0,
    minute: 0,
    prediction: {
      homeWinProb: 44,
      drawProb: 28,
      awayWinProb: 32,
      expectedHomeGoals: 1.54,
      expectedAwayGoals: 1.28,
      predictedHomeScore: 1,
      predictedAwayScore: 1,
      secondaryHomeScore: 2,
      secondaryAwayScore: 1,
      scoreProbabilities: JSON.stringify({
        '1-1': 13.8, '2-1': 11.2, '1-2': 9.8, '1-0': 9.5, '2-2': 8.5
      }),
      bettingTips: JSON.stringify([
        { market: 'BTTS', recommendation: 'Yes (BTTS)', confidence: 68, oddSim: 1.75, isValue: true },
        { market: 'Over/Under 2.5', recommendation: 'Under 2.5 Goals', confidence: 54, oddSim: 1.88, isValue: false }
      ]),
      confidenceScore: 56,
      riskLevel: 'MEDIUM'
    }
  },
  {
    id: 'm3',
    homeTeam: MOCK_TEAMS[3], // England
    awayTeam: MOCK_TEAMS[7], // Germany
    stage: 'GROUP',
    groupName: 'B',
    date: new Date(Date.now() + 172800000).toISOString(),
    status: 'SCHEDULED',
    homeScore: 0,
    awayScore: 0,
    minute: 0,
    prediction: {
      homeWinProb: 50,
      drawProb: 27,
      awayWinProb: 23,
      expectedHomeGoals: 1.68,
      expectedAwayGoals: 1.12,
      predictedHomeScore: 2,
      predictedAwayScore: 1,
      secondaryHomeScore: 1,
      secondaryAwayScore: 1,
      scoreProbabilities: JSON.stringify({
        '2-1': 14.5, '1-1': 12.8, '1-0': 11.2, '2-0': 9.8, '2-2': 7.6
      }),
      bettingTips: JSON.stringify([
        { market: 'Asian Handicap', recommendation: 'Anh -0.5', confidence: 72, oddSim: 1.85, isValue: true },
        { market: 'BTTS', recommendation: 'Yes (BTTS)', confidence: 70, oddSim: 1.68, isValue: true }
      ]),
      confidenceScore: 68,
      riskLevel: 'MEDIUM'
    }
  }
];

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.warn(`Failed to fetch ${endpoint} from server, using fallback mock data.`, error);
    
    // Return mock datasets based on endpoints
    if (endpoint === '/matches') {
      return MOCK_MATCHES;
    }
    if (endpoint.startsWith('/matches/')) {
      const matchId = endpoint.split('/')[2];
      const match = MOCK_MATCHES.find(m => m.id === matchId) || MOCK_MATCHES[0];
      
      // Return details
      return {
        match,
        homeSquad: [
          { name: 'Lionel Messi', position: 'FWD', marketValueEur: 35, status: 'FIT', goals: 5, assists: 3, rating: 8.2 },
          { name: 'Alexis Mac Allister', position: 'MID', marketValueEur: 70, status: 'INJURED', injuryDetails: 'Căng cơ đùi sau', rating: 7.4 }
        ],
        awaySquad: [
          { name: 'Kylian Mbappé', position: 'FWD', marketValueEur: 180, status: 'FIT', goals: 6, assists: 2, rating: 8.4 }
        ],
        h2h: [
          { homeScore: 3, awayScore: 3, date: '2022-12-18T15:00:00Z', competition: 'Chung kết World Cup' }
        ],
        form: {
          home: MOCK_MATCHES,
          away: MOCK_MATCHES
        }
      };
    }
    if (endpoint === '/teams') {
      return MOCK_TEAMS;
    }
    if (endpoint.startsWith('/teams/')) {
      const teamId = endpoint.split('/')[2];
      const team = MOCK_TEAMS.find(t => t.id === teamId) || MOCK_TEAMS[0];
      return {
        team,
        matches: MOCK_MATCHES
      };
    }
    if (endpoint === '/betting-insights') {
      return {
        valueBets: [
          {
            matchId: 'm1',
            homeTeam: MOCK_TEAMS[0],
            awayTeam: MOCK_TEAMS[8],
            stage: 'GROUP',
            date: new Date().toISOString(),
            tips: [
              { market: 'Asian Handicap', recommendation: 'Brazil -0.5', confidence: 78, oddSim: 1.65, isValue: true }
            ],
            confidenceScore: 78,
            riskLevel: 'LOW'
          },
          {
            matchId: 'm2',
            homeTeam: MOCK_TEAMS[1],
            awayTeam: MOCK_TEAMS[2],
            stage: 'GROUP',
            date: new Date().toISOString(),
            tips: [
              { market: 'BTTS', recommendation: 'Yes (BTTS)', confidence: 68, oddSim: 1.75, isValue: true }
            ],
            confidenceScore: 56,
            riskLevel: 'MEDIUM'
          }
        ],
        highConfidence: [
          {
            matchId: 'm1',
            homeTeam: MOCK_TEAMS[0],
            awayTeam: MOCK_TEAMS[8],
            stage: 'GROUP',
            date: new Date().toISOString(),
            tips: [
              { market: 'Asian Handicap', recommendation: 'Brazil -0.5', confidence: 78, oddSim: 1.65, isValue: true }
            ],
            confidenceScore: 78,
            riskLevel: 'LOW'
          }
        ]
      };
    }
    if (endpoint === '/bracket/simulate') {
      // Return simulated brackets probabilities
      return MOCK_TEAMS.map((t, idx) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        flagUrl: t.flagUrl,
        eloRating: t.eloRating,
        probabilities: {
          r16: 100,
          qf: Math.max(10, 85 - idx * 8),
          sf: Math.max(5, 55 - idx * 12),
          f: Math.max(2, 30 - idx * 10),
          winner: Math.max(1, 18 - idx * 5)
        }
      })).sort((a, b) => b.probabilities.winner - a.probabilities.winner);
    }
    
    throw error;
  }
}
