// Evidence matrix — real, sourced citations per supplement.
// Sources favored: NIH ODS, FDA, NCCIH, USDA, CDC, ACOG, AASM, AGA, ISSN,
// USP/NSF/Informed Sport. This file is the single source of truth for the
// citation links shown in the UI and PDF.
//
// Each citation is intentionally a small object so the UI can render it as a
// clickable link without re-typing the URL elsewhere.

export type SourceOrg =
  | "NIH ODS"
  | "NIH NCCIH"
  | "FDA"
  | "CDC"
  | "USDA"
  | "ACOG"
  | "AASM"
  | "AGA"
  | "ISSN"
  | "USP"
  | "NSF"
  | "Informed Sport"
  | "Endocrine Society"
  | "ACSM"
  | "Cochrane"
  | "WHO";

export interface Citation {
  /** Short label rendered in the UI, e.g. "NIH ODS — Vitamin D Fact Sheet". */
  label: string;
  /** Authoritative organization. */
  org: SourceOrg;
  /** Direct URL to the primary source. */
  url: string;
  /** Optional one-line context for what this citation supports. */
  supports?: string;
}

export type EvidenceGrade = "Strong" | "Moderate" | "Limited" | "Situational";
export type LabRequirement = "none" | "encouraged" | "required_before_use" | "clinician_directed";

export interface EvidenceEntry {
  /** Matches Supplement.id from supplementData. */
  supplementId: string;
  /** Plain-language summary of what the evidence supports. */
  supportedClaims: string[];
  /** Plain-language summary of what the evidence does NOT support. */
  unsupportedClaims?: string[];
  /** Conditions where this supplement provides no meaningful benefit. */
  notUsefulFor?: string[];
  /** Populations where evidence is strongest. */
  populationFit: string[];
  /** Populations where evidence is weakest or where caution applies. */
  populationCaution?: string[];
  /** Hard-block conditions — never recommend if any of these are true. */
  avoidWhen?: string[];
  /** Clinician must direct dosing if any of these are true. */
  clinicianOnlyWhen?: string[];
  /** Downgrade confidence/score if any of these are true. */
  downgradeWhen?: string[];
  /** Maximum safe default OTC dose (per day) for an average adult, in the supplement's native unit. */
  maxSafeDefaultDose?: string;
  /** Authoritative citations rendered in the UI. */
  citations: Citation[];
  evidenceGrade: EvidenceGrade;
  labRequirement: LabRequirement;
  /** ISO date (YYYY-MM-DD) the entry was last reviewed against sources. */
  lastChecked: string;
}

const LAST_CHECKED = "2026-05-19";

