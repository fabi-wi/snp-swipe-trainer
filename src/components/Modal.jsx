import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Modal({ title, children, onClose, size = "normal" }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    dialogRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <header>
          <h2 id="modal-title">{title}</h2>
          <button type="button" aria-label="Schliessen" onClick={onClose}>
            <X aria-hidden="true" size={22} />
          </button>
        </header>
        <div className="modal__content">{children}</div>
      </section>
    </div>
  );
}
