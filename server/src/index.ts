import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { generatePrediction } from './predictor';
import { fetchSofaScoreEvent } from './sofa-api';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- DYNAMIC TIME AND MATCH STATE HELPERS ---

function getCurrentSimulatedTime(): Date {
  const actualNow = new Date();
  if (actualNow.getFullYear() === 2026) {
    return actualNow;
  }
  // Fallback map: if opened in future/past years, shift hours/mins/secs to June 13, 2026
  const simulated = new Date('2026-06-13T00:00:00Z');
  simulated.setUTCHours(actualNow.getUTCHours());
  simulated.setUTCMinutes(actualNow.getUTCMinutes());
  simulated.setUTCSeconds(actualNow.getUTCSeconds());
  return simulated;
}

function getDynamicMatchState(match: any, currentTime: Date, playersByTeam: { [teamId: string]: any[] } = {}): any {
  if (!match) return null;
  const kickoff = new Date(match.date);
  
  // Target scores (use actual if finished in seeder, else AI prediction)
  const targetHome = match.status === 'FINISHED' ? match.homeScore : (match.prediction?.predictedHomeScore ?? 1);
  const targetAway = match.status === 'FINISHED' ? match.awayScore : (match.prediction?.predictedAwayScore ?? 1);

  // Sync with SofaScore API adapter
  const sofaEvent = fetchSofaScoreEvent(match.id, kickoff, targetHome, targetAway, currentTime);

  const currentMinute = sofaEvent.time.matchTime ?? 0;
  const homeScore = sofaEvent.homeScore.current;
  const awayScore = sofaEvent.awayScore.current;
  
  let status: 'SCHEDULED' | 'LIVE' | 'FINISHED' = 'SCHEDULED';
  if (sofaEvent.status.type === 'inprogress') {
    status = 'LIVE';
  } else if (sofaEvent.status.type === 'finished') {
    status = 'FINISHED';
  }

  if (status === 'SCHEDULED') {
    return {
      ...match,
      status: 'SCHEDULED',
      minute: 0,
      homeScore: 0,
      awayScore: 0,
      liveStats: null,
      liveTicker: null
    };
  }

  // Generate stats deterministically based on SofaScore output
  const hash = match.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const possessionHome = 45 + (hash % 11);
  const liveStats = JSON.stringify({
    possession: [possessionHome, 100 - possessionHome],
    shots: [Math.floor(currentMinute * 0.15) + homeScore, Math.floor(currentMinute * 0.1) + awayScore],
    shotsOnTarget: [homeScore + Math.floor(currentMinute * 0.05), awayScore + Math.floor(currentMinute * 0.03)],
    corners: [Math.floor(currentMinute * 0.08), Math.floor(currentMinute * 0.06)],
    fouls: [Math.floor(currentMinute * 0.12), Math.floor(currentMinute * 0.14)],
    yellowCards: [Math.floor(currentMinute * 0.02), Math.floor(currentMinute * 0.03)],
    redCards: [0, 0],
    xG: [Math.round((homeScore * 0.5 + currentMinute * 0.01) * 100) / 100, Math.round((awayScore * 0.5 + currentMinute * 0.008) * 100) / 100]
  });

  // Fetch real squad players if available
  const homePlayers = playersByTeam[match.homeTeamId] || [];
  const awayPlayers = playersByTeam[match.awayTeamId] || [];

  const getDeterministicPlayer = (players: any[], seedValue: number, positionPreference?: string): string => {
    if (!players || players.length === 0) return 'Cầu thủ';
    let pool = players;
    if (positionPreference) {
      const preferredPool = players.filter(p => p.position === positionPreference && p.status === 'FIT');
      if (preferredPool.length > 0) {
        pool = preferredPool;
      }
    }
    const index = Math.abs(seedValue) % pool.length;
    return pool[index].name;
  };

  // Generate ticker events
  const homeGoalMinutes: number[] = [];
  const awayGoalMinutes: number[] = [];
  for (let i = 0; i < targetHome; i++) {
    homeGoalMinutes.push(10 + ((hash + i * 23) % 75));
  }
  for (let i = 0; i < targetAway; i++) {
    awayGoalMinutes.push(15 + ((hash + i * 31) % 70));
  }

  const tickerEvents: any[] = [];
  tickerEvents.push({ 
    min: 15 + (hash % 10), 
    type: 'YELLOW', 
    team: 'home', 
    player: getDeterministicPlayer(homePlayers, hash + 15, 'DEF') 
  });
  tickerEvents.push({ 
    min: 30 + (hash % 10), 
    type: 'YELLOW', 
    team: 'away', 
    player: getDeterministicPlayer(awayPlayers, hash + 30, 'DEF') 
  });

  homeGoalMinutes.forEach(gm => {
    tickerEvents.push({ 
      min: gm, 
      type: 'GOAL', 
      team: 'home', 
      player: getDeterministicPlayer(homePlayers, hash + gm + 7, 'FWD') 
    });
  });
  awayGoalMinutes.forEach(gm => {
    tickerEvents.push({ 
      min: gm, 
      type: 'GOAL', 
      team: 'away', 
      player: getDeterministicPlayer(awayPlayers, hash + gm + 9, 'FWD') 
    });
  });

  tickerEvents.sort((a, b) => a.min - b.min);
  const activeTickerEvents = tickerEvents.filter(evt => currentMinute >= evt.min);

  let currentHome = 0;
  let currentAway = 0;
  activeTickerEvents.forEach(evt => {
    if (evt.type === 'GOAL') {
      if (evt.team === 'home') {
        currentHome++;
        evt.detail = `[${currentHome}] - ${currentAway}`;
      } else {
        currentAway++;
        evt.detail = `${currentHome} - [${currentAway}]`;
      }
    }
  });

  return {
    ...match,
    status,
    minute: currentMinute,
    homeScore,
    awayScore,
    liveStats,
    liveTicker: JSON.stringify(activeTickerEvents)
  };
}

