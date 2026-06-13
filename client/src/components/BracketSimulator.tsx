'use client';

import { useState } from 'react';
import { fetchAPI } from '../utils/api';
import { Play, Sparkles, Trophy, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BracketSimulator() {
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [simulating, setSimulating] = useState(false);

  const startSimulation = async () => {
    setSimulating(true);
    try {
      const data = await fetchAPI('/bracket/simulate', { method: 'POST' });
      setSimulationData(data);
    } catch (err) {
      console.error(err);
      alert('Không thể chạy mô phỏng. (Vui lòng kiểm tra server ở cổng 3001)');
    } finally {
      setSimulating(false);
    }
  };

  // Mock brackets for visual structure representation
  const bracketVisual = {
    r16: [
      { id: '1', t1: 'Hà Lan', t2: 'Mỹ', s1: 3, s2: 1 },
      { id: '2', t1: 'Argentina', t2: 'Úc', s1: 2, s2: 1 },
      { id: '3', t1: 'Nhật Bản', t2: 'Croatia', s1: 1, s2: 1, pen: '1-3' },
      { id: '4', t1: 'Brazil', t2: 'Hàn Quốc', s1: 4, s2: 1 },
      { id: '5', t1: 'Anh', t2: 'Senegal', s1: 3, s2: 0 },
      { id: '6', t1: 'Pháp', t2: 'Ba Lan', s1: 3, s2: 1 },
      { id: '7', t1: 'Maroc', t2: 'Tây Ban Nha', s1: 0, s2: 0, pen: '3-0' },
      { id: '8', t1: 'Bồ Đào Nha', t2: 'Thụy Sĩ', s1: 6, s2: 1 }
    ],
    qf: [
      { id: 'q1', t1: 'Hà Lan', t2: 'Argentina', s1: 2, s2: 2, pen: '3-4' },
      { id: 'q2', t1: 'Croatia', t2: 'Brazil', s1: 1, s2: 1, pen: '4-2' },
      { id: 'q3', t1: 'Anh', t2: 'Pháp', s1: 1, s2: 2 },
      { id: 'q4', t1: 'Maroc', t2: 'Bồ Đào Nha', s1: 1, s2: 0 }
    ],
    sf: [
      { id: 's1', t1: 'Argentina', t2: 'Croatia', s1: 3, s2: 0 },
      { id: 's2', t1: 'Pháp', t2: 'Maroc', s1: 2, s2: 0 }
    ],
    final: { t1: 'Argentina', t2: 'Pháp', s1: 3, s2: 3, pen: '4-2', winner: 'Argentina' }
  };

  return (
    <div className="space-y-6">
      {/* Simulation banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-emerald-950/20 via-sky-950/20 to-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="font-bold text-base flex items-center space-x-2 text-brand-green">
            <Sparkles className="h-5 w-5 text-brand-gold animate-pulse" />
            <span>Giả lập Nhánh đấu AI Monte Carlo (48 đội)</span>
          </h3>
          <p className="text-xs text-white/50 max-w-xl leading-relaxed">
            Hệ thống chạy 1.000 lượt giả lập vòng loại trực tiếp World Cup 2026 dựa trên các chỉ số ELO, hiệu suất công/thủ và giá trị đội hình của 48 quốc gia.
          </p>
        </div>

        <button
          onClick={startSimulation}
          disabled={simulating}
          className="px-6 py-3 bg-brand-green text-black font-extrabold rounded-lg hover:bg-emerald-400 transition cursor-pointer flex items-center space-x-2 shadow-lg glow-green"
        >
          <Play className="h-4 w-4 fill-black" />
          <span>{simulating ? 'Đang chạy 1.000 lượt...' : 'Bắt đầu mô phỏng nhánh đấu'}</span>
        </button>
      </div>

      {simulationData.length > 0 ? (
        /* Simulation output probabilities board */
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <BarChart2 className="h-5 w-5 text-brand-gold" />
            <h4 className="font-bold text-sm">Tỷ lệ phần trăm đi tiếp qua mô phỏng (%)</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/40 font-bold">
                  <th className="py-2.5">Quốc gia</th>
                  <th className="py-2.5">Hệ số ELO</th>
                  <th className="py-2.5 text-center">Vòng 16 đội</th>
                  <th className="py-2.5 text-center">Tứ kết</th>
                  <th className="py-2.5 text-center">Bán kết</th>
                  <th className="py-2.5 text-center">Chung kết</th>
                  <th className="py-2.5 text-center text-brand-gold">Vô địch</th>
                </tr>
              </thead>
              <tbody>
                {simulationData.slice(0, 24).map((item, idx) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 flex items-center space-x-2 font-bold">
                      <span className="text-white/30 text-[10px] w-4">{idx + 1}</span>
                      <img src={item.flagUrl} alt="" className="w-5 h-3 object-cover rounded-sm" />
                      <span>{item.name}</span>
                    </td>
                    <td className="py-3 font-semibold text-white/50">{Math.round(item.eloRating)}</td>
                    <td className="py-3 text-center">
                      <span className="bg-white/5 px-2 py-0.5 rounded text-white/60 font-semibold">{item.probabilities.r16}%</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded font-semibold">{item.probabilities.qf}%</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded font-semibold">{item.probabilities.sf}%</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-semibold">{item.probabilities.f}%</span>
                    </td>
                    <td className="py-3 text-center font-bold text-brand-gold">
                      <div className="flex items-center justify-center space-x-1.5">
                        <Trophy className="h-3 w-3 text-brand-gold" />
                        <span>{item.probabilities.winner}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visual Brackets Layout Tree */
        <div className="glass-panel p-6 space-y-6 overflow-x-auto">
          <h4 className="font-bold text-xs uppercase tracking-wider text-white/50 border-b border-white/5 pb-2">Mô hình nhánh đấu mẫu (Tham khảo kỳ 2022)</h4>
          
          <div className="flex justify-between items-center space-x-6 min-w-[900px] py-4">
            
            {/* ROUND OF 16 COLUMN */}
            <div className="flex-1 space-y-4">
              <span className="text-[10px] uppercase font-bold text-white/30 block mb-2">Vòng 16 đội</span>
              {bracketVisual.r16.slice(0, 4).map(m => (
                <div key={m.id} className="bg-white/5 border border-white/5 p-2 rounded text-[11px] space-y-1">
                  <div className="flex justify-between font-medium">
                    <span>{m.t1}</span>
                    <span className="font-bold">{m.s1}</span>
                  </div>
                  <div className="flex justify-between font-medium text-white/60">
                    <span>{m.t2}</span>
                    <span className="font-bold">{m.s2}</span>
                  </div>
                  {m.pen && <div className="text-[9px] text-brand-gold text-right">L.lưu: {m.pen}</div>}
                </div>
              ))}
            </div>

            {/* QUARTER FINALS COLUMN */}
            <div className="flex-1 space-y-8">
              <span className="text-[10px] uppercase font-bold text-white/30 block mb-2">Tứ kết</span>
              {bracketVisual.qf.slice(0, 2).map(m => (
                <div key={m.id} className="bg-sky-500/10 border border-sky-500/20 p-2.5 rounded text-[11px] space-y-1">
                  <div className="flex justify-between font-medium">
                    <span>{m.t1}</span>
                    <span className="font-bold">{m.s1}</span>
                  </div>
                  <div className="flex justify-between font-medium text-white/60">
                    <span>{m.t2}</span>
                    <span className="font-bold">{m.s2}</span>
                  </div>
                  {m.pen && <div className="text-[9px] text-brand-gold text-right">L.lưu: {m.pen}</div>}
                </div>
              ))}
            </div>

            {/* SEMI FINALS COLUMN */}
            <div className="flex-1 space-y-16">
              <span className="text-[10px] uppercase font-bold text-white/30 block mb-2">Bán kết</span>
              {bracketVisual.sf.slice(0, 1).map((m, idx) => (
                <div key={idx} className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded text-[11px] space-y-1">
                  <div className="flex justify-between font-medium">
                    <span>{m.t1}</span>
                    <span className="font-bold">{m.s1}</span>
                  </div>
                  <div className="flex justify-between font-medium text-white/60">
                    <span>{m.t2}</span>
                    <span className="font-bold">{m.s2}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* FINAL COLUMN */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <span className="text-[10px] uppercase font-bold text-brand-gold block text-center mb-2">Chung kết</span>
              <div className="bg-amber-500/10 border-2 border-brand-gold/30 p-4 rounded-lg text-xs space-y-2 text-center w-full relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Trophy className="h-16 w-16 text-brand-gold" />
                </div>
                <div className="font-bold text-brand-gold mb-1">VÔ ĐỊCH</div>
                <div className="font-bold">{bracketVisual.final.t1} ({bracketVisual.final.s1})</div>
                <div className="text-white/60 font-semibold">{bracketVisual.final.t2} ({bracketVisual.final.s2})</div>
                <div className="text-[10px] text-brand-gold mt-1">Luân lưu: {bracketVisual.final.pen}</div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
