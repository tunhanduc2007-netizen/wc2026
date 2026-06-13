'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import { HeartCrack, Ban } from 'lucide-react';

export default function InjuryCenter() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchAPI('/teams');
        const detailedTeams = [];
        for (const t of data) {
          const detail = await fetchAPI(`/teams/${t.id}`);
          detailedTeams.push(detail.team);
        }
        setTeams(detailedTeams);
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

  // Filter out teams that have injured players
  const teamsWithInjuries = teams.map(team => {
    const unavailable = (team.players || []).filter((p: any) => p.status !== 'FIT');
    return {
      ...team,
      unavailable
    };
  }).filter(t => t.unavailable.length > 0);

  const getPositionTranslation = (pos: string) => {
    switch (pos) {
      case 'GK': return 'Thủ môn';
      case 'DEF': return 'Hậu vệ';
      case 'MID': return 'Tiền vệ';
      case 'FWD': return 'Tiền đạo';
      default: return pos;
    }
  };

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case 'INJURED': return 'Chấn thương';
      case 'SUSPENDED': return 'Bị treo giò';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="glass-panel p-5">
        <h3 className="font-bold text-sm text-brand-green uppercase tracking-wider mb-2">Trung tâm y tế & kỷ luật giải đấu</h3>
        <p className="text-xs text-white/50 leading-relaxed">
          Theo dõi tình hình lực lượng của 48 đội bóng tham dự giải đấu. Các trường hợp chấn thương, thẻ đỏ treo giò sẽ được hệ thống AI tự động phân tích và giảm trừ vào chỉ số hiệu năng công/thủ tương ứng của đội tuyển.
        </p>
      </div>

      {teamsWithInjuries.length === 0 ? (
        <div className="glass-panel p-10 text-center text-xs text-white/40">
          Chưa ghi nhận ca chấn thương hay án treo giò nào. Tất cả các cầu thủ sẵn sàng ra sân.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teamsWithInjuries.map(team => (
            <div key={team.id} className="glass-panel p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center space-x-2">
                  <img src={team.flagUrl} alt="" className="w-6 h-4 object-cover rounded shadow" />
                  <h4 className="font-bold text-sm">Vắng mặt của {team.name}</h4>
                </div>
                <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold uppercase">
                  {team.unavailable.length} Cầu thủ
                </span>
              </div>

              <div className="space-y-2.5">
                {team.unavailable.map((p: any, idx: number) => (
                  <div key={idx} className="bg-white/5 border border-white/5 p-3 rounded-lg flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <div className="font-bold text-white/90">{p.name}</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">
                        {getPositionTranslation(p.position)} | Định giá: €{p.marketValueEur}M
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center space-x-1 ${p.status === 'INJURED' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>
                        {p.status === 'INJURED' ? (
                          <>
                            <HeartCrack className="h-3 w-3 mr-0.5" />
                            <span>Chấn thương</span>
                          </>
                        ) : (
                          <>
                            <Ban className="h-3 w-3 mr-0.5" />
                            <span>Bị treo giò</span>
                          </>
                        )}
                      </span>
                      {p.injuryDetails && (
                        <span className="text-[10px] text-white/50 text-right max-w-[150px] truncate">
                          {p.injuryDetails}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
