// SEO topic data for /topic/$topic landing pages.
// Conservative, evidence-aware copy aligned with NIH ODS, FDA, ACOG, ISSN.
// All copy is informational — not medical advice.

export interface TopicFAQ {
  q: string;
  a: string;
}

export interface TopicCitation {
  label: string;
  url: string;
}

export interface TopicCopy {
  slug: string;
  supplement: string;
  /** <title> ~ 55 chars */
  metaTitle: string;
  /** <meta description> ~ 150 chars */
  metaDescription: string;
  /** H1 */
  h1: string;
  /** Short lede shown under H1 */
  lede: string;
  /** "Who it may help" bullets */
  whoItMayHelp: string[];
  /** "Who should NOT take it (without a clinician)" bullets */
  whoShouldAvoid: string[];
  /** Food-first paragraph */
  foodFirst: string;
  /** What the evidence says (one paragraph) */
  evidenceSummary: string;
  /** Typical conservative dose range, as a short sentence */
  dosing: string;
  /** Form / quality checklist bullets */
  qualityChecklist: string[];
  /** Safety, interactions, and red flags */
  safety: string[];
  /** Whether a lab/clinician test is recommended before use */
  testFirst?: string;
  /** FAQ entries — used for FAQPage schema */
  faqs: TopicFAQ[];
  /** Citations rendered + included in MedicalWebPage schema */
  citations: TopicCitation[];
  /** Related topic slugs for internal linking */
  related: string[];
}

const NIH = (path: string, label: string) => ({
  label,
  url: `https://ods.od.nih.gov/factsheets/${path}/`,
});

