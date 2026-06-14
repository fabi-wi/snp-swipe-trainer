import {
  formatLearningText,
  isDisplayCodeSegment,
} from "../utils/learningText.js";

export function TechnicalText({
  as: Component = "span",
  className = "",
  text,
}) {
  const segments = formatLearningText(text);
  const classes = ["technical-text", className].filter(Boolean).join(" ");

  return (
    <Component className={classes}>
      {segments.map((segment, index) =>
        segment.type === "code" ? (
          isDisplayCodeSegment(segment) ? (
            <span
              className="technical-text__code-line"
              key={`${segment.value}-${index}`}
            >
              <code className="technical-text__code technical-text__code--display">
                {segment.value.trim()}
              </code>
            </span>
          ) : (
            <code
              className={`technical-text__code technical-text__code--${segment.kind}`}
              key={`${segment.value}-${index}`}
            >
              {segment.value}
            </code>
          )
        ) : (
          segment.value
        ),
      )}
    </Component>
  );
}
