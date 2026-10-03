import { FoodItem, HeartRateZoneInfo, UserProfile } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'ผู้รักสุขภาพ',
  age: 28,
  gender: 'Male',
  weight: 70.0,
  targetWeight: 65.0,
  height: 170.0,
  waistCm: 80.0,
  activityFactor: 1.55,
  fitnessGoal: 'weight_loss',
};

export const ACTIVITY_OPTIONS = [
  { value: 1.2, label: 'น้อยมาก (นั่งทำงานอยู่กับที่ ไม่ค่อยออกกำลังกาย)' },
  { value: 1.375, label: 'เล็กน้อย (ออกกำลังกายเบาๆ 1-3 วัน/สัปดาห์)' },
  { value: 1.55, label: 'ปานกลาง (ออกกำลังกาย 3-5 วัน/สัปดาห์)' },
  { value: 1.725, label: 'มาก (ออกกำลังกายหนัก 6-7 วัน/สัปดาห์)' },
] as const;

export function calculateBMR(profile: UserProfile): number {
  const { weight, height, age, gender } = profile;
  if (gender === 'Male') {
    return Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5);
  } else {
    return Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
  }
}

export function calculateTDEE(bmr: number, factor: number): number {
  return Math.round(bmr * factor);
}

export function calculateBMI(weight: number, heightCm: number): {
  bmi: number;
  category: string;
  color: string;
  textColor: string;
  advice: string;
} {
  const heightM = heightCm / 100;
  const bmi = Number((weight / (heightM * heightM)).toFixed(1));

  // เกณฑ์ BMI มาตรฐานสำหรับคนเอเชีย / กระทรวงสาธารณสุข
  if (bmi < 18.5) {
    return {
      bmi,
      category: 'น้ำหนักน้อย / ผอม',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
      textColor: 'text-amber-600',
      advice: 'ควรรับประทานอาหารที่มีคุณค่าทางโภชนาการเพิ่มขึ้น และฝึกเวทเทรนนิ่งเพื่อเพิ่มมวลกล้ามเนื้อ',
    };
  } else if (bmi <= 22.9) {
    return {
      bmi,
      category: 'น้ำหนักสมส่วน (ปกติ)',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      textColor: 'text-emerald-600',
      advice: 'สุขภาพดีเยี่ยม ควรรักษาระดับการออกกำลังกายและโภชนาการที่สมดุลต่อเนื่อง',
    };
  } else if (bmi <= 24.9) {
    return {
      bmi,
      category: 'ท้วม / น้ำหนักเกินเกณฑ์',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      textColor: 'text-yellow-600',
      advice: 'ควรควบคุมพลังงานจากอาหาร ลดของหวานของทอด และเพิ่มคาร์ดิโอ Zone 2',
    };
  } else if (bmi <= 29.9) {
    return {
      bmi,
      category: 'อ้วนระดับ 1 (เริ่มเสี่ยง)',
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      textColor: 'text-orange-600',
      advice: 'มีความเสี่ยงต่อโรค NCDs แนะนำวางแผน Calorie Deficit 500 kcal/วัน และออกกำลังกายสม่ำเสมอ',
    };
  } else {
    return {
      bmi,
      category: 'อ้วนระดับ 2 (อันตราย)',
      color: 'bg-red-100 text-red-800 border-red-300',
      textColor: 'text-red-600',
      advice: 'ควรปรึกษาแพทย์หรือผู้เชี่ยวชาญ และเริ่มการออกกำลังกายแบบแรงกระแทกต่ำ (Low-impact)',
    };
  }
}

