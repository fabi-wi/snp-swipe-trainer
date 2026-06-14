import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { questions, topics } from "../content/exam-kprim.mjs";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const legacyPath = resolve(projectRoot, "src/data/cards.legacy.json");
const outputPath = resolve(projectRoot, "src/data/cards.json");
const legacy = JSON.parse(readFileSync(legacyPath, "utf8"));

const LEGACY_CARDS_PER_TOPIC = 12;
const EXPECTED_CARDS_PER_TOPIC = 20;
const MAX_CARDS = 400;

const topicSources = {
  "01": ["01", "17", "18", "28", "29"],
  "02": ["01", "17", "18", "19", "28", "29"],
  "03": ["02", "09", "10", "18", "28", "29"],
  "04": ["03", "04", "20", "28", "29"],
  "05": ["05", "21", "28", "29"],
  "06": ["06", "07", "09", "28", "29"],
  "07": ["06", "07", "09", "28", "29"],
  "08": ["08", "22", "28", "29"],
  "09": ["18", "19", "22", "28", "29"],
  "10": ["10", "11", "12", "28", "29"],
  "11": ["12", "13", "25", "28", "29"],
  "12": ["14", "23", "28", "29"],
  "13": ["15", "23", "28", "29"],
  "14": ["15", "25", "26", "27", "28", "29"],
  "15": ["14", "23", "28", "29"],
  "16": ["16", "24", "28", "29"],
};

const targetKeywords = {
  "01": /\b(?:literal|sizeof|datentyp|unsigned|signed|char|float|double|size_t|konversion|division|getchar|scanf)\b/i,
  "02": /\b(?:operator|ausdruck|switch|case|schleife|while|for|break|continue|bit|shift)\b/i,
  "03": /\b(?:funktion|parameter|return|scope|static|extern|lebensdauer|rekursion|rückgabewert)\b/i,
  "04": /\b(?:präprozessor|compiler|linker|header|include|make|target|recipe|objektdatei|dependency)\b/i,
  "05": /\b(?:array|arrays|string|strings|strlen|strcat|strncpy|sizeof|index|mehrdimensional|nul)\b/i,
  "06": /\b(?:pointerarithmetik|zeigerarithmetik|adresse|dereferenzieren|dereferenzierung|void\*|arrayelement|jagged|pointer)\b/i,
  "07": /deklar|funktionspointer|pointer auf eine funktion|array von pointer|\(\*\w+\)|\*\w+\[\d+\]|\bconst\b|\btypedef\b/i,
  "08": /\b(?:malloc|calloc|realloc|free|heap|ownership|leak|dangling)\b/i,
  "09": /\b(?:struct|typedef|enum|union|liste|listenanker|node|bitmaske|flags|xor)\b/i,
  "10": /\b(?:system call|systemcall|kernel|user mode|user-space|kernel-space|virtuell|errno|library|betriebssystem)\b/i,
  "11": /\b(?:file descriptor|file\*|open|close|read|write|fopen|fclose|stream|puffer|datei|fprintf|fgets)\b/i,
  "12": /\b(?:prozess|fork|exec|waitpid|pid|zombie|child|parent|daemon|orphan)\b/i,
  "13": /\b(?:signal|sigaction|handler|sigkill|sigint|sigterm|sigabrt|wifsignaled)\b/i,
  "14": /\b(?:pipe|queue|socket|shared memory|fifo|ipc|client|server|accept|connect)\b/i,
  "15": /\b(?:thread|pthread|join|detach|stack|kontext-switch|register|adressraum)\b/i,
  "16": /\b(?:mutex|semaphore|semaphoren|deadlock|race condition|critical section|lock|unlock|synchronisation)\b/i,
};

const targetExclusions = {
  "01": /\(\*\w+\)|funktionspointer|malloc/i,
  "02": /\bfork\b|\bstruct\b|printf|tastatur|eingabevalidierung/i,
  "03": /\bfree\b|\bmalloc\b/i,
  "05": /\bmalloc\b|open-book/i,
  "11": /\bmalloc\b|\bmutex\b|open-book/i,
  "12": /\bsemaphore\b|\bpost\b|\bmutex\b|\bdeadlock\b/i,
  "15": /\bcalloc\b|\borphan\b/i,
  "16": /\bwaitpid\b/i,
};

