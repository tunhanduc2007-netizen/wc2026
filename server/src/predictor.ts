export interface TeamStats {
  id: string;
  name: string;
  code: string;
  eloRating: number;
  fifaRanking: number;
  attackRating: number;
  defenseRating: number;
  midfieldRating: number;
  squadValueEur: number;
}

export interface PlayerStats {
  position: string;
  status: string; // FIT, INJURED, SUSPENDED
  marketValueEur: number;
}

export interface PredictionResult {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  secondaryHomeScore: number;
  secondaryAwayScore: number;
  scoreProbabilities: { [score: string]: number };
  bettingTips: Array<{
    market: string;
    recommendation: string;
    confidence: number;
    oddSim: number;
    isValue: boolean;
  }>;
  confidenceScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function poisson(k: number, lambda: number): number {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

export function generatePrediction(
  home: TeamStats,
  away: TeamStats,
  homePlayers: PlayerStats[],
  awayPlayers: PlayerStats[],
  h2hMatches: { homeScore: number; awayScore: number; isHome: boolean }[] = []
): PredictionResult {
  // 1. Calculate Player Availability Index
  // Injuries to forwards/midfielders reduce attacking power.
  // Injuries to defenders/goalkeepers reduce defensive power.
  let homeAttLoss = 0;
  let homeDefLoss = 0;
  let awayAttLoss = 0;
  let awayDefLoss = 0;

  const getVal = (p: PlayerStats) => p.marketValueEur || 5.0;

  const homeFitVal = homePlayers.filter(p => p.status === 'FIT').reduce((acc, p) => acc + getVal(p), 0);
  const homeInjuredVal = homePlayers.filter(p => p.status !== 'FIT').reduce((acc, p) => acc + getVal(p), 0);
  const homeTotalVal = homeFitVal + homeInjuredVal || 1;

  const awayFitVal = awayPlayers.filter(p => p.status === 'FIT').reduce((acc, p) => acc + getVal(p), 0);
  const awayInjuredVal = awayPlayers.filter(p => p.status !== 'FIT').reduce((acc, p) => acc + getVal(p), 0);
  const awayTotalVal = awayFitVal + awayInjuredVal || 1;

  // Calculate position-specific availability
  homePlayers.forEach(p => {
    if (p.status !== 'FIT') {
      const weight = getVal(p) / homeTotalVal;
      if (p.position === 'FWD' || p.position === 'MID') homeAttLoss += weight * 0.4;
      if (p.position === 'DEF' || p.position === 'GK') homeDefLoss += weight * 0.4;
    }
  });

  awayPlayers.forEach(p => {
    if (p.status !== 'FIT') {
      const weight = getVal(p) / awayTotalVal;
      if (p.position === 'FWD' || p.position === 'MID') awayAttLoss += weight * 0.4;
      if (p.position === 'DEF' || p.position === 'GK') awayDefLoss += weight * 0.4;
    }
  });

  const homeAttAvailability = Math.max(0.7, 1 - homeAttLoss);
  const homeDefAvailability = Math.max(0.7, 1 - homeDefLoss);
  const awayAttAvailability = Math.max(0.7, 1 - awayAttLoss);
  const awayDefAvailability = Math.max(0.7, 1 - awayDefLoss);

  // 2. Base Expected Goals (xG)
  const baseAvgGoals = 1.35; // Tournament average goals per team

  // Ratings are 0-100, normalize around 75
  let lambdaHome = baseAvgGoals * (home.attackRating / 75) * (75 / away.defenseRating);
  let lambdaAway = baseAvgGoals * (away.attackRating / 75) * (75 / home.defenseRating);

  // Adjust for Elo Difference
  // 100 Elo points = ~10% adjustment
  const eloDiff = home.eloRating - away.eloRating;
  const eloFactor = eloDiff / 1000;
  lambdaHome *= (1 + eloFactor);
  lambdaAway *= (1 - eloFactor);

  // Apply Injury Penalties
  // Attacking injuries reduce goals scored
  lambdaHome *= homeAttAvailability;
  lambdaAway *= awayAttAvailability;
  // Defensive injuries increase opponent's goals scored
  lambdaHome *= (1 + (awayDefLoss * 0.5));
  lambdaAway *= (1 + (homeDefLoss * 0.5));

  // Head-to-Head adjustment
  if (h2hMatches.length > 0) {
    let homeH2hScoreSum = 0;
    let awayH2hScoreSum = 0;
    h2hMatches.forEach(m => {
      if (m.isHome) {
        homeH2hScoreSum += m.homeScore;
        awayH2hScoreSum += m.awayScore;
      } else {
        homeH2hScoreSum += m.awayScore;
        awayH2hScoreSum += m.homeScore;
      }
    });
    const avgHomeH2H = homeH2hScoreSum / h2hMatches.length;
    const avgAwayH2H = awayH2hScoreSum / h2hMatches.length;
    
    // Blend H2H history (20% weight) with ratings-based calculation
    lambdaHome = lambdaHome * 0.8 + avgHomeH2H * 0.2;
    lambdaAway = lambdaAway * 0.8 + avgAwayH2H * 0.2;
  }

  // Clamping expectations to realistic ranges
  lambdaHome = Math.max(0.15, Math.min(4.5, lambdaHome));
  lambdaAway = Math.max(0.15, Math.min(4.5, lambdaAway));

  // 3. Poisson Score Matrix Simulation (0 to 7 goals)
  const maxGoals = 7;
  const scoreMatrix: number[][] = [];
  for (let h = 0; h <= maxGoals; h++) {
    scoreMatrix[h] = [];
    for (let a = 0; a <= maxGoals; a++) {
      scoreMatrix[h][a] = poisson(h, lambdaHome) * poisson(a, lambdaAway);
    }
  }

  // Calculate outcomes probabilities
  let homeWinProb = 0;
  let drawProb = 0;
  let awayWinProb = 0;
  const scores: { [score: string]: number } = {};

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const prob = scoreMatrix[h][a];
      if (h > a) homeWinProb += prob;
      else if (h === a) drawProb += prob;
      else awayWinProb += prob;

      const scoreStr = `${h}-${a}`;
      scores[scoreStr] = Math.round(prob * 1000) / 10; // keep one decimal place
    }
  }

