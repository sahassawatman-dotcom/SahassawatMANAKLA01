import React, { useState, useRef } from 'react';
import {
  Utensils,
  Plus,
  Upload,
  FileSpreadsheet,
  FileText,
  Trash2,
  Sparkles,
  Camera,
  CheckCircle,
  AlertCircle,
  PieChart,
  Edit2,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FoodItem, MealTime, NutritionZone, UserProfile } from '../types';
import { INITIAL_FOOD_DATABASE } from '../utils/fitnessCalculations';
import { exportToCSV, exportToExcel } from '../utils/exportReports';

interface Props {
  profile: UserProfile;
  meals: FoodItem[];
  onAddMeal: (item: Omit<FoodItem, 'id'>) => void;
  onDeleteMeal: (id: string) => void;
  onClearMeals: () => void;
  tdee: number;
}

export const TabNutritionLog: React.FC<Props> = ({
  profile,
  meals,
  onAddMeal,
  onDeleteMeal,
  onClearMeals,
  tdee,
}) => {
  // Predefined food selection
  const [mealTime, setMealTime] = useState<MealTime>('มื้อเช้า');
  const [selectedFood, setSelectedFood] = useState<string>('ข้าวกะเพราไก่ไข่ดาว');

  // Custom manual entry modal
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState<number>(350);
  const [customPro, setCustomPro] = useState<number>(25);
  const [customCarbs, setCustomCarbs] = useState<number>(30);
  const [customFat, setCustomFat] = useState<number>(10);
  const [customZone, setCustomZone] = useState<NutritionZone>('🟢 Green Zone');
  const [customAdvice, setCustomAdvice] = useState('');

  // AI Food Scanner state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [aiScanResult, setAiScanResult] = useState<{
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    zone: NutritionZone;
    advice: string;
    ingredients?: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Totals
  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + (m.fat || 0), 0);

  // Target Protein (approx 1.6g per kg of bodyweight)
  const targetProtein = Math.round(profile.weight * 1.6);
  const caloriePercent = Math.min(100, Math.round((totalCalories / tdee) * 100));

  // Add predefined meal
  const handleAddPredefined = () => {
    const item = INITIAL_FOOD_DATABASE[selectedFood];
    if (!item) return;

    onAddMeal({
      mealTime,
      name: selectedFood,
      calories: item.cal,
      protein: item.pro,
      carbs: item.carbs,
      fat: item.fat,
      zone: item.zone,
      advice: item.advice,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    });

    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  };

  // Add custom meal
  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    onAddMeal({
      mealTime,
      name: customName.trim(),
      calories: Number(customCal) || 0,
      protein: Number(customPro) || 0,
      carbs: Number(customCarbs) || 0,
      fat: Number(customFat) || 0,
      zone: customZone,
      advice: customAdvice.trim() || 'เมนูที่บันทึกด้วยตนเอง',
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    });

    setCustomName('');
    setShowCustomModal(false);
  };

  // Handle File Upload for AI Scan
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setAiScanResult(null);

      // Automatically trigger scan
      await scanFoodImage(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const scanFoodImage = async (base64: string, mimeType: string) => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/scan-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
        }),
      });

      if (!res.ok) {
        throw new Error('เกิดข้อผิดพลาดในการวิเคราะห์ภาพอาหาร');
      }

      const result = await res.json();
      setAiScanResult(result);
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ AI');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddAiScannedMeal = () => {
    if (!aiScanResult) return;

    onAddMeal({
      mealTime,
      name: aiScanResult.foodName,
      calories: aiScanResult.calories,
      protein: aiScanResult.protein,
      carbs: aiScanResult.carbs,
      fat: aiScanResult.fat,
      zone: aiScanResult.zone,
      advice: aiScanResult.advice,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    });

    setAiScanResult(null);
    setImagePreview(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              ส่วนที่ 3: บันทึกประวัติอาหาร & ส่งออกรายงาน (Excel & CSV)
            </h2>
            <p className="text-xs text-slate-500">
              บันทึกมื้ออาหาร เลือกจากฐานข้อมูล หรือใช้ AI สแกนภาพอาหาร พร้อมส่งออกรายงานไฟล์ Excel (.xlsx) และ CSV
            </p>
          </div>
        </div>

        {/* Nutritional Summary Progress Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">พลังงานวันนี้</span>
              <span className="font-bold text-slate-900">
                {totalCalories} / {tdee} kcal
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  totalCalories > tdee ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {totalCalories > tdee
                ? `เกิน TDEE ${totalCalories - tdee} kcal`
                : `เหลือได้อีก ${tdee - totalCalories} kcal`}
            </span>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">โปรตีน (Protein)</span>
            <span className="text-lg font-bold text-blue-600">{totalProtein}g</span>
            <span className="text-[11px] text-slate-400 block">เป้าหมาย: ~{targetProtein}g</span>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">คาร์โบไฮเดรต (Carbs)</span>
            <span className="text-lg font-bold text-amber-600">{totalCarbs}g</span>
            <span className="text-[11px] text-slate-400 block">พลังงานหลัก</span>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">ไขมัน (Fat)</span>
            <span className="text-lg font-bold text-purple-600">{totalFat}g</span>
            <span className="text-[11px] text-slate-400 block">ไขมันดีช่วยดูดซึมวิตามิน</span>
          </div>
        </div>
      </div>

      {/* Input Section: 2 Columns like Streamlit col_f1 and col_f2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Predefined Food Database & Manual Entry */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              🍽️ เลือกจากเมนูอาหารยอดนิยม
            </h3>
            <button
              onClick={() => setShowCustomModal(true)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> พิมพ์เมนูเอง
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                เลือกมื้ออาหาร
              </label>
              <select
                value={mealTime}
                onChange={(e) => setMealTime(e.target.value as MealTime)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="มื้อเช้า">มื้อเช้า (Breakfast)</option>
                <option value="มื้อกลางวัน">มื้อกลางวัน (Lunch)</option>
                <option value="มื้อเย็น">มื้อเย็น (Dinner)</option>
                <option value="ของว่าง">ของว่าง / มื้อว่าง (Snack)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                เลือกเมนูอาหาร
              </label>
              <select
                value={selectedFood}
                onChange={(e) => setSelectedFood(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Object.keys(INITIAL_FOOD_DATABASE).map((food) => (
                  <option key={food} value={food}>
                    {food} ({INITIAL_FOOD_DATABASE[food].cal} kcal)
                  </option>
                ))}
              </select>
            </div>

            {/* Food Preview Card */}
            {INITIAL_FOOD_DATABASE[selectedFood] && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">{selectedFood}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-semibold ${
                      INITIAL_FOOD_DATABASE[selectedFood].zone.includes('Green')
                        ? 'bg-emerald-100 text-emerald-800'
                        : INITIAL_FOOD_DATABASE[selectedFood].zone.includes('Yellow')
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {INITIAL_FOOD_DATABASE[selectedFood].zone}
                  </span>
                </div>
                <div className="flex gap-4 text-slate-600 pt-1">
                  <span>🔥 {INITIAL_FOOD_DATABASE[selectedFood].cal} kcal</span>
                  <span>🥩 โปรตีน {INITIAL_FOOD_DATABASE[selectedFood].pro}g</span>
                  <span>🍚 คาร์บ {INITIAL_FOOD_DATABASE[selectedFood].carbs}g</span>
                  <span>🥑 ไขมัน {INITIAL_FOOD_DATABASE[selectedFood].fat}g</span>
                </div>
                <p className="text-slate-500 italic pt-1 border-t border-slate-200/60">
                  💡 {INITIAL_FOOD_DATABASE[selectedFood].advice}
                </p>
              </div>
            )}

            <button
              onClick={handleAddPredefined}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4" /> บันทึกเมนูอาหารนี้
            </button>
          </div>
        </div>

        {/* Column 2: AI Scan Image with Gemini (Matching col_f2) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              📸 อัปโหลดภาพอาหาร (AI Scan)
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Gemini 3.8 Flash Vision
            </span>
          </div>

          <div className="space-y-3">
            {/* Upload & Camera Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-600 text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition"
              >
                <Upload className="w-5 h-5 text-blue-600" />
                <span>เลือกรูปจากแกลเลอรี</span>
              </button>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="py-3 px-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-600 text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition"
              >
                <Camera className="w-5 h-5 text-emerald-600" />
                <span>ถ่ายรูปอาหารสด</span>
              </button>
            </div>

            {/* Scanning Status */}
            {isScanning && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center space-y-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-blue-700 font-medium">
                  AI กำลังวิเคราะห์วัตถุดิบ แคลอรี และโซนโภชนาการ...
                </p>
              </div>
            )}

            {/* Image Preview & AI Result */}
            {imagePreview && !isScanning && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={imagePreview}
                    alt="Food Scan"
                    className="w-20 h-20 rounded-lg object-cover border border-slate-300 shadow-sm shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    {aiScanResult ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 text-sm truncate">
                            {aiScanResult.foodName}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                          {aiScanResult.zone} • {aiScanResult.calories} kcal
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          P: {aiScanResult.protein}g | C: {aiScanResult.carbs}g | F: {aiScanResult.fat}g
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">พร้อมวิเคราะห์</p>
                    )}
                  </div>
                </div>

                {aiScanResult && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
                    <p className="text-slate-600">
                      <strong>คำแนะนำ AI:</strong> {aiScanResult.advice}
                    </p>
                    {aiScanResult.ingredients && aiScanResult.ingredients.length > 0 && (
                      <p className="text-slate-500 text-[11px]">
                        <strong>ส่วนประกอบ:</strong> {aiScanResult.ingredients.join(', ')}
                      </p>
                    )}
                    <button
                      onClick={handleAddAiScannedMeal}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" /> ➕ เพิ่มเมนูจาก AI ลงตาราง
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Meal History Table (Matching Streamlit Table & Export Buttons) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              📋 ตารางบันทึกประวัติการรับประทานอาหารวันนี้
            </h3>
            <p className="text-xs text-slate-500">
              บันทึกแล้วทั้งหมด {meals.length} รายการ (รวม {totalCalories} kcal)
            </p>
          </div>

          {/* Export and Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportToExcel(meals, profile)}
              disabled={meals.length === 0}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              📥 ดาวน์โหลดรายงาน (Excel .xlsx)
            </button>

            <button
              onClick={() => exportToCSV(meals)}
              disabled={meals.length === 0}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <FileText className="w-4 h-4" />
              📥 ดาวน์โหลดรายงาน (CSV)
            </button>

            {meals.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างประวัติอาหารทั้งหมด?')) {
                    onClearMeals();
                  }
                }}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-rose-200 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                🗑️ ล้างประวัติทั้งหมด
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        {meals.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">มื้ออาหาร</th>
                  <th className="py-3 px-3.5">ชื่อเมนู</th>
                  <th className="py-3 px-3.5 text-right">แคลอรี (kcal)</th>
                  <th className="py-3 px-3.5 text-right">โปรตีน (g)</th>
                  <th className="py-3 px-3.5 text-right">คาร์บ (g)</th>
                  <th className="py-3 px-3.5 text-right">ไขมัน (g)</th>
                  <th className="py-3 px-3.5">โซนโภชนาการ</th>
                  <th className="py-3 px-3.5">คำแนะนำ</th>
                  <th className="py-3 px-3.5 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {meals.map((meal) => (
                  <tr key={meal.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {meal.mealTime}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-bold text-slate-800">
                      {meal.name}
                    </td>
                    <td className="py-3 px-3.5 text-right font-semibold text-slate-900">
                      {meal.calories}
                    </td>
                    <td className="py-3 px-3.5 text-right text-blue-600 font-semibold">
                      {meal.protein}
                    </td>
                    <td className="py-3 px-3.5 text-right text-amber-600 font-semibold">
                      {meal.carbs}
                    </td>
                    <td className="py-3 px-3.5 text-right text-purple-600 font-semibold">
                      {meal.fat}
                    </td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          meal.zone.includes('Green')
                            ? 'bg-emerald-100 text-emerald-800'
                            : meal.zone.includes('Yellow')
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {meal.zone}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 max-w-xs truncate text-[11px]">
                      {meal.advice || '-'}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <button
                        onClick={() => onDeleteMeal(meal.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50/80 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan={2} className="py-3 px-3.5 text-slate-800">
                    รวมทั้งสิ้น ({meals.length} รายการ)
                  </td>
                  <td className="py-3 px-3.5 text-right text-slate-900 font-bold text-sm">
                    {totalCalories} kcal
                  </td>
                  <td className="py-3 px-3.5 text-right text-blue-700">
                    {totalProtein}g
                  </td>
                  <td className="py-3 px-3.5 text-right text-amber-700">
                    {totalCarbs}g
                  </td>
                  <td className="py-3 px-3.5 text-right text-purple-700">
                    {totalFat}g
                  </td>
                  <td colSpan={3} className="py-3 px-3.5 text-slate-500 text-xs">
                    {totalCalories <= tdee ? '🟢 อยู่ในเกณฑ์ TDEE' : '⚠️ เกินเกณฑ์ TDEE'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Utensils className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-medium text-sm">ยังไม่มีรายการอาหารที่บันทึกในวันนี้</p>
            <p className="text-xs text-slate-400 mt-0.5">
              เลือกเมนูด้านบนหรือใช้กล้อง AI สแกนอาหารเพื่อเริ่มบันทึก
            </p>
          </div>
        )}
      </div>

      {/* Manual Custom Food Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-slate-800">เพิ่มเมนูอาหารด้วยตนเอง</h4>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustom} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">ชื่อเมนูอาหาร</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ข้าวผัดไข่ใส่กุ้ง"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">แคลอรี (kcal)</label>
                  <input
                    type="number"
                    min={0}
                    value={customCal}
                    onChange={(e) => setCustomCal(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">โปรตีน (g)</label>
                  <input
                    type="number"
                    min={0}
                    value={customPro}
                    onChange={(e) => setCustomPro(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">คาร์โบไฮเดรต (g)</label>
                  <input
                    type="number"
                    min={0}
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">ไขมัน (g)</label>
                  <input
                    type="number"
                    min={0}
                    value={customFat}
                    onChange={(e) => setCustomFat(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">โซนโภชนาการ</label>
                <select
                  value={customZone}
                  onChange={(e) => setCustomZone(e.target.value as NutritionZone)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg outline-none"
                >
                  <option value="🟢 Green Zone">🟢 Green Zone (อาหารสุขภาพ ไขมันต่ำ)</option>
                  <option value="🟡 Yellow Zone">🟡 Yellow Zone (ทานได้ปานกลาง)</option>
                  <option value="🔴 Red Zone">🔴 Red Zone (ของหวาน ของทอด โซเดียมสูง)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">คำแนะนำเพิ่มเติม</label>
                <input
                  type="text"
                  placeholder="เช่น ทอดด้วยน้ำมันรำข้าว"
                  value={customAdvice}
                  onChange={(e) => setCustomAdvice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm"
                >
                  บันทึกลงตาราง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
