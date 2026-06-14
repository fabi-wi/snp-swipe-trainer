import { useCallback, useMemo, useState } from "react";
import cardData from "../data/cards.json";

const STORAGE_KEY = "snp-swipe-trainer:v2";
const STATE_VERSION = 2;
const TOPIC_ALL = "all";
const TOPIC_RETRY = "retry";
const cardsById = new Map(cardData.cards.map((card) => [card.id, card]));
const validIds = new Set(cardsById.keys());

function shuffled(values) {
  const next = [...values];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }

  return next;
}

function queueForTopic(topic, shouldShuffle = false) {
  const ids = cardData.cards
    .filter(
      (card) => topic === TOPIC_ALL || card.topicNumber === topic,
    )
    .map((card) => card.id);

  return shouldShuffle ? shuffled(ids) : ids;
}

function newSession(topic, shouldShuffle = false) {
  return {
    queueIds: queueForTopic(topic, shouldShuffle),
    position: 0,
  };
}

function freshState() {
  return {
    version: STATE_VERSION,
    selectedTopic: TOPIC_ALL,
    shuffleEnabled: false,
    sessions: {
      [TOPIC_ALL]: newSession(TOPIC_ALL),
    },
    retryIds: [],
    feedback: null,
    stats: {
      answered: 0,
      correct: 0,
      incorrect: 0,
      score: 0,
      highScore: 0,
      streak: 0,
      bestStreak: 0,
    },
  };
}

function sanitizeSession(session, topic) {
  const queueIds = Array.isArray(session?.queueIds)
    ? session.queueIds.filter((id) => validIds.has(id))
    : queueForTopic(topic);

  return {
    queueIds,
    position: Math.min(
      Math.max(Number(session?.position) || 0, 0),
      queueIds.length,
    ),
  };
}

function loadState() {
  const fallback = freshState();

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!stored || stored.version !== STATE_VERSION) {
      return fallback;
    }

    const sessions = {};

    for (const [topic, session] of Object.entries(stored.sessions ?? {})) {
      if (
        topic === TOPIC_ALL ||
        topic === TOPIC_RETRY ||
        cardData.topics.some((entry) => entry.number === topic)
      ) {
        sessions[topic] = sanitizeSession(session, topic);
      }
    }

    const selectedTopic =
      stored.selectedTopic === TOPIC_RETRY ||
      stored.selectedTopic === TOPIC_ALL ||
      cardData.topics.some((topic) => topic.number === stored.selectedTopic)
        ? stored.selectedTopic
        : TOPIC_ALL;

    if (!sessions[selectedTopic]) {
      sessions[selectedTopic] =
        selectedTopic === TOPIC_RETRY
          ? { queueIds: [], position: 0 }
          : newSession(selectedTopic, Boolean(stored.shuffleEnabled));
    }

    const feedbackId = stored.feedback?.cardId;
    const feedback =
      feedbackId && validIds.has(feedbackId)
        ? {
            cardId: feedbackId,
            guess: Boolean(stored.feedback.guess),
          }
        : null;

    return {
      ...fallback,
      ...stored,
      version: STATE_VERSION,
      selectedTopic,
      sessions,
      retryIds: Array.isArray(stored.retryIds)
        ? [...new Set(stored.retryIds.filter((id) => validIds.has(id)))]
        : [],
      feedback,
      stats: {
        ...fallback.stats,
        ...(stored.stats ?? {}),
      },
    };
  } catch {
    return fallback;
  }
}

function persist(nextState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  return nextState;
}

