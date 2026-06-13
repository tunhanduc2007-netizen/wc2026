'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import { ChevronRight, Award, Search, Sparkles, Filter } from 'lucide-react';

interface Props {
  onSelectMatch: (id: string) => void;
}

export default function PredictionDashboard({ onSelectMatch }: Props) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');

  const getSimulatedNow = () => {
    const actualNow = new Date();
    if (actualNow.getFullYear() === 2026) {
      return actualNow;
    }
    const simulated = new Date('2026-06-13T00:00:00Z');
    simulated.setUTCHours(actualNow.getUTCHours());
    simulated.setUTCMinutes(actualNow.getUTCMinutes());
    simulated.setUTCSeconds(actualNow.getUTCSeconds());
    return simulated;
  };

  const [now, setNow] = useState(getSimulatedNow());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(getSimulatedNow());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getCountdownString = (kickoffStr: string) => {
    const kickoff = new Date(kickoffStr);
    const diffMs = kickoff.getTime() - now.getTime();
    if (diffMs <= 0) return "Sắp diễn ra";

    const diffSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSecs / 3600);
    const mins = Math.floor((diffSecs % 3600) / 60);
    const secs = diffSecs % 60;

    const hoursStr = String(hours).padStart(2, '0');
    const minsStr = String(mins).padStart(2, '0');
    const secsStr = String(secs).padStart(2, '0');

    return `${hoursStr}:${minsStr}:${secsStr}`;
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAPI('/matches');
        setMatches(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-green"></div>
      </div>
    );
  }

  // Filter matches
  const filteredMatches = matches.filter(m => {
    const matchesSearch = 
      m.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRisk = 
      selectedRisk === 'ALL' || 
      (m.prediction && m.prediction.riskLevel === selectedRisk);

    return matchesSearch && matchesRisk;
  });

  const getRiskTranslation = (level: string) => {
    switch (level) {
      case 'LOW': return 'Thấp';
      case 'MEDIUM': return 'T.Bình';
      case 'HIGH': return 'Cao';
      default: return level;
    }
  };

  const getStageTranslation = (stage: string) => {
    switch (stage) {
      case 'GROUP': return 'VÒNG BẢNG';
      case 'ROUND_32': return 'VÒNG 32 ĐỘI';
      case 'ROUND_16': return 'VÒNG 16 ĐỘI';
      case 'QUARTER': return 'TỨ KẾT';
      case 'SEMI': return 'BÁN KẾT';
      case 'FINAL': return 'CHUNG KẾT';
      default: return stage;
    }
  };

  const formatDateHeader = (dateStr: string) => {
    const matchDate = new Date(dateStr);
    const now = new Date();
    const today = now.getFullYear() === 2026 ? new Date(now.getFullYear(), now.getMonth(), now.getDate()) : new Date('2026-06-13T00:00:00Z');
    
    const matchDateString = matchDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' });
    const todayString = today.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' });
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowString = tomorrow.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' });

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayString = yesterday.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' });

    const weekday = matchDate.toLocaleDateString('vi-VN', { weekday: 'long' });
    const formattedDate = matchDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' });

    if (matchDateString === todayString) {
      return `Hôm nay - ${formattedDate}`;
    } else if (matchDateString === tomorrowString) {
      return `Ngày mai - ${formattedDate}`;
    } else if (matchDateString === yesterdayString) {
      return `Hôm qua - ${formattedDate}`;
    } else {
      const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      return `${capitalizedWeekday}, ${formattedDate}`;
    }
  };

  const getGroupedMatches = () => {
    const groups: { [key: string]: any[] } = {};
    
    filteredMatches.forEach(m => {
      const d = new Date(m.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(m);
    });
    
    return Object.keys(groups).sort().map(key => ({
      dateLabel: formatDateHeader(groups[key][0].date),
      matches: groups[key]
    }));
  };

  const groupedMatches = getGroupedMatches();

  return (
    <div className="space-y-6">
      {/* Filters and search banner */}
      <div className="glass-panel p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
          <input 
            type="text" 
            placeholder="Tìm kiếm quốc gia..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input pl-9 pr-4 py-2 w-full text-xs"
          />
        </div>

        {/* Risk Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="h-4 w-4 text-brand-green" />
          <span className="text-slate-200 mr-1 font-bold">Mức rủi ro:</span>
          {[
            { id: 'ALL', name: 'TẤT CẢ' },
            { id: 'LOW', name: 'THẤP' },
            { id: 'MEDIUM', name: 'TRUNG BÌNH' },
            { id: 'HIGH', name: 'CAO' }
          ].map(risk => (
            <button
              key={risk.id}
              onClick={() => setSelectedRisk(risk.id as any)}
              className={`px-3 py-1.5 rounded font-bold cursor-pointer transition border ${
                selectedRisk === risk.id 
                  ? 'bg-brand-green/20 text-brand-green border-brand-green/30 glow-green' 
                  : 'bg-white/5 hover:bg-white/10 text-white/85 border-transparent'
              }`}
            >
              {risk.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Grid of matches */}
      {groupedMatches.length === 0 ? (
        <div className="glass-panel p-20 text-center text-xs text-white/60">
          Không tìm thấy trận đấu nào khớp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="space-y-8">
          {groupedMatches.map((group, gIdx) => (
            <div key={gIdx} className="space-y-4">
              <h3 className="font-extrabold text-[11px] text-brand-green uppercase tracking-widest border-l-2 border-brand-green pl-2.5">
                {group.dateLabel}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {group.matches.map((m: any) => {
                  const pred = m.prediction;
                  if (!pred) return null;

                  return (
                    <div 
                      key={m.id} 
                      className="glass-panel p-5 flex flex-col justify-between glass-panel-hover"
                    >
                      {/* Ribbon details */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] text-slate-300 uppercase tracking-wider font-bold">
                          <span>{getStageTranslation(m.stage)} {m.groupName ? `- Bảng ${m.groupName}` : ''}</span>
                          <span className={`px-2 py-0.5 rounded ${pred.riskLevel === 'LOW' ? 'bg-emerald-500/15 text-emerald-400' : pred.riskLevel === 'MEDIUM' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>
                            Rủi ro {getRiskTranslation(pred.riskLevel)}
                          </span>
                        </div>

                        {/* Team vs Team flag row */}
                        <div className="flex justify-between items-center py-4">
                          {/* Home team */}
                          <div className="flex-1 flex items-center space-x-3">
                            <img src={m.homeTeam.flagUrl} alt="" className="w-8 h-5 object-cover rounded border border-white/10" />
                            <span className="font-bold text-sm">{m.homeTeam.name}</span>
                          </div>

                          {/* predicted vs actual score */}
                          <div className="px-3 text-center flex flex-col items-center justify-center min-w-[90px]">
                            {m.status === 'LIVE' ? (
                              <>
                                <span className="text-2xl font-extrabold text-red-500 animate-pulse font-numeric">
                                  {m.homeScore} - {m.awayScore}
                                </span>
                                <div className="text-[9px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full mt-1 font-bold animate-pulse font-numeric">
                                  TRỰC TIẾP {m.minute}'
                                </div>
                                <div className="text-[8px] text-slate-400 mt-1 font-medium font-numeric">
                                  Dự đoán: {pred.predictedHomeScore}-{pred.predictedAwayScore}
                                </div>
                              </>
                            ) : m.status === 'FINISHED' ? (
                              <>
                                <span className="text-2xl font-extrabold text-white/90 font-numeric">
                                  {m.homeScore} - {m.awayScore}
                                </span>
                                <div className="text-[9px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full mt-1 font-bold">
                                  HẾT GIỜ
                                </div>
                                <div className="text-[8px] text-slate-400 mt-1 font-medium font-numeric">
                                  Dự đoán: {pred.predictedHomeScore}-{pred.predictedAwayScore}
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="text-xl font-bold text-white/95 tracking-wide font-numeric">
                                  {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div className="text-[9px] bg-brand-gold/15 text-brand-gold px-1.5 py-0.5 rounded-full mt-1.5 font-bold font-numeric tracking-wider animate-pulse">
                                  {getCountdownString(m.date)}
                                </div>
                                <div className="text-[8px] text-slate-400 mt-1 font-medium font-numeric">
                                  Dự đoán: {pred.predictedHomeScore}-{pred.predictedAwayScore}
                                </div>
                              </>
                            )}
                          </div>

                          {/* Away team */}
                          <div className="flex-1 flex items-center space-x-3 justify-end text-right">
                            <span className="font-bold text-sm">{m.awayTeam.name}</span>
                            <img src={m.awayTeam.flagUrl} alt="" className="w-8 h-5 object-cover rounded border border-white/10" />
                          </div>
                        </div>

                        {/* Probabilities meter bar */}
                        <div className="space-y-1.5 mt-2">
                          <div className="flex justify-between text-[10px] text-slate-300 font-medium font-numeric">
                            <span>{m.homeTeam.code} ({pred.homeWinProb}%)</span>
                            <span>Hòa ({pred.drawProb}%)</span>
                            <span>{m.awayTeam.code} ({pred.awayWinProb}%)</span>
                          </div>
                          <div className="flex h-2 w-full rounded overflow-hidden">
                            <div className="bg-brand-green" style={{ width: `${pred.homeWinProb}%` }}></div>
                            <div className="bg-zinc-600" style={{ width: `${pred.drawProb}%` }}></div>
                            <div className="bg-sky-500" style={{ width: `${pred.awayWinProb}%` }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom card links */}
                      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-xs text-brand-gold font-numeric">
                          <Award className="h-4 w-4" />
                          <span className="font-bold">{pred.confidenceScore}%</span>
                          <span className="text-slate-300 font-sans">Độ tin cậy AI</span>
                        </div>

                        <button 
                          onClick={() => onSelectMatch(m.id)}
                          className="text-xs text-brand-green font-bold flex items-center hover:underline cursor-pointer"
                        >
                          <span>Phân tích chi tiết</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