// Background simulation loop is disabled since we now compute clock-synced state on-the-fly
setInterval(() => {
  // Empty loop body: clock-synced simulator handles state dynamically
}, 60000);

// --- REST API ENDPOINTS ---

// 1. Get all matches
app.get('/api/matches', async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
        prediction: true
      },
      orderBy: { date: 'asc' }
    });
    const now = getCurrentSimulatedTime();

    // Fetch all players and group them to avoid N+1 query overhead in simulation loop
    const allPlayers = await prisma.player.findMany();
    const playersByTeam: { [teamId: string]: any[] } = {};
    allPlayers.forEach(p => {
      if (!playersByTeam[p.teamId]) playersByTeam[p.teamId] = [];
      playersByTeam[p.teamId].push(p);
    });

    const dynamicMatches = matches.map(m => getDynamicMatchState(m, now, playersByTeam));
    res.json(dynamicMatches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// 2. Get match details (form, H2H, squads, prediction matrix)
app.get('/api/matches/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        prediction: true
      }
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const now = getCurrentSimulatedTime();

    // Fetch roster (squads)
    const homePlayers = await prisma.player.findMany({ where: { teamId: match.homeTeamId } });
    const awayPlayers = await prisma.player.findMany({ where: { teamId: match.awayTeamId } });

    const playersByTeam: { [teamId: string]: any[] } = {
      [match.homeTeamId]: homePlayers,
      [match.awayTeamId]: awayPlayers
    };

    const dynamicMatch = getDynamicMatchState(match, now, playersByTeam);

    // Fetch H2H
    const h2h = await prisma.h2HRecord.findMany({
      where: {
        OR: [
          { homeTeamId: dynamicMatch.homeTeamId, awayTeamId: dynamicMatch.awayTeamId },
          { homeTeamId: dynamicMatch.awayTeamId, awayTeamId: dynamicMatch.homeTeamId }
        ]
      },
      orderBy: { date: 'desc' }
    });

    // Form: Fetch last matches for both teams
    const homeRecentMatches = await prisma.match.findMany({
      where: {
        OR: [{ homeTeamId: dynamicMatch.homeTeamId }, { awayTeamId: dynamicMatch.homeTeamId }],
        status: 'FINISHED'
      },
      include: { homeTeam: true, awayTeam: true },
      orderBy: { date: 'desc' },
      take: 5
    });

    const awayRecentMatches = await prisma.match.findMany({
      where: {
        OR: [{ homeTeamId: dynamicMatch.awayTeamId }, { awayTeamId: dynamicMatch.awayTeamId }],
        status: 'FINISHED'
      },
      include: { homeTeam: true, awayTeam: true },
      orderBy: { date: 'desc' },
      take: 5
    });

    // Fetch all players for form matches
    const allPlayers = await prisma.player.findMany();
    const globalPlayersMap: { [teamId: string]: any[] } = {};
    allPlayers.forEach(p => {
      if (!globalPlayersMap[p.teamId]) globalPlayersMap[p.teamId] = [];
      globalPlayersMap[p.teamId].push(p);
    });

    // Apply dynamic match state to recent matches to ensure accurate history
    const dynamicHomeRecent = homeRecentMatches.map(m => getDynamicMatchState(m, now, globalPlayersMap));
    const dynamicAwayRecent = awayRecentMatches.map(m => getDynamicMatchState(m, now, globalPlayersMap));

    res.json({
      match: dynamicMatch,
      homeSquad: homePlayers,
      awaySquad: awayPlayers,
      h2h,
      form: {
        home: dynamicHomeRecent,
        away: dynamicAwayRecent
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch match details' });
  }
});

// 3. Get all teams
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        players: true
      },
      orderBy: { eloRating: 'desc' }
    });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// 4. Get team details (squad, stats, schedule)