const C = {
  // Vitamin D
  odsD: {
    label: "NIH ODS — Vitamin D Fact Sheet",
    org: "NIH ODS" as const,
    url: "https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/",
  },
  endoD: {
    label: "Endocrine Society — Vitamin D Clinical Practice Guideline (2024)",
    org: "Endocrine Society" as const,
    url: "https://www.endocrine.org/clinical-practice-guidelines/vitamin-d-for-the-prevention-of-disease",
  },
  // B12
  odsB12: {
    label: "NIH ODS — Vitamin B12 Fact Sheet",
    org: "NIH ODS" as const,
    url: "https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/",
  },
  // Omega-3
  odsOmega: {
    label: "NIH ODS — Omega-3 Fatty Acids Fact Sheet",
    org: "NIH ODS" as const,
    url: "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/",
  },
  nccihOmega: {
    label: "NIH NCCIH — Omega-3 Supplements",
    org: "NIH NCCIH" as const,
    url: "https://www.nccih.nih.gov/health/omega3-supplements-in-depth",
  },
  // Magnesium
  odsMg: {
    label: "NIH ODS — Magnesium Fact Sheet",
    org: "NIH ODS" as const,
    url: "https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/",
  },
  // Creatine
  issnCr: {
    label: "ISSN — Creatine Supplementation Position Stand (Kreider et al., JISSN 2017)",
    org: "ISSN" as const,
    url: "https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0173-z",
  },
  nccihCr: {
    label: "NIH NCCIH — Creatine",
    org: "NIH NCCIH" as const,
    url: "https://www.nccih.nih.gov/health/creatine",
  },
  // Protein
  issnProtein: {
    label: "ISSN — Protein and Exercise Position Stand (Jäger et al., JISSN 2017)",
    org: "ISSN" as const,
    url: "https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8",
  },
  // Iron
  odsIron: {
    label: "NIH ODS — Iron Fact Sheet",
    org: "NIH ODS" as const,
    url: "https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/",
  },
  fdaIron: {
    label: "FDA — Iron-Containing Supplements: Required Warning",
    org: "FDA" as const,
    url: "https://www.fda.gov/drugs/special-features/iron-containing-products-warning-accidental-overdose",
  },
  // Calcium
  odsCa: {
    label: "NIH ODS — Calcium Fact Sheet",
    org: "NIH ODS" as const,
    url: "https://ods.od.nih.gov/factsheets/Calcium-HealthProfessional/",
  },
  // Prenatal / folate
  cdcFolate: {
    label: "CDC — Folic Acid Recommendations",
    org: "CDC" as const,
    url: "https://www.cdc.gov/ncbddd/folicacid/recommendations.html",
  },
  acogPrenatal: {
    label: "ACOG — Nutrition During Pregnancy FAQ",
    org: "ACOG" as const,
    url: "https://www.acog.org/womens-health/faqs/nutrition-during-pregnancy",
  },
  // Electrolytes / hydration
  acsmHydration: {
    label: "ACSM — Exercise and Fluid Replacement Position Stand",
    org: "ACSM" as const,
    url: "https://journals.lww.com/acsm-msse/Fulltext/2007/02000/Exercise_and_Fluid_Replacement.22.aspx",
  },
  // Fiber
  usdaFiber: {
    label: "USDA / HHS — Dietary Guidelines for Americans (fiber)",
    org: "USDA" as const,
    url: "https://www.dietaryguidelines.gov/",
  },
  // Probiotic
  agaProb: {
    label: "AGA — Clinical Practice Guidelines on Probiotics in GI Disorders",
    org: "AGA" as const,
    url: "https://gastro.org/clinical-guidance/probiotics-in-the-management-of-gastrointestinal-disorders/",
  },
  // Zinc
  odsZinc: {
    label: "NIH ODS — Zinc Fact Sheet",
    org: "NIH ODS" as const,
    url: "https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/",
  },
  // Vitamin C
  odsC: {
    label: "NIH ODS — Vitamin C Fact Sheet",
    org: "NIH ODS" as const,
    url: "https://ods.od.nih.gov/factsheets/VitaminC-HealthProfessional/",
  },
  // Melatonin
  aasmMel: {
    label: "AASM — Clinical Practice Guideline for the Pharmacologic Treatment of Insomnia",
    org: "AASM" as const,
    url: "https://aasm.org/clinical-resources/practice-standards/practice-guidelines/",
  },
  nccihMel: {
    label: "NIH NCCIH — Melatonin: What You Need To Know",
    org: "NIH NCCIH" as const,
    url: "https://www.nccih.nih.gov/health/melatonin-what-you-need-to-know",
  },
  // Quality / testing
  uspVerified: {
    label: "USP Verified Mark — Dietary Supplement Verification",
    org: "USP" as const,
    url: "https://www.quality-supplements.org/",
  },
  nsfSport: {
    label: "NSF Certified for Sport — Banned-substance Tested",
    org: "NSF" as const,
    url: "https://www.nsfsport.com/",
  },
};

