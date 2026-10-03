import React, { useState } from 'react';
import { Heart, Flame, Zap, Target, Activity, Info, Scale, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import { UserProfile } from '../types';
import {
  ACTIVITY_OPTIONS,
  calculateBMI,
  calculateBMR,
  calculateHeartRateZones,
  calculateTDEE,
} from '../utils/fitnessCalculations';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const TabHealthOverview: React.FC<Props> = ({ profile, onUpdateProfile }) => {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityFactor);
  const weightLossTarget = tdee - 500;
  const muscleGainTarget = tdee + 350;
  const bmiInfo = calculateBMI(profile.weight, profile.height);
  const hrData = calculateHeartRateZones(profile.age);

  // Interactive pulse test slider
  const [testPulse, setTestPulse] = useState<number>(hrData.zone2Min + 5);

  // Find active zone for test pulse
  const currentPulseZone = hrData.zones.find(
    (z) => testPulse >= z.minHr && testPulse <= z.maxHr
  ) || (testPulse < hrData.zones[0].minHr ? hrData.zones[0] : hrData.zones[4]);

  return (
    <div className="space-y-6">
      {/* Section 1 Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              ส่วนที่ 1: ข้อมูลส่วนตัว, พลังงาน (BMR/TDEE) และคำนวณโซนชีพจร
            </h2>
            <p className="text-xs text-slate-500">
              กรอกข้อมูลส่วนบุคคลเพื่อคำนวณการเผาผลาญพื้นฐานและระดับความหนักในการออกกำลังกายที่เหมาะสม
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Age */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              อายุ (ปี)
            </label>
            <input
              type="number"
              min={5}
              max={100}
              value={profile.age}
              onChange={(e) => onUpdateProfile({ age: Math.max(5, Math.min(100, Number(e.target.value) || 0)) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              เพศ
            </label>
            <select
              value={profile.gender}
              onChange={(e) => onUpdateProfile({ gender: e.target.value as 'Male' | 'Female' })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
            >
              <option value="Male">ชาย (Male)</option>
              <option value="Female">หญิง (Female)</option>
            </select>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              น้ำหนัก (กก.)
            </label>
            <input
              type="number"
              step="0.5"
              min={20}
              max={250}
              value={profile.weight}
              onChange={(e) => onUpdateProfile({ weight: Math.max(20, Math.min(250, Number(e.target.value) || 0)) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              ส่วนสูง (ซม.)
            </label>
            <input
              type="number"
              step="1"
              min={80}
              max={240}
              value={profile.height}
              onChange={(e) => onUpdateProfile({ height: Math.max(80, Math.min(240, Number(e.target.value) || 0)) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
            />
          </div>
        </div>

        {/* Activity Level */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            ระดับกิจกรรมประจำวัน (Activity Factor)
          </label>
          <select
            value={profile.activityFactor}
            onChange={(e) => onUpdateProfile({ activityFactor: Number(e.target.value) as 1.2 | 1.375 | 1.55 | 1.725 })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
          >
            {ACTIVITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.value} - {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Energy Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* BMR */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">BMR (พลังงานพื้นฐานขณะพัก)</span>
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {bmr.toLocaleString()} <span className="text-sm font-normal text-slate-500">kcal</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            พลังงานที่ร่างกายต้องใช้เพื่อการมีชีวิตรอด (อวัยวะภายในทำงาน)
          </p>
        </div>

        {/* TDEE */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">TDEE (พลังงานที่ใช้ต่อวัน)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {tdee.toLocaleString()} <span className="text-sm font-normal text-slate-500">kcal</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            รวม BMR และกิจกรรมประจำวัน ทานเท่านี้เพื่อรักษาน้ำหนักเดิม
          </p>
        </div>

        {/* Weight Loss Target */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">เป้าหมายลดไขมัน (-500 kcal)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {weightLossTarget.toLocaleString()} <span className="text-sm font-normal text-slate-500">kcal</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calorie Deficit ลดน้ำหนักได้ประมาณ 0.5 กก./สัปดาห์ อย่างปลอดภัย
          </p>
        </div>

        {/* BMI */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:border-purple-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">BMI ดัชนีมวลกาย</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800">{bmiInfo.bmi}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${bmiInfo.color}`}>
              {bmiInfo.category}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {bmiInfo.advice}
          </p>
        </div>
      </div>

      {/* Heart Rate Zones Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                เครื่องคำนวณโซนอัตราการเต้นของหัวใจ (Heart Rate Zones)
              </h3>
              <p className="text-xs text-slate-500">
                คำนวณจากสูตรมาตรฐาน Max HR = 220 - อายุ ({profile.age} ปี) = <strong>{hrData.maxHr} bpm</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 font-medium">
              Max HR: {hrData.maxHr} bpm
            </span>
          </div>
        </div>

        {/* 3 Metric Highlights matching prompt */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-lg">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Max Heart Rate (ชีพจรสูงสุด)</p>
              <p className="text-xl font-bold text-slate-800">{hrData.maxHr} <span className="text-sm font-normal text-slate-500">bpm</span></p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg">
              Z2
            </div>
            <div>
              <p className="text-xs text-emerald-800 uppercase font-semibold">Zone 2 (เผาผลาญไขมัน / คาร์ดิโอ)</p>
              <p className="text-xl font-bold text-emerald-700">
                {hrData.zone2Min} - {hrData.zone2Max} <span className="text-sm font-normal text-emerald-600">bpm</span>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-lg">
              Z4
            </div>
            <div>
              <p className="text-xs text-orange-800 uppercase font-semibold">Zone 4-5 (พัฒนาความอึด / HIIT)</p>
              <p className="text-xl font-bold text-orange-700">
                {hrData.zone4Min} - {hrData.zone4Max}+ <span className="text-sm font-normal text-orange-600">bpm</span>
              </p>
            </div>
          </div>
        </div>

        {/* Heart Rate Zones Visual List */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-700 mb-2">รายละเอียดทั้ง 5 โซนชีพจร</h4>
          {hrData.zones.map((zone) => {
            const isZone2 = zone.zone === 2;
            const isZone4 = zone.zone === 4;

            return (
              <div
                key={zone.zone}
                className={`p-4 rounded-xl border transition-all ${
                  isZone2
                    ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300'
                    : isZone4
                    ? 'bg-orange-50/70 border-orange-300 ring-1 ring-orange-300'
                    : 'bg-slate-50/50 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center ${zone.bgColor}`}
                    >
                      Z{zone.zone}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-slate-800">
                        Zone {zone.zone}: {zone.name}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">
                        ({zone.nameEn})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {zone.percentRange}
                    </span>
                    <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {zone.minHr} - {zone.maxHr} bpm
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200/60">
                  <p>
                    <strong className="text-slate-700">ความรู้สึก:</strong> {zone.description}
                  </p>
                  <p>
                    <strong className="text-slate-700">ประโยชน์หลัก:</strong> {zone.benefits}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Pulse Interactive Simulator */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 border border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase">ทดสอบค่าชีพจรปัจจุบัน (Pulse Simulator)</span>
              <p className="text-xs text-slate-500">เลื่อนแถบเพื่อดูว่าระดับชีพจรขณะออกกำลังกายของคุณจัดอยู่ในโซนใด</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-blue-700">{testPulse} bpm</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${currentPulseZone.bgColor}`}>
                Zone {currentPulseZone.zone} ({currentPulseZone.nameEn})
              </span>
            </div>
          </div>

          <input
            type="range"
            min={Math.round(hrData.maxHr * 0.45)}
            max={hrData.maxHr}
            value={testPulse}
            onChange={(e) => setTestPulse(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>พักผ่อน (Rest)</span>
            <span className="text-emerald-600 font-semibold">Zone 2 (Fat Burn)</span>
            <span className="text-orange-600 font-semibold">Zone 4 (HIIT)</span>
            <span className="text-red-600 font-semibold">Max ({hrData.maxHr})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
