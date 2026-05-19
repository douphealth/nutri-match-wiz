import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Brain } from "lucide-react";
import QuizHero from "@/components/quiz/QuizHero";
import QuizProgress from "@/components/quiz/QuizProgress";
import QuizStepContent from "@/components/quiz/QuizStepContent";
import QuizNavigation from "@/components/quiz/QuizNavigation";
import AnalyzingScreen from "@/components/quiz/AnalyzingScreen";
import {
  quizSteps,
  defaultAnswers,
  answeredCount,
  isStepAnswered,
  generateSlug,
  visibleSteps,
  type QuizAnswers,
} from "@/lib/quiz-data";
import { storeAnswersForSlug } from "@/lib/result-storage";
import { captureUTM } from "@/lib/utm";

const SITE = "https://gearuptofit.com/supplement-match/";

export const Route = createFileRoute("/")({
  head: () => {
    const webAppLd = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Supplement Match by GearUpToFit",
      url: SITE,
      applicationCategory: "HealthApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Free, evidence-aware vitamin and supplement quiz. 19 questions, one personalized, safety-first supplement plan with transparent scoring and food-first alternatives.",
      publisher: {
        "@type": "Organization",
        name: "GearUpToFit",
        url: "https://gearuptofit.com",
      },
    };
    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this supplement quiz medical advice?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. The quiz is for educational purposes only and does not diagnose, treat, cure, or prevent any disease. Always talk with a qualified clinician, pharmacist, or registered dietitian before starting, stopping, or changing supplements.",
          },
        },
        {
          "@type": "Question",
          name: "How does the supplement match quiz work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Your answers feed a deterministic, transparent scoring engine that weighs diet, training, lifestyle, lab-risk markers, and medication interactions against an evidence-aware supplement catalog. Same answers always produce the same ranking — no random shuffling.",
          },
        },
        {
          "@type": "Question",
          name: "Are recommendations biased toward affiliate revenue?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Ranking is commission-blind. Affiliate links to third-party-tested products are added only after the score is computed.",
          },
        },
        {
          "@type": "Question",
          name: "Why does third-party testing matter?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Dietary supplements are not FDA-approved before marketing. Independent verification (USP, NSF, Informed Sport, Informed Choice, ConsumerLab) confirms label accuracy and screens for contaminants and banned substances.",
          },
        },
      ],
    };
    return {
      meta: [
        { title: "Supplement Match — Find Your Best-Fit Vitamins in 90 Seconds" },
        {
          name: "description",
          content:
            "Free evidence-aware vitamin & supplement quiz by GearUpToFit. 19 questions, one personalized, safety-first supplement plan with transparent scoring and food-first alternatives.",
        },
        { property: "og:title", content: "Supplement Match — GearUpToFit" },
        {
          property: "og:description",
          content:
            "90-second quiz. Evidence-aware scoring. Personalized supplement plan with safety checks.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: SITE },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: SITE }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(webAppLd) },
        { type: "application/ld+json", children: JSON.stringify(faqLd) },
      ],
    };
  },
  component: Index,
});

function Index() {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = hero
  const [answers, setAnswers] = useState<QuizAnswers>(defaultAnswers);
  const [analyzing, setAnalyzing] = useState(false);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    captureUTM();
  }, []);

  const answered = useMemo(() => answeredCount(answers), [answers]);
  const confidence = Math.round((answered / quizSteps.length) * 100);

  const progress = currentStep >= 0 ? ((currentStep + 1) / quizSteps.length) * 100 : 0;
  const isLast = currentStep === quizSteps.length - 1;
  const step = currentStep >= 0 ? quizSteps[currentStep] : null;

  const finish = useCallback(() => {
    const slug = generateSlug(answers);
    // Privacy-first: answers live only in sessionStorage. The URL contains the
    // slug — nothing else. Users can opt in to a sanitized share link from the
    // result page.
    storeAnswersForSlug(slug, answers);
    setPendingSlug(slug);
    setAnalyzing(true);
  }, [answers]);

  const handleAnalyzingDone = useCallback(() => {
    if (!pendingSlug) return;
    navigate({
      to: "/supplement-match/$slug",
      params: { slug: pendingSlug },
    }).catch(() => {
      /* result route may be absent — sessionStorage still holds the answers */
    });
  }, [pendingSlug, navigate]);

  // Adaptive navigation: skip steps whose showWhen predicate is false.
  const visible = useMemo(() => visibleSteps(answers), [answers]);
  const isVisibleStep = (idx: number) =>
    idx < 0 || idx >= quizSteps.length || visible.includes(quizSteps[idx]);

  const handleNext = useCallback(() => {
    setCurrentStep((p) => {
      if (p < quizSteps.length - 1) return p + 1;
      finish();
      return p;
    });
  }, [finish]);

  const handleBack = useCallback(() => {
    setCurrentStep((p) => Math.max(-1, p - 1));
  }, []);

  if (analyzing) {
    return <AnalyzingScreen onDone={handleAnalyzingDone} />;
  }

  if (!step) {
    return <QuizHero onStart={() => setCurrentStep(0)} />;
  }

  const canProceed = isStepAnswered(step, answers);

  return (
    <div className="flex min-h-[80vh] flex-col">
      <QuizProgress currentStep={currentStep} totalSteps={quizSteps.length} progress={progress} />

      <div className="relative flex-1 px-4 py-8 sm:py-10">
        <div className="mx-auto w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <QuizStepContent
                step={step}
                answers={answers}
                setAnswers={setAnswers}
                onAutoAdvance={
                  step.type === "single" || step.type === "slider-freq" ? handleNext : undefined
                }
              />
            </motion.div>
          </AnimatePresence>

          {currentStep >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Match confidence
                  </span>
                  <span className="text-xs font-semibold text-primary tabular-nums">
                    {confidence}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={false}
                    animate={{ width: `${confidence}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <QuizNavigation
        onBack={handleBack}
        onNext={handleNext}
        canProceed={canProceed}
        isLast={isLast}
        isFirst={currentStep === 0}
      />
    </div>
  );
}