export const EVIDENCE_MATRIX: Record<string, EvidenceEntry> = {
  vitamin_d: {
    supplementId: "vitamin_d",
    supportedClaims: [
      "Maintains bone mineralization (with adequate calcium).",
      "Corrects deficiency in people with documented low 25(OH)D.",
    ],
    unsupportedClaims: [
      "High-dose vitamin D as a routine immune booster or COVID treatment in non-deficient adults.",
    ],
    populationFit: [
      "Adults with low sun exposure, darker skin, or living at higher latitudes",
      "Older adults (>60) — increased deficiency risk",
      "Vegans and exclusively-breastfed infants (per pediatric guidance)",
    ],
    populationCaution: ["Sarcoidosis", "Hypercalcemia", "Some kidney conditions"],
    citations: [C.odsD, C.endoD, C.uspVerified],
    evidenceGrade: "Strong",
    labRequirement: "encouraged",
  },
  b12: {
    supplementId: "b12",
    supportedClaims: [
      "Treats and prevents B12 deficiency, particularly in vegans, older adults, and those on metformin or PPIs.",
    ],
    populationFit: [
      "Vegans / vegetarians",
      "Adults 50+",
      "Long-term metformin or acid-reducer users",
      "History of pernicious anemia",
    ],
    citations: [C.odsB12],
    evidenceGrade: "Strong",
    labRequirement: "encouraged",
  },
  omega3: {
    supplementId: "omega3",
    supportedClaims: [
      "EPA + DHA support cardiovascular and triglyceride markers at adequate doses.",
      "Useful for people who rarely eat oily fish.",
    ],
    unsupportedClaims: [
      "Routine high-dose fish oil for primary prevention in healthy adults without baseline shortfall.",
    ],
    populationFit: ["Low oily-fish eaters", "Vegans (algal EPA/DHA)"],
    populationCaution: ["People on blood thinners — discuss dose with clinician"],
    citations: [C.odsOmega, C.nccihOmega],
    evidenceGrade: "Moderate",
    labRequirement: "none",
  },
  magnesium: {
    supplementId: "magnesium",
    supportedClaims: [
      "Corrects shortfall in adults with low dietary intake.",
      "May support sleep quality in deficient or older adults.",
    ],
    populationFit: [
      "Low intake of greens/legumes/nuts/whole grains",
      "Frequent training",
      "Adults 60+",
    ],
    populationCaution: ["Severe kidney disease — clinician oversight required"],
    citations: [C.odsMg],
    evidenceGrade: "Moderate",
    labRequirement: "none",
  },
  creatine: {
    supplementId: "creatine",
    supportedClaims: [
      "Creatine monohydrate increases lean mass, strength, and high-intensity performance with resistance training.",
      "Emerging evidence for cognitive performance under stress, sleep deprivation, and in older adults.",
    ],
    populationFit: [
      "Resistance-trained adults",
      "Older adults pairing creatine with resistance training",
      "Vegetarians/vegans (lower baseline)",
    ],
    populationCaution: ["Significant kidney disease — clinician guidance"],
    citations: [C.issnCr, C.nccihCr, C.nsfSport],
    evidenceGrade: "Strong",
    labRequirement: "none",
  },
  protein: {
    supplementId: "protein",
    supportedClaims: [
      "Distributed daily protein 1.4–2.0 g/kg supports muscle mass during training; whey and quality plant blends are convenient sources.",
    ],
    populationFit: [
      "Higher training loads",
      "Calorie deficits / weight management",
      "Older adults to protect lean mass",
    ],
    citations: [C.issnProtein, C.nsfSport],
    evidenceGrade: "Strong",
    labRequirement: "none",
  },
  iron: {
    supplementId: "iron",
    supportedClaims: [
      "Corrects iron-deficiency anemia confirmed by labs (ferritin / CBC), under clinician guidance.",
    ],
    unsupportedClaims: [
      "Routine iron 'energy' supplementation in adults without confirmed deficiency.",
    ],
    populationFit: [
      "Documented low ferritin",
      "Pregnancy under obstetric care",
      "Heavy menstrual losses (with labs)",
    ],
    populationCaution: [
      "Hemochromatosis",
      "Any iron overload condition",
      "Men and post-menopausal women without confirmed deficiency",
    ],
    citations: [C.odsIron, C.fdaIron],
    evidenceGrade: "Situational",
    labRequirement: "required_before_use",
  },
  calcium: {
    supplementId: "calcium",
    supportedClaims: [
      "Used to close a measured dietary calcium gap, especially in low-dairy or vegan diets and older adults.",
    ],
    unsupportedClaims: [
      "High-dose calcium supplements as routine prevention — adds limited benefit and some risk.",
    ],
    populationFit: [
      "Low-dairy / vegan with low fortified intake",
      "Post-menopausal at risk",
      "Older adults",
    ],
    populationCaution: ["History of some kidney stones", "Hypercalcemia"],
    citations: [C.odsCa],
    evidenceGrade: "Moderate",
    labRequirement: "none",
  },
  prenatal: {
    supplementId: "prenatal",
    supportedClaims: [
      "Folic acid (≥400 mcg/day) before and during early pregnancy reduces neural tube defect risk.",
      "Prenatal with iron and DHA is standard of care in pregnancy.",
    ],
    populationFit: ["Pregnant", "Trying to conceive", "Breastfeeding (per clinician)"],
    populationCaution: ["Not for the general non-pregnant population"],
    citations: [C.cdcFolate, C.acogPrenatal],
    evidenceGrade: "Strong",
    labRequirement: "clinician_directed",
  },
  electrolytes: {
    supplementId: "electrolytes",
    supportedClaims: [
      "Sodium-led electrolyte replacement during long, hot, or sweaty endurance work improves hydration and performance.",
    ],
    populationFit: ["Endurance athletes", "Heat / humidity training", "Heavy sweat losses"],
    populationCaution: [
      "Salt-sensitive hypertension",
      "Kidney disease",
      "Potassium-sparing diuretic / ACE-i / ARB users",
    ],
    citations: [C.acsmHydration],
    evidenceGrade: "Moderate",
    labRequirement: "none",
  },
  fiber: {
    supplementId: "fiber",
    supportedClaims: [
      "Psyllium improves stool form and supports LDL-cholesterol modestly.",
      "Useful to close a dietary fiber gap.",
    ],
    populationFit: ["Low fruit / vegetable / whole-grain intake", "Constipation"],
    populationCaution: ["Bowel obstruction", "Swallowing difficulty"],
    citations: [C.usdaFiber],
    evidenceGrade: "Strong",
    labRequirement: "none",
  },
  probiotic: {
    supplementId: "probiotic",
    supportedClaims: [
      "Benefits are strain-specific. Some strains help antibiotic-associated diarrhea and specific GI conditions.",
    ],
    unsupportedClaims: [
      "Routine multi-strain 'gut health' use for healthy adults outside a specific indication.",
    ],
    populationFit: ["Targeted strain-condition match", "Short courses after antibiotics"],
    populationCaution: ["Severely immunocompromised — clinician guidance only"],
    citations: [C.agaProb],
    evidenceGrade: "Limited",
    labRequirement: "none",
  },
  zinc: {
    supplementId: "zinc",
    supportedClaims: [
      "Short-term, modest zinc lozenges may slightly shorten cold duration in some adults.",
    ],
    unsupportedClaims: ["Chronic high-dose zinc — risks copper deficiency and immune issues."],
    populationFit: ["Early cold symptoms (short term)", "Documented low intake"],
    populationCaution: ["Avoid intranasal zinc (anosmia risk)"],
    citations: [C.odsZinc],
    evidenceGrade: "Limited",
    labRequirement: "none",
  },
  vitamin_c: {
    supplementId: "vitamin_c",
    supportedClaims: [
      "Modest daily vitamin C helps when produce intake is low; smokers have higher needs.",
    ],
    unsupportedClaims: ["Megadoses to prevent colds in the general population."],
    populationFit: ["Low fruit / vegetable intake", "Smokers"],
    populationCaution: ["History of oxalate kidney stones — avoid high doses"],
    citations: [C.odsC],
    evidenceGrade: "Limited",
    labRequirement: "none",
  },
  melatonin: {
    supplementId: "melatonin",
    supportedClaims: [
      "Low-dose melatonin (0.3–1 mg) is useful for jet lag and short-term circadian shifts.",
    ],
    unsupportedClaims: [
      "Nightly long-term sedative use, high-dose gummies (commonly mis-dosed), and routine pediatric use without clinician oversight.",
    ],
    populationFit: ["Jet lag", "Shift work (clinician-guided)"],
    populationCaution: [
      "Pregnancy / breastfeeding",
      "Under 18 without clinician guidance",
      "Users of sedatives, blood thinners, or immunosuppressants",
    ],
    citations: [C.aasmMel, C.nccihMel],
    evidenceGrade: "Moderate",
    labRequirement: "none",
  },
};

export function citationsFor(supplementId: string): Citation[] {
  return EVIDENCE_MATRIX[supplementId]?.citations ?? [];
}

export function evidenceFor(supplementId: string): EvidenceEntry | undefined {
  return EVIDENCE_MATRIX[supplementId];
}
