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

export type RecommendationStatus =
  | "recommended"
  | "consider"
  | "food_first"
  | "test_first"
  | "clinician_only"
  | "not_recommended"
  | "avoid";

export interface Recommendation {
  supplement: Supplement;
  score: number;
  precisionScore?: number;
  reasons: string[];
  safetyFlags: string[];
  confidence: "Low" | "Moderate" | "High" | "Blocked";
  /** "core" (top-3 active), "secondary" (next-2), or undefined (not in active stack). */
  tier?: "core" | "secondary";
  personalizationTags?: string[];
  /** Action label for this supplement given the user's profile. */
  status?: RecommendationStatus;
  /** One-sentence rationale for the status (e.g. "Iron requires lab testing first"). */
  statusReason?: string;
}

/** A supplement that was deliberately not recommended, with the reason why. */
export interface SuppressedRecommendation {
  supplementId: string;
  supplementName: string;
  status: RecommendationStatus;
  reason: string;
}

export interface EngineResult {
  matchScore: number;
  recommendations: Recommendation[];
  /** Supplements deliberately not recommended today, with reasons. */
  notRecommended?: SuppressedRecommendation[];
  /** Free-text callouts to escalate to a clinician/pharmacist. */
  clinicianCallouts?: string[];
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
