import { BookOpen, RotateCcw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function CompletionCard({
  stats,
  accuracy,
  retryCount,
  onRetry,
  onRestart,
  onAll,
}) {
  return (
    <motion.section
      className="completion-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      aria-live="polite"
    >
      <Sparkles aria-hidden="true" size={44} />
      <h1>Deck geschafft.</h1>
      <p>
        {stats.correct} richtige Antworten bei {accuracy}% Trefferquote. Der
        Lernstand ist gespeichert.
      </p>
      <div className="completion-card__score">
        <span>Score</span>
        <strong>{stats.score}</strong>
        <span>Highscore {stats.highScore}</span>
      </div>
      <div className="completion-card__actions">
        {retryCount > 0 ? (
          <button type="button" onClick={onRetry}>
            <RotateCcw aria-hidden="true" size={20} />
            {retryCount} Wiederholungen starten
          </button>
        ) : null}
        <button type="button" onClick={onRestart}>
          Deck neu starten
        </button>
        <button type="button" onClick={onAll}>
          <BookOpen aria-hidden="true" size={20} />
          Gesamter Stoff
        </button>
      </div>
    </motion.section>
  );
}
