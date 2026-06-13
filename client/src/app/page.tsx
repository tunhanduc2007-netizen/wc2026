'use client';

import { useState } from 'react';
import { 
  LayoutGrid, 
  Radio, 
  Sparkles, 
  Activity, 
  Trophy, 
  Table, 
  ShieldAlert, 
  TrendingUp 
} from 'lucide-react';
import MatchCenter from '../components/MatchCenter';
import PredictionDashboard from '../components/PredictionDashboard';
import TeamAnalysis from '../components/TeamAnalysis';
import BracketSimulator from '../components/BracketSimulator';
import GroupStandings from '../components/GroupStandings';
import InjuryCenter from '../components/InjuryCenter';
import BettingHub from '../components/BettingHub';
import PredictionDetailsModal from '../components/PredictionDetailsModal';

type Tab = 'dashboard' | 'live' | 'teams' | 'bracket' | 'standings' | 'injuries' | 'betting';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const navigation = [
    { id: 'dashboard', name: 'Dự đoán AI', icon: LayoutGrid },
    { id: 'live', name: 'Trận đấu trực tiếp', icon: Radio },
    { id: 'teams', name: 'So sánh đội bóng', icon: Activity },
    { id: 'bracket', name: 'Mô phỏng nhánh đấu', icon: Trophy },
    { id: 'standings', name: 'Bảng xếp hạng', icon: Table },
    { id: 'injuries', name: 'Chấn thương', icon: ShieldAlert },
    { id: 'betting', name: 'Phân tích Kèo', icon: TrendingUp },
  ];

  return (
    <>
      <div className="min-h-screen flex flex-col fade-in-up">
        {/* Premium Header */}
        <header className="glass-panel rounded-none border-t-0 border-x-0 bg-slate-950/80 sticky top-0 z-40 backdrop-blur-md relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-green via-brand-blue to-brand-gold flex items-center justify-center shadow-lg font-black text-slate-950 text-sm select-none font-numeric">
                WC
              </span>
              <div>
                <span className="font-extrabold text-white text-sm tracking-widest block uppercase font-numeric">FIFA WORLD CUP 2026</span>
                <span className="text-[9px] text-brand-blue font-bold tracking-widest block uppercase -mt-0.5 text-glow-blue">Hệ thống Dự đoán AI</span>
              </div>
            </div>

            <div className="hidden md:flex space-x-4 text-[10px] font-bold uppercase tracking-wider text-white/50 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 font-numeric">
              <span>MÔ HÌNH ELO v1.8</span>
              <span className="text-white/20">|</span>
              <span>MÔ PHỎNG POISSON ĐANG HOẠT ĐỘNG</span>
            </div>
          </div>
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent absolute bottom-0"></div>
        </header>

        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-6">
          
          {/* Navigation Tabs bar */}
          <div className="glass-panel p-1.5 flex flex-wrap gap-1 bg-black/40 text-xs font-semibold uppercase tracking-wider border-white/5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-brand-blue/15 text-brand-blue border border-brand-blue/20 glow-blue font-bold' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Page Views rendering */}
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <PredictionDashboard onSelectMatch={(id) => setSelectedMatchId(id)} />
            )}
            {activeTab === 'live' && (
              <MatchCenter onSelectMatch={(id) => setSelectedMatchId(id)} />
            )}
            {activeTab === 'teams' && (
              <TeamAnalysis />
            )}
            {activeTab === 'bracket' && (
              <BracketSimulator />
            )}
            {activeTab === 'standings' && (
              <GroupStandings />
            )}
            {activeTab === 'injuries' && (
              <InjuryCenter />
            )}
            {activeTab === 'betting' && (
              <BettingHub />
            )}
          </div>
        </main>

        {/* Footer Footer */}
        <footer className="mt-auto py-6 text-center text-[10px] text-white/30 border-t border-white/5 bg-slate-950/20">
          <span>© 2026 Nền tảng phân tích AI FIFA World Cup. Phát triển bởi mô hình hệ số ELO & phân phối Poisson.</span>
        </footer>
      </div>

      {/* Modal Modal popup */}
      {selectedMatchId && (
        <PredictionDetailsModal 
          matchId={selectedMatchId} 
          onClose={() => setSelectedMatchId(null)} 
        />
      )}
    </>
  );
}
