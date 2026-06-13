import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const defaultPdf =
  resolve(projectRoot, "SNP_FS2026_Kprim_MC_Trainer_Design.pdf");
const pdfPath = resolve(process.argv[2] ?? defaultPdf);
const outputPath = resolve(projectRoot, "src/data/cards.json");

const rawText = execFileSync("pdftotext", ["-layout", pdfPath, "-"], {
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024,
});

const solutionMarker = rawText.indexOf("Loesungsheft");

if (solutionMarker === -1) {
  throw new Error("Der Loesungsheft-Abschnitt wurde im PDF nicht gefunden.");
}

const solutionPageStart = rawText.lastIndexOf("\f", solutionMarker);
const solutionCoverStart = rawText.lastIndexOf("\f", solutionPageStart - 1);
const taskText = rawText.slice(
  0,
  solutionCoverStart === -1 ? solutionMarker : solutionCoverStart,
);
const solutionText = rawText.slice(solutionMarker);
const questionHeader =
  /^\s*Q\s+(\d{2}\.\d{2})\s*\/\s*([^/]+?)\s*\/\s*(Kprim|(?:[RF]\s+){3}[RF])\s*$/i;
const topicHeader = /^\s*THEMA\s+(\d{2})\s*\/\s*\d+\s+KPRIM-FRAGEN/i;

function compact(value) {
  return value.replace(/\s+/g, " ").trim();
}

function stripAnswerBoxes(value) {
  return compact(value.replace(/\s*[□☐]\s+[□☐]\s*$/, ""));
}

function isNoise(line) {
  const value = compact(line.replace(/\f/g, ""));

  return (
    value === "" ||
    /^SNP FS2026\s*\/\s*KPRIM-MC/i.test(value) ||
    /^Multiple Choice Trainer/i.test(value) ||
    /^(Aufgabenheft|Loesungsheft)$/i.test(value) ||
    /^\d{1,3}$/.test(value) ||
    /^Schnellcheck-Antwortmuster/i.test(value) ||
    /^Frage\s+A\s+B\s+C\s+D$/i.test(value) ||
    /^Aussage\s+R\s+F$/i.test(value) ||
    /^Lsg\.\s+Erklaerung$/i.test(value) ||
    /^Antwortmuster plus kurze Begruendung/i.test(value)
  );
}

function nextContentLine(lines, startIndex) {
  for (let index = startIndex; index < lines.length; index += 1) {
    if (!isNoise(lines[index])) {
      return { index, value: compact(lines[index]) };
    }
  }

  return null;
}

function parseTasks(text) {
  const lines = text.split(/\r?\n/);
  const questions = new Map();
  const topics = new Map();
  let currentTopic = null;

  for (let index = 0; index < lines.length; index += 1) {
    const topicMatch = lines[index].match(topicHeader);

    if (topicMatch) {
      const topicLine = nextContentLine(lines, index + 1);

      if (topicLine) {
        currentTopic = {
          number: topicMatch[1],
          name: topicLine.value,
        };
        topics.set(currentTopic.number, currentTopic);
        index = topicLine.index;
      }
      continue;
    }

    const headerMatch = lines[index].match(questionHeader);

    if (!headerMatch || headerMatch[3].toLowerCase() !== "kprim") {
      continue;
    }

    const promptLine = nextContentLine(lines, index + 1);

    if (!promptLine) {
      throw new Error(`Kein Fragetext fuer ${headerMatch[1]} gefunden.`);
    }

    const statements = [];
    let activeStatement = null;
    let cursor = promptLine.index + 1;

    for (; cursor < lines.length; cursor += 1) {
      if (lines[cursor].match(questionHeader) || lines[cursor].match(topicHeader)) {
        break;
      }

      const statementMatch = lines[cursor].match(/^\s{2,}([A-D])\s{2,}(.+)$/);

      if (statementMatch) {
        activeStatement = {
          letter: statementMatch[1],
          text: stripAnswerBoxes(statementMatch[2]),
        };
        statements.push(activeStatement);
        continue;
      }

      if (activeStatement && !isNoise(lines[cursor])) {
        activeStatement.text = compact(
          `${activeStatement.text} ${stripAnswerBoxes(lines[cursor])}`,
        );
      }
    }

    if (statements.length !== 4) {
      throw new Error(
        `${headerMatch[1]} enthaelt ${statements.length} statt 4 Aussagen.`,
      );
    }

    const topicNumber = headerMatch[1].slice(0, 2);
    const topic = currentTopic?.number === topicNumber
      ? currentTopic
      : topics.get(topicNumber);

    questions.set(headerMatch[1], {
      id: headerMatch[1],
      category: compact(headerMatch[2]),
      prompt: promptLine.value,
      topicNumber,
      topic: topic?.name ?? `Thema ${topicNumber}`,
      statements,
    });

    index = cursor - 1;
  }

  return { questions, topics };
}

