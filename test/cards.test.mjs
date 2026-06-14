import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const data = JSON.parse(
  readFileSync(resolve("src/data/cards.json"), "utf8"),
);

test("keeps the curated deck compact, balanced, and evenly distributed", () => {
  assert.equal(data.schemaVersion, 2);
  assert.equal(data.cardCount, 320);
  assert.equal(data.topics.length, 16);
  assert.ok(data.cardCount < 400);
  assert.equal(
    data.cards.filter((card) => card.correct).length,
    data.cardCount / 2,
  );

  for (const topic of data.topics) {
    const cards = data.cards.filter(
      (card) => card.topicNumber === topic.number,
    );

    assert.equal(cards.length, 20, topic.name);
    assert.equal(
      cards.filter((card) => card.correct).length,
      10,
      topic.name,
    );
  }
});

test("gives every card unique content and actionable feedback", () => {
  const ids = new Set();
  const statements = new Set();

  for (const card of data.cards) {
    assert.ok(!ids.has(card.id), `Doppelte ID: ${card.id}`);
    ids.add(card.id);

    const statement = card.statement.trim().toLowerCase();
    assert.ok(
      !statements.has(statement),
      `Doppelte Aussage: ${card.statement}`,
    );
    statements.add(statement);

    assert.ok(card.prompt.trim().length >= 12, card.id);
    assert.ok(card.statement.trim().length >= 30, card.id);
    assert.ok(card.explanation.trim().length >= 20, card.id);
  }
});

test("contains a substantial newly authored exam core", () => {
  const customCards = data.cards.filter(
    (card) => card.origin === "exam-curated",
  );
  const legacyCards = data.cards.filter(
    (card) => card.origin === "legacy-curated",
  );

  assert.equal(customCards.length, 128);
  assert.equal(legacyCards.length, 192);
});
