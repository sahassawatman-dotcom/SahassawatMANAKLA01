import React from 'react';
import { UserCheck, Moon, Droplets, ShieldAlert, Award, Clock, Heart, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
}

export const TabAgeGuidance: React.FC<Props> = ({ profile }) => {
  const { age, weight } = profile;

  // Calculate recommended daily water intake: weight (kg) * 33 ml
  const waterLiters = (weight * 0.033).toFixed(1);

  const isChild = age < 18;
  const isYoungAdult = age >= 18 && age <= 40;
  const isMiddleAge = age > 40 && age < 50;
  const isSenior = age >= 50;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              ส่วนที่ 4: คำแนะนำการออกกำลังกายและการพักผ่อนตามช่วงวัย
            </h2>
            <p className="text-xs text-slate-500">
              มาตรฐานวิทยาศาสตร์การกีฬาและสาธารณสุข ออกแบบตามสรีรวิทยาของแต่ละช่วงวัย
            </p>
          </div>
        </div>

        {/* Current User Age Badge */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {age}
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-900 uppercase">
                อายุของคุณในปัจจุบัน: {age} ปี
              </span>
              <p className="text-sm font-bold text-slate-800">
                {isChild && '🧒 วัยเด็กและเยาวชน (7-17 ปี)'}
                {isYoungAdult && '🧑 วัยหนุ่มสาว / วัยทำงาน (18-40 ปี)'}
                {isMiddleAge && '🧔 วัยผู้ใหญ่ตอนกลาง (41-49 ปี)'}
                {isSenior && '🧓 วัย 50 ปีขึ้นไปและผู้สูงอายุ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white text-blue-700 text-xs font-semibold rounded-lg shadow-sm border border-blue-100">
              💧 ควรดื่มน้ำ: ~{waterLiters} ลิตร/วัน
            </span>
          </div>
        </div>
      </div>

      {/* Main Age Card Highlighting Matching User Age */}
      <div className="space-y-4">
        {/* Child */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isChild
              ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400 shadow-md'
              : 'bg-white border-slate-200 opacity-80'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              🧒 วัยเด็กและเยาวชน (7-17 ปี)
              {isChild && (
                <span className="px-2 py-0.5 text-[11px] bg-emerald-600 text-white rounded-full font-semibold">
                  ช่วงวัยของคุณ
                </span>
              )}
            </h3>
            <span className="text-xs font-medium text-slate-500">60 นาที/วัน</span>
          </div>
          <p className="text-sm text-slate-700 mb-3">
            <strong>คำแนะนำหลัก:</strong> เน้นกิจกรรมเคลื่อนไหวสนุกสนาน กีฬาเป็นทีม เช่น วิ่งเล่น ฟุตบอล แบดมินตัน หรือกระโดดเชือก วันละ 60 นาที นอนหลับ 9-11 ชั่วโมงเพื่อกระตุ้นการหลั่ง Growth Hormone
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700 block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" /> การออกกำลังกาย
              </span>
              <span className="text-slate-600">อย่างน้อย 60 นาทีต่อวัน (ปานกลาง-หนัก)</span>
            </div>
            <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700 block flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-indigo-600" /> การนอนหลับ
              </span>
              <span className="text-slate-600">9 - 11 ชั่วโมง (เข้านอนก่อน 22:00 น.)</span>
            </div>
            <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700 block flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> ข้อควรระวัง
              </span>
              <span className="text-slate-600">เลี่ยงการยกน้ำหนักเกินตัวที่กดทับข้อต่อ</span>
            </div>
          </div>
        </div>

        {/* Young Adult */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isYoungAdult
              ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400 shadow-md'
              : 'bg-white border-slate-200 opacity-80'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              🧑 วัยหนุ่มสาว / วัยทำงาน (18-40 ปี)
              {isYoungAdult && (
                <span className="px-2 py-0.5 text-[11px] bg-blue-600 text-white rounded-full font-semibold">
                  ช่วงวัยของคุณ
                </span>
              )}
            </h3>
            <span className="text-xs font-medium text-slate-500">150-300 นาที/สัปดาห์</span>
          </div>
          <p className="text-sm text-slate-700 mb-3">
            <strong>คำแนะนำหลัก:</strong> ผสมผสานคาร์ดิโอ (Zone 2) 150-300 นาที/สัปดาห์ และเวทเทรนนิ่ง 3-5 วัน/สัปดาห์ เพื่อรักษามวลกล้ามเนื้อและระบบเผาผลาญ นอนหลับ 7-8 ชั่วโมง
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700 block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> การออกกำลังกาย
              </span>
              <span className="text-slate-600">Cardio Zone 2 + เวทเทรนนิ่ง 3-5 วัน</span>
            </div>
            <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700 block flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-indigo-600" /> การนอนหลับ
              </span>
              <span className="text-slate-600">7 - 8 ชั่วโมง ซ่อมแซมกล้ามเนื้อ</span>
            </div>
            <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700 block flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-600" /> เป้าหมายสุขภาพ
              </span>
              <span className="text-slate-600">ควบคุมไขมันสะสม ป้องกันออฟฟิศซินโดรม</span>
            </div>
          </div>
        </div>

        {/* Middle Age & Senior */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isSenior || isMiddleAge
              ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400 shadow-md'
              : 'bg-white border-slate-200 opacity-80'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              🧓 วัย 50 ปีขึ้นไปและผู้สูงอายุ
              {(isSenior || isMiddleAge) && (
                <span className="px-2 py-0.5 text-[11px] bg-amber-600 text-white rounded-full font-semibold">
                  ช่วงวัยของคุณ
                </span>
              )}
            </h3>
            <span className="text-xs font-medium text-slate-500">150 นาที/สัปดาห์ (Low-Impact)</span>
          </div>
          <p className="text-sm text-slate-700 mb-3">
            <strong>คำแนะนำหลัก:</strong> เน้นกิจกรรมแรงกระแทกต่ำ (Low-Impact) เช่น เดินเร็ว โยคะ ว่ายน้ำ หรือปั่นจักรยานเบาๆ เพื่อถนอมข้อต่อ และฝึก Balance ฝึกการทรงตัวเพื่อป้องกันการหกล้ม
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700 block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> การออกกำลังกาย
              </span>
              <span className="text-slate-600">เดินเร็ว ปั่นจักรยาน ว่ายน้ำ สัปดาห์ละ 150 นาที</span>
            </div>
            <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700 block flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-indigo-600" /> การนอนหลับ
              </span>
              <span className="text-slate-600">7 - 8 ชั่วโมง งดกาเฟอีนช่วงบ่าย</span>
            </div>
            <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700 block flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> ข้อควรระวัง
              </span>
              <span className="text-slate-600">วอร์มอัพนานขึ้น หลีกเลี่ยงการเคลื่อนไหวกระตุกเร็ว</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
