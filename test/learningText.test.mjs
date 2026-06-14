import test from "node:test";
import assert from "node:assert/strict";
import {
  formatLearningText,
  isDisplayCodeSegment,
  normalizeGermanProse,
  normalizeLearningText,
} from "../src/utils/learningText.js";

test("normalizes German umlauts without changing legitimate ue words", () => {
  assert.equal(
    normalizeGermanProse(
      "Fuer die Pruefung koennen neue Queues genauer geprueft werden.",
    ),
    "Für die Prüfung können neue Queues genauer geprüft werden.",
  );
});

test("keeps code untouched while normalizing surrounding prose", () => {
  assert.equal(
    normalizeLearningText("int fuer = 1; fuehrt zu einem Rueckgabewert."),
    "int fuer = 1; führt zu einem Rückgabewert.",
  );
});

test("separates terminal commands and function names from prose", () => {
  const segments = formatLearningText(
    "man 3 fopen beschreibt den Kernel-Systemcall fopen.",
  );

  assert.deepEqual(
    segments.filter((segment) => segment.type === "code"),
    [
      { type: "code", kind: "command", value: "man 3 fopen" },
      { type: "code", kind: "code", value: "fopen" },
    ],
  );
});

test("does not absorb German prose after technical tokens", () => {
  assert.equal(
    normalizeLearningText("#endif gehoeren zum Präprozessor."),
    "#endif gehören zum Präprozessor.",
  );
  assert.equal(
    normalizeLearningText("sizeof(double*) gibt die Groesse zurueck."),
    "sizeof(double*) gibt die Grösse zurück.",
  );
  assert.equal(
    normalizeLearningText("sp->name ist Kurzform fuer (*sp).name."),
    "sp->name ist Kurzform für (*sp).name.",
  );
});

test("keeps standalone preprocessor directives separate from prose", () => {
  const segments = formatLearningText(
    "Ersetzungen wie #include und #define aus.",
  );

  assert.deepEqual(
    segments.filter((segment) => segment.type === "code"),
    [
      { type: "code", kind: "code", value: "#include" },
      { type: "code", kind: "code", value: "#define" },
    ],
  );
});

test("highlights standalone compiler flags and fixes known source typos", () => {
  assert.deepEqual(
    formatLearningText("-E gibt den praepozessierten Quelltext aus."),
    [
      { type: "code", kind: "code", value: "-E" },
      { type: "text", value: " gibt den präprozessierten Quelltext aus." },
    ],
  );
  assert.equal(
    normalizeLearningText("Zaehlsamphoren koennen freie Plaetze modellieren."),
    "Zählsemaphoren können freie Plätze modellieren.",
  );
});

test("does not style abbreviations or German hyphenated prose as code", () => {
  const value =
    "make Optionen enthalten u.a. //-Kommentare und FILE*-Streams.";

  assert.deepEqual(formatLearningText(value), [
    { type: "code", kind: "command", value: "make" },
    {
      type: "text",
      value: " Optionen enthalten u.a. //-Kommentare und FILE*-Streams.",
    },
  ]);
});

test("avoids prose comparisons and keeps complete assignments together", () => {
  assert.deepEqual(
    formatLearningText("Pointer können mit == auf gleiche Adresse zeigen."),
    [
      {
        type: "text",
        value: "Pointer können mit == auf gleiche Adresse zeigen.",
      },
    ],
  );
  assert.deepEqual(
    formatLearningText("OBJECTS = main.o model.o wird erweitert."),
    [
      { type: "code", kind: "code", value: "OBJECTS = main.o model.o" },
      { type: "text", value: " wird erweitert." },
    ],
  );
  assert.deepEqual(
    formatLearningText("int ListeningSocket = ... verdeckt die globale Variable."),
    [
      { type: "code", kind: "code", value: "int ListeningSocket = ..." },
      { type: "text", value: " verdeckt die globale Variable." },
    ],
  );
});

test("keeps complete C expressions and declarations in one code segment", () => {
  assert.deepEqual(
    formatLearningText(
      "Eine Zuweisung von (int)txt - 3 in ein char-Feld ist möglich.",
    ),
    [
      { type: "text", value: "Eine Zuweisung von " },
      { type: "code", kind: "code", value: "(int)txt - 3" },
      { type: "text", value: " in ein char-Feld ist möglich." },
    ],
  );
  assert.equal(
    isDisplayCodeSegment(
      formatLearningText(
        "Eine Zuweisung von (int)txt - 3 in ein char-Feld ist möglich.",
      )[1],
    ),
    true,
  );

  const declaration = formatLearningText(
    "float (*tab[10])(int); deklariert ein Array.",
  );

  assert.deepEqual(declaration, [
    {
      type: "code",
      kind: "code",
      value: "float (*tab[10])(int);",
    },
    { type: "text", value: " deklariert ein Array." },
  ]);
  assert.equal(isDisplayCodeSegment(declaration[0]), true);
});

test("promotes long expressions but keeps short tokens inline", () => {
  const call = formatLearningText(
    'Bei scanf("%d", &day); muss die Adresse übergeben werden.',
  )[1];
  const token = formatLearningText("NULL ist ein Nullpointer-Konstantenausdruck.")[0];

  assert.equal(isDisplayCodeSegment(call), true);
  assert.equal(isDisplayCodeSegment(token), false);
});
