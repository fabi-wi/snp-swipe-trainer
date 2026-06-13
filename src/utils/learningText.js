const PRESERVED_ASCII_WORDS = new Set([
  "aktuell",
  "aktuelle",
  "aktuellen",
  "anschauen",
  "bauen",
  "bequemer",
  "daemon",
  "daemonisierung",
  "daemons",
  "dauerhaft",
  "genaue",
  "genauer",
  "konsequent",
  "konzeptuell",
  "lebensdauer",
  "manuell",
  "neue",
  "neuen",
  "neues",
  "opaque",
  "queue",
  "queues",
  "quellcode",
  "quellcodedatei",
  "quellfile",
  "quelltext",
  "request",
  "sequence",
  "steuern",
  "textuell",
  "textuelle",
  "tictactoe",
  "true",
  "value",
  "virtuell",
  "virtuelle",
  "virtuellen",
  "virtuelles",
  "zuerst",
]);

const PROSE_CORRECTIONS = new Map([
  ["präpozessiert", "präprozessiert"],
  ["präpozessierte", "präprozessierte"],
  ["präpozessierten", "präprozessierten"],
  ["zählsamphore", "zählsemaphore"],
  ["zählsamphoren", "zählsemaphoren"],
]);

const NON_TECHNICAL_FRAGMENTS = new Set(["u.a", "z.B"]);

