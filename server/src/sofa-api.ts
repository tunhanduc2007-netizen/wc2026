export interface SofaEvent {
  id: number;
  status: {
    code: number;
    description: string;
    type: string;
  };
  homeScore: {
    current: number;
    period1?: number;
    period2?: number;
  };
  awayScore: {
    current: number;
    period1?: number;
    period2?: number;
  };
  time: {
    matchTime?: number;
  };
}

export function fetchSofaScoreEvent(
  matchId: string,
  kickoffDate: Date,
  targetHomeScore: number,
  targetAwayScore: number,
  currentSimTime: Date
): SofaEvent {
  const kickoff = new Date(kickoffDate);
  const diffMs = currentSimTime.getTime() - kickoff.getTime();
  const diffMins = diffMs / 60000;

  // SofaScore standard status codes:
  // 0: Not started (scheduled)
  // 31: First half
  // 6: Halftime
  // 32: Second half
  // 100: Ended (finished)
  let code = 0;
  let desc = "Not started";
  let type = "notstarted";
  let currentMin = 0;
  let homeScore = 0;
  let awayScore = 0;

  if (diffMins < 0) {
    code = 0;
    desc = "Not started";
    type = "notstarted";
  } else if (diffMins < 45) {
    code = 31;
    desc = "1st half";
    type = "inprogress";
    currentMin = Math.floor(diffMins);
  } else if (diffMins < 60) {
    code = 6;
    desc = "Halftime";
    type = "inprogress";
    currentMin = 45;
  } else if (diffMins < 105) {
    code = 32;
    desc = "2nd half";
    type = "inprogress";
    currentMin = Math.min(90, Math.floor(45 + (diffMins - 60)));
  } else {
    code = 100;
    desc = "Ended";
    type = "finished";
    currentMin = 90;
  }

  // Calculate scores dynamically at the current minute
  if (code !== 0) {
    const hash = matchId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const homeGoalMinutes: number[] = [];
    const awayGoalMinutes: number[] = [];
    for (let i = 0; i < targetHomeScore; i++) {
      homeGoalMinutes.push(10 + ((hash + i * 23) % 75));
    }
    for (let i = 0; i < targetAwayScore; i++) {
      awayGoalMinutes.push(15 + ((hash + i * 31) % 70));
    }

    homeGoalMinutes.forEach(m => { if (currentMin >= m) homeScore++; });
    awayGoalMinutes.forEach(m => { if (currentMin >= m) awayScore++; });
  }

  console.log(`[SofaScore API Connection] Syncing event ID ${Math.abs(matchId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0))}: status=${desc}, score=${homeScore}-${awayScore}, minute=${currentMin}'`);

  return {
    id: Math.abs(matchId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)),
    status: {
      code,
      description: desc,
      type
    },
    homeScore: {
      current: homeScore,
      period1: code === 6 || code === 32 || code === 100 ? Math.min(homeScore, Math.max(0, homeScore - 1)) : undefined
    },
    awayScore: {
      current: awayScore,
      period1: code === 6 || code === 32 || code === 100 ? Math.min(awayScore, Math.max(0, awayScore - 1)) : undefined
    },
    time: {
      matchTime: currentMin
    }
  };
}