export const SEO_TOPICS: TopicCopy[] = [
  {
    slug: "vitamin-d",
    supplement: "Vitamin D",
    metaTitle: "Vitamin D Supplements: Who Needs Them | Supplement Match",
    metaDescription:
      "Evidence-based guide to vitamin D: who actually benefits, conservative doses, when to test 25(OH)D, and safety limits. By GearUpToFit.",
    h1: "Vitamin D: Who Actually Benefits, and How to Supplement Safely",
    lede:
      "Vitamin D supports calcium absorption, bone health, and immune function. Most adults do not need megadoses — they need to know their 25(OH)D level first.",
    whoItMayHelp: [
      "Adults with low sun exposure (office work, northern latitudes, covered skin)",
      "Older adults (60+), who synthesize vitamin D less efficiently",
      "People with darker skin pigmentation, which slows cutaneous synthesis",
      "People with documented 25(OH)D < 20 ng/mL (50 nmol/L)",
      "People with malabsorption (celiac, Crohn's, post-bariatric surgery)",
    ],
    whoShouldAvoid: [
      "People with hypercalcemia, sarcoidosis, or other granulomatous disease",
      "People taking thiazide diuretics at high vitamin D doses without supervision",
      "People with current 25(OH)D > 50 ng/mL (125 nmol/L) — supplementation rarely adds benefit and may increase risk",
    ],
    foodFirst:
      "Food sources include fatty fish (salmon, sardines, mackerel), egg yolks, and fortified milk or plant milks. Sensible sun exposure (10–20 minutes on bare arms several times per week, where UV index allows) also contributes. Diet alone often falls short in winter — supplementation may be appropriate when intake and sun are both low.",
    evidenceSummary:
      "Strong evidence supports vitamin D for preventing deficiency-related bone disease (rickets, osteomalacia) and for supporting bone health with calcium in older adults. Evidence for benefits beyond bone (immune, mood, cardiovascular) is mixed; large trials such as VITAL did not show that routine vitamin D supplementation reduces cardiovascular events or invasive cancer in vitamin D–replete adults.",
    dosing:
      "A conservative maintenance dose for adults is 600–2,000 IU (15–50 mcg) per day. The NIH-defined Tolerable Upper Intake Level is 4,000 IU (100 mcg)/day. Doses above this should only be used under clinician guidance.",
    qualityChecklist: [
      "Cholecalciferol (vitamin D3) is generally preferred over D2 for raising 25(OH)D",
      "Third-party tested (USP, NSF, Informed Choice)",
      "Take with a meal containing fat for absorption",
      "Avoid mega-dose 'weekly' formulations unless prescribed",
    ],
    safety: [
      "Toxicity (hypercalcemia, kidney stones) is rare but real at chronic doses above 4,000 IU/day without monitoring",
      "Interacts with thiazide diuretics, digoxin, corticosteroids, and orlistat",
      "Pregnant and breastfeeding people should follow prenatal-specific guidance from their clinician",
    ],
    testFirst:
      "If you're considering more than 1,000–2,000 IU/day long-term, ask your clinician to check 25(OH)D first. Dosing without a baseline is guessing.",
    faqs: [
      {
        q: "How much vitamin D should I take per day?",
        a: "For most adults without a known deficiency, 600–2,000 IU (15–50 mcg) per day is a conservative range. The NIH Tolerable Upper Intake Level is 4,000 IU/day. Higher doses should be guided by a 25(OH)D blood test and a clinician.",
      },
      {
        q: "Is vitamin D3 better than D2?",
        a: "Vitamin D3 (cholecalciferol) generally raises serum 25(OH)D more effectively than D2 (ergocalciferol). D3 is the more common form in over-the-counter supplements.",
      },
      {
        q: "Can I get enough vitamin D from sun alone?",
        a: "Sensible sun exposure contributes, but latitude, season, skin tone, sunscreen use, and time indoors all reduce synthesis. Many adults outside the tropics fall short in winter.",
      },
      {
        q: "Do I need to test my vitamin D level?",
        a: "Testing 25(OH)D is recommended before long-term doses above 1,000–2,000 IU/day, for people with malabsorption, osteoporosis, or symptoms of deficiency.",
      },
    ],
    citations: [
      NIH("VitaminD-Consumer", "NIH ODS — Vitamin D Fact Sheet"),
      NIH("VitaminD-HealthProfessional", "NIH ODS — Vitamin D for Health Professionals"),
      {
        label: "VITAL Trial — Manson et al., NEJM 2019",
        url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1809944",
      },
    ],
    related: ["calcium", "magnesium", "multivitamin"],
  },
  {
    slug: "vitamin-b12",
    supplement: "Vitamin B12",
    metaTitle: "Vitamin B12: Who Needs to Supplement | Supplement Match",
    metaDescription:
      "Vegans, vegetarians, adults 50+, and people on metformin or PPIs are at higher risk of B12 deficiency. Evidence-based dosing and safety.",
    h1: "Vitamin B12: A Required Supplement for Vegans and Adults 50+",
    lede:
      "Vitamin B12 (cobalamin) is essential for red blood cell formation, neurological function, and DNA synthesis. Deficiency is common, often silent, and entirely preventable.",
    whoItMayHelp: [
      "Anyone following a vegan or strict vegetarian diet",
      "Adults 50 and older (reduced gastric acid impairs absorption from food)",
      "People taking metformin long-term",
      "People on proton-pump inhibitors (PPIs) or H2 blockers",
      "People with pernicious anemia, atrophic gastritis, or after gastric bypass",
    ],
    whoShouldAvoid: [
      "Very few contraindications exist; B12 has an excellent safety profile",
      "If you have Leber's hereditary optic neuropathy, discuss with a clinician before high-dose hydroxocobalamin",
    ],
    foodFirst:
      "Animal foods (meat, fish, eggs, dairy) are reliable sources. Fortified breakfast cereals and nutritional yeast can supply B12 for plant-based diets, but intake is often inconsistent — a low-dose supplement is typically more reliable for vegans.",
    evidenceSummary:
      "Strong, well-established evidence supports supplementation in deficient populations. Vegans without supplementation almost universally develop low B12 over time. Symptoms of deficiency (fatigue, neuropathy, cognitive changes) can be irreversible if uncorrected — prevention is far better than treatment.",
    dosing:
      "Routine prevention in vegans: 25–100 mcg/day or 1,000 mcg 2–3 times per week as cyanocobalamin or methylcobalamin. For documented deficiency, higher doses or B12 injections under medical supervision.",
    qualityChecklist: [
      "Cyanocobalamin (most studied, stable, inexpensive) or methylcobalamin",
      "Sublingual and oral tablets are both effective for most people",
      "Third-party tested (USP, NSF)",
    ],
    safety: [
      "No established Tolerable Upper Intake Level — excess is excreted in urine",
      "Interacts with chloramphenicol (rare)",
      "Very rare allergic reactions to cobalt or formulation excipients",
    ],
    faqs: [
      {
        q: "Do vegans really need a B12 supplement?",
        a: "Yes. B12 is produced by bacteria, not plants. Unfortified plant foods do not contain reliable B12. Every major vegan nutrition organization recommends supplementation.",
      },
      {
        q: "Is methylcobalamin better than cyanocobalamin?",
        a: "For most people, both forms correct deficiency equally well. Cyanocobalamin is more studied, more stable, and cheaper. Methylcobalamin is preferred by some clinicians for specific neurological conditions.",
      },
      {
        q: "Can I overdose on B12?",
        a: "B12 has no established upper limit. Excess is water-soluble and excreted. High oral doses are routinely used clinically without adverse effects.",
      },
    ],
    citations: [
      NIH("VitaminB12-Consumer", "NIH ODS — Vitamin B12 Fact Sheet"),
      NIH("VitaminB12-HealthProfessional", "NIH ODS — Vitamin B12 for Health Professionals"),
    ],
    related: ["multivitamin", "iron", "omega-3"],
  },
  {
    slug: "omega-3",
    supplement: "Omega-3 (EPA/DHA)",
    metaTitle: "Omega-3 EPA/DHA: Evidence, Dose, and Safety | Supplement Match",
    metaDescription:
      "Marine omega-3 (EPA/DHA) for heart, brain, and triglycerides. Conservative doses, who benefits most, drug interactions, and food-first sources.",
    h1: "Omega-3 (EPA/DHA): What the Evidence Actually Shows",
    lede:
      "Marine omega-3 fatty acids (EPA and DHA) play documented roles in cardiovascular and neurological health. Benefits are clearest for people with low fish intake or elevated triglycerides.",
    whoItMayHelp: [
      "Adults eating fatty fish less than twice per week",
      "People with elevated triglycerides (per clinician)",
      "Pregnant and breastfeeding people (DHA for fetal/infant neurodevelopment, per ACOG)",
      "Vegans and vegetarians (algae-derived DHA/EPA)",
    ],
    whoShouldAvoid: [
      "People on warfarin or other anticoagulants — discuss with clinician (additive bleeding risk)",
      "People scheduled for surgery within 1–2 weeks — pause unless clinician advises otherwise",
      "People with seafood allergy (use algae-derived form)",
    ],
    foodFirst:
      "Two servings per week of low-mercury fatty fish (salmon, sardines, mackerel, herring, trout) is the most evidence-supported way to get EPA/DHA. ALA from flax, chia, and walnuts converts to EPA/DHA inefficiently in humans.",
    evidenceSummary:
      "Strong evidence supports EPA/DHA for lowering triglycerides at pharmacologic doses (2–4 g/day under medical supervision). Mixed evidence for primary prevention of cardiovascular events in well-fed populations; clearer benefit in high-risk groups (REDUCE-IT used 4 g/day icosapent ethyl). DHA is recommended in pregnancy for fetal neurodevelopment.",
    dosing:
      "General wellness: 250–1,000 mg combined EPA+DHA per day. Triglyceride lowering: 2–4 g/day, prescription-grade, under medical supervision.",
    qualityChecklist: [
      "Look at the EPA+DHA total on the label, not the total 'fish oil' weight",
      "Third-party tested for oxidation (TOTOX) and heavy metals (IFOS, USP)",
      "Triglyceride or re-esterified triglyceride forms absorb well",
      "Vegan: algae-derived EPA/DHA",
    ],
    safety: [
      "Bleeding risk increases with anticoagulants and antiplatelets at high doses",
      "Mild GI upset and 'fish burps' are common — try with meals or enteric-coated",
      "Some products are rancid; store in a cool, dark place",
    ],
    faqs: [
      {
        q: "How much omega-3 should I take per day?",
        a: "For general wellness, 250–1,000 mg combined EPA+DHA per day is a reasonable conservative range. Higher doses (2–4 g) for triglyceride lowering should be supervised by a clinician.",
      },
      {
        q: "Is fish oil better than flaxseed oil?",
        a: "For EPA and DHA specifically, yes. Flaxseed provides ALA, which the body converts to EPA/DHA inefficiently (often less than 10%). Algae-derived EPA/DHA is a vegan-friendly direct source.",
      },
      {
        q: "Can I take omega-3 with blood thinners?",
        a: "Not without medical supervision. Omega-3 has mild antiplatelet effects that can compound the effect of warfarin, aspirin, or DOACs.",
      },
    ],
    citations: [
      NIH("Omega3FattyAcids-Consumer", "NIH ODS — Omega-3 Fatty Acids Fact Sheet"),
      NIH("Omega3FattyAcids-HealthProfessional", "NIH ODS — Omega-3 for Health Professionals"),
      {
        label: "REDUCE-IT Trial — Bhatt et al., NEJM 2019",
        url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1812792",
      },
    ],
    related: ["vitamin-d", "magnesium", "multivitamin"],
  },
  {
    slug: "magnesium",
    supplement: "Magnesium",
    metaTitle: "Magnesium: Forms, Dose, and Who Benefits | Supplement Match",
    metaDescription:
      "Magnesium glycinate, citrate, oxide — which form, what dose, and who actually benefits. Evidence-based guide with safety and interactions.",
    h1: "Magnesium: Choosing the Right Form for the Right Reason",
    lede:
      "Magnesium is involved in over 300 enzymatic reactions, including muscle function, nerve signaling, and energy metabolism. Many adults fall below the recommended intake from diet alone.",
    whoItMayHelp: [
      "Adults whose diets are low in leafy greens, nuts, seeds, and whole grains",
      "People with frequent muscle cramps (after ruling out other causes)",
      "People with mild constipation (magnesium citrate or oxide)",
      "People with documented hypomagnesemia",
      "Athletes with heavy sweat losses",
    ],
    whoShouldAvoid: [
      "People with chronic kidney disease — risk of dangerous accumulation",
      "People taking bisphosphonates, tetracycline, or quinolone antibiotics (separate dosing by 2+ hours)",
      "People with bradycardia or heart-block at high doses",
    ],
    foodFirst:
      "Pumpkin seeds, almonds, cashews, spinach, black beans, edamame, dark chocolate, and whole grains are reliable sources. A varied plant-forward diet usually meets the RDA without supplementation.",
    evidenceSummary:
      "Moderate evidence supports magnesium for replenishing deficiency, easing constipation, and modestly improving sleep onset in older adults. Evidence for migraines and blood pressure is limited but suggestive at the upper end of the dosing range, under clinician guidance.",
    dosing:
      "RDA: 310–420 mg/day from all sources. Supplemental tolerable upper limit (from supplements alone, not food): 350 mg/day. Common supplement doses: 100–300 mg elemental magnesium.",
    qualityChecklist: [
      "Glycinate or bisglycinate: well-absorbed, gentle on the gut, good for general use and sleep",
      "Citrate: well-absorbed, may have laxative effect — useful for constipation",
      "Oxide: cheap, poor absorption, mainly a laxative",
      "Avoid 'proprietary blends' that hide elemental magnesium per serving",
    ],
    safety: [
      "Diarrhea is the most common side effect, especially with oxide and citrate",
      "Reduces absorption of certain antibiotics and bisphosphonates — separate dosing",
      "Risk of toxicity in kidney impairment",
    ],
    faqs: [
      {
        q: "Which form of magnesium is best?",
        a: "It depends on the goal. Glycinate is well-tolerated for general use and sleep. Citrate is well-absorbed and mildly laxative. Oxide is poorly absorbed and mostly useful as a laxative.",
      },
      {
        q: "Will magnesium help me sleep?",
        a: "Evidence is modest. Some trials in older adults show improved sleep onset with 300–500 mg/day. It is not a sedative; do not expect dramatic effects.",
      },
      {
        q: "Is magnesium safe with kidney disease?",
        a: "No, not without nephrology supervision. The kidneys are the primary route of excretion, and accumulation can be dangerous.",
      },
    ],
    citations: [
      NIH("Magnesium-Consumer", "NIH ODS — Magnesium Fact Sheet"),
      NIH("Magnesium-HealthProfessional", "NIH ODS — Magnesium for Health Professionals"),
    ],
    related: ["vitamin-d", "calcium", "creatine"],
  },
  {
    slug: "iron",
    supplement: "Iron",
    metaTitle: "Iron Supplements: Test First, Then Supplement | Supplement Match",
    metaDescription:
      "Iron should be supplemented only when a blood test shows you need it. Risks of overload, who's actually deficient, and food-first strategies.",
    h1: "Iron: Why You Should Never Supplement Without a Blood Test",
    lede:
      "Iron deficiency is common, especially in menstruating people and pregnancy — but iron overload is dangerous, often silent, and can damage the heart and liver. Test before you supplement.",
    whoItMayHelp: [
      "People with documented iron-deficiency anemia (low ferritin, low hemoglobin, low MCV)",
      "Pregnant people — under prenatal care, per ACOG",
      "Heavy menstrual bleeding with documented low ferritin",
      "Endurance athletes with confirmed deficiency",
    ],
    whoShouldAvoid: [
      "Adult men and post-menopausal women without a confirmed deficiency",
      "Anyone with hereditary hemochromatosis or unexplained elevated ferritin",
      "Anyone with chronic liver disease, without specialist guidance",
    ],
    foodFirst:
      "Heme iron (more bioavailable): red meat, poultry, fish. Non-heme iron: legumes, tofu, lentils, fortified cereals, pumpkin seeds, spinach. Pair non-heme iron with vitamin C–rich foods to boost absorption; avoid coffee/tea with iron-rich meals.",
    evidenceSummary:
      "Strong evidence supports iron supplementation for documented iron-deficiency anemia. Supplementation in iron-replete people offers no known benefit and carries real risk — iron is a pro-oxidant and is stored cumulatively. This is why Supplement Match never recommends iron without lab work.",
    dosing:
      "For documented deficiency, typical replacement is 40–80 mg elemental iron 2–3 times per week (alternate-day dosing improves absorption and reduces side effects). Always under clinician guidance.",
    qualityChecklist: [
      "Ferrous bisglycinate (gentle on the gut) or ferrous sulfate (cheap, well-studied)",
      "Take with vitamin C–rich food; avoid coffee, tea, calcium, and dairy within 2 hours",
      "Third-party tested",
    ],
    safety: [
      "Constipation, nausea, dark stools are common",
      "Acute overdose is a leading cause of pediatric poisoning — keep tightly capped and out of reach",
      "Interacts with levothyroxine, levodopa, tetracyclines, quinolones, PPIs",
      "Mandatory clinician oversight in hemochromatosis, thalassemia, chronic liver disease",
    ],
    testFirst:
      "Required. Ask your clinician for ferritin, hemoglobin, MCV, and transferrin saturation before starting iron. Supplementing without these values is unsafe.",
    faqs: [
      {
        q: "Should I take iron 'just in case' I'm low?",
        a: "No. Iron overload is dangerous and often silent. Always get ferritin and a complete blood count tested first.",
      },
      {
        q: "Is alternate-day iron better than daily?",
        a: "Recent research suggests alternate-day dosing improves fractional absorption and reduces GI side effects compared to daily dosing.",
      },
      {
        q: "Why does iron upset my stomach?",
        a: "Ferrous sulfate often causes nausea and constipation. Ferrous bisglycinate is gentler. Taking with food reduces absorption but improves tolerance.",
      },
    ],
    citations: [
      NIH("Iron-Consumer", "NIH ODS — Iron Fact Sheet"),
      NIH("Iron-HealthProfessional", "NIH ODS — Iron for Health Professionals"),
      {
        label: "Stoffel et al., Lancet Haematology 2017 — Alternate-day iron",
        url: "https://www.thelancet.com/journals/lanhae/article/PIIS2352-3026(17)30182-5/fulltext",
      },
    ],
    related: ["vitamin-b12", "vitamin-c", "multivitamin"],
  },
  {
    slug: "creatine",
    supplement: "Creatine Monohydrate",
    metaTitle: "Creatine Monohydrate: Evidence and Safety | Supplement Match",
    metaDescription:
      "Creatine monohydrate is one of the most-studied sports supplements. Who benefits, conservative dosing, hydration, and kidney safety.",
    h1: "Creatine Monohydrate: The Most-Studied Sports Supplement",
    lede:
      "Creatine monohydrate has decades of evidence for improving strength, power, and lean mass when combined with resistance training. Effects are real, modest, and well-characterized.",
    whoItMayHelp: [
      "Adults doing regular resistance training (3+ sessions/week)",
      "Athletes in power, sprint, or repeated-effort sports",
      "Vegetarians and vegans (lower baseline muscle creatine)",
      "Older adults pairing supplementation with resistance training (sarcopenia)",
    ],
    whoShouldAvoid: [
      "People with pre-existing kidney disease — discuss with nephrology first",
      "Children and adolescents under 18 — not recommended for general use",
      "Anyone with a single kidney or known renal abnormality, without medical clearance",
    ],
    foodFirst:
      "Red meat and fish contain roughly 1–2 g of creatine per pound. Reaching supplementation-level doses through food alone is impractical and calorie-dense.",
    evidenceSummary:
      "Strong evidence (ISSN position stand) supports creatine monohydrate for strength, power, repeated high-intensity work, and lean mass gains when combined with training. Long-term safety in healthy adults is well-documented across multi-year studies.",
    dosing:
      "3–5 g/day of creatine monohydrate, taken any time of day. A 'loading phase' (20 g/day for 5–7 days) is optional and saturates muscle stores faster but is not required.",
    qualityChecklist: [
      "Creatine monohydrate only — 'fancy' forms (HCl, ethyl ester, buffered) are not better and cost more",
      "Look for Creapure® or third-party tested (Informed Sport, NSF)",
      "Unflavored powder mixes easily with water or any beverage",
    ],
    safety: [
      "Initial 1–2 kg weight gain from intracellular water — expected, not fat",
      "Does not damage kidneys in healthy individuals; serum creatinine may rise modestly without true renal impairment",
      "Stay well-hydrated",
      "Rare GI upset at higher single doses — split into 2.5 g twice daily if needed",
    ],
    faqs: [
      {
        q: "Do I need to load creatine?",
        a: "No. Loading (20 g/day for 5–7 days) saturates muscle stores faster, but 3–5 g/day reaches the same plateau in 3–4 weeks with fewer GI complaints.",
      },
      {
        q: "Will creatine damage my kidneys?",
        a: "In healthy adults, multi-year studies show no harm. People with pre-existing kidney disease should consult a nephrologist before supplementing.",
      },
      {
        q: "Is creatine safe for women?",
        a: "Yes. Evidence supports the same benefits in women, particularly for strength and lean mass with training.",
      },
    ],
    citations: [
      {
        label: "ISSN Position Stand on Creatine — Kreider et al., 2017",
        url: "https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0173-z",
      },
      {
        label: "Antonio et al. 2021 — Common Questions about Creatine",
        url: "https://jissn.biomedcentral.com/articles/10.1186/s12970-021-00412-w",
      },
    ],
    related: ["magnesium", "vitamin-d", "multivitamin"],
  },
  {
    slug: "zinc",
    supplement: "Zinc",
    metaTitle: "Zinc: When It Helps and When to Stop | Supplement Match",
    metaDescription:
      "Zinc for immune support and wound healing — short courses only. Long-term overuse causes copper deficiency. Conservative doses and safety.",
    h1: "Zinc: A Short-Course Supplement, Not a Daily Habit",
    lede:
      "Zinc plays a key role in immune function, wound healing, taste, and protein synthesis. It works best in clear deficiency or short, targeted courses — chronic high-dose use depletes copper.",
    whoItMayHelp: [
      "Adults with documented zinc deficiency",
      "People with malabsorption (Crohn's, celiac, post-bariatric)",
      "Acute cold onset — lozenges within 24 hours, short course only",
      "Vegans and vegetarians at risk of low intake",
    ],
    whoShouldAvoid: [
      "Anyone taking long-term high-dose zinc without copper",
      "People on quinolone or tetracycline antibiotics within 2 hours of zinc dose",
      "People taking penicillamine (rheumatologic) — separate dosing",
    ],
    foodFirst:
      "Oysters are the densest source. Other reliable sources: beef, poultry, pumpkin seeds, cashews, lentils, chickpeas, fortified cereals.",
    evidenceSummary:
      "Strong evidence for zinc in deficiency. Moderate evidence that zinc lozenges (75–100 mg/day, short course) shorten the common cold when started within 24 hours. Long-term doses above 40 mg/day reliably cause copper deficiency, which can mimic neurologic disease.",
    dosing:
      "RDA: 8–11 mg/day. Tolerable Upper Intake Level: 40 mg/day from all sources. Cold-shortening lozenges: 75–100 mg/day for up to 5–7 days only, then stop.",
    qualityChecklist: [
      "Zinc picolinate, citrate, or gluconate — all well-absorbed",
      "Zinc oxide is poorly absorbed",
      "Take with food to reduce nausea",
      "Pair long-term doses with copper (1 mg copper per 15 mg zinc)",
    ],
    safety: [
      "Nausea on an empty stomach is common",
      "Long-term doses above 40 mg/day cause copper deficiency",
      "Interferes with absorption of certain antibiotics — separate by 2 hours",
      "Intranasal zinc has caused permanent anosmia — avoid",
    ],
    faqs: [
      {
        q: "Should I take zinc every day?",
        a: "Not at high doses. The RDA is 8–11 mg/day. Long-term doses above 40 mg/day cause copper deficiency. Short courses for colds are fine; daily megadoses are not.",
      },
      {
        q: "Do zinc lozenges shorten colds?",
        a: "Meta-analyses suggest a modest reduction in cold duration when started within 24 hours of symptoms at 75–100 mg/day of zinc acetate or gluconate. Stop after 5–7 days.",
      },
    ],
    citations: [
      NIH("Zinc-Consumer", "NIH ODS — Zinc Fact Sheet"),
      NIH("Zinc-HealthProfessional", "NIH ODS — Zinc for Health Professionals"),
    ],
    related: ["vitamin-c", "vitamin-d", "multivitamin"],
  },
  {
    slug: "vitamin-c",
    supplement: "Vitamin C",
    metaTitle: "Vitamin C: Realistic Benefits and Dose | Supplement Match",
    metaDescription:
      "Vitamin C supports collagen synthesis, antioxidant defense, and non-heme iron absorption. Conservative dosing and the truth about colds.",
    h1: "Vitamin C: What It Does, and What Megadoses Don't Do",
    lede:
      "Vitamin C is essential for collagen synthesis, antioxidant defense, and dramatically improves non-heme iron absorption. The body can only absorb a limited amount at once — megadoses mostly become expensive urine.",
    whoItMayHelp: [
      "People with low fruit and vegetable intake",
      "Smokers (RDA is 35 mg/day higher)",
      "Anyone supplementing non-heme iron — taken together to boost absorption",
      "People recovering from surgery or wounds (clinician-guided)",
    ],
    whoShouldAvoid: [
      "People with kidney stones (oxalate type) — high doses raise oxalate excretion",
      "People with G6PD deficiency at very high IV doses",
      "People with hemochromatosis — vitamin C boosts iron absorption",
    ],
    foodFirst:
      "Citrus, kiwi, strawberries, bell peppers, broccoli, kale, tomatoes. The RDA is easily met by one serving of most of these.",
    evidenceSummary:
      "Strong evidence for preventing scurvy and supporting iron absorption. Moderate evidence that regular supplementation (200 mg+/day) slightly reduces cold duration but does not prevent colds in the general population. No strong evidence that megadoses prevent or treat serious disease in well-nourished people.",
    dosing:
      "RDA: 75–90 mg/day (smokers +35 mg). Tolerable Upper Intake Level: 2,000 mg/day. Common supplement dose: 250–500 mg/day, which is well above the RDA.",
    qualityChecklist: [
      "Plain ascorbic acid is fine; 'liposomal' and 'buffered' forms offer marginal benefit at higher cost",
      "Split high doses across the day to improve total absorption",
    ],
    safety: [
      "GI upset and diarrhea above ~2,000 mg/day",
      "Increases iron absorption — caution in iron overload",
      "May interfere with some chemotherapy regimens — check with oncology",
    ],
    faqs: [
      {
        q: "Will vitamin C prevent a cold?",
        a: "Regular supplementation does not prevent colds in the general population. It may modestly reduce duration (about 8% in adults). Starting it after symptoms begin has minimal effect.",
      },
      {
        q: "Are megadoses of vitamin C safe?",
        a: "Doses above 2,000 mg/day commonly cause GI upset and may increase kidney stone risk in susceptible people. There is no strong evidence that megadoses prevent disease.",
      },
    ],
    citations: [
      NIH("VitaminC-Consumer", "NIH ODS — Vitamin C Fact Sheet"),
      NIH("VitaminC-HealthProfessional", "NIH ODS — Vitamin C for Health Professionals"),
    ],
    related: ["iron", "zinc", "multivitamin"],
  },
  {
    slug: "calcium",
    supplement: "Calcium",
    metaTitle: "Calcium: Food First, Pills Carefully | Supplement Match",
    metaDescription:
      "Calcium supports bone and muscle function — but food sources are safer than high-dose pills. Cardiovascular concerns and conservative dosing.",
    h1: "Calcium: Food Is the Better Delivery System",
    lede:
      "Calcium is essential for bone, muscle, and nerve function. Modern guidance favors meeting needs through food first — high-dose calcium supplements have been linked to cardiovascular and kidney-stone concerns in some studies.",
    whoItMayHelp: [
      "People who avoid dairy and fortified plant milks and don't get calcium from greens, tofu, or fish bones",
      "Postmenopausal people, under clinician guidance with vitamin D",
      "People with documented osteoporosis or osteopenia, under medical care",
    ],
    whoShouldAvoid: [
      "Anyone meeting needs from food — extra calcium is not better",
      "People with hypercalcemia or hyperparathyroidism",
      "People with a history of kidney stones at high supplemental doses",
    ],
    foodFirst:
      "Dairy (milk, yogurt, cheese), fortified plant milks, calcium-set tofu, sardines/canned salmon with bones, kale, bok choy, almonds. Two to three calcium-rich servings per day usually meets the RDA without pills.",
    evidenceSummary:
      "Strong evidence for total calcium intake supporting bone health, especially when paired with vitamin D. Some observational data raises concerns about high-dose calcium supplements (not dietary calcium) and cardiovascular events; evidence remains mixed. The safer default is dietary calcium plus targeted supplementation only when intake is genuinely low.",
    dosing:
      "RDA: 1,000–1,200 mg/day from all sources. If supplementing, doses of 500 mg or less per dose absorb best. Total supplemental calcium typically does not need to exceed the gap between diet and RDA.",
    qualityChecklist: [
      "Calcium citrate absorbs well with or without food and in low-acid stomachs",
      "Calcium carbonate is cheaper but needs food and stomach acid",
      "Pair with vitamin D and adequate magnesium",
      "Split doses — single doses above 500 mg are poorly absorbed",
    ],
    safety: [
      "Constipation, bloating, gas",
      "Reduces absorption of levothyroxine, bisphosphonates, tetracyclines, quinolones, iron — separate by 2–4 hours",
      "Kidney stone risk increases with high doses in susceptible people",
    ],
    faqs: [
      {
        q: "Should I take a calcium supplement for my bones?",
        a: "Only if your dietary calcium is below the RDA. Most adults can meet needs with 2–3 calcium-rich servings per day. Pair calcium intake with vitamin D and weight-bearing exercise.",
      },
      {
        q: "Are calcium pills bad for the heart?",
        a: "Evidence is mixed. Some studies link high-dose calcium supplements (but not dietary calcium) to a small increase in cardiovascular events. Food-first is the safer default.",
      },
    ],
    citations: [
      NIH("Calcium-Consumer", "NIH ODS — Calcium Fact Sheet"),
      NIH("Calcium-HealthProfessional", "NIH ODS — Calcium for Health Professionals"),
    ],
    related: ["vitamin-d", "magnesium", "multivitamin"],
  },
  {
    slug: "probiotics",
    supplement: "Probiotics",
    metaTitle: "Probiotics: Strain-Specific Evidence | Supplement Match",
    metaDescription:
      "Probiotics work strain by strain, not as a generic category. What's actually supported, and who should avoid them.",
    h1: "Probiotics: Strains Matter More Than Brands",
    lede:
      "Probiotic effects are strain-specific. 'A probiotic' is not a single thing — different strains target different outcomes. Generic labels rarely tell you what you're getting.",
    whoItMayHelp: [
      "People taking antibiotics — Saccharomyces boulardii or specific Lactobacillus strains for antibiotic-associated diarrhea",
      "Travelers — strain-specific prevention of traveler's diarrhea",
      "People with IBS — certain strains modestly improve symptoms",
      "Infants/children with acute diarrhea — under pediatric guidance",
    ],
    whoShouldAvoid: [
      "Severely immunocompromised people (cancer chemotherapy, post-transplant, severe pancreatitis)",
      "Critically ill patients — without specialist input",
      "Infants in the NICU — without neonatology guidance",
    ],
    foodFirst:
      "Fermented foods (yogurt with live cultures, kefir, sauerkraut, kimchi, miso, tempeh) provide diverse live microbes and supportive nutrients. Fiber-rich plants feed the existing microbiome — often more impactful than any pill.",
    evidenceSummary:
      "Strain-by-strain evidence varies from strong (specific Lactobacillus and Saccharomyces strains for antibiotic-associated diarrhea, AGA guideline) to limited (most generic 'gut health' claims). Always look up the specific strain and indication, not the brand.",
    dosing:
      "Dose is reported in CFU (colony-forming units) and is strain-specific. Typical effective ranges: 10⁹–10¹¹ CFU/day of clinically studied strains.",
    qualityChecklist: [
      "Specific strain names listed (e.g. Lactobacillus rhamnosus GG, not just 'Lactobacillus')",
      "CFU guaranteed through end of shelf life, not just at manufacture",
      "Refrigeration may be required — check label",
      "Third-party verification of identity and viability",
    ],
    safety: [
      "Gas and bloating in the first 1–2 weeks is common",
      "Rare bloodstream infections in severely immunocompromised people",
      "Stop and consult a clinician if symptoms worsen",
    ],
    faqs: [
      {
        q: "Are all probiotics the same?",
        a: "No. Effects are strain-specific. Lactobacillus rhamnosus GG and Saccharomyces boulardii have evidence for specific indications; many marketed products use unstudied strain combinations.",
      },
      {
        q: "Should I take a probiotic with antibiotics?",
        a: "For prevention of antibiotic-associated diarrhea, specific strains have evidence. Take the probiotic at least 2 hours apart from the antibiotic dose.",
      },
    ],
    citations: [
      {
        label: "AGA Clinical Guideline on Probiotics, Gastroenterology 2020",
        url: "https://gastro.org/practice-guidance/practice-updates/probiotics/",
      },
      NIH("Probiotics-Consumer", "NIH ODS — Probiotics Fact Sheet"),
    ],
    related: ["vitamin-d", "multivitamin", "magnesium"],
  },
  {
    slug: "melatonin",
    supplement: "Melatonin",
    metaTitle: "Melatonin: Low-Dose, Short-Term Use | Supplement Match",
    metaDescription:
      "Melatonin works best at low doses for jet lag and shift work — not as a nightly sleeping pill. Safety in pregnancy and children covered.",
    h1: "Melatonin: A Circadian Cue, Not a Sleeping Pill",
    lede:
      "Melatonin is a hormone that signals nighttime to the body. It is most useful for resetting circadian rhythm (jet lag, shift work) at low doses — not as a sedative.",
    whoItMayHelp: [
      "Adults with jet lag — 0.3–1 mg, timed to destination bedtime, for a few nights",
      "Shift workers, under occupational health guidance",
      "Adults with delayed sleep phase disorder, under medical care",
    ],
    whoShouldAvoid: [
      "Pregnant and breastfeeding people — insufficient safety data; avoid unless clinician advises",
      "Children and adolescents — only under pediatric/sleep-specialist guidance, never as a parental shortcut",
      "People on warfarin, immunosuppressants, or seizure medications — interaction risk",
      "People with autoimmune disease — discuss with rheumatology first",
    ],
    foodFirst:
      "Consistent bedtimes, dim light 1–2 hours before bed, morning bright light, and avoiding caffeine after midday have larger and more durable effects on sleep than melatonin.",
    evidenceSummary:
      "Moderate evidence supports low-dose, short-term melatonin for jet lag and circadian disorders. Weaker evidence for chronic insomnia. Over-the-counter products in the U.S. are often poorly dose-controlled — independent testing has found wide variance from label-stated amounts.",
    dosing:
      "0.3–1 mg taken 30–60 minutes before the target bedtime is sufficient for most circadian uses. Higher doses (3–10 mg) are widely sold but offer no consistent additional benefit and increase next-day grogginess.",
    qualityChecklist: [
      "Choose third-party tested brands (USP, NSF)",
      "Lower doses (0.3–1 mg) are usually preferable",
      "Immediate-release for circadian phase shifting; sustained-release for sleep maintenance",
    ],
    safety: [
      "Next-day grogginess, vivid dreams, headache",
      "Interacts with anticoagulants, anticonvulsants, immunosuppressants, contraceptives",
      "Avoid in pregnancy, breastfeeding, and routine pediatric use",
    ],
    faqs: [
      {
        q: "Is melatonin safe to take every night?",
        a: "Short-term use is generally well-tolerated in healthy adults. Long-term nightly use has limited safety data. It is best used for specific circadian goals, not as a default sleep aid.",
      },
      {
        q: "Why does the standard 3 mg or 5 mg dose feel too strong?",
        a: "Because it usually is. Studies often show 0.3–1 mg is sufficient. Larger doses produce supraphysiologic blood levels and can cause next-day grogginess.",
      },
      {
        q: "Can I give melatonin to my child?",
        a: "Only under pediatric or sleep-specialist guidance. Routine use in children is not recommended, and accidental pediatric ingestion has risen sharply.",
      },
    ],
    citations: [
      {
        label: "AASM Clinical Practice Guideline — Chronic Insomnia, 2017",
        url: "https://aasm.org/clinical-resources/practice-standards/practice-guidelines/",
      },
      {
        label: "Erland & Saxena 2017 — Melatonin Content vs Label",
        url: "https://jcsm.aasm.org/doi/10.5664/jcsm.6462",
      },
    ],
    related: ["magnesium", "vitamin-d", "multivitamin"],
  },
  {
    slug: "multivitamin",
    supplement: "Multivitamin",
    metaTitle: "Do You Need a Multivitamin? An Honest Answer | Supplement Match",
    metaDescription:
      "Multivitamins are insurance, not optimization. Who genuinely benefits, what to look for, and what to avoid.",
    h1: "Multivitamins: Useful Insurance for Some, Unnecessary for Many",
    lede:
      "A multivitamin is dietary insurance — it covers gaps when intake is inconsistent. It does not extend lifespan in well-nourished adults and is not a substitute for food.",
    whoItMayHelp: [
      "Adults with inconsistent diets, calorie restriction, or restrictive eating patterns",
      "Older adults (B12 absorption declines with age)",
      "People after bariatric surgery (specific bariatric formulations under medical care)",
      "People with malabsorption (celiac, Crohn's)",
      "Vegans (for B12, D, iodine, possibly zinc)",
    ],
    whoShouldAvoid: [
      "Anyone with a varied, adequate diet who is already meeting RDAs",
      "Pregnant people should use a prenatal — not a generic multi (different folate, iodine, iron, DHA requirements)",
      "Smokers and former smokers should avoid high-dose beta-carotene formulations (CARET trial)",
    ],
    foodFirst:
      "A whole-foods, plant-forward diet with adequate protein covers most micronutrient needs. Specific gaps (B12 for vegans, vitamin D for low-sun populations, iron for menstruating people with low intake) are better addressed individually than with a one-size-fits-all multi.",
    evidenceSummary:
      "Large trials (PHS-II, COSMOS) show modest cognitive benefits and no clear mortality benefit from generic multivitamin use in well-nourished adults. Benefit is concentrated in groups with documented gaps. Megadose 'comprehensive' formulas with thousands of percent of RDA offer no additional benefit and increase risk for fat-soluble vitamins.",
    dosing:
      "Once daily at or near 100% of RDA for most nutrients. Avoid 'mega' formulas. Iron-free for adult men and post-menopausal women unless deficiency is documented.",
    qualityChecklist: [
      "USP Verified, NSF Certified, or Informed Choice tested",
      "Reasonable dosing (100–200% RDA, not 5,000%)",
      "Methylated folate (5-MTHF) if you have MTHFR concerns and a clinician has advised it",
      "No beta-carotene if smoker or former smoker",
      "Iron-free for adult men unless documented deficiency",
    ],
    safety: [
      "Generally safe at RDA-level doses",
      "Risk of vitamin A toxicity in pregnancy if retinol content is high — use prenatals instead",
      "Beta-carotene supplementation raises lung cancer risk in smokers",
      "Watch for double-dosing if combining with single-nutrient supplements",
    ],
    faqs: [
      {
        q: "Do multivitamins extend lifespan?",
        a: "Large randomized trials in well-nourished adults have not shown a mortality benefit. They may provide modest cognitive benefit in older adults (COSMOS-Mind), and they do prevent deficiency in at-risk groups.",
      },
      {
        q: "Should I take a prenatal even if not pregnant?",
        a: "No. Prenatals have higher iron, folic acid, and iodine than non-pregnant adults need. Use a standard adult multivitamin or address specific gaps individually.",
      },
      {
        q: "Are gummy multivitamins as good as pills?",
        a: "They often contain less of certain nutrients (especially iron and minerals) and add sugar. They are a reasonable choice for people who won't take pills, but check the label carefully.",
      },
    ],
    citations: [
      {
        label: "PHS-II — Sesso et al., JAMA 2012",
        url: "https://jamanetwork.com/journals/jama/fullarticle/1380451",
      },
      {
        label: "COSMOS-Mind — Baker et al., Alzheimer's & Dementia 2022",
        url: "https://alz-journals.onlinelibrary.wiley.com/doi/10.1002/alz.12767",
      },
      {
        label: "CARET — Omenn et al., NEJM 1996",
        url: "https://www.nejm.org/doi/full/10.1056/NEJM199605023341802",
      },
    ],
    related: ["vitamin-d", "vitamin-b12", "omega-3"],
  },
];

export const TOPIC_SLUGS = SEO_TOPICS.map((t) => t.slug);

export function findTopic(slug: string): TopicCopy | undefined {
  return SEO_TOPICS.find((t) => t.slug === slug);
}