function parseSolutions(text) {
  const lines = text.split(/\r?\n/);
  const solutions = new Map();

  for (let index = 0; index < lines.length; index += 1) {
    const headerMatch = lines[index].match(questionHeader);

    if (!headerMatch || headerMatch[3].toLowerCase() === "kprim") {
      continue;
    }

    const entries = [];
    let activeEntry = null;
    let cursor = index + 1;

    for (; cursor < lines.length; cursor += 1) {
      if (lines[cursor].match(questionHeader) || lines[cursor].match(topicHeader)) {
        break;
      }

      const answerMatch = lines[cursor].match(
        /^\s{2,}([A-D])\s+([RF])\s+(.+)$/,
      );

      if (answerMatch) {
        activeEntry = {
          letter: answerMatch[1],
          correct: answerMatch[2] === "R",
          explanation: compact(answerMatch[3]),
        };
        entries.push(activeEntry);
        continue;
      }

      if (activeEntry && !isNoise(lines[cursor])) {
        activeEntry.explanation = compact(
          `${activeEntry.explanation} ${lines[cursor]}`,
        );
      }
    }

    if (entries.length !== 4) {
      throw new Error(
        `${headerMatch[1]} enthaelt ${entries.length} statt 4 Loesungen.`,
      );
    }

    solutions.set(headerMatch[1], entries);
    index = cursor - 1;
  }

  return solutions;
}

const { questions, topics } = parseTasks(taskText);
const solutions = parseSolutions(solutionText);
const cards = [];

for (const question of questions.values()) {
  const answers = solutions.get(question.id);

  if (!answers) {
    throw new Error(`Keine Loesungen fuer ${question.id} gefunden.`);
  }

  for (const statement of question.statements) {
    const answer = answers.find((entry) => entry.letter === statement.letter);

    if (!answer) {
      throw new Error(
        `Keine Loesung fuer ${question.id}-${statement.letter} gefunden.`,
      );
    }

    cards.push({
      id: `${question.id}-${statement.letter}`,
      questionId: question.id,
      letter: statement.letter,
      category: question.category,
      topicNumber: question.topicNumber,
      topic: question.topic,
      prompt: question.prompt,
      statement: statement.text,
      correct: answer.correct,
      explanation: answer.explanation,
    });
  }
}

if (questions.size !== 291 || cards.length !== 1164) {
  throw new Error(
    `Import unvollstaendig: ${questions.size} Fragen und ${cards.length} Karten.`,
  );
}

const topicList = [...topics.values()].map((topic) => {
  const topicCards = cards.filter((card) => card.topicNumber === topic.number);

  return {
    ...topic,
    questionCount: new Set(topicCards.map((card) => card.questionId)).size,
    cardCount: topicCards.length,
  };
});

const payload = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: basename(pdfPath),
  questionCount: questions.size,
  cardCount: cards.length,
  topics: topicList,
  cards,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

console.log(
  `Importiert: ${payload.questionCount} Fragen, ${payload.cardCount} Karten, ${payload.topics.length} Themen.`,
);
console.log(`Ausgabe: ${outputPath}`);
