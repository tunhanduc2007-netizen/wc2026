'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Info } from 'lucide-react';

export default function TeamAnalysis() {
  const [teams, setTeams] = useState<any[]>([]);
  const [teamAId, setTeamAId] = useState<string>('');
  const [teamBId, setTeamBId] = useState<string>('');
  const [teamADetails, setTeamADetails] = useState<any>(null);
  const [teamBDetails, setTeamBDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeams() {
      try {
        const data = await fetchAPI('/teams');
        setTeams(data);
        if (data.length > 1) {
          // Default: Brazil vs Argentina
          const bra = data.find((t: any) => t.code === 'BRA') || data[0];
          const arg = data.find((t: any) => t.code === 'ARG') || data[1];
          setTeamAId(bra.id);
          setTeamBId(arg.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTeams();
  }, []);

  useEffect(() => {
    async function loadDetails() {
      if (!teamAId || !teamBId) return;
      try {
        const detA = await fetchAPI(`/teams/${teamAId}`);
        const detB = await fetchAPI(`/teams/${teamBId}`);
        setTeamADetails(detA);
        setTeamBDetails(detB);
      } catch (err) {
        console.error(err);
      }
    }
    loadDetails();
  }, [teamAId, teamBId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-green"></div>
      </div>
    );
  }

  const teamA = teamADetails?.team;
  const teamB = teamBDetails?.team;

  // Radar chart data preparation in Vietnamese
  const radarData = teamA && teamB ? [
    { subject: 'Hiệu suất Tấn công', A: teamA.attackRating, B: teamB.attackRating, fullMark: 100 },
    { subject: 'Khả năng Phòng ngự', A: teamA.defenseRating, B: teamB.defenseRating, fullMark: 100 },
    { subject: 'Kiểm soát Tuyến giữa', A: teamA.midfieldRating, B: teamB.midfieldRating, fullMark: 100 },
    { subject: 'Chỉ số ELO', A: (teamA.eloRating / 2200) * 100, B: (teamB.eloRating / 2200) * 100, fullMark: 100 },
    { subject: 'Giá trị Đội hình', A: Math.min(100, (teamA.squadValueEur / 1200) * 100), B: Math.min(100, (teamB.squadValueEur / 1200) * 100), fullMark: 100 }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Selection dropdowns */}
      <div className="glass-panel p-5 flex flex-col sm:flex-row items-center justify-around gap-6">
        {/* Dropdown A */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-center">
          {teamA && <img src={teamA.flagUrl} alt="" className="w-10 h-6 object-cover rounded shadow border border-white/10" />}
          <select 
            value={teamAId}
            onChange={(e) => setTeamAId(e.target.value)}
            className="glass-input px-3 py-2 bg-slate-900 text-xs font-semibold focus:ring-1 focus:ring-brand-green w-48"
          >
            {teams.map((t: any) => (
              <option key={t.id} value={t.id} disabled={t.id === teamBId}>{t.name} (Bảng {t.group})</option>
            ))}
          </select>
        </div>

        <div className="text-sm font-bold text-white/30 uppercase">SO VỚI</div>

        {/* Dropdown B */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-center">
          <select 
            value={teamBId}
            onChange={(e) => setTeamBId(e.target.value)}
            className="glass-input px-3 py-2 bg-slate-900 text-xs font-semibold focus:ring-1 focus:ring-brand-green w-48"
          >
            {teams.map((t: any) => (
              <option key={t.id} value={t.id} disabled={t.id === teamAId}>{t.name} (Bảng {t.group})</option>
            ))}
          </select>
          {teamB && <img src={teamB.flagUrl} alt="" className="w-10 h-6 object-cover rounded shadow border border-white/10" />}
        </div>
      </div>

      {teamA && teamB ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart Panel */}
          <div className="glass-panel p-6 flex flex-col justify-between min-h-[400px]">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-brand-green mb-1">Biểu đồ so sánh thuộc tính</h4>
              <span className="text-[11px] text-white/40">So sánh trực quan sức mạnh tấn công, tuyến giữa, phòng thủ, hệ số ELO và giá trị chuyển nhượng.</span>
            </div>

            <div className="w-full h-[300px] mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 8 }} />
                  <Radar name={teamA.name} dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                  <Radar name={teamB.name} dataKey="B" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.25} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Metrics Table */}
          <div className="glass-panel p-6 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-brand-gold mb-1">Chỉ số so sánh chi tiết</h4>
              <span className="text-[11px] text-white/40">Bảng đối chiếu số liệu từ hệ thống ELO và FIFA ranking.</span>
            </div>

            <div className="space-y-4 my-6 text-xs">
              {/* FIFA RANK */}
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/60">Xếp hạng FIFA</span>
                <div className="flex items-center space-x-6">
                  <span className="font-semibold text-brand-green">#{teamA.fifaRanking}</span>
                  <span className="text-white/30">vs</span>
                  <span className="font-semibold text-brand-blue">#{teamB.fifaRanking}</span>
                </div>
              </div>

              {/* ELO */}
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/60">Chỉ số sức mạnh ELO</span>
                <div className="flex items-center space-x-6">
                  <span className="font-semibold text-brand-green">{Math.round(teamA.eloRating)}</span>
                  <span className="text-white/30">vs</span>
                  <span className="font-semibold text-brand-blue">{Math.round(teamB.eloRating)}</span>
                </div>
              </div>

              {/* ATTACK */}
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/60">Hệ số Tấn công</span>
                <div className="flex items-center space-x-6">
                  <span className="font-semibold text-brand-green">{teamA.attackRating}/100</span>
                  <span className="text-white/30">vs</span>
                  <span className="font-semibold text-brand-blue">{teamB.attackRating}/100</span>
                </div>
              </div>

              {/* DEFENSE */}
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/60">Hệ số Phòng ngự</span>
                <div className="flex items-center space-x-6">
                  <span className="font-semibold text-brand-green">{teamA.defenseRating}/100</span>
                  <span className="text-white/30">vs</span>
                  <span className="font-semibold text-brand-blue">{teamB.defenseRating}/100</span>
                </div>
              </div>

              {/* MARKET VALUE */}
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/60">Giá trị đội hình</span>
                <div className="flex items-center space-x-6">
                  <span className="font-semibold text-brand-green">€{teamA.squadValueEur}M</span>
                  <span className="text-white/30">vs</span>
                  <span className="font-semibold text-brand-blue">€{teamB.squadValueEur}M</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3 text-xs border border-white/10 flex items-start space-x-2">
              <Info className="h-4 w-4 text-brand-blue flex-shrink-0 mt-0.5" />
              <div className="text-white/60 text-[11px] leading-relaxed">
                Hệ thống ELO và các chỉ số lực lượng phản ánh chính xác tương quan sức mạnh giữa hai đội tuyển. Bạn có thể chọn bất kỳ quốc gia nào khác trong danh sách ở trên để so sánh chỉ số của họ.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