export function useTrainer() {
  const [state, setState] = useState(loadState);
  const activeSession = state.sessions[state.selectedTopic] ?? {
    queueIds: [],
    position: 0,
  };
  const currentId = activeSession.queueIds[activeSession.position];
  const currentCard = currentId ? cardsById.get(currentId) : null;
  const nextCards = activeSession.queueIds
    .slice(activeSession.position + 1, activeSession.position + 3)
    .map((id) => cardsById.get(id))
    .filter(Boolean);
  const feedback = state.feedback
    ? {
        card: cardsById.get(state.feedback.cardId),
        guess: state.feedback.guess,
      }
    : null;
  const currentTotal = activeSession.queueIds.length;
  const currentPosition = Math.min(activeSession.position, currentTotal);
  const progress =
    currentTotal === 0
      ? 0
      : Math.round((currentPosition / currentTotal) * 100);
  const accuracy =
    state.stats.answered === 0
      ? 0
      : Math.round((state.stats.correct / state.stats.answered) * 100);

  const update = useCallback((recipe) => {
    setState((previous) => persist(recipe(previous)));
  }, []);

  const answer = useCallback(
    (guess) => {
      update((previous) => {
        if (previous.feedback) {
          return previous;
        }

        const session = previous.sessions[previous.selectedTopic];
        const cardId = session?.queueIds[session.position];
        const card = cardsById.get(cardId);

        if (!card) {
          return previous;
        }

        const isCorrect = guess === card.correct;
        const nextStreak = isCorrect ? previous.stats.streak + 1 : 0;
        const earned = isCorrect ? 10 + Math.min(nextStreak, 8) * 2 : 0;
        const nextScore = previous.stats.score + earned;
        const nextStats = {
          answered: previous.stats.answered + 1,
          correct: previous.stats.correct + (isCorrect ? 1 : 0),
          incorrect: previous.stats.incorrect + (isCorrect ? 0 : 1),
          score: nextScore,
          highScore: Math.max(previous.stats.highScore, nextScore),
          streak: nextStreak,
          bestStreak: Math.max(previous.stats.bestStreak, nextStreak),
        };

        if (!isCorrect) {
          return {
            ...previous,
            stats: nextStats,
            feedback: { cardId, guess },
          };
        }

        return {
          ...previous,
          stats: nextStats,
          sessions: {
            ...previous.sessions,
            [previous.selectedTopic]: {
              ...session,
              position: session.position + 1,
            },
          },
        };
      });
    },
    [update],
  );

  const continueAfterFeedback = useCallback(() => {
    update((previous) => {
      if (!previous.feedback) {
        return previous;
      }

      const session = previous.sessions[previous.selectedTopic];

      return {
        ...previous,
        feedback: null,
        sessions: {
          ...previous.sessions,
          [previous.selectedTopic]: {
            ...session,
            position: Math.min(session.position + 1, session.queueIds.length),
          },
        },
      };
    });
  }, [update]);

  const addCurrentToRetry = useCallback(() => {
    update((previous) => {
      const cardId = previous.feedback?.cardId;

      if (!cardId || previous.retryIds.includes(cardId)) {
        return previous;
      }

      return {
        ...previous,
        retryIds: [...previous.retryIds, cardId],
      };
    });
  }, [update]);

  const selectTopic = useCallback(
    (topic) => {
      update((previous) => {
        const previousSession = previous.sessions[previous.selectedTopic];
        const settledSessions =
          previous.feedback && previousSession
            ? {
                ...previous.sessions,
                [previous.selectedTopic]: {
                  ...previousSession,
                  position: Math.min(
                    previousSession.position + 1,
                    previousSession.queueIds.length,
                  ),
                },
              }
            : previous.sessions;
        const existing = settledSessions[topic];

        return {
          ...previous,
          selectedTopic: topic,
          feedback: null,
          sessions: {
            ...settledSessions,
            [topic]:
              existing ??
              (topic === TOPIC_RETRY
                ? { queueIds: previous.retryIds, position: 0 }
                : newSession(topic, previous.shuffleEnabled)),
          },
        };
      });
    },
    [update],
  );

  const shuffleRemaining = useCallback(() => {
    update((previous) => {
      const session = previous.sessions[previous.selectedTopic];

      if (!session || session.position >= session.queueIds.length) {
        return previous;
      }

      const prefix = session.queueIds.slice(0, session.position + 1);
      const remaining = shuffled(
        session.queueIds.slice(session.position + 1),
      );

      return {
        ...previous,
        shuffleEnabled: true,
        sessions: {
          ...previous.sessions,
          [previous.selectedTopic]: {
            ...session,
            queueIds: [...prefix, ...remaining],
          },
        },
      };
    });
  }, [update]);

  const restartCurrentSession = useCallback(() => {
    update((previous) => {
      const topic = previous.selectedTopic;
      const queueIds =
        topic === TOPIC_RETRY
          ? previous.sessions[TOPIC_RETRY]?.queueIds ?? []
          : queueForTopic(topic, previous.shuffleEnabled);

      return {
        ...previous,
        feedback: null,
        sessions: {
          ...previous.sessions,
          [topic]: { queueIds, position: 0 },
        },
      };
    });
  }, [update]);

  const startRetryDeck = useCallback(() => {
    update((previous) => {
      const queueIds = [...previous.retryIds];

      if (queueIds.length === 0) {
        return previous;
      }

      return {
        ...previous,
        selectedTopic: TOPIC_RETRY,
        retryIds: [],
        feedback: null,
        sessions: {
          ...previous.sessions,
          [TOPIC_RETRY]: {
            queueIds: previous.shuffleEnabled ? shuffled(queueIds) : queueIds,
            position: 0,
          },
        },
      };
    });
  }, [update]);

  const clearAll = useCallback(() => {
    const next = freshState();
    localStorage.removeItem(STORAGE_KEY);
    setState(next);
  }, []);

  const getTopicProgress = useCallback(
    (topic) => {
      const session = state.sessions[topic];
      const total =
        topic === TOPIC_ALL
          ? cardData.cardCount
          : cardData.topics.find((entry) => entry.number === topic)?.cardCount ??
            0;
      const answered = Math.min(session?.position ?? 0, total);

      return {
        answered,
        percent: total === 0 ? 0 : Math.round((answered / total) * 100),
      };
    },
    [state.sessions],
  );

  const api = useMemo(
    () => ({
      selectedTopic: state.selectedTopic,
      stats: state.stats,
      currentCard,
      nextCards,
      currentTotal,
      currentPosition,
      progress,
      accuracy,
      feedback,
      retryCount: state.retryIds.length,
      answer,
      continueAfterFeedback,
      addCurrentToRetry,
      selectTopic,
      shuffleRemaining,
      restartCurrentSession,
      startRetryDeck,
      clearAll,
      getTopicProgress,
      isQueuedForRetry: (cardId) => state.retryIds.includes(cardId),
    }),
    [
      state,
      currentCard,
      nextCards,
      currentTotal,
      currentPosition,
      progress,
      accuracy,
      feedback,
      answer,
      continueAfterFeedback,
      addCurrentToRetry,
      selectTopic,
      shuffleRemaining,
      restartCurrentSession,
      startRetryDeck,
      clearAll,
      getTopicProgress,
    ],
  );

  return api;
}
