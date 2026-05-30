export interface UserPreferences {
  goal: "weight_loss" | "muscle_gain" | "maintenance" | "custom";
  dailyCalorieTarget: number;
  restrictions: string[];
  allergies: string;
}

export interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface NutritionAnalysis {
  foods: FoodItem[];
  total: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  dailyGoalPercentage: number;
  allergenWarnings: string[];
  restrictionConflicts: string[];
  notes: string;
}

export interface ScanRecord {
  id: string;
  timestamp: string;
  imageDataUrl: string;
  analysis: NutritionAnalysis;
}
