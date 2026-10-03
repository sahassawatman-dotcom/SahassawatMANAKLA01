import React, { useState } from 'react';
import {
  Heart,
  Flame,
  Zap,
  Target,
  Activity,
  Scale,
  HeartPulse,
  User,
  Edit3,
  Check,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
  Ruler,
  Droplets,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import {
  ACTIVITY_OPTIONS,
  INITIAL_USER_PROFILE,
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
  // State for toggling edit mode
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);

  // Draft state while editing
  const [draft, setDraft] = useState<UserProfile>(profile);

  // Sync draft whenever profile changes from external or when opening edit mode
  const handleStartEdit = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateProfile(draft);
    setIsEditing(false);
    setShowSaveSuccess(true);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 3500);
  };

  const handleCancelEdit = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const handleResetDefault = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลส่วนตัวเป็นค่าเริ่มต้นหรือไม่?')) {
      setDraft(INITIAL_USER_PROFILE);
      onUpdateProfile(INITIAL_USER_PROFILE);
      setIsEditing(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  };

  // Calculations
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityFactor);
  const weightLossTarget = tdee - 500;
  const muscleGainTarget = tdee + 350;
  const bmiInfo = calculateBMI(profile.weight, profile.height);
  const hrData = calculateHeartRateZones(profile.age);

  // Waist-to-Height Ratio (WHtR)
  const waist = profile.waistCm || 80;
  const whtr = Number((waist / profile.height).toFixed(2));
  const isHealthyWaist = whtr <= 0.5;

  // Weight Difference
  const targetW = profile.targetWeight || profile.weight;
  const weightDiff = Number((profile.weight - targetW).toFixed(1));

  // Recommended Water
  const waterLiters = (profile.weight * 0.033).toFixed(1);

  // Interactive pulse test slider
  const [testPulse, setTestPulse] = useState<number>(hrData.zone2Min + 5);

  // Find active zone for test pulse
  const currentPulseZone = hrData.zones.find(
    (z) => testPulse >= z.minHr && testPulse <= z.maxHr
  ) || (testPulse < hrData.zones[0].minHr ? hrData.zones[0] : hrData.zones[4]);

  return (
    <div className="space-y-6">
      {/* Save Success Alert Notification */}
      {showSaveSuccess && (
        <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว!</p>
              <p className="text-xs text-emerald-100">
                ระบบคำนวณ BMR, TDEE, แคลอรี และโซนชีพจรใหม่ให้คุณอัตโนมัติ
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSaveSuccess(false)}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition"
          >
            ตกลง
          </button>
        </div>
      )}

      {/* SECTION 1: Personal Profile Summary & Edit Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Profile Card Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 flex items-center justify-center text-white shrink-0 shadow-inner">
              <User className="w-9 h-9 text-blue-100" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight">
                  {profile.name || 'คุณผู้รักสุขภาพ'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30">
                  {profile.gender === 'Male' ? 'ชาย ♂' : 'หญิง ♀'} • {profile.age} ปี
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400 text-slate-900 flex items-center gap-1 shadow-sm">
                  <Award className="w-3 h-3" />
                  {profile.fitnessGoal === 'weight_loss'
                    ? 'เป้าหมาย: ลดไขมัน'
                    : profile.fitnessGoal === 'muscle_gain'
                    ? 'เป้าหมาย: เพิ่มกล้ามเนื้อ'
                    : 'เป้าหมาย: รักษาสุขภาพ'}
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-1 flex items-center gap-2 flex-wrap">
                <span>น้ำหนัก: <strong>{profile.weight} กก.</strong></span>
                <span>•</span>
                <span>ส่วนสูง: <strong>{profile.height} ซม.</strong></span>
                <span>•</span>
                <span>BMI: <strong>{bmiInfo.bmi} ({bmiInfo.category})</strong></span>
              </p>
            </div>
          </div>

          {/* Edit Profile Action Button */}
          <div className="flex items-center gap-2 self-start md:self-center">
            {!isEditing ? (
              <button
                onClick={handleStartEdit}
                className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 active:scale-95 font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
              >
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>แก้ไขข้อมูลส่วนตัว</span>
              </button>
            ) : (
              <button
                onClick={handleCancelEdit}
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-medium text-xs rounded-xl border border-white/20 transition flex items-center gap-1.5"
              >
                <span>ยกเลิกการแก้ไข</span>
              </button>
            )}
          </div>
        </div>

        {/* Edit Form (Expanded when isEditing is true) */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="p-5 sm:p-6 bg-blue-50/40 border-b border-slate-200 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  แบบฟอร์มแก้ไขข้อมูลส่วนตัว (Edit Personal Profile)
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                กรอกข้อมูลแล้วกดปุ่ม "บันทึกข้อมูลส่วนตัว" ด้านล่าง
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Display Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ / ชื่อเรียกประจำตัว
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น คุณสมชาย หรือ นามแฝง"
                  value={draft.name || ''}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition shadow-xs"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อายุ (ปี)
                </label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  required
                  value={draft.age}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      age: Math.max(5, Math.min(100, Number(e.target.value) || 0)),
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition shadow-xs"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เพศสภาพ
                </label>
                <select
                  value={draft.gender}
                  onChange={(e) => setDraft({ ...draft, gender: e.target.value as 'Male' | 'Female' })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition shadow-xs"
                >
                  <option value="Male">ชาย (Male)</option>
                  <option value="Female">หญิง (Female)</option>
                </select>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  น้ำหนักปัจจุบัน (กก.)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={20}
                  max={250}
                  required
                  value={draft.weight}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      weight: Math.max(20, Math.min(250, Number(e.target.value) || 0)),
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition shadow-xs"
                />
              </div>

              {/* Target Weight */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  น้ำหนักเป้าหมาย (กก.)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={20}
                  max={250}
                  value={draft.targetWeight || draft.weight}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      targetWeight: Math.max(20, Math.min(250, Number(e.target.value) || 0)),
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition shadow-xs"
                />
              </div>

              {/* Height */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ส่วนสูง (ซม.)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={80}
                  max={240}
                  required
                  value={draft.height}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      height: Math.max(80, Math.min(240, Number(e.target.value) || 0)),
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition shadow-xs"
                />
              </div>

              {/* Waist Circumference */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รอบเอว (ซม.)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={40}
                  max={180}
                  value={draft.waistCm || 80}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      waistCm: Math.max(40, Math.min(180, Number(e.target.value) || 0)),
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition shadow-xs"
                />
              </div>

              {/* Fitness Goal */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เป้าหมายสุขภาพและฟิตเนส
                </label>
                <select
                  value={draft.fitnessGoal}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      fitnessGoal: e.target.value as 'weight_loss' | 'maintain' | 'muscle_gain',
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition shadow-xs"
                >
                  <option value="weight_loss">🔥 ลดน้ำหนัก / ลดไขมัน (Calorie Deficit -500 kcal)</option>
                  <option value="maintain">⚖️ รักษาน้ำหนัก / เพื่อสุขภาพที่แข็งแรง (Maintain TDEE)</option>
                  <option value="muscle_gain">💪 เพิ่มมวลกล้ามเนื้อ / เพิ่มน้ำหนักดี (Calorie Surplus +350 kcal)</option>
                </select>
              </div>

              {/* Activity Level */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ระดับกิจกรรมประจำวัน (Activity Factor)
                </label>
                <select
                  value={draft.activityFactor}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      activityFactor: Number(e.target.value) as 1.2 | 1.375 | 1.55 | 1.725,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition shadow-xs"
                >
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.value} - {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleResetDefault}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                รีเซ็ตค่าเริ่มต้น
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
                >
                  <Check className="w-4 h-4" />
                  บันทึกข้อมูลส่วนตัว (Save)
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Profile Quick Stats Bar when not editing */
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-500 block text-[11px]">เป้าหมายน้ำหนัก</span>
              <span className="font-bold text-slate-800 text-sm">
                {targetW} กก.{' '}
                <span className={`text-xs font-semibold ${weightDiff > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  ({weightDiff > 0 ? `อีก -${weightDiff} กก.` : weightDiff < 0 ? `+${Math.abs(weightDiff)} กก.` : 'ถึงเป้าหมายแล้ว!'})
                </span>
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-500 block text-[11px]">สัดส่วนรอบเอว/ส่วนสูง</span>
              <span className="font-bold text-slate-800 text-sm">
                {waist} ซม.{' '}
                <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${isHealthyWaist ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {isHealthyWaist ? 'มาตรฐานดี' : 'ควรระวังเอว'}
                </span>
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-500 block text-[11px]">น้ำดื่มแนะนำต่อวัน</span>
              <span className="font-bold text-blue-600 text-sm flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" /> ~{waterLiters} ลิตร
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-500 block text-[11px]">ระดับกิจกรรม</span>
              <span className="font-bold text-slate-800 text-sm truncate block" title={ACTIVITY_OPTIONS.find(a => a.value === profile.activityFactor)?.label}>
                {profile.activityFactor} เท่า ({ACTIVITY_OPTIONS.find(a => a.value === profile.activityFactor)?.label.split(' ')[0]})
              </span>
            </div>
          </div>
        )}
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
            <span className="text-xs font-semibold tracking-wide uppercase">
              {profile.fitnessGoal === 'muscle_gain' ? 'เป้าหมายเพิ่มกล้าม (+350 kcal)' : 'เป้าหมายลดไขมัน (-500 kcal)'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {(profile.fitnessGoal === 'muscle_gain' ? muscleGainTarget : weightLossTarget).toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-500">kcal</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {profile.fitnessGoal === 'muscle_gain'
              ? 'Calorie Surplus เล็กน้อย ช่วยสร้างกล้ามเนื้อโดยไม่สะสมไขมันเกิน'
              : 'Calorie Deficit ลดน้ำหนักได้ประมาณ 0.5 กก./สัปดาห์ อย่างปลอดภัย'}
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
