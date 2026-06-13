import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Hand,
  X,
} from "lucide-react";
import { TechnicalText } from "./TechnicalText.jsx";

const SWIPE_THRESHOLD = 110;

const SwipeCard = forwardRef(function SwipeCard({ card, onAnswer }, ref) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-320, 0, 320], [-11, 0, 11]);
  const falseOpacity = useTransform(x, [-180, -55], [1, 0]);
  const trueOpacity = useTransform(x, [55, 180], [0, 1]);
  const [locked, setLocked] = useState(false);
  const reduceMotion = useReducedMotion();

  const swipe = async (guess) => {
    if (locked) {
      return;
    }

    setLocked(true);
    const destination = guess ? window.innerWidth + 360 : -window.innerWidth - 360;

    await animate(x, destination, {
      duration: reduceMotion ? 0.01 : 0.24,
      ease: [0.32, 0.72, 0, 1],
    });
    onAnswer(guess);
  };

  useImperativeHandle(ref, () => ({ swipe }));

  return (
    <motion.article
      className="swipe-card"
      style={{ x, rotate }}
      drag={locked ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      whileDrag={{ scale: 1.015, cursor: "grabbing" }}
      onDragEnd={(_, info) => {
        if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 700) {
          swipe(true);
        } else if (
          info.offset.x < -SWIPE_THRESHOLD ||
          info.velocity.x < -700
        ) {
          swipe(false);
        } else {
          animate(x, 0, {
            type: "spring",
            stiffness: 460,
            damping: 34,
          });
        }
      }}
      aria-label={`Aussage: ${card.statement}`}
    >
      <motion.div
        className="swipe-stamp swipe-stamp--false"
        style={{ opacity: falseOpacity }}
      >
        Falsch
      </motion.div>
      <motion.div
        className="swipe-stamp swipe-stamp--true"
        style={{ opacity: trueOpacity }}
      >
        Richtig
      </motion.div>

      <div className="card-meta">
        <span>Q {card.questionId}</span>
        <i />
        <span>{card.category}</span>
        <i />
        <span>Aussage {card.letter}</span>
      </div>
      <span className="kprim-label">KPRIM</span>
      <TechnicalText as="p" className="card-prompt" text={card.prompt} />
      <TechnicalText as="h1" text={card.statement} />
      <div className="drag-hint">
        <span />
        <div>
          <Hand aria-hidden="true" size={23} />
          Ziehen oder Pfeiltasten nutzen
        </div>
      </div>
    </motion.article>
  );
});

export function SwipeDeck({ card, nextCards, onAnswer, disabled }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (disabled || event.repeat) {
        return;
      }

      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        event.preventDefault();
        cardRef.current?.swipe(false);
      }

      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        event.preventDefault();
        cardRef.current?.swipe(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disabled]);

  return (
    <section className="deck-area" aria-live="polite">
      <div className="deck-stack">
        {nextCards
          .slice()
          .reverse()
          .map((nextCard, index) => (
            <div
              className="deck-card-back"
              key={nextCard.id}
              style={{
                "--back-index": index,
              }}
              aria-hidden="true"
            />
          ))}
        <SwipeCard ref={cardRef} card={card} onAnswer={onAnswer} />
      </div>

      <button
        className="decision decision--false"
        type="button"
        onClick={() => cardRef.current?.swipe(false)}
        disabled={disabled}
        aria-label="Aussage als falsch beantworten"
      >
        <span>
          <X aria-hidden="true" size={34} strokeWidth={2.4} />
        </span>
        <strong>Falsch</strong>
      </button>

      <button
        className="decision decision--true"
        type="button"
        onClick={() => cardRef.current?.swipe(true)}
        disabled={disabled}
        aria-label="Aussage als richtig beantworten"
      >
        <span>
          <Check aria-hidden="true" size={34} strokeWidth={2.4} />
        </span>
        <strong>Richtig</strong>
      </button>

      <div className="keyboard-hint" aria-hidden="true">
        <kbd>
          <ArrowLeft size={14} />
        </kbd>
        <span>oder</span>
        <kbd>A</kbd>
        <strong className="false-text">Falsch</strong>
        <i />
        <kbd>
          <ArrowRight size={14} />
        </kbd>
        <span>oder</span>
        <kbd>D</kbd>
        <strong className="true-text">Richtig</strong>
      </div>
    </section>
  );
}