app.get('/api/teams/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        players: true
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const matches = await prisma.match.findMany({
      where: {
        OR: [{ homeTeamId: id }, { awayTeamId: id }]
      },
      include: { 
        homeTeam: true, 
        awayTeam: true,
        prediction: true
      },
      orderBy: { date: 'asc' }
    });

    const now = getCurrentSimulatedTime();

    // Fetch all players and group them to avoid N+1 query overhead in simulation loop
    const allPlayers = await prisma.player.findMany();
    const playersByTeam: { [teamId: string]: any[] } = {};
    allPlayers.forEach(p => {
      if (!playersByTeam[p.teamId]) playersByTeam[p.teamId] = [];
      playersByTeam[p.teamId].push(p);
    });

    const dynamicMatches = matches.map(m => getDynamicMatchState(m, now, playersByTeam));

    res.json({ team, matches: dynamicMatches });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team details' });
  }
});

// 5. Get Betting Insights (Value Bets, high confidence indicators)
app.get('/api/betting-insights', async (req, res) => {
  try {
    const predictions = await prisma.prediction.findMany({
      include: {
        match: {
          include: { homeTeam: true, awayTeam: true }
        }
      }
    });

    const now = getCurrentSimulatedTime();

    // Fetch all players and group them to avoid N+1 query overhead in simulation loop
    const allPlayers = await prisma.player.findMany();
    const playersByTeam: { [teamId: string]: any[] } = {};
    allPlayers.forEach(p => {
      if (!playersByTeam[p.teamId]) playersByTeam[p.teamId] = [];
      playersByTeam[p.teamId].push(p);
    });

    const dynamicPredictions = predictions.map(pred => {
      const dynamicMatch = getDynamicMatchState(pred.match, now, playersByTeam);
      return {
        ...pred,
        match: dynamicMatch
      };
    });

    // Only include insights for matches that are dynamically SCHEDULED
    const scheduledPredictions = dynamicPredictions.filter(p => p.match.status === 'SCHEDULED');

    const valueBets = [];
    const highConfidence = [];

    for (const pred of scheduledPredictions) {
      let tips: any[] = [];
      try { tips = JSON.parse(pred.bettingTips); } catch (e) {}

      // Collect value tips
      const valTips = tips.filter((t: any) => t.isValue);
      if (valTips.length > 0) {
        valueBets.push({
          matchId: pred.matchId,
          homeTeam: pred.match.homeTeam,
          awayTeam: pred.match.awayTeam,
          stage: pred.match.stage,
          date: pred.match.date,
          tips: valTips,
          confidenceScore: pred.confidenceScore,
          riskLevel: pred.riskLevel
        });
      }

      // Collect high confidence tips (confidence > 75%)
      const highTips = tips.filter((t: any) => t.confidence >= 75);
      if (highTips.length > 0 || pred.confidenceScore >= 75) {
        highConfidence.push({
          matchId: pred.matchId,
          homeTeam: pred.match.homeTeam,
          awayTeam: pred.match.awayTeam,
          stage: pred.match.stage,
          date: pred.match.date,
          tips: highTips.length > 0 ? highTips : tips,
          confidenceScore: pred.confidenceScore,
          riskLevel: pred.riskLevel
        });
      }
    }

    res.json({ valueBets, highConfidence });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch betting insights' });
  }
});

