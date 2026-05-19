import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
  isLast: boolean;
  hideNext?: boolean;
  isFirst?: boolean;
}

export default function QuizNavigation({
  onBack,
  onNext,
  canProceed,
  isLast,
  hideNext,
  isFirst,
}: Props) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={isFirst}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {!hideNext && (
          <Button
            type="button"
            size="sm"
            onClick={onNext}
            disabled={!canProceed}
            className="gap-1.5"
          >
            {isLast ? (
              <>
                See my matches <Check className="h-4 w-4" />
              </>
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