export function calculateHeartRateZones(age: number): {
  maxHr: number;
  zone2Min: number;
  zone2Max: number;
  zone4Min: number;
  zone4Max: number;
  zones: HeartRateZoneInfo[];
} {
  const maxHr = Math.max(120, 220 - age);

  const zones: HeartRateZoneInfo[] = [
    {
      zone: 1,
      name: 'ฟื้นฟูกล้ามเนื้อ & วอร์มอัพ',
      nameEn: 'Active Recovery',
      percentRange: '50% - 60%',
      minHr: Math.round(maxHr * 0.50),
      maxHr: Math.round(maxHr * 0.60),
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      borderColor: 'border-blue-400',
      description: 'ออกกำลังกายเบามาก หายใจสบาย สามารถพูดคุยได้คล่อง',
      benefits: 'ช่วยกระตุ้นการไหลเวียนโลหิต ลดความตึงตัวของกล้ามเนื้อ และเตรียมความพร้อม',
    },
    {
      zone: 2,
      name: 'เผาผลาญไขมัน & เพิ่มแอโรบิก',
      nameEn: 'Fat Burn / Aerobic Base',
      percentRange: '60% - 70%',
      minHr: Math.round(maxHr * 0.60),
      maxHr: Math.round(maxHr * 0.70),
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500',
      borderColor: 'border-emerald-400',
      description: 'ออกกำลังกายระดับปานกลาง หายใจลึกขึ้น ยังสามารถพูดเป็นประโยคได้',
      benefits: 'ดึงไขมันสะสมมาใช้เป็นพลังงานได้สูงที่สุด เสริมสร้างความแข็งแรงของหัวใจและปอด',
    },
    {
      zone: 3,
      name: 'พัฒนาแอโรบิก & ความฟิต',
      nameEn: 'Aerobic / Tempo',
      percentRange: '70% - 80%',
      minHr: Math.round(maxHr * 0.70),
      maxHr: Math.round(maxHr * 0.80),
      color: 'text-amber-600',
      bgColor: 'bg-amber-500',
      borderColor: 'border-amber-400',
      description: 'ออกกำลังกายหนักปานกลาง-สูง เริ่มพูดได้ทีละวลีสั้นๆ',
      benefits: 'เพิ่มประสิทธิภาพการส่งออกซิเจนของหัวใจและหลอดเลือด ช่วยให้วิ่งได้เร็วนานขึ้น',
    },
    {
      zone: 4,
      name: 'พัฒนาความอึด / แอนแอโรบิก (HIIT)',
      nameEn: 'Threshold / Anaerobic',
      percentRange: '80% - 90%',
      minHr: Math.round(maxHr * 0.80),
      maxHr: Math.round(maxHr * 0.90),
      color: 'text-orange-600',
      bgColor: 'bg-orange-500',
      borderColor: 'border-orange-400',
      description: 'ออกกำลังกายหนัก หายใจเร็วแรง พูดได้เพียงคำสั้นๆ',
      benefits: 'เพิ่มขีดจำกัดกรดแลกติก (Lactate Threshold) พัฒนาสปีดและพลังกล้ามเนื้อขั้นสูง',
    },
    {
      zone: 5,
      name: 'ขีดจำกัดสูงสุด (Maximum Effort)',
      nameEn: 'VO2 Max / Neuromuscular',
      percentRange: '90% - 100%',
      minHr: Math.round(maxHr * 0.90),
      maxHr: maxHr,
      color: 'text-red-600',
      bgColor: 'bg-red-500',
      borderColor: 'border-red-400',
      description: 'หนักที่สุด สปรินต์เต็มแรง ทำได้ช่วงสั้นๆ 10-60 วินาที',
      benefits: 'กระตุ้นเส้นใยกล้ามเนื้อชนิด Fast-twitch สูงสุด เหมาะสำหรับนักกีฬาเพื่อพัฒนาความเร็วระเบิด',
    },
  ];

  return {
    maxHr,
    zone2Min: zones[1].minHr,
    zone2Max: zones[1].maxHr,
    zone4Min: zones[3].minHr,
    zone4Max: zones[3].maxHr,
    zones,
  };
}