const subtleWords =
  /\b(?:immer|niemals|nur|genau|zwingend|grundsätzlich|automatisch|darf|muss|kann|solange|erst|auch|bereits)\b/gi;
const technicalTokens =
  /(?:\b(?:sizeof|strlen|malloc|calloc|realloc|free|fork|exec|wait|read|write|open|close|pthread_\w+|SIG[A-Z]+|NULL|FILE)\b|->|\+\+|--|&&|\|\||<<|>>|==|!=|#\w+)/g;
const trivialPatterns = [
  /C ist eine Programmiersprache/i,
  /Java und C sind identisch/i,
  /Computer.*Strom/i,
  /immer automatisch korrekt/i,
  /keine Fehler möglich/i,
];

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[`"'.,;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function difficulty(card, topicNumber) {
  const text = `${card.prompt} ${card.statement} ${card.explanation}`;
  let score = Math.min(card.statement.length, 180) / 18;
  score += (text.match(subtleWords) ?? []).length * 1.5;
  score += (text.match(technicalTokens) ?? []).length * 1.8;
  score += targetKeywords[topicNumber].test(text) ? 8 : 0;
  score += Math.min(card.explanation.length, 180) / 45;
  score += card.statement.includes("nicht") ? 1 : 0;
  score -= trivialPatterns.some((pattern) => pattern.test(text)) ? 20 : 0;
  score -= card.statement.length < 38 ? 4 : 0;
  return score;
}

function selectLegacyCards(
  topicNumber,
  globallyUsedStatements,
  desiredCounts,
) {
  const candidates = legacy.cards
    .filter((card) => {
      return (
        topicSources[topicNumber].includes(card.topicNumber) &&
        targetKeywords[topicNumber].test(card.statement) &&
        !(targetExclusions[topicNumber]?.test(card.statement) ?? false)
      );
    })
    .map((card) => ({ ...card, score: difficulty(card, topicNumber) }))
    .sort((a, b) => b.score - a.score);
  const selected = [];
  const seenStatements = new Set();
  const usedQuestions = new Set();

  for (const desiredCorrect of [true, false]) {
    const desiredCount = desiredCorrect
      ? desiredCounts.correct
      : desiredCounts.incorrect;

    for (const allowRepeatedQuestion of [false, true]) {
      for (const card of candidates) {
        if (
          selected.filter((entry) => entry.correct === desiredCorrect).length >=
          desiredCount
        ) {
          break;
        }

        const key = normalize(card.statement);
        if (
          card.correct !== desiredCorrect ||
          seenStatements.has(key) ||
          globallyUsedStatements.has(key) ||
          (!allowRepeatedQuestion && usedQuestions.has(card.questionId))
        ) {
          continue;
        }

        selected.push(card);
        seenStatements.add(key);
        usedQuestions.add(card.questionId);
      }
    }
  }

  if (selected.length !== LEGACY_CARDS_PER_TOPIC) {
    throw new Error(
      `Thema ${topicNumber}: nur ${selected.length} geeignete Legacy-Karten gefunden.`,
    );
  }

  return selected.sort((a, b) => b.score - a.score);
}

function customCardsForTopic(topic) {
  return questions
    .filter((entry) => entry.topicNumber === topic.number)
    .flatMap((entry) =>
      entry.statements.map((item, index) => ({
        id: `${entry.id}-${String.fromCharCode(65 + index)}`,
        questionId: entry.id,
        letter: String.fromCharCode(65 + index),
        category: entry.category,
        topicNumber: topic.number,
        topic: topic.name,
        prompt: entry.prompt,
        statement: item.text,
        correct: item.correct,
        explanation: item.explanation,
        origin: "exam-curated",
      })),
    );
}

const cards = [];
const topicList = [];
const globallyUsedStatements = new Set();
const priorityOrder = ["07", "13", "12", "15", "11", "06"];
const selectionTopics = [...topics].sort((a, b) => {
  const aPriority = priorityOrder.indexOf(a.number);
  const bPriority = priorityOrder.indexOf(b.number);
  const aRank = aPriority === -1 ? priorityOrder.length : aPriority;
  const bRank = bPriority === -1 ? priorityOrder.length : bPriority;
  return aRank - bRank || a.number.localeCompare(b.number);
});

for (const topic of selectionTopics) {
  const customCards = customCardsForTopic(topic);
  const customCorrect = customCards.filter((card) => card.correct).length;
  const desiredCounts = {
    correct: EXPECTED_CARDS_PER_TOPIC / 2 - customCorrect,
    incorrect:
      EXPECTED_CARDS_PER_TOPIC / 2 -
      (customCards.length - customCorrect),
  };

  for (const card of customCards) {
    globallyUsedStatements.add(normalize(card.statement));
  }

  const selectedLegacy = selectLegacyCards(
    topic.number,
    globallyUsedStatements,
    desiredCounts,
  ).map((card, index) => ({
    ...card,
    id: `${topic.number}.L${String(index + 1).padStart(2, "0")}`,
    questionId: `${topic.number}.L${String(index + 1).padStart(2, "0")}`,
    letter: "A",
    topicNumber: topic.number,
    topic: topic.name,
    origin: "legacy-curated",
  }));

  for (const card of selectedLegacy) {
    globallyUsedStatements.add(normalize(card.statement));
  }
  const topicCards = [...customCards, ...selectedLegacy];

  if (topicCards.length !== EXPECTED_CARDS_PER_TOPIC) {
    throw new Error(
      `Thema ${topic.number}: ${topicCards.length} statt ${EXPECTED_CARDS_PER_TOPIC} Karten.`,
    );
  }

  cards.push(...topicCards);
  topicList.push({
    ...topic,
    questionCount: new Set(topicCards.map((card) => card.questionId)).size,
    cardCount: topicCards.length,
  });
}

cards.sort(
  (a, b) =>
    a.topicNumber.localeCompare(b.topicNumber) ||
    (a.origin === b.origin ? 0 : a.origin === "exam-curated" ? -1 : 1) ||
    a.id.localeCompare(b.id),
);
topicList.sort((a, b) => a.number.localeCompare(b.number));

const ids = new Set(cards.map((card) => card.id));
const statements = new Set(cards.map((card) => normalize(card.statement)));
const correctCount = cards.filter((card) => card.correct).length;

if (ids.size !== cards.length) {
  throw new Error("Der kuratierte Datensatz enthält doppelte IDs.");
}

if (statements.size !== cards.length) {
  throw new Error("Der kuratierte Datensatz enthält doppelte Aussagen.");
}

if (cards.length >= MAX_CARDS) {
  throw new Error(`Der Datensatz muss unter ${MAX_CARDS} Karten bleiben.`);
}

if (correctCount !== cards.length / 2) {
  throw new Error(
    `Antwortbalance fehlerhaft: ${correctCount} richtige bei ${cards.length} Karten.`,
  );
}

for (const card of cards) {
  for (const field of ["prompt", "statement", "explanation"]) {
    if (!card[field] || card[field].trim().length < 12) {
      throw new Error(`${card.id}: Feld ${field} ist zu kurz oder fehlt.`);
    }
  }
}

const payload = {
  schemaVersion: 2,
  source: "Kuratierter SNP-FS2026-Prüfungskatalog",
  methodology:
    "128 neu verfasste Prüfungsfallen plus 192 nach Schwierigkeit, Relevanz und Redundanz ausgewählte Bestandsaussagen.",
  questionCount: new Set(cards.map((card) => card.questionId)).size,
  cardCount: cards.length,
  topics: topicList,
  cards,
};

writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

console.log(
  `Kuratierter Datensatz: ${payload.cardCount} Aussagen, ${payload.topics.length} Themen, ${correctCount}/${cards.length - correctCount} R/F.`,
);
