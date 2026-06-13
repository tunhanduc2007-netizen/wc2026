'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import { X, TrendingUp, ShieldAlert, Award, FileSpreadsheet, Users, Calendar, Shield, ChevronUp, ChevronDown, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  matchId: string;
  onClose: () => void;
}

export default function PredictionDetailsModal({ matchId, onClose }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'matrix' | 'squads' | 'h2h'>('overview');
  const [oddsTab, setOddsTab] = useState<'1x2' | 'ou' | 'btts' | 'dc'>('1x2');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchAPI(`/matches/${matchId}`);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [matchId]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-green"></div>
      </div>
    );
  }

  if (!data) return null;

  const { match, homeSquad, awaySquad, h2h, form } = data;
  const homeTeam = match.homeTeam;
  const awayTeam = match.awayTeam;
  const prediction = match.prediction;

  // Parse JSONs safely
  let scoreProbs: { [key: string]: number } = {};
  let tips: any[] = [];
  if (prediction) {
    try { scoreProbs = JSON.parse(prediction.scoreProbabilities); } catch (e) {}
    try { tips = JSON.parse(prediction.bettingTips); } catch (e) {}
  }

  // Find max value in score matrix for heatmap scaling
  const maxMatrixVal = Math.max(...Object.values(scoreProbs), 1);

  const getRiskTranslation = (level: string) => {
    switch (level) {
      case 'LOW': return 'Thấp';
      case 'MEDIUM': return 'Trung bình';
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

  const getMarketTranslation = (market: string) => {
    switch (market) {
      case 'Over/Under 2.5': return 'Tài/Xỉu 2.5';
      case 'BTTS': return 'Hai đội ghi bàn (BTTS)';
      case 'Asian Handicap': return 'Kèo châu Á (Handicap)';
      default: return market;
    }
  };

  const getTipTranslation = (rec: string) => {
    if (rec.includes('Over 2.5 Goals')) return 'Tài 2.5 bàn';
    if (rec.includes('Under 2.5 Goals')) return 'Xỉu 2.5 bàn';
    if (rec.includes('Yes (BTTS)')) return 'Có ghi bàn';
    if (rec.includes('No (BTTS)')) return 'Không ghi bàn';
    return rec; // Teams handicaps are already names
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto relative flex flex-col bg-[#0b1220]/95"
      >
        {/* Header Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <span className="text-xs uppercase tracking-wider text-white/50">{getStageTranslation(match.stage)} {match.groupName ? `- Bảng ${match.groupName}` : ''}</span>
            <h2 className="text-xl font-bold">Phân tích dữ liệu & dự đoán</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-white/70 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Score Ribbon */}
        <div className="bg-gradient-to-r from-emerald-950/20 via-sky-950/20 to-amber-950/20 p-8 flex justify-between items-center text-center border-b border-white/5">
          <div className="flex-1 flex flex-col items-center">
            <img src={homeTeam.flagUrl} alt={homeTeam.name} className="w-16 h-10 object-cover rounded shadow-md border border-white/10" />
            <h3 className="text-lg font-bold mt-2">{homeTeam.name}</h3>
            <span className="text-xs text-white/50">Hạng FIFA: #{homeTeam.fifaRanking} | ELO: {Math.round(homeTeam.eloRating)}</span>
          </div>

          <div className="px-6 flex flex-col items-center">
            {match.status === 'LIVE' || match.status === 'FINISHED' ? (
              <div className="flex flex-col items-center">
                <span className="text-4xl font-extrabold tracking-widest">{match.homeScore} - {match.awayScore}</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider mt-2 ${
                  match.status === 'LIVE' ? 'bg-red-600/80 text-white animate-pulse' : 'bg-zinc-700/80 text-zinc-300'
                }`}>
                  {match.status === 'LIVE' ? `TRỰC TIẾP ${match.minute}'` : 'HẾT GIỜ'}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-white/40">VS</span>
                <span className="text-xs text-white/40 mt-1">{new Date(match.date).toLocaleDateString()}</span>
              </div>
            )}
            
            {prediction && (
              <div className="mt-3 bg-white/5 border border-white/10 rounded-lg px-4 py-1.5 text-xs">
                <span className="text-white/60">Bàn thắng kỳ vọng (xG): </span>
                <span className="font-bold text-brand-green">{prediction.expectedHomeGoals.toFixed(2)}</span>
                <span className="text-white/40"> - </span>
                <span className="font-bold text-brand-green">{prediction.expectedAwayGoals.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center">
            <img src={awayTeam.flagUrl} alt={awayTeam.name} className="w-16 h-10 object-cover rounded shadow-md border border-white/10" />
            <h3 className="text-lg font-bold mt-2">{awayTeam.name}</h3>
            <span className="text-xs text-white/50">Hạng FIFA: #{awayTeam.fifaRanking} | ELO: {Math.round(awayTeam.eloRating)}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 p-2 bg-black/30 border-b border-white/10 text-sm">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition ${activeTab === 'overview' ? 'bg-brand-green/20 text-brand-green border border-brand-green/35' : 'hover:bg-white/5 text-white/60'}`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Tổng quan & Xác suất</span>
          </button>
          <button 
            onClick={() => setActiveTab('matrix')} 
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition ${activeTab === 'matrix' ? 'bg-brand-green/20 text-brand-green border border-brand-green/35' : 'hover:bg-white/5 text-white/60'}`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Ma trận điểm Poisson</span>
          </button>
          <button 
            onClick={() => setActiveTab('squads')} 
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition ${activeTab === 'squads' ? 'bg-brand-green/20 text-brand-green border border-brand-green/35' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Users className="h-4 w-4" />
            <span>Đội hình & Lực lượng</span>
          </button>
          <button 
            onClick={() => setActiveTab('h2h')} 
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition ${activeTab === 'h2h' ? 'bg-brand-green/20 text-brand-green border border-brand-green/35' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Calendar className="h-4 w-4" />
            <span>Đối đầu & Phong độ</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Win/Draw/Loss probability bar */}
              {prediction && (
                <div>
                  <h4 className="font-semibold text-sm mb-3 text-white/70">Xác suất kết quả thi đấu</h4>
                  <div className="flex h-8 w-full rounded-lg overflow-hidden font-bold text-xs select-none shadow-lg">
                    <div 
                      className="bg-brand-green flex items-center justify-center text-black transition-all" 
                      style={{ width: `${prediction.homeWinProb}%` }}
                    >
                      {prediction.homeWinProb > 10 ? `${homeTeam.name} ${prediction.homeWinProb}%` : ''}
                    </div>
                    <div 
                      className="bg-zinc-600 flex items-center justify-center text-white transition-all" 
                      style={{ width: `${prediction.drawProb}%` }}
                    >
                      {prediction.drawProb > 10 ? `Hòa ${prediction.drawProb}%` : ''}
                    </div>
                    <div 
                      className="bg-sky-500 flex items-center justify-center text-black transition-all" 
                      style={{ width: `${prediction.awayWinProb}%` }}
                    >
                      {prediction.awayWinProb > 10 ? `${awayTeam.name} ${prediction.awayWinProb}%` : ''}
                    </div>
                  </div>
                </div>
              )}

              {/* Key Indicators grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stats indicators */}
                <div className="glass-panel p-5 space-y-4">
                  <h4 className="font-semibold text-sm border-b border-white/5 pb-2 text-brand-green">Chỉ số sức mạnh hai đội</h4>
                  
                  {/* Attack */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Hiệu suất tấn công</span>
                      <span>{homeTeam.attackRating} vs {awayTeam.attackRating}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-1.5 flex-1 bg-white/10 rounded overflow-hidden flex justify-end">
                        <div className="h-full bg-brand-green" style={{ width: `${homeTeam.attackRating}%` }}></div>
                      </div>
                      <div className="h-1.5 flex-1 bg-white/10 rounded overflow-hidden">
                        <div className="h-full bg-sky-400" style={{ width: `${awayTeam.attackRating}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Defense */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Khả năng phòng ngự</span>
                      <span>{homeTeam.defenseRating} vs {awayTeam.defenseRating}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-1.5 flex-1 bg-white/10 rounded overflow-hidden flex justify-end">
                        <div className="h-full bg-brand-green" style={{ width: `${homeTeam.defenseRating}%` }}></div>
                      </div>
                      <div className="h-1.5 flex-1 bg-white/10 rounded overflow-hidden">
                        <div className="h-full bg-sky-400" style={{ width: `${awayTeam.defenseRating}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Midfield */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Kiểm soát tuyến giữa</span>
                      <span>{homeTeam.midfieldRating} vs {awayTeam.midfieldRating}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-1.5 flex-1 bg-white/10 rounded overflow-hidden flex justify-end">
                        <div className="h-full bg-brand-green" style={{ width: `${homeTeam.midfieldRating}%` }}></div>
                      </div>
                      <div className="h-1.5 flex-1 bg-white/10 rounded overflow-hidden">
                        <div className="h-full bg-sky-400" style={{ width: `${awayTeam.midfieldRating}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Squad Value */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Định giá đội hình</span>
                      <span>€{homeTeam.squadValueEur}M vs €{awayTeam.squadValueEur}M</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-1.5 flex-1 bg-white/10 rounded overflow-hidden flex justify-end">
                        <div className="h-full bg-brand-green" style={{ width: `${Math.min(100, (homeTeam.squadValueEur / 1200) * 100)}%` }}></div>
                      </div>
                      <div className="h-1.5 flex-1 bg-white/10 rounded overflow-hidden">
                        <div className="h-full bg-sky-400" style={{ width: `${Math.min(100, (awayTeam.squadValueEur / 1200) * 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score forecast card */}
                {prediction && (
                  <div className="glass-panel p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-sm border-b border-white/5 pb-2 text-brand-gold">Dự đoán tỷ số AI</h4>
                      
                      <div className="flex justify-around items-center py-4 text-center">
                        <div>
                          <span className="text-xs text-white/50 uppercase">Khả năng cao nhất</span>
                          <div className="text-4xl font-extrabold mt-1 text-brand-green">
                            {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
                          </div>
                        </div>
                        <div className="h-10 w-[1px] bg-white/10"></div>
                        <div>
                          <span className="text-xs text-white/50 uppercase">Khả năng phụ</span>
                          <div className="text-2xl font-bold mt-2 text-white/80">
                            {prediction.secondaryHomeScore} - {prediction.secondaryAwayScore}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3 text-xs border border-white/10 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-brand-gold" />
                        <div>
                          <div className="font-semibold">Chỉ số tin cậy của AI</div>
                          <div className="text-white/60">Hệ số rủi ro: {getRiskTranslation(prediction.riskLevel)}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded font-bold ${prediction.riskLevel === 'LOW' ? 'bg-emerald-500/20 text-emerald-400' : prediction.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                        {prediction.confidenceScore}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Betting Recommendations */}
              <div className="glass-panel p-5">
                <h4 className="font-semibold text-sm mb-4 border-b border-white/5 pb-2 text-sky-400">Đề xuất kèo gợi ý từ AI</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tips.map((tip, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4 relative overflow-hidden">
                      {tip.isValue && (
                        <span className="absolute top-2 right-2 text-[10px] font-bold bg-brand-gold text-black px-1.5 py-0.5 rounded uppercase tracking-wider glow-gold">
                          Kèo thơm
                        </span>
                      )}
                      <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">{getMarketTranslation(tip.market)}</span>
                      <div className="font-bold text-base mt-1 text-white">{getTipTranslation(tip.recommendation)}</div>
                      <div className="flex justify-between items-center mt-3 text-xs">
                        <span className="text-white/50">Tỷ lệ cược tương ứng</span>
                        <span className="font-bold text-brand-green">@{tip.oddSim.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1 text-xs">
                        <span className="text-white/50">Xác suất AI tính toán</span>
                        <span className="font-bold text-brand-blue">{tip.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matrix' && prediction && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs text-white/50 bg-white/5 p-3 rounded-lg border border-white/10">
                <ShieldAlert className="h-4 w-4 text-brand-gold flex-shrink-0" />
                <span>Ma trận hiển thị xác suất tỷ số chính xác qua phân phối Poisson. Tỷ số có độ đậm màu xanh cao hơn biểu thị xác suất xảy ra cao hơn.</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="p-2 border border-white/10 bg-white/5">
                        <div className="text-[9px] text-white/40">CHỦ \ KHÁCH</div>
                      </th>
                      {[0, 1, 2, 3, 4, 5].map(g => (
                        <th key={g} className="p-2 border border-white/10 bg-sky-950/20 font-bold">
                          {awayTeam.name} ({g})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[0, 1, 2, 3, 4, 5].map(h => (
                      <tr key={h}>
                        <td className="p-2 border border-white/10 bg-emerald-950/20 font-bold">
                          {homeTeam.name} ({h})
                        </td>
                        {[0, 1, 2, 3, 4, 5].map(a => {
                          const prob = scoreProbs[`${h}-${a}`] || 0;
                          const opacity = prob / maxMatrixVal;
                          return (
                            <td 
                              key={a} 
                              className="p-3 border border-white/10 relative transition-all"
                              style={{ 
                                backgroundColor: prob > 0 ? `rgba(16, 185, 129, ${opacity * 0.4})` : 'transparent',
                                borderLeft: h === a ? '2px solid rgba(255, 255, 255, 0.2)' : undefined,
                                borderRight: h === a ? '2px solid rgba(255, 255, 255, 0.2)' : undefined
                              }}
                            >
                              <div className="font-bold text-white/90">{prob}%</div>
                              <span className="text-[9px] text-white/30">{h}-{a}</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'squads' && (() => {
            // Helper to get starting 11
            const getStarting11 = (squad: any[]) => {
              const fitPlayers = squad.filter((p: any) => p.status === 'FIT');
              const gk = fitPlayers.filter((p: any) => p.position === 'GK').slice(0, 1);
              const def = fitPlayers.filter((p: any) => p.position === 'DEF').slice(0, 4);
              const mid = fitPlayers.filter((p: any) => p.position === 'MID').slice(0, 3);
              const fwd = fitPlayers.filter((p: any) => p.position === 'FWD').slice(0, 3);
              
              const selected = [...gk, ...def, ...mid, ...fwd];
              if (selected.length < 11) {
                const remaining = fitPlayers.filter((p: any) => !selected.includes(p));
                selected.push(...remaining.slice(0, 11 - selected.length));
              }
              return selected.slice(0, 11);
            };

            const homeStart = getStarting11(homeSquad);
            const awayStart = getStarting11(awaySquad);

            // Injured / suspended players list
            const homeInjured = homeSquad.filter((p: any) => p.status !== 'FIT');
            const awayInjured = awaySquad.filter((p: any) => p.status !== 'FIT');

            // Coordinates for 4-3-3 formation
            const getPlayerCoords = (index: number, isHome: boolean) => {
              const yCoords = [
                [50],                  // GK (index 0)
                [15, 38, 62, 85],      // DEF (index 1-4)
                [25, 50, 75],          // MID (index 5-7)
                [20, 50, 80]           // FWD (index 8-10)
              ];
              
              let category = 0;
              let catIndex = 0;
              
              if (index === 0) {
                category = 0;
                catIndex = 0;
              } else if (index <= 4) {
                category = 1;
                catIndex = index - 1;
              } else if (index <= 7) {
                category = 2;
                catIndex = index - 5;
              } else {
                category = 3;
                catIndex = index - 8;
              }
              
              const yVal = yCoords[category][catIndex] ?? 50;
              let xVal = 50;
              
              if (isHome) {
                const xMap = [8, 22, 36, 46];
                xVal = xMap[category];
              } else {
                const xMap = [92, 78, 64, 54];
                xVal = xMap[category];
              }
              
              return { x: xVal, y: yVal };
            };

            const getPlayerNumber = (player: any, index: number, isHome: boolean) => {
              if (player.position === 'GK') return 1;
              const numbersList = isHome 
                ? [3, 26, 8, 5, 11, 20, 7, 10, 4, 13, 2]
                : [2, 14, 18, 3, 6, 24, 10, 8, 11, 20, 9];
              return numbersList[index % numbersList.length] || (index + 2);
            };

            const getShortName = (name: string) => {
              if (!name) return '';
              
              // Special cases for world famous players
              if (name === 'Vinícius Júnior' || name === 'Vinicius Junior') return 'Vini Jr.';
              if (name === 'Cristiano Ronaldo') return 'Ronaldo';
              if (name === 'Lionel Messi') return 'Messi';
              if (name.startsWith('Neymar')) return 'Neymar';

              const parts = name.split(' ');
              if (parts.length <= 1) return name;

              // Handle Korean family names (family name comes first)
              const koreanFamilyNames = ['Son', 'Kim', 'Cho', 'Hwang', 'Lee', 'Seol', 'Park', 'Jo'];
              if (koreanFamilyNames.includes(parts[0])) {
                return parts[0];
              }

              // If last part is Junior/Júnior/Jr/Jr., return the second-to-last part + Jr.
              const lastPart = parts[parts.length - 1];
              if (['Jr', 'Jr.', 'Jnr', 'Júnior', 'Junior'].includes(lastPart)) {
                return `${parts[parts.length - 2]} Jr.`;
              }

              // Handle "Mac Allister", "De Paul", "De Vrij"
              if (parts.length === 3) {
                const mid = parts[1].toLowerCase();
                if (mid === 'mac' || mid === 'de') {
                  return `${parts[1]} ${parts[2]}`;
                }
              }

              // Default: Return the family/last name
              return parts[parts.length - 1];
            };

            // AI Odds simulation calculation
            const homeOdds = Math.round((100 / prediction.homeWinProb) * 1.05 * 100) / 100;
            const drawOdds = Math.round((100 / prediction.drawProb) * 1.05 * 100) / 100;
            const awayOdds = Math.round((100 / prediction.awayWinProb) * 1.05 * 100) / 100;

            const ouTip = tips.find((t: any) => t.market === 'Over/Under 2.5');
            let overOdds = 1.95;
            let underOdds = 1.85;
            if (ouTip) {
              if (ouTip.recommendation.includes('Over')) {
                overOdds = ouTip.oddSim;
                underOdds = Math.round((1 / (1 - (ouTip.confidence / 100))) * 1.05 * 100) / 100;
              } else {
                underOdds = ouTip.oddSim;
                overOdds = Math.round((1 / (1 - (ouTip.confidence / 100))) * 1.05 * 100) / 100;
              }
            }

            const bttsTip = tips.find((t: any) => t.market === 'BTTS');
            let bttsYesOdds = 1.90;
            let bttsNoOdds = 1.90;
            if (bttsTip) {
              if (bttsTip.recommendation.includes('Yes')) {
                bttsYesOdds = bttsTip.oddSim;
                bttsNoOdds = Math.round((1 / (1 - (bttsTip.confidence / 100))) * 1.05 * 100) / 100;
              } else {
                bttsNoOdds = bttsTip.oddSim;
                bttsYesOdds = Math.round((1 / (1 - (bttsTip.confidence / 100))) * 1.05 * 100) / 100;
              }
            }

            const dcHomeOrDraw = Math.round((100 / (prediction.homeWinProb + prediction.drawProb)) * 1.05 * 100) / 100;
            const dcHomeOrAway = Math.round((100 / (prediction.homeWinProb + prediction.awayWinProb)) * 1.05 * 100) / 100;
            const dcAwayOrDraw = Math.round((100 / (prediction.awayWinProb + prediction.drawProb)) * 1.05 * 100) / 100;

            return (
              <div className="space-y-8 fade-in-up">
                {/* 1. Tactical pitch diagram */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Đội hình ra sân dự kiến</span>
                    <span className="text-[10px] uppercase font-bold text-brand-blue tracking-wider font-numeric">Sơ đồ chiến thuật: 4-3-3</span>
                  </div>
                  <div className="relative w-full h-[320px] md:h-[420px] bg-gradient-to-b from-[#0a1f18] to-[#040e10] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Pitch markings */}
                    <div className="absolute inset-4 border border-white/5 pointer-events-none rounded-lg"></div>
                    <div className="absolute top-[20%] bottom-[20%] left-4 w-[12%] border-y border-r border-white/5 pointer-events-none"></div>
                    <div className="absolute top-[35%] bottom-[35%] left-4 w-[4%] border-y border-r border-white/5 pointer-events-none"></div>
                    
                    <div className="absolute top-[20%] bottom-[20%] right-4 w-[12%] border-y border-l border-white/5 pointer-events-none"></div>
                    <div className="absolute top-[35%] bottom-[35%] right-4 w-[4%] border-y border-l border-white/5 pointer-events-none"></div>
                    
                    <div className="absolute top-4 bottom-4 left-1/2 -translate-x-1/2 w-[1px] bg-white/5 pointer-events-none"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[16%] aspect-square border border-white/5 rounded-full pointer-events-none"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/15 rounded-full pointer-events-none"></div>

                    {/* Left/Right Team Identifiers */}
                    <div className="absolute top-6 left-6 flex items-center space-x-2 bg-slate-900/50 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm">
                      <img src={homeTeam.flagUrl} alt="" className="w-4 h-2.5 object-cover rounded-sm" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{homeTeam.name}</span>
                    </div>

                    <div className="absolute top-6 right-6 flex items-center space-x-2 bg-slate-900/50 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">{awayTeam.name}</span>
                      <img src={awayTeam.flagUrl} alt="" className="w-4 h-2.5 object-cover rounded-sm" />
                    </div>

                    {/* Home Team Players on Field */}
                    {homeStart.map((p: any, idx: number) => {
                      const coords = getPlayerCoords(idx, true);
                      const num = getPlayerNumber(p, idx, true);
                      return (
                        <div 
                          key={`home-field-${idx}`} 
                          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer transition-all duration-300 hover:scale-110 z-10"
                          style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                        >
                          <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-700 text-slate-950 font-black text-xs md:text-sm flex items-center justify-center shadow-lg border border-white/20 group-hover:border-emerald-300 transition-colors font-numeric">
                            {num}
                          </div>
                          <span className="text-[9px] md:text-[10px] font-bold text-white/90 bg-slate-950/80 px-2 py-0.5 rounded-full mt-1.5 border border-white/5 group-hover:bg-slate-950 group-hover:border-emerald-500/30 transition-all shadow whitespace-nowrap">
                            {getShortName(p.name)}
                          </span>
                        </div>
                      );
                    })}

                    {/* Away Team Players on Field */}
                    {awayStart.map((p: any, idx: number) => {
                      const coords = getPlayerCoords(idx, false);
                      const num = getPlayerNumber(p, idx, false);
                      return (
                        <div 
                          key={`away-field-${idx}`} 
                          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer transition-all duration-300 hover:scale-110 z-10"
                          style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                        >
                          <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-black text-xs md:text-sm flex items-center justify-center shadow-lg border border-white/20 group-hover:border-cyan-300 transition-colors font-numeric">
                            {num}
                          </div>
                          <span className="text-[9px] md:text-[10px] font-bold text-white/90 bg-slate-950/80 px-2 py-0.5 rounded-full mt-1.5 border border-white/5 group-hover:bg-slate-950 group-hover:border-cyan-500/30 transition-all shadow whitespace-nowrap">
                            {getShortName(p.name)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Match Details Row and Starting Lineup List */}
                <div className="glass-panel p-5 space-y-4 bg-slate-950/45">
                  <div className="flex flex-col items-center justify-center border-b border-white/5 pb-4 text-center">
                    <div className="flex items-center space-x-6">
                      <img src={homeTeam.flagUrl} alt="" className="w-12 h-8 object-cover rounded shadow border border-white/10" />
                      <span className="text-xl font-bold text-white/30 font-numeric">-</span>
                      <img src={awayTeam.flagUrl} alt="" className="w-12 h-8 object-cover rounded shadow border border-white/10" />
                    </div>
                    <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-2 flex items-center space-x-1 font-numeric">
                      <Calendar className="h-3.5 w-3.5 text-brand-blue" />
                      <span>KICKOFF: {new Date(match.date).toLocaleDateString('vi-VN')} {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {Array.from({ length: 11 }).map((_, idx) => {
                      const hp = homeStart[idx];
                      const ap = awayStart[idx];
                      if (!hp || !ap) return null;
                      
                      const hNum = getPlayerNumber(hp, idx, true);
                      const aNum = getPlayerNumber(ap, idx, false);

                      return (
                        <div 
                          key={`lineup-row-${idx}`} 
                          className="flex justify-between items-center py-2.5 px-3 rounded-lg hover:bg-white/5 transition border-b border-white/5 last:border-b-0 text-xs font-semibold"
                        >
                          {/* Home player detail */}
                          <div className="flex-1 flex items-center space-x-3">
                            <span className="w-5 text-white/40 font-bold text-left font-numeric">{hNum}</span>
                            <Shield className="h-3.5 w-3.5 text-emerald-500/60" />
                            <span className="text-white/80">{hp.name}</span>
                            <span className="text-[9px] text-white/35 uppercase font-medium bg-white/5 px-1.5 py-0.5 rounded font-numeric">
                              {hp.position}
                            </span>
                          </div>

                          {/* Center Divider spacer */}
                          <div className="w-8 text-center text-white/20 font-bold">vs</div>

                          {/* Away player detail */}
                          <div className="flex-1 flex items-center space-x-3 justify-end text-right">
                            <span className="text-[9px] text-white/35 uppercase font-medium bg-white/5 px-1.5 py-0.5 rounded font-numeric">
                              {ap.position}
                            </span>
                            <span className="text-white/80">{ap.name}</span>
                            <Shield className="h-3.5 w-3.5 text-cyan-500/60" />
                            <span className="w-5 text-white/40 font-bold text-right font-numeric">{aNum}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Will Not Play Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Home Injured */}
                  <div className="glass-panel p-5 space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-red-400 flex items-center space-x-1.5 border-b border-white/5 pb-2">
                      <ShieldAlert className="h-4 w-4" />
                      <span>Danh sách vắng mặt {homeTeam.name}</span>
                    </h4>
                    <div className="space-y-2">
                      {homeInjured.length === 0 ? (
                        <div className="text-xs text-white/40 italic py-2">Lực lượng đầy đủ, không có chấn thương.</div>
                      ) : (
                        homeInjured.map((p: any, idx: number) => (
                          <div key={`home-inj-${idx}`} className="bg-white/5 border border-white/5 rounded-lg p-3 flex justify-between items-center text-xs">
                            <div>
                              <div className="font-bold text-white/95">{p.name}</div>
                              <div className="text-[9px] text-white/40 uppercase mt-0.5 font-numeric">{p.position}</div>
                            </div>
                            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-bold">
                              {p.injuryDetails || 'Chấn thương'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Away Injured */}
                  <div className="glass-panel p-5 space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-red-400 flex items-center space-x-1.5 border-b border-white/5 pb-2">
                      <ShieldAlert className="h-4 w-4" />
                      <span>Danh sách vắng mặt {awayTeam.name}</span>
                    </h4>
                    <div className="space-y-2">
                      {awayInjured.length === 0 ? (
                        <div className="text-xs text-white/40 italic py-2">Lực lượng đầy đủ, không có chấn thương.</div>
                      ) : (
                        awayInjured.map((p: any, idx: number) => (
                          <div key={`away-inj-${idx}`} className="bg-white/5 border border-white/5 rounded-lg p-3 flex justify-between items-center text-xs">
                            <div>
                              <div className="font-bold text-white/95">{p.name}</div>
                              <div className="text-[9px] text-white/40 uppercase mt-0.5 font-numeric">{p.position}</div>
                            </div>
                            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-bold">
                              {p.injuryDetails || 'Chấn thương'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Odds Section */}
                <div className="glass-panel p-5 space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-brand-gold border-b border-white/5 pb-2">
                    Tỷ lệ cược mô phỏng AI (Odds Simulation)
                  </h4>
                  
                  {/* Odds Sub-Tabs */}
                  <div className="flex border-b border-white/5 p-1 bg-black/20 rounded-lg max-w-lg text-[10px] md:text-xs font-bold">
                    {[
                      { id: '1x2', name: '1X2' },
                      { id: 'ou', name: 'TÀI/XỈU 2.5' },
                      { id: 'btts', name: 'BTTS' },
                      { id: 'dc', name: 'CƠ HỘI KÉP' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setOddsTab(tab.id as any)}
                        className={`flex-1 py-1.5 rounded transition uppercase cursor-pointer ${
                          oddsTab === tab.id 
                            ? 'bg-brand-blue/15 text-brand-blue border border-brand-blue/20 shadow-sm' 
                            : 'text-white/50 hover:text-white/80'
                        }`}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </div>

                  {/* Odds Display Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {oddsTab === '1x2' && (
                      <>
                        <div className="bg-slate-900/50 border border-white/5 p-3.5 rounded-xl flex flex-col items-center">
                          <span className="text-[10px] text-white/40 font-bold uppercase mb-1">1 (Chủ nhà thắng)</span>
                          <span className="text-base font-extrabold text-brand-green flex items-center space-x-1 font-numeric">
                            <ChevronUp className="h-4 w-4" />
                            <span>{homeOdds.toFixed(2)}</span>
                          </span>
                        </div>
                        <div className="bg-slate-900/50 border border-white/5 p-3.5 rounded-xl flex flex-col items-center">
                          <span className="text-[10px] text-white/40 font-bold uppercase mb-1">X (Hòa)</span>
                          <span className="text-base font-extrabold text-slate-300 font-numeric">
                            {drawOdds.toFixed(2)}
                          </span>
                        </div>
                        <div className="bg-slate-900/50 border border-white/5 p-3.5 rounded-xl flex flex-col items-center col-span-2 md:col-span-1">
                          <span className="text-[10px] text-white/40 font-bold uppercase mb-1">2 (Khách thắng)</span>
                          <span className="text-base font-extrabold text-red-400 flex items-center space-x-1 font-numeric">
                            <ChevronDown className="h-4 w-4" />
                            <span>{awayOdds.toFixed(2)}</span>
                          </span>
                        </div>
                      </>
                    )}

                    {oddsTab === 'ou' && (
                      <>
                        <div className="bg-slate-900/50 border border-white/5 p-3.5 rounded-xl flex flex-col items-center">
                          <span className="text-[10px] text-white/40 font-bold uppercase mb-1">Tài 2.5 (Over)</span>
                          <span className="text-base font-extrabold text-brand-green font-numeric">
                            {overOdds.toFixed(2)}
                          </span>
                        </div>
                        <div className="bg-slate-900/50 border border-white/5 p-3.5 rounded-xl flex flex-col items-center">
                          <span className="text-[10px] text-white/40 font-bold uppercase mb-1">Xỉu 2.5 (Under)</span>
                          <span className="text-base font-extrabold text-red-400 font-numeric">
                            {underOdds.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}

                    {oddsTab === 'btts' && (
                      <>
                        <div className="bg-slate-900/50 border border-white/5 p-3.5 rounded-xl flex flex-col items-center">
                          <span className="text-[10px] text-white/40 font-bold uppercase mb-1">BTTS - Có (Yes)</span>
                          <span className="text-base font-extrabold text-brand-green font-numeric">
                            {bttsYesOdds.toFixed(2)}
                          </span>
                        </div>
                        <div className="bg-slate-900/50 border border-white/5 p-3.5 rounded-xl flex flex-col items-center">
                          <span className="text-[10px] text-white/40 font-bold uppercase mb-1">BTTS - Không (No)</span>
                          <span className="text-base font-extrabold text-red-400 font-numeric">
                            {bttsNoOdds.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}

                    {oddsTab === 'dc' && (
                      <>
                        <div className="bg-slate-900/50 border border-white/5 p-3.5 rounded-xl flex flex-col items-center">
                          <span className="text-[10px] text-white/40 font-bold uppercase mb-1">1X (Chủ hoặc Hòa)</span>
                          <span className="text-base font-extrabold text-brand-blue font-numeric">
                            {dcHomeOrDraw.toFixed(2)}
                          </span>
                        </div>
                        <div className="bg-slate-900/50 border border-white/5 p-3.5 rounded-xl flex flex-col items-center">
                          <span className="text-[10px] text-white/40 font-bold uppercase mb-1">12 (Chủ hoặc Khách)</span>
                          <span className="text-base font-extrabold text-brand-blue font-numeric">
                            {dcHomeOrAway.toFixed(2)}
                          </span>
                        </div>
                        <div className="bg-slate-900/50 border border-white/5 p-3.5 rounded-xl flex flex-col items-center col-span-2 md:col-span-1">
                          <span className="text-[10px] text-white/40 font-bold uppercase mb-1">X2 (Khách hoặc Hòa)</span>
                          <span className="text-base font-extrabold text-brand-blue font-numeric">
                            {dcAwayOrDraw.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === 'h2h' && (
            <div className="space-y-6">
              {/* Form History */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sm mb-3 text-white/80">Lịch sử trận gần đây của {homeTeam.name}</h4>
                  <div className="space-y-2">
                    {form.home.length === 0 ? (
                      <div className="text-xs text-white/40 italic">Chưa có dữ liệu trận đấu gần đây.</div>
                    ) : (
                      form.home.map((item: any, idx: number) => (
                        <div key={idx} className="bg-white/5 border border-white/5 p-3 rounded-lg text-xs flex justify-between items-center">
                          <span>{item.homeTeam.name} vs {item.awayTeam.name}</span>
                          <span className="font-bold bg-white/10 px-2 py-0.5 rounded">
                            {item.homeScore} - {item.awayScore}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-3 text-white/80">Lịch sử trận gần đây của {awayTeam.name}</h4>
                  <div className="space-y-2">
                    {form.away.length === 0 ? (
                      <div className="text-xs text-white/40 italic">Chưa có dữ liệu trận đấu gần đây.</div>
                    ) : (
                      form.away.map((item: any, idx: number) => (
                        <div key={idx} className="bg-white/5 border border-white/5 p-3 rounded-lg text-xs flex justify-between items-center">
                          <span>{item.homeTeam.name} vs {item.awayTeam.name}</span>
                          <span className="font-bold bg-white/10 px-2 py-0.5 rounded">
                            {item.homeScore} - {item.awayScore}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Head to Head records */}
              <div className="glass-panel p-5">
                <h4 className="font-semibold text-sm mb-3 border-b border-white/5 pb-2 text-brand-green">Lịch sử đối đầu trực tiếp</h4>
                <div className="space-y-2">
                  {h2h.length === 0 ? (
                    <div className="text-xs text-white/40 italic py-2 text-center">Chưa có dữ liệu đối đầu trực tiếp gần đây. Dự đoán dựa chủ yếu trên hệ số ELO và sức mạnh lực lượng hiện tại.</div>
                  ) : (
                    h2h.map((record: any, idx: number) => (
                      <div key={idx} className="bg-white/5 p-3 rounded-lg text-xs flex justify-between items-center">
                        <span className="text-white/45">{new Date(record.date).getFullYear()} | {record.competition}</span>
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold">{record.homeTeamId === homeTeam.id ? homeTeam.name : awayTeam.name}</span>
                          <span className="font-bold bg-brand-green/20 text-brand-green px-3 py-0.5 rounded-full">{record.homeScore} - {record.awayScore}</span>
                          <span className="font-semibold text-white/60">{record.awayTeamId === awayTeam.id ? awayTeam.name : homeTeam.name}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
