export type Gender = 'Male' | 'Female';

export type ActivityLevel = 1.2 | 1.375 | 1.55 | 1.725;

export type MealTime = 'มื้อเช้า' | 'มื้อกลางวัน' | 'มื้อเย็น' | 'ของว่าง';

export type NutritionZone = '🟢 Green Zone' | '🟡 Yellow Zone' | '🔴 Red Zone';

export interface UserProfile {
  age: number;
  gender: Gender;
  weight: number; // kg
  height: number; // cm
  activityFactor: ActivityLevel;
  fitnessGoal: 'weight_loss' | 'maintain' | 'muscle_gain';
}

export interface HeartRateZoneInfo {
  zone: number;
  name: string;
  nameEn: string;
  percentRange: string;
  minHr: number;
  maxHr: number;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  benefits: string;
}

export interface FoodItem {
  id: string;
  mealTime: MealTime;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  zone: NutritionZone;
  advice?: string;
  timestamp?: string;
}

export interface ExercisePlan {
  id: string;
  name: string;
  category: 'Cardio' | 'Weight' | 'Bodyweight' | 'Sports';
  subTitle: string;
  description: string;
  burnRateKcalPerHour: number;
  recommendedZone: string;
  recommendedDuration: string;
  instructions: string[];
  equipment: string;
  targetMuscles: string;
}
