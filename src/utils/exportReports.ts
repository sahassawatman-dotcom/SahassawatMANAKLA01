import * as XLSX from 'xlsx';
import { FoodItem, UserProfile } from '../types';
import { calculateBMI, calculateBMR, calculateTDEE } from './fitnessCalculations';

export function exportToExcel(meals: FoodItem[], profile: UserProfile) {
  if (meals.length === 0) {
    alert('ไม่มีข้อมูลมื้ออาหารสำหรับส่งออก');
    return;
  }

  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityFactor);
  const bmiInfo = calculateBMI(profile.weight, profile.height);

  // Main meal records
  const mealRows: Record<string, unknown>[] = meals.map((m, idx) => ({
    'ลำดับ (No.)': idx + 1,
    'มื้ออาหาร': m.mealTime,
    'ชื่อเมนู': m.name,
    'แคลอรี (kcal)': m.calories,
    'โปรตีน (g)': m.protein,
    'คาร์โบไฮเดรต (g)': m.carbs,
    'ไขมัน (g)': m.fat,
    'โซนโภชนาการ': m.zone,
    'คำแนะนำโภชนาการ': m.advice || '-',
    'เวลาที่บันทึก': m.timestamp || new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
  }));

  // Calculate totals
  const totalCal = meals.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalPro = meals.reduce((sum, item) => sum + (item.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, item) => sum + (item.carbs || 0), 0);
  const totalFat = meals.reduce((sum, item) => sum + (item.fat || 0), 0);

  mealRows.push({
    'ลำดับ (No.)': 'รวมทั้งวัน' as unknown as number,
    'มื้ออาหาร': `${meals.length} รายการ`,
    'ชื่อเมนู': 'ผลรวมโภชนาการวันนี้',
    'แคลอรี (kcal)': totalCal,
    'โปรตีน (g)': totalPro,
    'คาร์โบไฮเดรต (g)': totalCarbs,
    'ไขมัน (g)': totalFat,
    'โซนโภชนาการ': totalCal <= tdee ? '✅ ในเกณฑ์เป้าหมาย' : '⚠️ เกินเกณฑ์ TDEE',
    'คำแนะนำโภชนาการ': `เป้าหมาย TDEE: ${tdee} kcal (เหลือ ${Math.max(0, tdee - totalCal)} kcal)`,
    'เวลาที่บันทึก': '-',
  });

  const wsMeals = XLSX.utils.json_to_sheet(mealRows);

  // Set column widths
  wsMeals['!cols'] = [
    { wch: 12 },
    { wch: 15 },
    { wch: 28 },
    { wch: 14 },
    { wch: 12 },
    { wch: 16 },
    { wch: 12 },
    { wch: 18 },
    { wch: 35 },
    { wch: 15 },
  ];

  // User Profile summary sheet
  const profileRows = [
    { 'รายการ': 'วันที่รายงาน', 'ข้อมูล': new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) },
    { 'รายการ': 'เพศ', 'ข้อมูล': profile.gender === 'Male' ? 'ชาย' : 'หญิง' },
    { 'รายการ': 'อายุ (ปี)', 'ข้อมูล': `${profile.age} ปี` },
    { 'รายการ': 'น้ำหนัก (กก.)', 'ข้อมูล': `${profile.weight} กก.` },
    { 'รายการ': 'ส่วนสูง (ซม.)', 'ข้อมูล': `${profile.height} ซม.` },
    { 'รายการ': 'ดัชนีมวลกาย (BMI)', 'ข้อมูล': `${bmiInfo.bmi} (${bmiInfo.category})` },
    { 'รายการ': 'BMR (พลังงานพื้นฐานขณะพัก)', 'ข้อมูล': `${bmr} kcal` },
    { 'รายการ': 'TDEE (พลังงานที่ใช้ต่อวัน)', 'ข้อมูล': `${tdee} kcal` },
    { 'รายการ': 'เป้าหมายลดน้ำหนัก (-500 kcal)', 'ข้อมูล': `${tdee - 500} kcal` },
    { 'รายการ': 'เป้าหมายเพิ่มกล้ามเนื้อ (+350 kcal)', 'ข้อมูล': `${tdee + 350} kcal` },
    { 'รายการ': 'ชีพจรสูงสุด (Max HR)', 'ข้อมูล': `${220 - profile.age} bpm` },
    { 'รายการ': 'ชีพจร Zone 2 (เผาผลาญไขมัน)', 'ข้อมูล': `${Math.round((220 - profile.age) * 0.60)} - ${Math.round((220 - profile.age) * 0.70)} bpm` },
  ];

  const wsProfile = XLSX.utils.json_to_sheet(profileRows);
  wsProfile['!cols'] = [{ wch: 30 }, { wch: 35 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsMeals, 'ประวัติมื้ออาหาร (Meal Log)');
  XLSX.utils.book_append_sheet(wb, wsProfile, 'ข้อมูลสุขภาพ (Health Summary)');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `health_nutrition_report_${dateStr}.xlsx`);
}

export function exportToCSV(meals: FoodItem[]) {
  if (meals.length === 0) {
    alert('ไม่มีข้อมูลมื้ออาหารสำหรับส่งออก');
    return;
  }

  // Header row
  const headers = ['มื้ออาหาร', 'ชื่อเมนู', 'แคลอรี (kcal)', 'โปรตีน (g)', 'คาร์บ (g)', 'ไขมัน (g)', 'โซนโภชนาการ', 'คำแนะนำ'];
  
  const rows = meals.map(m => [
    `"${m.mealTime}"`,
    `"${m.name.replace(/"/g, '""')}"`,
    m.calories,
    m.protein,
    m.carbs,
    m.fat,
    `"${m.zone}"`,
    `"${(m.advice || '').replace(/"/g, '""')}"`
  ]);

  // Totals row
  const totalCal = meals.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalPro = meals.reduce((sum, item) => sum + (item.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, item) => sum + (item.carbs || 0), 0);
  const totalFat = meals.reduce((sum, item) => sum + (item.fat || 0), 0);

  rows.push([
    '"รวมทั้งหมด"',
    `"รวม ${meals.length} รายการ"`,
    totalCal,
    totalPro,
    totalCarbs,
    totalFat,
    '""',
    '""'
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `health_nutrition_report_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
