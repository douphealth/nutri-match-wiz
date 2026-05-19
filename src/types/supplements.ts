export type EvidenceLevel = "Strong" | "Moderate" | "Limited" | "Situational";
export type SafetyLevel = "Low" | "Moderate" | "High caution";

export interface Supplement {
  id: string;
  name: string;
  category: string;
  bestFor: string[];
  evidenceLevel: EvidenceLevel;
  safetyLevel: SafetyLevel;
  contraindications: string[];
  medicationInteractions: string[];
  recommendedOnlyIf: string[];
  foodFirstAdvice: string;
  typicalUseCase: string;
  whatToLookFor: string[];
  avoidIf: string[];
  resultCopy: string;
  citationsPlaceholder: string[];
}

export type Sex = "female" | "male" | "intersex" | "prefer_not";
export type Diet =
  | "omnivore"
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "low_carb"
  | "calorie_deficit"
  | "restricted";

export type Goal =
  | "energy"
  | "muscle_recovery"
  | "endurance"
  | "weight_management"
  | "sleep"
  | "general_wellness"
  | "bone_health"
  | "immune"
  | "focus";

export type Frequency = "never" | "rarely" | "weekly" | "often" | "daily";

export interface QuizAnswers {
  ageRange: "under_18" | "18_29" | "30_44" | "45_59" | "60_plus";
  sex: Sex;
  pregnancy: "none" | "pregnant" | "breastfeeding" | "trying";
  diet: Diet;
  goals: Goal[];
  sunExposure: "low" | "moderate" | "high";
  sleepQuality: "poor" | "fair" | "good";
  stress: "low" | "moderate" | "high";
  alcohol: Frequency;
  caffeine: Frequency;
  trainingFrequency: "none" | "1_2" | "3_4" | "5_plus";
  foodIntake: {
    oilyFish: Frequency;
    dairy: Frequency;
    fortifiedFoods: Frequency;
    redMeat: Frequency;
    legumes: Frequency;
    fruitsVeg: Frequency;
    wholeGrains: Frequency;
  };
  medical: {
    medications: boolean;
    bloodThinners: boolean;
    antidepressants: boolean;
    diabetesMeds: boolean;
    thyroidMeds: boolean;
    bloodPressureMeds: boolean;
    kidneyLiver: boolean;
    heartDisease: boolean;
    surgeryPlanned: boolean;
    anemiaHistory: boolean;
  };
  currentSupplements: string;
  allergies: {
    gelatinFree: boolean;
    vegan: boolean;
    glutenFree: boolean;
    lactoseFree: boolean;
    stimulantFree: boolean;
    thirdPartyTestedOnly: boolean;
  };
  budget: "low" | "moderate" | "premium";
  pillPreference: "capsule" | "powder" | "gummy" | "liquid" | "no_preference";
}

export interface Recommendation {
  supplement: Supplement;
  score: number;
  precisionScore?: number;
  reasons: string[];
  safetyFlags: string[];
  confidence: "Low" | "Moderate" | "High";
  personalizationTags?: string[];
}

export interface EngineResult {
  matchScore: number;
  recommendations: Recommendation[];
  safetyGate: {
    triggered: boolean;
    reasons: string[];
  };
  personalizationProfile?: {
    label: string;
    summary: string;
    signalCount: number;
    differentiators: string[];
  };
  answers?: QuizAnswers;
  foodFirstNotes: string[];
  generalNotes: string[];
}