// 6. Tournament Bracket Knockout Monte Carlo Simulation
app.post('/api/bracket/simulate', async (req, res) => {
  try {
    // 1. Fetch all teams
    const teams = await prisma.team.findMany();
    
    // We define standard seeds for the Round of 32 (top two Elo rated teams from groups A-L, plus 8 best third place teams)
    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const groupQualifiers: { [group: string]: any[] } = {};
    const thirdPlacePool: any[] = [];

    groups.forEach(g => {
      const groupTeams = teams.filter(t => t.group === g)
        .sort((a, b) => b.eloRating - a.eloRating); // seed by Elo for simulation
      if (groupTeams.length >= 2) {
        groupQualifiers[g] = [groupTeams[0], groupTeams[1]]; // Top 2 advance
      } else {
        groupQualifiers[g] = groupTeams;
      }
      if (groupTeams.length >= 3) {
        thirdPlacePool.push(groupTeams[2]);
      }
    });

    // Select the best 8 third-place teams based on Elo ratings
    const bestThirdPlace = thirdPlacePool.sort((a, b) => b.eloRating - a.eloRating).slice(0, 8);

    // Combine into a list of 32 qualified teams
    const qualifiedPool: any[] = [];
    groups.forEach(g => {
      if (groupQualifiers[g]) {
        qualifiedPool.push(...groupQualifiers[g]);
      }
    });
    qualifiedPool.push(...bestThirdPlace);

    // Matchups for Round of 32 (16 matches)
    const r32Matchups: any[][] = [];
    for (let j = 0; j < 32; j += 2) {
      if (qualifiedPool[j] && qualifiedPool[j+1]) {
        r32Matchups.push([qualifiedPool[j], qualifiedPool[j+1]]);
      } else if (qualifiedPool[j]) {
        // Safe fallback in case of missing rosters
        r32Matchups.push([qualifiedPool[j], qualifiedPool[0]]);
      }
    }

    // Run 1000 Monte Carlo iterations to count progress stats
    const progressCount: { [teamId: string]: { R32: number; R16: number; QF: number; SF: number; F: number; W: number; info: any } } = {};
    teams.forEach(t => {
      progressCount[t.id] = { R32: 1000, R16: 0, QF: 0, SF: 0, F: 0, W: 0, info: t };
    });

    const runMatchSim = (t1: any, t2: any): any => {
      const eloDiff = t1.eloRating - t2.eloRating;
      const t1WinProb = 1 / (1 + Math.pow(10, -eloDiff / 400));
      return Math.random() < t1WinProb ? t1 : t2;
    };

    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      // Simulate Round of 32 -> Round of 16 (16 winners)
      const r16Teams: any[] = [];
      r32Matchups.forEach(([t1, t2]) => {
        const winner = runMatchSim(t1, t2);
        progressCount[winner.id].R16 += 1;
        r16Teams.push(winner);
      });

      // Simulate Round of 16 -> Quarters (8 winners)
      const qfTeams: any[] = [];
      for (let j = 0; j < 16; j += 2) {
        const winner = runMatchSim(r16Teams[j], r16Teams[j+1]);
        progressCount[winner.id].QF += 1;
        qfTeams.push(winner);
      }

      // Simulate Quarters -> Semis (4 winners)
      const sfTeams: any[] = [];
      for (let j = 0; j < 8; j += 2) {
        const winner = runMatchSim(qfTeams[j], qfTeams[j+1]);
        progressCount[winner.id].SF += 1;
        sfTeams.push(winner);
      }

      // Simulate Semis -> Finals (2 winners)
      const fTeams: any[] = [];
      for (let j = 0; j < 4; j += 2) {
        const winner = runMatchSim(sfTeams[j], sfTeams[j+1]);
        progressCount[winner.id].F += 1;
        fTeams.push(winner);
      }

      // Simulate Finals -> Champion (1 winner)
      const champion = runMatchSim(fTeams[0], fTeams[1]);
      progressCount[champion.id].W += 1;
    }

    // Format output
    const simulationResult = Object.values(progressCount).map(c => ({
      id: c.info.id,
      name: c.info.name,
      code: c.info.code,
      flagUrl: c.info.flagUrl,
      eloRating: c.info.eloRating,
      probabilities: {
        r16: Math.round((c.R16 / iterations) * 100),
        qf: Math.round((c.QF / iterations) * 100),
        sf: Math.round((c.SF / iterations) * 100),
        f: Math.round((c.F / iterations) * 100),
        winner: Math.round((c.W / iterations) * 100)
      }
    })).sort((a, b) => b.probabilities.winner - a.probabilities.winner);

    // Run one single representative simulation run for visual bracket tree display
    const runSingleSampleBracket = () => {
      const r16Teams: any[] = [];
      r32Matchups.forEach(([t1, t2]) => {
        const winner = runMatchSim(t1, t2);
        r16Teams.push(winner);
      });

      const r16Matches: any[] = [];
      const qfTeams: any[] = [];
      for (let j = 0; j < 16; j += 2) {
        const t1 = r16Teams[j];
        const t2 = r16Teams[j+1];
        const winner = runMatchSim(t1, t2);
        qfTeams.push(winner);
        const s1 = 1 + Math.floor(Math.random() * 3);
        const s2 = Math.floor(Math.random() * s1);
        r16Matches.push({
          t1: t1.name,
          t2: t2.name,
          s1: t1.id === winner.id ? s1 : s2,
          s2: t2.id === winner.id ? s1 : s2,
          flag1: t1.flagUrl,
          flag2: t2.flagUrl
        });
      }

      const qfMatches: any[] = [];
      const sfTeams: any[] = [];
      for (let j = 0; j < 8; j += 2) {
        const t1 = qfTeams[j];
        const t2 = qfTeams[j+1];
        const winner = runMatchSim(t1, t2);
        sfTeams.push(winner);
        const s1 = 1 + Math.floor(Math.random() * 2);
        const s2 = Math.floor(Math.random() * s1);
        qfMatches.push({
          t1: t1.name,
          t2: t2.name,
          s1: t1.id === winner.id ? s1 : s2,
          s2: t2.id === winner.id ? s1 : s2,
          flag1: t1.flagUrl,
          flag2: t2.flagUrl
        });
      }

      const sfMatches: any[] = [];
      const fTeams: any[] = [];
      for (let j = 0; j < 4; j += 2) {
        const t1 = sfTeams[j];
        const t2 = sfTeams[j+1];
        const winner = runMatchSim(t1, t2);
        fTeams.push(winner);
        const s1 = 1 + Math.floor(Math.random() * 2);
        const s2 = Math.floor(Math.random() * s1);
        sfMatches.push({
          t1: t1.name,
          t2: t2.name,
          s1: t1.id === winner.id ? s1 : s2,
          s2: t2.id === winner.id ? s1 : s2,
          flag1: t1.flagUrl,
          flag2: t2.flagUrl
        });
      }

      const t1 = fTeams[0];
      const t2 = fTeams[1];
      const winner = runMatchSim(t1, t2);
      const s1 = 1 + Math.floor(Math.random() * 2);
      const s2 = Math.floor(Math.random() * s1);
      
      // Check for penalties
      let pen = undefined;
      if (s1 === s2) {
        const p1 = 3 + Math.floor(Math.random() * 3);
        const p2 = Math.floor(Math.random() * p1);
        pen = `${p1}-${p2}`;
      }

      const finalMatch = {
        t1: t1.name,
        t2: t2.name,
        s1: t1.id === winner.id ? s1 : s2,
        s2: t2.id === winner.id ? s1 : s2,
        flag1: t1.flagUrl,
        flag2: t2.flagUrl,
        winner: winner.name,
        pen
      };

      return {
        r16: r16Matches,
        qf: qfMatches,
        sf: sfMatches,
        final: finalMatch
      };
    };

    res.json({ probabilities: simulationResult, sampleBracket: runSingleSampleBracket() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run bracket simulation' });
  }
});

// Trigger a live simulation match (starts currently SCHEDULED Group A match Qatar vs Ecuador or Senegal vs Netherlands, sets it as LIVE)
app.post('/api/matches/trigger-live', async (req, res) => {
  try {
    const scheduled = await prisma.match.findFirst({
      where: { status: 'SCHEDULED' },
      orderBy: { date: 'asc' }
    });

    if (!scheduled) {
      return res.status(404).json({ error: 'No scheduled matches to start' });
    }

    const now = getCurrentSimulatedTime();
    const updated = await prisma.match.update({
      where: { id: scheduled.id },
      data: {
        status: 'LIVE',
        date: now, // Set the kickoff date to current simulated time!
        minute: 0,
        homeScore: 0,
        awayScore: 0,
        liveStats: JSON.stringify({
          possession: [50, 50],
          shots: [0, 0],
          shotsOnTarget: [0, 0],
          corners: [0, 0],
          fouls: [0, 0],
          yellowCards: [0, 0],
          redCards: [0, 0],
          xG: [0.0, 0.0]
        }),
        liveTicker: JSON.stringify([])
      },
      include: { homeTeam: true, awayTeam: true }
    });

    res.json({ message: `Simulated live match started: ${updated.homeTeam.name} vs ${updated.awayTeam.name}`, match: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger live match simulation' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