const TECHNICAL_PATTERNS = [
  {
    kind: "command",
    pattern: /\bman\s+[1-9]\s+[A-Za-z_][\w.-]*/g,
  },
  {
    kind: "command",
    pattern:
      /\bgcc(?=\s+(?:-|[\w./-]+\.(?:c|h|o|a|so)\b))(?:\s+(?:-[\w-]+|[\w./*-]+\.(?:c|h|o|a|so)|-o\s+[\w./-]+)){1,8}/g,
  },
  {
    kind: "command",
    pattern:
      /\bmake(?:\s+(?:clean|all|test|install|-[\w-]+|[A-Z_][A-Z0-9_$().-]*\b))?/g,
  },
  {
    kind: "command",
    pattern:
      /@?\b(?:chmod|valgrind|gdb|grep|kill|ps|cat|echo|rm|cp|mv|touch)\b/g,
  },
  {
    kind: "code",
    pattern: /#include\s*[<"][^>"]+[>"]/g,
  },
  {
    kind: "code",
    pattern:
      /#(?:define|ifdef|ifndef|if|elif|undef)\b(?:\s+[A-Z_][A-Z0-9_]*)?|#(?:endif|else|pragma|include)\b/g,
  },
  {
    kind: "code",
    pattern:
      /\b(?:const\s+)?(?:unsigned\s+|signed\s+)?(?:void|char|short|int|long|float|double|size_t|bool|struct\s+[A-Za-z_]\w*|[A-Za-z_]\w*_t)\s+\*?[A-Za-z_]\w*\s*\([^()]*\)/g,
  },
  {
    kind: "code",
    pattern:
      /\b(?:const\s+)?(?:unsigned\s+|signed\s+)?(?:void|char|short|int|long|float|double|size_t|bool|struct\s+[A-Za-z_]\w*|[A-Za-z_]\w*_t)\s+(?:(?:\*+\s*)[A-Za-z_]\w*|[A-Za-z_]\w*\s*\[[^\]]*\]|[A-Za-z_]\w*\s*=\s*(?:\.\.\.|-?\d+(?:\.\d+)?|[A-Za-z_]\w*|&[A-Za-z_]\w*|\{[^}]+\});?|[A-Za-z_]\w*\s*;)/g,
  },
  {
    kind: "code",
    pattern: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,
  },
  {
    kind: "code",
    pattern:
      /(?<!-)\b(?:printf|scanf|fprintf|fscanf|sprintf|snprintf|fopen|fclose|open|close|read|write|lseek|malloc|calloc|realloc|free|strlen|strcpy|strncpy|memcpy|memset|sizeof|fork|exec|execl|execv|wait|waitpid|pipe|dup|dup2|socket|bind|listen|accept|connect|pthread_[A-Za-z_]\w*|sem_[A-Za-z_]\w*)\b(?!-)(?:\s*\([^()]*\))?/g,
  },
  {
    kind: "code",
    pattern: /\b[A-Za-z_]\w*\([^()]*\)/g,
  },
  {
    kind: "code",
    pattern: /\b[A-Za-z_]\w+(?:->|\.)[A-Za-z_]\w*/g,
  },
  {
    kind: "code",
    pattern: /\b[A-Za-z_]\w*\s*\[[^\]]*\]/g,
  },
  {
    kind: "code",
    pattern: /(?:\*|&)[A-Za-z_]\w*/g,
  },
  {
    kind: "code",
    pattern:
      /\b(?:[A-Za-z_]\w?|[A-Za-z_]\w*_[A-Za-z_]\w*)\s*(?:==|!=|<=|>=|\+=|-=|\*=|\/=|=)\s*(?:[A-Za-z_]\w*|-?\d+(?:\.\d+)?|NULL)\b/g,
  },
  {
    kind: "code",
    pattern:
      /\b[A-Za-z_]\w*\s*(?:==|!=|<=|>=|\+=|-=|\*=|\/=|=)\s*(?:-?\d+(?:\.\d+)?|NULL)\b/g,
  },
  {
    kind: "code",
    pattern: /\b[A-Za-z_]\w*=[A-Za-z_]\w*\b/g,
  },
  {
    kind: "code",
    pattern:
      /\b[A-Z_][A-Z0-9_]*\s*=\s*[\w$()/-]+\.(?:o|c|h|a|so)(?:\s+[\w$()/-]+\.(?:o|c|h|a|so))*/g,
  },
  {
    kind: "code",
    pattern:
      /\b(?:NULL|EOF|EXIT_SUCCESS|EXIT_FAILURE|SIG[A-Z0-9]+|stdin|stdout|stderr|true|false)\b/g,
  },
  {
    kind: "code",
    pattern: /(?:\.\.?\/)?[\w.-]+\.(?:c|h|o|a|so|sh|txt)\b/g,
  },
  {
    kind: "code",
    pattern: /\$\?|\$\([A-Za-z_]\w*\)|\$\{[A-Za-z_]\w*\}/g,
  },
  {
    kind: "code",
    pattern:
      /\B-(?:E|H|I[A-Za-z0-9_./-]*|D[A-Za-z0-9_]*|U[A-Za-z0-9_]*|O[0-3s]?|Wall|Wextra|Werror|Wparentheses|Wsign-compare|std(?:=[A-Za-z0-9]+)?|pedantic|pthread|lm|c|o|f|n|p|k|s|a|Tpng)\b/g,
  },
];

function replaceUmlauts(word) {
  if (PRESERVED_ASCII_WORDS.has(word.toLowerCase())) {
    return word;
  }

  const normalized = word
    .replaceAll("Ae", "Ä")
    .replaceAll("Oe", "Ö")
    .replaceAll("Ue", "Ü")
    .replaceAll("ae", "ä")
    .replaceAll("oe", "ö")
    .replaceAll("ue", "ü");
  const corrected = PROSE_CORRECTIONS.get(normalized.toLowerCase());

  if (!corrected) {
    return normalized;
  }

  return normalized[0] === normalized[0].toUpperCase()
    ? `${corrected[0].toUpperCase()}${corrected.slice(1)}`
    : corrected;
}

export function normalizeGermanProse(text) {
  return String(text ?? "").replace(/[A-Za-zÄÖÜäöüß]+/g, replaceUmlauts);
}

function findTechnicalRanges(text) {
  const ranges = [];

  for (const { kind, pattern } of TECHNICAL_PATTERNS) {
    const matcher = new RegExp(pattern.source, pattern.flags);

    for (const match of text.matchAll(matcher)) {
      if (NON_TECHNICAL_FRAGMENTS.has(match[0])) {
        continue;
      }

      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
        kind,
      });
    }
  }

  ranges.sort(
    (left, right) =>
      left.start - right.start || right.end - right.start - (left.end - left.start),
  );

  const selected = [];
  let cursor = -1;

  for (const range of ranges) {
    if (range.start >= cursor) {
      selected.push(range);
      cursor = range.end;
    }
  }

  return selected;
}

export function formatLearningText(value) {
  const text = String(value ?? "");
  const ranges = findTechnicalRanges(text);
  const segments = [];
  let cursor = 0;

  for (const range of ranges) {
    if (range.start > cursor) {
      segments.push({
        type: "text",
        value: normalizeGermanProse(text.slice(cursor, range.start)),
      });
    }

    segments.push({
      type: "code",
      kind: range.kind,
      value: text.slice(range.start, range.end),
    });
    cursor = range.end;
  }

  if (cursor < text.length) {
    segments.push({
      type: "text",
      value: normalizeGermanProse(text.slice(cursor)),
    });
  }

  return segments;
}

export function normalizeLearningText(value) {
  return formatLearningText(value)
    .map((segment) => segment.value)
    .join("");
}
