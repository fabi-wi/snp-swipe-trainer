import { useEffect } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Info,
  Lightbulb,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export function FeedbackCard({
  card,
  guess,
  queued,
  disabled,
  onContinue,
  onRetry,
}) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onKeyDown = (event) => {
      if (disabled) {
        return;
      }

      if (event.key === "Enter" || event.code === "Space") {
        event.preventDefault();
        onContinue();
      }

      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        onRetry();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disabled, onContinue, onRetry]);

  return (
    <motion.article
      className="feedback-card"
      initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 330, damping: 27 }}
      aria-live="assertive"
    >
      <div className="feedback-card__meta">
        Q {card.questionId} · {card.category} · Aussage {card.letter}
      </div>
      <div className="feedback-card__verdict">
        <XCircle aria-hidden="true" size={70} strokeWidth={1.8} />
        <h1>Falsch!</h1>
      </div>

      <div className="feedback-card__statement">
        <span>Aussage</span>
        <p>{card.statement}</p>
      </div>

      <div className="explanation-box">
        <Lightbulb aria-hidden="true" size={25} />
        <div>
          <strong>Erklärung</strong>
          <p>{card.explanation}</p>
        </div>
      </div>

      <div className="answer-compare">
        <Info aria-hidden="true" size={19} />
        <span>
          Deine Antwort:{" "}
          <strong className={guess ? "true-text" : "false-text"}>
            {guess ? "Richtig" : "Falsch"}
          </strong>
        </span>
        <i />
        <span>
          Lösung:{" "}
          <strong className={card.correct ? "true-text" : "false-text"}>
            {card.correct ? "Richtig" : "Falsch"}
          </strong>
        </span>
      </div>

      <button
        className="continue-button"
        type="button"
        onClick={onContinue}
        disabled={disabled}
      >
        <ArrowRight aria-hidden="true" size={22} />
        Weiter
        <kbd>Space / Enter</kbd>
      </button>
      <button
        className={`retry-button${queued ? " is-queued" : ""}`}
        type="button"
        onClick={onRetry}
        disabled={disabled}
      >
        {queued ? (
          <CheckCircle2 aria-hidden="true" size={20} />
        ) : (
          <RotateCcw aria-hidden="true" size={20} />
        )}
        {queued ? "Für Wiederholung vorgemerkt" : "Später wiederholen"}
        <kbd>S</kbd>
      </button>

      <p className="feedback-card__source">
        {card.topic} · {card.prompt}
      </p>
    </motion.article>
  );
}
