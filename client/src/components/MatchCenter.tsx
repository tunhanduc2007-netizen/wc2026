'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import { Radio, ChevronRight, Activity, Flame, ShieldAlert } from 'lucide-react';

interface MatchCenterProps {
  onSelectMatch: (id: string) => void;
}

export default function MatchCenter({ onSelectMatch }: MatchCenterProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [triggering, setTriggering] = useState(false);
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
    async function loadMatches() {
      try {
        const data = await fetchAPI('/matches');
        setMatches(data);
        
        // Auto-select first LIVE match or first FINISHED or SCHEDULED
        const live = data.find((m: any) => m.status === 'LIVE');
        if (live) {
          setActiveMatch(live);
        } else if (data.length > 0 && !activeMatch) {
          setActiveMatch(data[0]);
        } else if (activeMatch) {
          // Keep active selected, sync latest properties
          const updatedActive = data.find((m: any) => m.id === activeMatch.id);
          if (updatedActive) setActiveMatch(updatedActive);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadMatches();
    const interval = setInterval(loadMatches, 4000); // Poll match states every 4s to reflect backend simulation
    return () => clearInterval(interval);
  }, [activeMatch?.id]);

  const triggerLiveSim = async () => {
    setTriggering(true);
    try {
      const res = await fetchAPI('/matches/trigger-live', { method: 'POST' });
      alert('Đã bắt đầu trận đấu trực tiếp: ' + res.match.homeTeam.name + ' vs ' + res.match.awayTeam.name);
    } catch (err) {
      alert('Không thể bắt đầu mô phỏng. (Vui lòng kiểm tra server ở cổng 3001)');
    } finally {
      setTriggering(false);
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

  const liveMatches = matches.filter(m => m.status === 'LIVE');

  const getGroupedMatches = () => {
    const nonLiveMatches = matches.filter(m => m.status !== 'LIVE');
    const groups: { [key: string]: any[] } = {};
    
    nonLiveMatches.forEach(m => {
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

  // Parse stats and ticker of active selected match
  let stats: any = null;
  let ticker: any[] = [];
  if (activeMatch && activeMatch.liveStats) {
    try { stats = JSON.parse(activeMatch.liveStats); } catch (e) {}
  }
  if (activeMatch && activeMatch.liveTicker) {
    try { ticker = JSON.parse(activeMatch.liveTicker); } catch (e) {}
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left panel: Matches selection list */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-panel p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-brand-green uppercase tracking-wider">Danh sách trận đấu</h3>
            <button 
              onClick={triggerLiveSim}
              disabled={triggering}
              className="px-3 py-1.5 bg-brand-gold text-black rounded text-[11px] font-bold hover:bg-amber-400 transition cursor-pointer flex items-center space-x-1"
            >
              <Flame className="h-3 w-3" />
              <span>{triggering ? 'Đang bật...' : 'Mô phỏng Trực tiếp'}</span>
            </button>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {/* Live Matches section */}
            {liveMatches.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                  <span>Đang trực tiếp</span>
                </span>
                {liveMatches.map((m: any) => (
                  <div 
                    key={m.id}
                    onClick={() => setActiveMatch(m)}
                    className={`glass-panel p-4 cursor-pointer transition relative overflow-hidden border border-red-950/20 ${activeMatch?.id === m.id ? 'bg-red-950/20 border-red-500/30' : 'hover:bg-white/5'}`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 uppercase">{getStageTranslation(m.stage)}</span>
                      <span className="text-red-500 font-bold flex items-center space-x-1">
                        <Radio className="h-3 w-3 animate-pulse" />
                        <span>TRỰC TIẾP {m.minute}'</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-3 text-sm font-semibold">
                      <div className="flex items-center space-x-2">
                        <img src={m.homeTeam.flagUrl} alt="" className="w-4 h-3 object-cover rounded-sm" />
                        <span>{m.homeTeam.name}</span>
                      </div>
                      <span>{m.homeScore}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1 text-sm font-semibold">
                      <div className="flex items-center space-x-2">
                        <img src={m.awayTeam.flagUrl} alt="" className="w-4 h-3 object-cover rounded-sm" />
                        <span>{m.awayTeam.name}</span>
                      </div>
                      <span>{m.awayScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grouped by Date Matches */}
            {groupedMatches.map((group, idx) => (
              <div key={idx} className="space-y-2 pt-2">
                <span className="text-[10px] text-brand-green font-bold uppercase tracking-wider block border-b border-white/5 pb-1">
                  {group.dateLabel}
                </span>
                {group.matches.map((m: any) => {
                  const isSelected = activeMatch?.id === m.id;
                  const isFinished = m.status === 'FINISHED';
                  const matchTime = new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div 
                      key={m.id}
                      onClick={() => setActiveMatch(m)}
                      className={`glass-panel p-4 cursor-pointer transition ${isSelected ? 'bg-brand-green/10 border-brand-green/30' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase">
                        <span>{getStageTranslation(m.stage)}</span>
                        {isFinished ? (
                          <span className="text-slate-300 font-bold">KẾT THÚC</span>
                        ) : (
                          <span className="text-brand-blue font-bold">{matchTime}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-3 text-sm font-semibold">
                        <div className="flex items-center space-x-2">
                          <img src={m.homeTeam.flagUrl} alt="" className="w-4 h-3 object-cover rounded-sm" />
                          <span className={isFinished && m.homeScore < m.awayScore ? 'text-slate-400' : 'text-white'}>{m.homeTeam.name}</span>
                        </div>
                        <span className={isFinished && m.homeScore < m.awayScore ? 'text-slate-400 font-normal' : 'text-white font-bold'}>
                          {isFinished ? m.homeScore : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1 text-sm font-semibold">
                        <div className="flex items-center space-x-2">
                          <img src={m.awayTeam.flagUrl} alt="" className="w-4 h-3 object-cover rounded-sm" />
                          <span className={isFinished && m.awayScore < m.homeScore ? 'text-slate-400' : 'text-white'}>{m.awayTeam.name}</span>
                        </div>
                        <span className={isFinished && m.awayScore < m.homeScore ? 'text-slate-400 font-normal' : 'text-white font-bold'}>
                          {isFinished ? m.awayScore : '-'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle & Right: Selected match detail center */}
      <div className="lg:col-span-2 space-y-6">
        {activeMatch ? (
          <>
            {/* Top overview panel */}
            <div className="glass-panel p-6 relative overflow-hidden bg-gradient-to-br from-[#0c1424] to-[#06090e]">
              <div className="absolute top-0 right-0 p-3">
                <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded uppercase tracking-wider font-bold">
                  {activeMatch.status === 'LIVE' ? 'TRỰC TIẾP' : activeMatch.status === 'FINISHED' ? 'HẾT GIỜ' : 'CHƯA ĐẤU'}
                </span>
              </div>

              <div className="flex justify-between items-center text-center mt-4">
                <div className="flex-1 flex flex-col items-center">
                  <img src={activeMatch.homeTeam.flagUrl} alt="" className="w-16 h-10 object-cover rounded shadow" />
                  <h4 className="font-bold text-base mt-2">{activeMatch.homeTeam.name}</h4>
                </div>

                <div className="px-6 flex flex-col items-center">
                  {activeMatch.status === 'SCHEDULED' ? (
                    <div className="text-center flex flex-col items-center">
                      <span className="text-xs text-slate-300">BẮT ĐẦU VÀO LÚC</span>
                      <div className="text-sm font-bold mt-1 text-brand-blue">
                        {new Date(activeMatch.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[10px] bg-brand-gold/15 text-brand-gold px-2.5 py-0.5 rounded-full mt-2 font-bold font-mono tracking-wider animate-pulse">
                        ĐẾM NGƯỢC: {getCountdownString(activeMatch.date)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl font-extrabold tracking-widest">{activeMatch.homeScore} - {activeMatch.awayScore}</div>
                      {activeMatch.status === 'LIVE' && (
                        <div className="text-xs text-red-500 font-semibold animate-pulse mt-2 uppercase tracking-widest">
                          Đang mô phỏng: {activeMatch.minute}'
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col items-center">
                  <img src={activeMatch.awayTeam.flagUrl} alt="" className="w-16 h-10 object-cover rounded shadow" />
                  <h4 className="font-bold text-base mt-2">{activeMatch.awayTeam.name}</h4>
                </div>
              </div>

              {/* Match quick links */}
              {activeMatch.prediction && (
                <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center">
                  <div className="text-xs text-slate-300">
                    Khả năng thắng cuộc AI: <span className="font-bold text-brand-green">{activeMatch.prediction.homeWinProb}%</span> vs <span className="font-bold text-sky-400">{activeMatch.prediction.awayWinProb}%</span>
                  </div>
                  <button 
                    onClick={() => onSelectMatch(activeMatch.id)}
                    className="text-xs text-brand-green hover:underline flex items-center font-bold"
                  >
                    <span>Xem Ma trận dự đoán AI</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Live Stats panel (only show if stats exist) */}
            {stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stats list */}
                <div className="glass-panel p-5 space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-brand-green flex items-center space-x-1">
                    <Activity className="h-4 w-4" />
                    <span>Thống kê trực tiếp thời gian thực</span>
                  </h4>
                  
                  {/* Possession */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span>Kiểm soát bóng</span>
                      <span>{stats.possession[0]}% - {stats.possession[1]}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded overflow-hidden flex">
                      <div className="h-full bg-brand-green" style={{ width: `${stats.possession[0]}%` }}></div>
                      <div className="h-full bg-sky-400" style={{ width: `${stats.possession[1]}%` }}></div>
                    </div>
                  </div>

                  {/* xG */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span>Bàn thắng kỳ vọng (xG)</span>
                      <span>{stats.xG[0]} - {stats.xG[1]}</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded overflow-hidden flex">
                      <div className="h-full bg-brand-green" style={{ width: `${Math.min(100, (stats.xG[0] / 3) * 100)}%` }}></div>
                      <div className="h-full bg-sky-400" style={{ width: `${Math.min(100, (stats.xG[1] / 3) * 100)}%` }}></div>
                    </div>
                  </div>

                  {/* Shots */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span>Tổng dứt điểm (Trúng đích)</span>
                      <span>{stats.shots[0]} ({stats.shotsOnTarget[0]}) - {stats.shots[1]} ({stats.shotsOnTarget[1]})</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded overflow-hidden flex">
                      <div className="h-full bg-brand-green" style={{ width: `${stats.shots[0] + stats.shots[1] > 0 ? (stats.shots[0] / (stats.shots[0] + stats.shots[1])) * 100 : 50}%` }}></div>
                      <div className="h-full bg-sky-400" style={{ width: `${stats.shots[0] + stats.shots[1] > 0 ? (stats.shots[1] / (stats.shots[0] + stats.shots[1])) * 100 : 50}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Live ticker commentary */}
                <div className="glass-panel p-5 flex flex-col">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-brand-gold mb-3">Nhật ký diễn biến trực tiếp</h4>
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[200px] pr-2 text-xs">
                    {ticker.length === 0 ? (
                      <div className="text-slate-400 italic py-4 text-center">Trận đấu bắt đầu! Đang chờ các diễn biến chính...</div>
                    ) : (
                      ticker.slice().reverse().map((evt: any, idx: number) => (
                        <div key={idx} className="flex space-x-3 items-start border-l-2 border-white/10 pl-3 relative py-1">
                          <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-white/20"></span>
                          <span className="font-bold text-brand-gold">{evt.min}'</span>
                          <div>
                            <span className="font-semibold text-white/90">
                              {evt.type === 'GOAL' ? '⚽ GHI BÀN! ' : '🟨 Thẻ vàng: '}
                            </span>
                            <span className="text-white/70">{evt.player} ({evt.team === 'home' ? activeMatch.homeTeam.code : activeMatch.awayTeam.code})</span>
                            {evt.detail && <div className="text-slate-300 text-[10px] mt-0.5">{evt.detail}</div>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-10 text-center text-xs text-slate-300">
                <ShieldAlert className="h-6 w-6 mx-auto mb-2 text-white/50" />
                <span>Hãy chọn một trận đấu Trực tiếp để theo dõi diễn biến, hoặc nhấp nút "Mô phỏng Trực tiếp" để khởi tạo một giả lập trận đấu mới.</span>
              </div>
            )}
          </>
        ) : (
          <div className="glass-panel p-20 text-center text-slate-200">
            <Radio className="h-8 w-8 mx-auto mb-3 text-white/40 animate-pulse" />
            <h4 className="font-bold text-sm">Chưa chọn trận đấu</h4>
            <span className="text-xs text-slate-400">Hãy chọn một trận đấu từ danh sách bên trái để phân tích diễn biến và số liệu chi tiết.</span>
          </div>
        )}
      </div>
    </div>
  );
}
