import {
  BarChart3,
  Layers3,
  RotateCcw,
  Shuffle,
} from "lucide-react";

export function BottomDock({
  current,
  total,
  onTopics,
  onShuffle,
  onStats,
  onReset,
}) {
  const actions = [
    {
      label: "Themen",
      detail: "Kapitel wählen",
      icon: Layers3,
      action: onTopics,
    },
    {
      label: "Mischen",
      detail: "Rest zufällig",
      icon: Shuffle,
      action: onShuffle,
    },
    {
      label: "Statistik",
      detail: "Fortschritt",
      icon: BarChart3,
      action: onStats,
    },
    {
      label: "Zurücksetzen",
      detail: "Deck verwalten",
      icon: RotateCcw,
      action: onReset,
    },
  ];

  return (
    <nav className="bottom-dock" aria-label="Trainer-Navigation">
      {actions.map(({ label, detail, icon: Icon, action }) => (
        <button type="button" key={label} onClick={action}>
          <Icon aria-hidden="true" size={25} />
          <span>
            <strong>{label}</strong>
            <small>{detail}</small>
          </span>
        </button>
      ))}
      <div className="bottom-dock__count" aria-label="Aktuelle Karte">
        <span>Karte</span>
        <strong>
          {Math.min(current + 1, total || 0)} / {total}
        </strong>
      </div>
    </nav>
  );
}
