import { useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Check,
  Flame,
  RotateCcw,
  Settings,
  Shuffle,
  Target,
  Trophy,
} from "lucide-react";
import cardData from "./data/cards.json";
import { BottomDock } from "./components/BottomDock.jsx";
import { CompletionCard } from "./components/CompletionCard.jsx";
import { FeedbackCard } from "./components/FeedbackCard.jsx";
import { Modal } from "./components/Modal.jsx";
import { SwipeDeck } from "./components/SwipeDeck.jsx";
import { useTrainer } from "./hooks/useTrainer.js";

const TOPIC_ALL = "all";
const TOPIC_RETRY = "retry";

function Stat({ icon: Icon, value, label, accent }) {
  return (
    <div className="stat" style={{ "--stat-accent": accent }}>
      <Icon aria-hidden="true" size={22} strokeWidth={2.2} />
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function Header({
  activeLabel,
  answered,
  total,
  stats,
  progress,
  onTopics,
  onSettings,
}) {
  return (
    <header className="topbar">
      <div className="brand" aria-label="SNP Swipe">
        <span className="brand__title">
          SNP <em>SWIPE</em>
        </span>
        <span className="brand__course">SNP FS2026</span>
      </div>

      <button className="topic-switcher" type="button" onClick={onTopics}>
        <BookOpen aria-hidden="true" size={21} />
        <span>{activeLabel}</span>
        <span className="topic-switcher__count">{total} Karten</span>
      </button>

      <div className="topbar__stats" aria-label="Lernstatistik">
        <Stat
          icon={Target}
          value={`${answered} / ${total}`}
          label="Fortschritt"
          accent="#7ee2ca"
        />
        <Stat
          icon={Flame}
          value={stats.streak}
          label="Streak"
          accent="#ffb247"
        />
        <Stat
          icon={Check}
          value={stats.score}
          label="Score"
          accent="#7ee2ca"
        />
        <Stat
          icon={Trophy}
          value={stats.highScore}
          label="Highscore"
          accent="#9bc7e8"
        />
      </div>

      <button
        className="icon-button"
        type="button"
        aria-label="Einstellungen öffnen"
        onClick={onSettings}
      >
        <Settings aria-hidden="true" size={22} />
      </button>

      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
    </header>
  );
}

function TopicsModal({ trainer, onClose }) {
  const topics = useMemo(
    () => [
      {
        number: TOPIC_ALL,
        name: "Gesamter SNP-Stoff",
        cardCount: cardData.cardCount,
      },
      ...cardData.topics,
    ],
    [],
  );

  return (
    <Modal title="Thema wählen" onClose={onClose} size="large">
      <div className="topic-list">
        {topics.map((topic) => {
          const progress = trainer.getTopicProgress(topic.number);
          const selected = trainer.selectedTopic === topic.number;

          return (
            <button
              className={`topic-row${selected ? " is-selected" : ""}`}
              type="button"
              key={topic.number}
              onClick={() => {
                trainer.selectTopic(topic.number);
                onClose();
              }}
            >
              <span className="topic-row__number">
                {topic.number === TOPIC_ALL ? "ALL" : topic.number}
              </span>
              <span className="topic-row__content">
                <strong>{topic.name}</strong>
                <span>
                  {progress.answered} von {topic.cardCount} Karten
                </span>
                <span className="topic-row__bar" aria-hidden="true">
                  <i style={{ width: `${progress.percent}%` }} />
                </span>
              </span>
              <span className="topic-row__percent">{progress.percent}%</span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

function StatsModal({ trainer, onClose }) {
  const { stats } = trainer;

  return (
    <Modal title="Deine Statistik" onClose={onClose}>
      <div className="stat-summary">
        <div>
          <span>Antworten</span>
          <strong>{stats.answered}</strong>
        </div>
        <div>
          <span>Trefferquote</span>
          <strong>{trainer.accuracy}%</strong>
        </div>
        <div>
          <span>Beste Serie</span>
          <strong>{stats.bestStreak}</strong>
        </div>
        <div>
          <span>Highscore</span>
          <strong>{stats.highScore}</strong>
        </div>
      </div>
      <div className="accuracy-bar" aria-label={`${trainer.accuracy}% richtig`}>
        <span style={{ width: `${trainer.accuracy}%` }} />
      </div>
      <div className="result-split">
        <span>
          <i className="result-dot result-dot--right" />
          {stats.correct} richtig
        </span>
        <span>
          <i className="result-dot result-dot--wrong" />
          {stats.incorrect} falsch
        </span>
        <span>{trainer.retryCount} vorgemerkt</span>
      </div>
    </Modal>
  );
}

function SettingsModal({ trainer, onClose }) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <Modal title="Einstellungen" onClose={onClose}>
      <div className="settings-copy">
        <p>
          Fortschritt, Score, Highscore und Wiederholungen werden nur lokal in
          diesem Browser gespeichert.
        </p>
        <p>
          Datensatz: {cardData.questionCount} KPRIM-Fragen mit{" "}
          {cardData.cardCount} einzelnen Aussagen aus{" "}
          <code>{cardData.source}</code>.
        </p>
      </div>
      <button
        className="settings-action"
        type="button"
        onClick={() => {
          trainer.restartCurrentSession();
          onClose();
        }}
      >
        <RotateCcw aria-hidden="true" size={19} />
        Aktuelles Deck neu starten
      </button>
      {confirmClear ? (
        <div className="danger-confirm">
          <p>Wirklich Lernstand und Highscore löschen?</p>
          <div>
            <button type="button" onClick={() => setConfirmClear(false)}>
              Abbrechen
            </button>
            <button
              className="danger-button"
              type="button"
              onClick={() => {
                trainer.clearAll();
                onClose();
              }}
            >
              Alles löschen
            </button>
          </div>
        </div>
      ) : (
        <button
          className="settings-action settings-action--danger"
          type="button"
          onClick={() => setConfirmClear(true)}
        >
          Lernstand vollständig löschen
        </button>
      )}
    </Modal>
  );
}

export function App() {
  const trainer = useTrainer();
  const [modal, setModal] = useState(null);

  const activeLabel =
    trainer.selectedTopic === TOPIC_RETRY
      ? "Wiederholungen"
      : trainer.selectedTopic === TOPIC_ALL
        ? "Gesamter Stoff"
        : cardData.topics.find(
            (topic) => topic.number === trainer.selectedTopic,
          )?.name ?? "SNP";

  return (
    <div className="app-shell">
      <Header
        activeLabel={activeLabel}
        answered={trainer.currentPosition}
        total={trainer.currentTotal}
        stats={trainer.stats}
        progress={trainer.progress}
        onTopics={() => setModal("topics")}
        onSettings={() => setModal("settings")}
      />

      <main className="trainer-stage">
        {trainer.feedback ? (
          <FeedbackCard
            card={trainer.feedback.card}
            guess={trainer.feedback.guess}
            queued={trainer.isQueuedForRetry(trainer.feedback.card.id)}
            disabled={Boolean(modal)}
            onContinue={trainer.continueAfterFeedback}
            onRetry={trainer.addCurrentToRetry}
          />
        ) : trainer.currentCard ? (
          <SwipeDeck
            key={trainer.currentCard.id}
            card={trainer.currentCard}
            nextCards={trainer.nextCards}
            onAnswer={trainer.answer}
            disabled={Boolean(modal)}
          />
        ) : (
          <CompletionCard
            stats={trainer.stats}
            accuracy={trainer.accuracy}
            retryCount={trainer.retryCount}
            onRetry={trainer.startRetryDeck}
            onRestart={trainer.restartCurrentSession}
            onAll={() => trainer.selectTopic(TOPIC_ALL)}
          />
        )}
      </main>

      <BottomDock
        current={trainer.currentPosition}
        total={trainer.currentTotal}
        onTopics={() => setModal("topics")}
        onShuffle={trainer.shuffleRemaining}
        onStats={() => setModal("stats")}
        onReset={() => setModal("settings")}
      />

      {modal === "topics" ? (
        <TopicsModal trainer={trainer} onClose={() => setModal(null)} />
      ) : null}
      {modal === "stats" ? (
        <StatsModal trainer={trainer} onClose={() => setModal(null)} />
      ) : null}
      {modal === "settings" ? (
        <SettingsModal trainer={trainer} onClose={() => setModal(null)} />
      ) : null}
    </div>
  );
}