export const INITIAL_FOOD_DATABASE: Record<string, { cal: number; pro: number; carbs: number; fat: number; zone: '🟢 Green Zone' | '🟡 Yellow Zone' | '🔴 Red Zone'; advice: string }> = {
  "ข้าวกะเพราไก่ไข่ดาว": { cal: 550, pro: 30, carbs: 60, fat: 20, zone: "🟡 Yellow Zone", advice: "ทานได้แต่ไม่บ่อย น้ำมันปานกลาง ลดไข่ดาวเป็นไข่ต้มเพื่อสุขภาพดีขึ้น" },
  "อกไก่ย่าง + ข้าวกล้อง": { cal: 350, pro: 35, carbs: 40, fat: 5, zone: "🟢 Green Zone", advice: "แนะนำ โปรตีนสูง ไขมันต่ำ เหมาะสำหรับสร้างกล้ามเนื้อและลดไขมัน" },
  "ส้มตำไทย + ไก่ย่าง": { cal: 400, pro: 25, carbs: 35, fat: 15, zone: "🟢 Green Zone", advice: "แนะนำ ระวังโซเดียมจากน้ำปลา/ปลาร้า ดื่มน้ำตามมากๆ" },
  "ราดหน้าหมูหมัก": { cal: 480, pro: 20, carbs: 65, fat: 16, zone: "🟡 Yellow Zone", advice: "แป้งและน้ำตาลในน้ำราดค่อนข้างสูง เลี่ยงการซดน้ำราดจนหมด" },
  "ชานมไข่มุก (หวาน 100%)": { cal: 450, pro: 2, carbs: 75, fat: 14, zone: "🔴 Red Zone", advice: "ควรหลีกเลี่ยง น้ำตาลสูงมาก แนะนำเปลี่ยนเป็นหวาน 0-25% หรือชาเขียวใส" },
  "สลัดผักอกไก่ น้ำสลัดใส": { cal: 250, pro: 28, carbs: 15, fat: 8, zone: "🟢 Green Zone", advice: "แนะนำ ดีต่อสุขภาพ พลังงานต่ำ ไฟเบอร์สูง ทำให้อิ่มนาน" },
  "ต้มยำกุ้งน้ำใส + ข้าวสวย": { cal: 320, pro: 26, carbs: 45, fat: 4, zone: "🟢 Green Zone", advice: "สมุนไพรเยอะ แคลอรีต่ำ รสชาติจัดจ้าน ช่วยกระตุ้นการเผาผลาญ" },
  "ข้าวไข่เจียวหมูสับ": { cal: 620, pro: 18, carbs: 55, fat: 38, zone: "🔴 Red Zone", advice: "อมน้ำมันสูง พลังงานเกิน แนะนำเปลี่ยนเป็นไข่ต้มหรือไข่ตุ๋น" },
  "ก๋วยเตี๋ยวน้ำใสไก่ฉีก": { cal: 330, pro: 24, carbs: 48, fat: 5, zone: "🟢 Green Zone", advice: "เลือกเส้นหมี่ขาวหรือวุ้นเส้น ไม่ใส่น้ำมันกระเทียมเจียวเพื่อลดไขมัน" },
  "เวย์โปรตีน 1 สกู๊ป + กล้วยหอม": { cal: 230, pro: 27, carbs: 28, fat: 2, zone: "🟢 Green Zone", advice: "มื้อก่อน/หลังออกกำลังกายที่ดีเยี่ยม ดูดซึมเร็ว เติมไกลโคเจน" },
};

export const INITIAL_MEAL_HISTORY: FoodItem[] = [
  {
    id: 'sample-1',
    mealTime: 'มื้อเช้า',
    name: 'อกไก่ย่าง + ข้าวกล้อง',
    calories: 350,
    protein: 35,
    carbs: 40,
    fat: 5,
    zone: '🟢 Green Zone',
    advice: 'โปรตีนสูง ไขมันต่ำ เหมาะสำหรับสร้างกล้ามเนื้อ',
    timestamp: '08:30',
  },
  {
    id: 'sample-2',
    mealTime: 'มื้อกลางวัน',
    name: 'ส้มตำไทย + ไก่ย่าง',
    calories: 400,
    protein: 25,
    carbs: 35,
    fat: 15,
    zone: '🟢 Green Zone',
    advice: 'แนะนำ ระวังโซเดียม ดื่มน้ำให้เพียงพอ',
    timestamp: '12:30',
  },
];
