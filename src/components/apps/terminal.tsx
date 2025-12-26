import React from "react";
import handleCommand from "@/lib/commandHandling";

type TerminalLine =
  | { id: number; kind: "input"; location: string; text: string }
  | { id: number; kind: "output"; text: string };

export default function Terminal() {
  const [location, setLocation] = React.useState("~/");
  const [lines, setLines] = React.useState<TerminalLine[]>([]);
  const [inputValue, setInputValue] = React.useState("");

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const nextIdRef = React.useRef(1);

  // Command history (like a real terminal)
  const historyRef = React.useRef<string[]>([]);
  // -1 means "not currently browsing history" (showing draft)
  const historyIndexRef = React.useRef<number>(-1);
  const draftRef = React.useRef<string>("");

  const pushLine = React.useCallback(
    (line: { kind: "input"; location: string; text: string } | { kind: "output"; text: string }) => {
      const id = nextIdRef.current++;
      setLines((prev) => [...prev, { id, ...line }]);
    },
    []
  );

  const setInputAndMoveCaretToEnd = (value: string) => {
    setInputValue(value);
    queueMicrotask(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      const end = value.length;
      try {
        el.setSelectionRange(end, end);
      } catch {
        // ignore
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // History navigation
    if (e.key === "ArrowUp") {
      e.preventDefault();
      console.log("UP");

      const history = historyRef.current;
      if (history.length === 0) return;

      // entering history mode: capture current draft
      if (historyIndexRef.current === -1) {
        draftRef.current = inputValue;
        historyIndexRef.current = history.length - 1;
      } else {
        historyIndexRef.current = Math.max(0, historyIndexRef.current - 1);
      }

      setInputAndMoveCaretToEnd(history[historyIndexRef.current] ?? "");
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();

      const history = historyRef.current;
      const idx = historyIndexRef.current;

      // not in history mode
      if (idx === -1) return;

      // step forward; if we go past the latest, restore draft + exit history mode
      if (idx >= history.length - 1) {
        historyIndexRef.current = -1;
        setInputAndMoveCaretToEnd(draftRef.current);
      } else {
        historyIndexRef.current = idx + 1;
        setInputAndMoveCaretToEnd(history[historyIndexRef.current] ?? "");
      }
      return;
    }

    if (e.key !== "Enter") return;

    const value = (e.target as HTMLInputElement).value;
    pushLine({ kind: "input", location, text: value });

    // ✅ Populate history BEFORE handleCommand()
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      const history = historyRef.current;
      // optional: avoid duplicates when pressing Enter repeatedly on same command
      if (history[history.length - 1] !== trimmed) history.push(trimmed);
    }
    // reset history browsing state
    historyIndexRef.current = -1;
    draftRef.current = "";

    const result = handleCommand(value, location, setLocation);

    // Special-case: clear
    if (result === "clear") {
      setLines([]);
    } else {
      pushLine({ kind: "output", text: result });
    }

    setInputValue("");
    queueMicrotask(() => inputRef.current?.focus());
    queueMicrotask(() => {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  };

  return (
    <div className="bg-[#1a1b26]/70 backdrop-blur-xl select-text overflow-y-auto flex-1 min-h-0">
      {lines.map((line) => {
        if (line.kind === "input") {
          return (
            <div key={line.id}>
              <span className="text-green-400">user@nygosaki</span>:
              <span className="text-blue-400">{line.location}</span>$&nbsp;
              <span className="text-white break-all">{line.text}</span>
            </div>
          );
        }

        return (
          <div key={line.id} className="text-white whitespace-pre-wrap break-words">
            {line.text}
          </div>
        );
      })}

      <div className="flex">
        <span className="text-green-400">user@nygosaki</span>:
        <span className="text-blue-400">{location}</span>$&nbsp;
        <input
          ref={inputRef}
          type="text"
          className="bg-transparent focus:outline-none text-white w-3/4"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.currentTarget.value);
            historyIndexRef.current = -1;
          }}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>
    </div>
  );
}