'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import { ShieldAlert, Star, Sparkles } from 'lucide-react';

export default function BettingHub() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchAPI('/betting-insights');
        setData(res);
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

  const valueBets = data?.valueBets || [];
  const highConfidence = data?.highConfidence || [];

  const getRiskTranslation = (level: string) => {
    switch (level) {
      case 'LOW': return 'Thấp';
      case 'MEDIUM': return 'T.Bình';
      case 'HIGH': return 'Cao';
      default: return level;
    }
  };

  const getMarketTranslation = (market: string) => {
    switch (market) {
      case 'Over/Under 2.5': return 'Tài/Xỉu 2.5';
      case 'Over/Under 0.5': return 'Tài/Xỉu 0.5';
      case 'Over/Under 3.5': return 'Tài/Xỉu 3.5';
      case 'Over/Under 4.5': return 'Tài/Xỉu 4.5';
      case 'Double Chance': return 'Cơ hội kép (Double Chance)';
      case 'BTTS': return 'Cả hai đội ghi bàn (BTTS)';
      case 'Asian Handicap': return 'Kèo châu Á (Handicap)';
      default: return market;
    }
  };

  const getTipTranslation = (rec: string) => {
    if (rec.includes('Over 2.5 Goals')) return 'Tài 2.5 bàn';
    if (rec.includes('Under 2.5 Goals')) return 'Xỉu 2.5 bàn';
    if (rec.includes('Over 0.5 Goals')) return 'Tài 0.5 bàn';
    if (rec.includes('Under 3.5 Goals')) return 'Xỉu 3.5 bàn';
    if (rec.includes('Under 4.5 Goals')) return 'Xỉu 4.5 bàn';
    if (rec.includes('Yes (BTTS)')) return 'Có ghi bàn';
    if (rec.includes('No (BTTS)')) return 'Không ghi bàn';
    if (rec.includes('or Draw')) {
      return rec.replace('or Draw', 'hoặc Hòa');
    }
    return rec; // Team names
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

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="glass-panel p-5 bg-gradient-to-r from-red-950/10 to-slate-900 border-red-500/20 text-xs leading-relaxed space-y-2">
        <div className="flex items-center space-x-2 text-red-400 font-bold uppercase tracking-wider">
          <ShieldAlert className="h-5 w-5" />
          <span>KHUYẾN CÁO RỦI RO & CHƠI CÓ TRÁCH NHIỆM</span>
        </div>
        <p className="text-slate-300">
          Tất cả các dự đoán tỷ số, xác suất và gợi ý cá cược trên nền tảng này được tổng hợp thông qua các mô hình toán học (Phân phối Poisson, Xếp hạng ELO, Phong độ đội bóng) chỉ mang tính chất tham khảo. Kết quả trong quá khứ không đảm bảo cho tương lai. <strong>Chúng tôi không cam kết lợi nhuận, và cá cược thể thao luôn đi kèm với rủi ro tài chính lớn.</strong> Hãy tham gia một cách tỉnh táo, có trách nhiệm và trong giới hạn tài chính của bản thân.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Value Bets Detected */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-brand-gold animate-pulse" />
              <h4 className="font-bold text-sm">Kèo thơm phát hiện từ AI</h4>
            </div>
            <span className="text-[10px] bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded font-bold uppercase">
              {valueBets.length} Phát hiện
            </span>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {valueBets.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-10 text-center">Không tìm thấy kèo thơm biên lợi nhuận cao nào trong danh sách trận đấu sắp tới.</div>
            ) : (
              valueBets.map((bet: any, idx: number) => (
                <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-lg space-y-3 relative overflow-hidden">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                    <span>{getStageTranslation(bet.stage)}</span>
                    <span className={`px-2 py-0.5 rounded ${bet.riskLevel === 'LOW' ? 'bg-emerald-500/10 text-emerald-400' : bet.riskLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                      Rủi ro {getRiskTranslation(bet.riskLevel)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>{bet.homeTeam.name} vs {bet.awayTeam.name}</span>
                    <span className="text-brand-gold">Độ tin cậy: {bet.confidenceScore}%</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {bet.tips.map((tip: any, tIdx: number) => (
                      <div key={tIdx} className="bg-slate-900/50 p-2.5 rounded border border-white/5 flex justify-between items-center">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">{getMarketTranslation(tip.market)}</div>
                          <div className="font-bold text-white/90 mt-0.5">{getTipTranslation(tip.recommendation)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400">Tỷ lệ cược</div>
                          <div className="font-bold text-brand-green">@{tip.oddSim.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: High Confidence Recommendations */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-brand-green" />
              <h4 className="font-bold text-sm">Gợi ý độ tin cậy cao (&gt;75%)</h4>
            </div>
            <span className="text-[10px] bg-brand-green/10 text-brand-green px-2 py-0.5 rounded font-bold uppercase">
              {highConfidence.length} Trận đấu
            </span>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {highConfidence.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-10 text-center">Không có trận đấu nào hiện tại đạt độ tin cậy trên 75%.</div>
            ) : (
              highConfidence.map((bet: any, idx: number) => (
                <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                    <span>{getStageTranslation(bet.stage)}</span>
                    <span className="text-brand-green font-bold">Độ tin cậy {bet.confidenceScore}%</span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>{bet.homeTeam.name} vs {bet.awayTeam.name}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {bet.tips.map((tip: any, tIdx: number) => (
                      <div key={tIdx} className="bg-slate-900/50 p-2.5 rounded border border-white/5 flex justify-between items-center">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">{getMarketTranslation(tip.market)}</div>
                          <div className="font-bold text-brand-blue mt-0.5">{getTipTranslation(tip.recommendation)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400">Xác suất AI</div>
                          <div className="font-bold text-brand-gold">{tip.confidence}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
