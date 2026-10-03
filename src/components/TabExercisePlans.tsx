import React, { useState, useEffect, useRef } from 'react';
import { Dumbbell, Play, Pause, RotateCcw, Sparkles, Flame, Timer, CheckCircle, Info, ChevronRight, Volume2, Shield } from 'lucide-react';
import { UserProfile } from '../types';
import { calculateHeartRateZones } from '../utils/fitnessCalculations';

interface Props {
  profile: UserProfile;
}

export const TabExercisePlans: React.FC<Props> = ({ profile }) => {
  const hrData = calculateHeartRateZones(profile.age);

  const [category, setCategory] = useState<string>('การออกกำลังกายแบบคาร์ดิโอ (Cardio)');
  const [subChoice, setSubChoice] = useState<string>('วิ่งเหยาะ / วิ่ง Zone 2');

  // AI Coach state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<{
    headline: string;
    advice: string;
    hrZoneStrategy: string;
    nutritionStrategy: string;
    tips: string[];
  } | null>(null);

  // Timer state for HIIT / Workout
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'interval'>('stopwatch');
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [intervalWorkSec, setIntervalWorkSec] = useState(45);
  const [intervalRestSec, setIntervalRestSec] = useState(15);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(4);
  const [isRestPhase, setIsRestPhase] = useState(false);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(45);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play beep sound using Web Audio API
  const playBeep = (freq = 800, duration = 0.15) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not permitted or supported
    }
  };

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        if (timerMode === 'stopwatch') {
          setSeconds((prev) => prev + 1);
        } else {
          // Interval HIIT mode
          setPhaseSecondsLeft((prev) => {
            if (prev <= 1) {
              playBeep(isRestPhase ? 1000 : 600, 0.3);
              if (isRestPhase) {
                // Switching from Rest to Work of Next Round
                if (currentRound >= totalRounds) {
                  setTimerRunning(false);
                  alert('🎉 ยอดเยี่ยมมาก! คุณทำครบทุกเซตแล้ว!');
                  return intervalWorkSec;
                }
                setCurrentRound((r) => r + 1);
                setIsRestPhase(false);
                return intervalWorkSec;
              } else {
                // Switching from Work to Rest
                setIsRestPhase(true);
                return intervalRestSec;
              }
            }
            if (prev <= 4) {
              playBeep(440, 0.1); // 3-2-1 countdown beep
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerMode, isRestPhase, currentRound, totalRounds, intervalWorkSec, intervalRestSec]);

  // Update default subChoice when category changes
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    if (newCat === 'การออกกำลังกายแบบคาร์ดิโอ (Cardio)') {
      setSubChoice('วิ่งเหยาะ / วิ่ง Zone 2');
    } else if (newCat === 'เวทเทรนนิ่ง (Weight Training / Resistance)') {
      setSubChoice('Upper Body (อก/หลัง/แขน)');
    } else if (newCat === 'บอดี้เวทเทรนนิ่ง (Bodyweight)') {
      setSubChoice('Full Body HIIT (ไร้แรงกระแทก)');
    } else {
      setSubChoice('แบดมินตัน (Badminton)');
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Fetch AI Recommendation
  const fetchAiAdvice = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: profile.age,
          gender: profile.gender,
          weight: profile.weight,
          height: profile.height,
          activityLevel: profile.activityFactor,
          bmr: Math.round(profile.weight * 22),
          tdee: Math.round(profile.weight * 22 * profile.activityFactor),
          goal: profile.fitnessGoal,
          preferredSport: `${category} - ${subChoice}`,
        }),
      });

      if (!res.ok) {
        throw new Error('ไม่สามารถเชื่อมต่อ AI Coach ได้');
      }

      const data = await res.json();
      setAiAdvice(data);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการขอคำแนะนำ AI');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Selection Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              ส่วนที่ 2: ระบบเลือกประเภทกีฬาและกิจกรรมการออกกำลังกาย
            </h2>
            <p className="text-xs text-slate-500">
              เลือกรูปแบบการออกกำลังกายที่ตรงกับไลฟ์สไตล์ เพื่อรับคำแนะนำโซนชีพจรและโปรแกรมการฝึก
            </p>
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            เลือกหมวดหมู่การออกกำลังกายที่คุณสนใจ
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              'การออกกำลังกายแบบคาร์ดิโอ (Cardio)',
              'เวทเทรนนิ่ง (Weight Training / Resistance)',
              'บอดี้เวทเทรนนิ่ง (Bodyweight)',
              'กีฬาประเภททีมและเดี่ยว (Sports)',
            ].map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`p-3 text-left rounded-xl border text-xs font-medium transition ${
                    active
                      ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-sm ring-1 ring-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Program Details Box based on user selection */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
        {category === 'การออกกำลังกายแบบคาร์ดิโอ (Cardio)' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                🏃♂️ โปรแกรมคาร์ดิโอ (Cardio Workout)
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full">
                เน้นเผาผลาญไขมัน & หัวใจ
              </span>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                เลือกกิจกรรมคาร์ดิโอ
              </label>
              <select
                value={subChoice}
                onChange={(e) => setSubChoice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="วิ่งเหยาะ / วิ่ง Zone 2">วิ่งเหยาะ / วิ่ง Zone 2</option>
                <option value="ปั่นจักรยาน (Cycling)">ปั่นจักรยาน (Cycling)</option>
                <option value="กระโดดเชือก (Jumping Rope)">กระโดดเชือก (Jumping Rope)</option>
                <option value="ว่ายน้ำ (Swimming)">ว่ายน้ำ (Swimming)</option>
              </select>
            </div>

            {/* Matching Streamlit Info */}
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-sm">
              <p>
                <strong>กิจกรรม:</strong> {subChoice} | <strong>แนะนำ:</strong> ทำต่อเนื่อง 30-45 นาที
                ควบคุมชีพจรให้อยู่ในช่วง <strong>Zone 2 ({hrData.zone2Min}-{hrData.zone2Max} bpm)</strong> เพื่อเผาผลาญไขมันดีที่สุด
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">ระยะเวลาแนะนำ</span>
                <span className="font-bold text-slate-800 text-sm">30 - 45 นาที</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">โซนชีพจรเป้าหมาย</span>
                <span className="font-bold text-emerald-600 text-sm">Zone 2 ({hrData.zone2Min}-{hrData.zone2Max} bpm)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">เผาผลาญโดยประมาณ</span>
                <span className="font-bold text-slate-800 text-sm">300 - 450 kcal</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">ความถี่ที่เหมาะสม</span>
                <span className="font-bold text-slate-800 text-sm">3 - 4 วัน/สัปดาห์</span>
              </div>
            </div>
          </div>
        )}

        {category === 'เวทเทรนนิ่ง (Weight Training / Resistance)' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                🏋️♀️ โปรแกรมเวทเทรนนิ่งด้วยอุปกรณ์ (Gym/Weights)
              </h3>
              <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2.5 py-1 rounded-full">
                เสริมสร้างมวลกล้ามเนื้อ & กระดูก
              </span>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                เลือกส่วนของร่างกายที่ต้องการฝึก
              </label>
              <select
                value={subChoice}
                onChange={(e) => setSubChoice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Upper Body (อก/หลัง/แขน)">Upper Body (อก/หลัง/แขน)</option>
                <option value="Lower Body (ขา/ก้น)">Lower Body (ขา/ก้น)</option>
                <option value="Full Body Compound (ท่ารวมทุกส่วน)">Full Body Compound (ท่ารวมทุกส่วน)</option>
              </select>
            </div>

            {/* Matching Streamlit Success */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm">
              <p>
                <strong>โปรแกรม:</strong> {subChoice} | <strong>คำแนะนำ:</strong> ยกน้ำหนักด้วยความหนักระดับปานกลาง 3-4 เซต
                เซตละ 10-12 ครั้ง พักระหว่างเซต 60-90 วินาที ช่วยสร้างมวลกล้ามเนื้อและเพิ่มการเผาผลาญระยะยาว
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">จำนวนเซต</span>
                <span className="font-bold text-slate-800 text-sm">3 - 4 เซต</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">จำนวนครั้งต่อเซต</span>
                <span className="font-bold text-slate-800 text-sm">10 - 12 Reps (Hypertrophy)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">เวลาพักระหว่างเซต</span>
                <span className="font-bold text-slate-800 text-sm">60 - 90 วินาที</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">โภชนาการหลังซ้อม</span>
                <span className="font-bold text-slate-800 text-sm">โปรตีน 20-30g</span>
              </div>
            </div>
          </div>
        )}

        {category === 'บอดี้เวทเทรนนิ่ง (Bodyweight)' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                🧘♂️ โปรแกรมบอดี้เวทไร้อุปกรณ์ (Home Workout)
              </h3>
              <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-full">
                สะดวก ออกได้ทุกที่ ไม่ต้องใช้อุปกรณ์
              </span>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                เลือกรูปแบบบอดี้เวท
              </label>
              <select
                value={subChoice}
                onChange={(e) => setSubChoice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Full Body HIIT (ไร้แรงกระแทก)">Full Body HIIT (ไร้แรงกระแทก)</option>
                <option value="Core & Abs (เน้นหน้าท้องและแกนกลาง)">Core & Abs (เน้นหน้าท้องและแกนกลาง)</option>
                <option value="Lower Body Burn (สควอทและลันจ)">Lower Body Burn (สควอทและลันจ)</option>
              </select>
            </div>

            {/* Matching Streamlit Warning */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm">
              <p>
                <strong>โปรแกรม:</strong> {subChoice} | <strong>คำแนะนำ:</strong> ทำท่าละ 45 วินาที พัก 15 วินาที
                วนจนครบ 3-4 รอบ ช่วยกระตุ้นระบบไหลเวียนโลหิตและกระชับสัดส่วน
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">ช่วงทำงาน (Work)</span>
                <span className="font-bold text-slate-800 text-sm">45 วินาที</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">ช่วงพัก (Rest)</span>
                <span className="font-bold text-slate-800 text-sm">15 วินาที</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">จำนวนรอบ</span>
                <span className="font-bold text-slate-800 text-sm">3 - 4 รอบ</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">ข้อดี</span>
                <span className="font-bold text-slate-800 text-sm">Afterburn Effect สูง</span>
              </div>
            </div>
          </div>
        )}

        {category === 'กีฬาประเภททีมและเดี่ยว (Sports)' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                ⚽ กีฬาประเภททีมและเดี่ยว (Sports Activities)
              </h3>
              <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2.5 py-1 rounded-full">
                ฝึกความคล่องตัว & สนุกสนาน
              </span>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                เลือกชนิดกีฬา
              </label>
              <select
                value={subChoice}
                onChange={(e) => setSubChoice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="แบดมินตัน (Badminton)">แบดมินตัน (Badminton)</option>
                <option value="ฟุตบอล / ฟุตซอล (Football/Futsal)">ฟุตบอล / ฟุตซอล (Football/Futsal)</option>
                <option value="บาสเกตบอล (Basketball)">บาสเกตบอล (Basketball)</option>
                <option value="เทนนิส / ปิงปอง (Tennis/Pingpong)">เทนนิส / ปิงปอง (Tennis/Pingpong)</option>
              </select>
            </div>

            {/* Matching Streamlit Info */}
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-sm">
              <p>
                <strong>ชนิดกีฬา:</strong> {subChoice} | <strong>คำแนะนำ:</strong> เป็นกีฬากึ่งแอโรบิก (Intermittent Sport)
                ช่วยฝึกความคล่องตัว การตัดสินใจ และเผาผลาญพลังงานได้สูงมาก (ประมาณ 400-600 kcal/ชม.)
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">เผาผลาญเฉลี่ย</span>
                <span className="font-bold text-slate-800 text-sm">400 - 600 kcal/ชม.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">รูปแบบพลังงาน</span>
                <span className="font-bold text-slate-800 text-sm">ผสมผสาน Aerobic & Anaerobic</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">ทักษะที่ได้</span>
                <span className="font-bold text-slate-800 text-sm">Agility, Reaction Time</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">การดื่มน้ำ</span>
                <span className="font-bold text-slate-800 text-sm">จิบน้ำทุก 15-20 นาที</span>
              </div>
            </div>
          </div>
        )}

        {/* Built-in Workout Timer / HIIT Stopwatch */}
        <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-sm">นาฬิกาจับเวลาออกกำลังกาย & ตัวจับเวลาเซต (HIIT Timer)</h4>
            </div>

            {/* Timer mode tabs */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => {
                  setTimerMode('stopwatch');
                  setTimerRunning(false);
                }}
                className={`px-3 py-1 rounded-md transition font-medium ${
                  timerMode === 'stopwatch' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                จับเวลาธรรมดา
              </button>
              <button
                onClick={() => {
                  setTimerMode('interval');
                  setTimerRunning(false);
                  setIsRestPhase(false);
                  setPhaseSecondsLeft(intervalWorkSec);
                }}
                className={`px-3 py-1 rounded-md transition font-medium ${
                  timerMode === 'interval' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                โหมด HIIT / Interval
              </button>
            </div>
          </div>

          {timerMode === 'stopwatch' ? (
            <div className="text-center py-4">
              <div className="text-5xl font-mono font-bold tracking-wider text-emerald-400 mb-4">
                {formatTime(seconds)}
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition active:scale-95 ${
                    timerRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                  }`}
                >
                  {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {timerRunning ? 'หยุดชั่วคราว' : 'เริ่มจับเวลา'}
                </button>
                <button
                  onClick={() => {
                    setTimerRunning(false);
                    setSeconds(0);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  รีเซ็ต
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-3">
              <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mb-2">
                <span>
                  รอบที่ <strong className="text-white text-sm">{currentRound}</strong> / {totalRounds}
                </span>
                <span>•</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[11px] ${
                    isRestPhase ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  {isRestPhase ? 'ช่วงพัก (REST)' : 'ช่วงออกกำลังกาย (WORK)'}
                </span>
              </div>

              <div
                className={`text-6xl font-mono font-bold tracking-wider mb-4 transition-colors ${
                  isRestPhase ? 'text-blue-400' : 'text-emerald-400'
                }`}
              >
                {formatTime(phaseSecondsLeft)}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition active:scale-95 ${
                    timerRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                  }`}
                >
                  {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {timerRunning ? 'หยุดชั่วคราว' : 'เริ่มเซต HIIT'}
                </button>
                <button
                  onClick={() => {
                    setTimerRunning(false);
                    setCurrentRound(1);
                    setIsRestPhase(false);
                    setPhaseSecondsLeft(intervalWorkSec);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  รีเซ็ต
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Personal Coach Button */}
        <div className="pt-2">
          <button
            onClick={fetchAiAdvice}
            disabled={aiLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            {aiLoading ? 'กำลังวิเคราะห์แผนออกกำลังกายด้วย AI...' : `🤖 ขอคำแนะนำเฉพาะบุคคลสำหรับ "${subChoice}"`}
          </button>

          {aiAdvice && (
            <div className="mt-4 p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-slate-800 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                {aiAdvice.headline}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{aiAdvice.advice}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <strong className="text-indigo-800 block mb-1">กลยุทธ์โซนชีพจร (HR Zone Strategy)</strong>
                  <p className="text-slate-600">{aiAdvice.hrZoneStrategy}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <strong className="text-indigo-800 block mb-1">กลยุทธ์โภชนาการควบคู่</strong>
                  <p className="text-slate-600">{aiAdvice.nutritionStrategy}</p>
                </div>
              </div>

              {aiAdvice.tips && aiAdvice.tips.length > 0 && (
                <div className="pt-2">
                  <strong className="text-xs text-slate-700 block mb-1.5">เคล็ดลับวิทยาศาสตร์การกีฬา:</strong>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {aiAdvice.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
