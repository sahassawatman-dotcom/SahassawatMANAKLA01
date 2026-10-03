import React, { useState, useEffect } from 'react';
import {
  Activity,
  Dumbbell,
  Utensils,
  UserCheck,
  Download,
  Smartphone,
  Share2,
  Heart,
  Sparkles,
  WifiOff,
} from 'lucide-react';
import { FoodItem, UserProfile } from './types';
import {
  INITIAL_MEAL_HISTORY,
  INITIAL_USER_PROFILE,
  calculateBMR,
  calculateTDEE,
} from './utils/fitnessCalculations';
import { TabHealthOverview } from './components/TabHealthOverview';
import { TabExercisePlans } from './components/TabExercisePlans';
import { TabNutritionLog } from './components/TabNutritionLog';
import { TabAgeGuidance } from './components/TabAgeGuidance';
import { PWAInstallModal } from './components/PWAInstallModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useOnlineStatus } from './hooks/useOnlineStatus';

export default function App() {
  // Offline status
  const isOnline = useOnlineStatus();
  const { isInstalled, isInstallable } = usePWAInstall();

  // PWA Install Modal state
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'tab1' | 'tab2' | 'tab3' | 'tab4'>('tab1');

  // User Profile state with local persistence
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('smartpe_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_USER_PROFILE;
  });

  // Meal history state with local persistence
  const [meals, setMeals] = useState<FoodItem[]>(() => {
    try {
      const saved = localStorage.getItem('smartpe_meals');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_MEAL_HISTORY;
  });

  // Save to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem('smartpe_profile', JSON.stringify(profile));
    } catch {
      // Ignore
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('smartpe_meals', JSON.stringify(meals));
    } catch {
      // Ignore
    }
  }, [meals]);

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const handleAddMeal = (newMeal: Omit<FoodItem, 'id'>) => {
    const item: FoodItem = {
      ...newMeal,
      id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setMeals((prev) => [item, ...prev]);
  };

  const handleDeleteMeal = (id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const handleClearMeals = () => {
    setMeals([]);
  };

  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityFactor);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Offline banner if disconnected */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-1.5 flex items-center justify-center gap-2 shadow-sm">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>โหมดออฟไลน์ — ข้อมูลของคุณได้รับการบันทึกบนเครื่องเรียบร้อย</span>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-md p-1.5 shrink-0">
              <img src="/icon.svg" alt="App Logo" className="w-full h-full object-contain drop-shadow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  🏃♂️ Smart Physical Education & Health AI Dashboard
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  AI Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                ระบบติดตามการออกกำลังกาย เลือกประเภทกีฬา/เวทเทรนนิ่ง คำนวณชีพจร (HR Zone) โภชนาการ และส่งออกรายงาน (Excel/CSV)
              </p>
            </div>
          </div>

          {/* Header Action: Install App Button */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => setShowInstallModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-medium text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isInstalled ? 'เปิดบนมือถือ' : 'ดาวน์โหลดบนมือถือ (iOS / Android)'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Bars */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar border-t border-slate-100 py-1">
            <button
              onClick={() => setActiveTab('tab1')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'tab1'
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-4 h-4 text-blue-600" />
              <span>📊 ภาพรวมสุขภาพ & ชีพจร (HR Zone)</span>
            </button>

            <button
              onClick={() => setActiveTab('tab2')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'tab2'
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Dumbbell className="w-4 h-4 text-indigo-600" />
              <span>🏋️♂️ เลือกกีฬา & แผนออกกำลังกาย</span>
            </button>

            <button
              onClick={() => setActiveTab('tab3')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'tab3'
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Utensils className="w-4 h-4 text-emerald-600" />
              <span>🥗 บันทึกประวัติอาหาร & ส่งออกไฟล์</span>
            </button>

            <button
              onClick={() => setActiveTab('tab4')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                activeTab === 'tab4'
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span>🏃♂️ คำแนะนำตามช่วงวัย</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 pb-24 sm:pb-12">
        {activeTab === 'tab1' && (
          <TabHealthOverview
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {activeTab === 'tab2' && (
          <TabExercisePlans
            profile={profile}
          />
        )}

        {activeTab === 'tab3' && (
          <TabNutritionLog
            profile={profile}
            meals={meals}
            onAddMeal={handleAddMeal}
            onDeleteMeal={handleDeleteMeal}
            onClearMeals={handleClearMeals}
            tdee={tdee}
          />
        )}

        {activeTab === 'tab4' && (
          <TabAgeGuidance
            profile={profile}
          />
        )}
      </main>

      {/* Mobile Floating Bottom Bar for Convenient Phone Usage */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex justify-around items-center shadow-lg pb-safe">
        <button
          onClick={() => setActiveTab('tab1')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            activeTab === 'tab1' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Activity className="w-5 h-5 mb-0.5" />
          <span>ชีพจร/BMR</span>
        </button>
        <button
          onClick={() => setActiveTab('tab2')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            activeTab === 'tab2' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Dumbbell className="w-5 h-5 mb-0.5" />
          <span>แผนกีฬา</span>
        </button>
        <button
          onClick={() => setActiveTab('tab3')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            activeTab === 'tab3' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Utensils className="w-5 h-5 mb-0.5" />
          <span>บันทึกอาหาร</span>
        </button>
        <button
          onClick={() => setActiveTab('tab4')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition ${
            activeTab === 'tab4' ? 'text-purple-600 font-bold' : 'text-slate-500'
          }`}
        >
          <UserCheck className="w-5 h-5 mb-0.5" />
          <span>ตามช่วงวัย</span>
        </button>
        <button
          onClick={() => setShowInstallModal(true)}
          className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium text-blue-700 bg-blue-50"
        >
          <Smartphone className="w-5 h-5 mb-0.5" />
          <span>โหลดแอพ</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500 mt-auto hidden sm:block">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Smart Physical Education & Health AI Dashboard • ใช้งานได้จริงบนทุกอุปกรณ์</p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Progressive Web App (PWA)</span>
            <span>•</span>
            <span>Google Play & Apple App Store Ready</span>
          </div>
        </div>
      </footer>

      {/* PWA Mobile Installation Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
}