  // Normalize probabilities to 100%
  const totalProb = homeWinProb + drawProb + awayWinProb;
  homeWinProb = Math.round((homeWinProb / totalProb) * 100);
  drawProb = Math.round((drawProb / totalProb) * 100);
  awayWinProb = 100 - homeWinProb - drawProb; // prevent rounding gap

  // Find top score outcomes
  const sortedScores = Object.entries(scores)
    .sort((a, b) => b[1] - a[1]);

  const [topScoreStr] = sortedScores[0];
  const [secScoreStr] = sortedScores[1];

  const parseScore = (s: string) => s.split('-').map(Number);
  const [predictedHomeScore, predictedAwayScore] = parseScore(topScoreStr);
  const [secondaryHomeScore, secondaryAwayScore] = parseScore(secScoreStr);

  // 4. Betting Insights Engine
  const bettingTips: Array<{
    market: string;
    recommendation: string;
    confidence: number;
    oddSim: number;
    isValue: boolean;
  }> = [];

  // Over/Under 2.5 Goals
  let over25Prob = 0;
  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      if (h + a > 2.5) over25Prob += scoreMatrix[h][a];
    }
  }
  over25Prob = over25Prob / totalProb;
  const ouTip = over25Prob > 0.52 
    ? { market: 'Over/Under 2.5', recommendation: 'Over 2.5 Goals', prob: over25Prob }
    : { market: 'Over/Under 2.5', recommendation: 'Under 2.5 Goals', prob: 1 - over25Prob };
  
  // Implied odds = 1 / probability, simulated odds has 5% bookmaker margin added
  const bookmakerMargin = 1.05;
  const ouOddSim = Math.round((1 / ouTip.prob) * bookmakerMargin * 100) / 100;
  // If actual model probability is 8% higher than bookmaker implied probability
  const isOuValue = ouTip.prob > (1 / (ouOddSim * 1.08));

  bettingTips.push({
    market: ouTip.market,
    recommendation: ouTip.recommendation,
    confidence: Math.round(ouTip.prob * 100),
    oddSim: ouOddSim,
    isValue: isOuValue,
  });

  // Both Teams To Score (BTTS)
  const homeScoreProb = 1 - poisson(0, lambdaHome);
  const awayScoreProb = 1 - poisson(0, lambdaAway);
  const bttsProb = homeScoreProb * awayScoreProb;
  const bttsTip = bttsProb > 0.52
    ? { market: 'BTTS', recommendation: 'Yes (BTTS)', prob: bttsProb }
    : { market: 'BTTS', recommendation: 'No (BTTS)', prob: 1 - bttsProb };

  const bttsOddSim = Math.round((1 / bttsTip.prob) * bookmakerMargin * 100) / 100;
  const isBttsValue = bttsTip.prob > (1 / (bttsOddSim * 1.08));

  bettingTips.push({
    market: bttsTip.market,
    recommendation: bttsTip.recommendation,
    confidence: Math.round(bttsTip.prob * 100),
    oddSim: bttsOddSim,
    isValue: isBttsValue,
  });

  // Asian Handicap
  // Determine favorite
  let handicapRecommendation = '';
  let handicapConfidence = 0;
  let handicapOdds = 1.85;
  let isHandicapValue = false;

  if (homeWinProb > 52) {
    if (homeWinProb > 70) {
      handicapRecommendation = `${home.name} -1.5`;
      // Prob of winning by 2+ goals
      let win2Plus = 0;
      for (let h = 2; h <= maxGoals; h++) {
        for (let a = 0; a <= h - 2; a++) {
          win2Plus += scoreMatrix[h][a];
        }
      }
      const p = win2Plus / totalProb;
      handicapConfidence = Math.round(p * 100);
      handicapOdds = Math.round((1 / Math.max(0.1, p)) * bookmakerMargin * 100) / 100;
      isHandicapValue = p > (1 / (handicapOdds * 1.08));
    } else {
      handicapRecommendation = `${home.name} -0.5`;
      handicapConfidence = homeWinProb;
      handicapOdds = Math.round((1 / (homeWinProb / 100)) * bookmakerMargin * 100) / 100;
      isHandicapValue = (homeWinProb / 100) > (1 / (handicapOdds * 1.08));
    }
  } else if (awayWinProb > 52) {
    if (awayWinProb > 70) {
      handicapRecommendation = `${away.name} -1.5`;
      let win2Plus = 0;
      for (let a = 2; a <= maxGoals; a++) {
        for (let h = 0; h <= a - 2; h++) {
          win2Plus += scoreMatrix[h][a];
        }
      }
      const p = win2Plus / totalProb;
      handicapConfidence = Math.round(p * 100);
      handicapOdds = Math.round((1 / Math.max(0.1, p)) * bookmakerMargin * 100) / 100;
      isHandicapValue = p > (1 / (handicapOdds * 1.08));
    } else {
      handicapRecommendation = `${away.name} -0.5`;
      handicapConfidence = awayWinProb;
      handicapOdds = Math.round((1 / (awayWinProb / 100)) * bookmakerMargin * 100) / 100;
      isHandicapValue = (awayWinProb / 100) > (1 / (handicapOdds * 1.08));
    }
  } else {
    // Tight match, draw-no-bet or handicap +0.5 on underdog
    if (home.eloRating > away.eloRating) {
      handicapRecommendation = `${away.name} +0.5`;
      const p = (drawProb + awayWinProb) / 100;
      handicapConfidence = Math.round(p * 100);
      handicapOdds = Math.round((1 / p) * bookmakerMargin * 100) / 100;
      isHandicapValue = p > (1 / (handicapOdds * 1.08));
    } else {
      handicapRecommendation = `${home.name} +0.5`;
      const p = (drawProb + homeWinProb) / 100;
      handicapConfidence = Math.round(p * 100);
      handicapOdds = Math.round((1 / p) * bookmakerMargin * 100) / 100;
      isHandicapValue = p > (1 / (handicapOdds * 1.08));
    }
  }

  bettingTips.push({
    market: 'Asian Handicap',
    recommendation: handicapRecommendation,
    confidence: handicapConfidence,
    oddSim: handicapOdds,
    isValue: isHandicapValue,
  });

  // --- KÈO SIÊU CẤP AI (>85% - 95% CONFIDENCE) ---
  // 1. Double Chance (Cơ hội kép)
  const homeOrDrawProb = Math.min(99, homeWinProb + drawProb);
  const awayOrDrawProb = Math.min(99, awayWinProb + drawProb);

  if (homeOrDrawProb >= 85) {
    bettingTips.push({
      market: 'Double Chance',
      recommendation: `${home.name} or Draw`,
      confidence: homeOrDrawProb,
      oddSim: Math.round((1 / (homeOrDrawProb / 100)) * bookmakerMargin * 100) / 100,
      isValue: homeOrDrawProb >= 90,
    });
  } else if (awayOrDrawProb >= 85) {
    bettingTips.push({
      market: 'Double Chance',
      recommendation: `${away.name} or Draw`,
      confidence: awayOrDrawProb,
      oddSim: Math.round((1 / (awayOrDrawProb / 100)) * bookmakerMargin * 100) / 100,
      isValue: awayOrDrawProb >= 90,
    });
  }

  // 2. Tài/Xỉu biên độ rộng (Alternative Over/Under)
  const over05Pct = Math.min(99, Math.round((1 - scoreMatrix[0][0]) * 100));
  if (over05Pct >= 88) {
    bettingTips.push({
      market: 'Over/Under 0.5',
      recommendation: 'Over 0.5 Goals',
      confidence: over05Pct,
      oddSim: Math.round((1 / (over05Pct / 100)) * bookmakerMargin * 100) / 100,
      isValue: over05Pct >= 92,
    });
  }

  let under35ProbSum = 0;
  let under45ProbSum = 0;
  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const sum = h + a;
      if (sum < 3.5) under35ProbSum += scoreMatrix[h][a];
      if (sum < 4.5) under45ProbSum += scoreMatrix[h][a];
    }
  }
  const under35Pct = Math.min(99, Math.round((under35ProbSum / totalProb) * 100));
  const under45Pct = Math.min(99, Math.round((under45ProbSum / totalProb) * 100));

  if (under35Pct >= 85) {
    bettingTips.push({
      market: 'Over/Under 3.5',
      recommendation: 'Under 3.5 Goals',
      confidence: under35Pct,
      oddSim: Math.round((1 / (under35Pct / 100)) * bookmakerMargin * 100) / 100,
      isValue: under35Pct >= 90,
    });
  } else if (under45Pct >= 88) {
    bettingTips.push({
      market: 'Over/Under 4.5',
      recommendation: 'Under 4.5 Goals',
      confidence: under45Pct,
      oddSim: Math.round((1 / (under45Pct / 100)) * bookmakerMargin * 100) / 100,
      isValue: under45Pct >= 92,
    });
  }

  // 5. Confidence Score & Risk Categorization
  // Confidence combines the max win probability and how well matched the teams are
  const maxProb = Math.max(homeWinProb, awayWinProb);
  let confidenceScore = maxProb;
  if (drawProb > maxProb) {
    confidenceScore = drawProb;
  }

  // Adjust confidence based on Elo rating differences
  const absEloDiff = Math.abs(eloDiff);
  const eloConfWeight = Math.min(25, absEloDiff / 15);
  confidenceScore = Math.min(96, Math.max(45, (confidenceScore * 0.75) + eloConfWeight));

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'HIGH';
  if (confidenceScore > 78) {
    riskLevel = 'LOW';
  } else if (confidenceScore > 62) {
    riskLevel = 'MEDIUM';
  }

  // Filter score probabilities to top 15 results to reduce payload
  const topScores: { [score: string]: number } = {};
  sortedScores.slice(0, 15).forEach(([score, prob]) => {
    topScores[score] = prob;
  });

  return {
    homeWinProb,
    drawProb,
    awayWinProb,
    expectedHomeGoals: Math.round(lambdaHome * 100) / 100,
    expectedAwayGoals: Math.round(lambdaAway * 100) / 100,
    predictedHomeScore,
    predictedAwayScore,
    secondaryHomeScore,
    secondaryAwayScore,
    scoreProbabilities: topScores,
    bettingTips,
    confidenceScore: Math.round(confidenceScore),
    riskLevel,
  };
}
