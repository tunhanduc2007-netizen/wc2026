'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import { ShieldAlert } from 'lucide-react';

export default function GroupStandings() {
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const teamsData = await fetchAPI('/teams');
        const matchesData = await fetchAPI('/matches');
        setTeams(teamsData);
        setMatches(matchesData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-green"></div>
      </div>
    );
  }

  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  // Calculates standings dynamically
  const getGroupStandings = (groupName: string) => {
    const groupTeams = teams.filter(t => t.group === groupName);
    const standings = groupTeams.map(team => {
      let played = 0;
      let won = 0;
      let drawn = 0;
      let lost = 0;
      let goalsFor = 0;
      let goalsAgainst = 0;

      // Scan all matches for stats
      matches.forEach(m => {
        if (m.status === 'FINISHED') {
          if (m.homeTeamId === team.id) {
            played++;
            goalsFor += m.homeScore;
            goalsAgainst += m.awayScore;
            if (m.homeScore > m.awayScore) won++;
            else if (m.homeScore === m.awayScore) drawn++;
            else lost++;
          } else if (m.awayTeamId === team.id) {
            played++;
            goalsFor += m.awayScore;
            goalsAgainst += m.homeScore;
            if (m.awayScore > m.homeScore) won++;
            else if (m.homeScore === m.awayScore) drawn++;
            else lost++;
          }
        }
      });

      const points = won * 3 + drawn;
      const gd = goalsFor - goalsAgainst;

      // Estimate qualification probability using relative Elo in group
      const otherGroupTeams = groupTeams.filter(t => t.id !== team.id);
      const avgOpponentElo = otherGroupTeams.reduce((acc, t) => acc + t.eloRating, 0) / 3;
      const eloDiff = team.eloRating - avgOpponentElo;
      
      // Map Elo difference to 0-100% chance (centered around 50%)
      const qualProb = Math.max(5, Math.min(95, Math.round(50 + (eloDiff / 6))));

      return {
        ...team,
        played,
        won,
        drawn,
        lost,
        gd,
        points,
        qualProb
      };
    });

    // Sort by points, then gd, then Elo rating
    return standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.eloRating - a.eloRating;
    });
  };

  return (
    <div className="space-y-8">
      {/* Disclaimer */}
      <div className="glass-panel p-4 flex items-center space-x-2 text-xs text-white/50 bg-white/5 border border-white/10">
        <ShieldAlert className="h-4 w-4 text-brand-gold flex-shrink-0" />
        <span>Điểm số và hiệu số bàn thắng bại (HS) được tính toán tự động dựa trên các trận đấu đã kết thúc. Tỷ lệ đi tiếp (Cơ hội đi tiếp) được ước lượng dựa trên chỉ số ELO và sức mạnh lực lượng cùng bảng đấu.</span>
      </div>

      {/* Grid of groups */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {groups.map(group => {
          const standings = getGroupStandings(group);

          return (
            <div key={group} className="glass-panel p-5 space-y-3">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h4 className="font-extrabold text-sm text-brand-green">BẢNG {group}</h4>
                <span className="text-[10px] text-white/40">Top 2 mỗi bảng và 8 đội hạng 3 tốt nhất đi tiếp</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 font-bold">
                      <th className="py-2 w-8">XH</th>
                      <th className="py-2">Đội bóng</th>
                      <th className="py-2 text-center w-8">ST</th>
                      <th className="py-2 text-center w-8">HS</th>
                      <th className="py-2 text-center w-8">Điểm</th>
                      <th className="py-2 text-center w-16 text-brand-gold">Cơ hội đi tiếp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team, idx) => (
                      <tr key={team.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-2.5 font-bold text-white/40">{idx + 1}</td>
                        <td className="py-2.5 flex items-center space-x-2">
                          <img src={team.flagUrl} alt="" className="w-5 h-3 object-cover rounded-sm border border-white/10" />
                          <span className="font-bold text-white/85">{team.name}</span>
                        </td>
                        <td className="py-2.5 text-center text-white/60">{team.played}</td>
                        <td className={`py-2.5 text-center font-semibold ${team.gd > 0 ? 'text-emerald-400' : team.gd < 0 ? 'text-red-400' : 'text-white/40'}`}>
                          {team.gd > 0 ? `+${team.gd}` : team.gd}
                        </td>
                        <td className="py-2.5 text-center font-bold text-white">{team.points}</td>
                        <td className="py-2.5 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <span className="font-bold text-brand-gold">{team.qualProb}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
