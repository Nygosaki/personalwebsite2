import React from "react";
import handleCommand, { TERMINAL_COMMANDS } from "@/lib/commandHandling";
import { getDirectoryAtPath } from "@/lib/fileSystem";

type TerminalLine =
  | { id: number; kind: "input"; location: string; text: string; format?: "plain" | "html" }
  | { id: number; kind: "output"; text: string; format?: "plain" | "html" };

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
    (line: { kind: "input"; location: string; text: string, format?: "plain" | "html" } | { kind: "output"; text: string, format?: "plain" | "html" }) => {
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

  // if there are multiple matches, this autofills as much as possible till the divergence
  const longestCommonPrefix = (items: string[]) => {
    if (items.length === 0) return "";
    let prefix = items[0] ?? "";
    for (let i = 1; i < items.length; i++) {
      const next = items[i] ?? "";
      let j = 0;
      while (j < prefix.length && j < next.length && prefix[j] === next[j]) j++;
      prefix = prefix.slice(0, j);
      if (prefix.length === 0) return "";
    }
    return prefix;
  };

  const getCompletionCandidates = (commandName: string | undefined, cwdLocation: string): string[] => {
    const directory = getDirectoryAtPath(cwdLocation);

    // Directory listing
    if (commandName === "cd") {
      if (Array.isArray(directory)) return [".."]; // can't cd into files list; still allow ..
      return ["..", ...Object.keys(directory)];
    }

    if (commandName === "open") {
      if (!Array.isArray(directory)) return [];
      return directory.map((item: any) => String(item?.name ?? "")).filter(Boolean);
    }

    if (Array.isArray(directory)) {
      return directory.map((item: any) => String(item?.name ?? "")).filter(Boolean);
    }
    return Object.keys(directory);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();

      // use current taxt blinker position instead of eol
      const el = inputRef.current;
      const caret = el?.selectionStart ?? inputValue.length;
      const beforeCaret = inputValue.slice(0, caret);

      const tokenStart = beforeCaret.lastIndexOf(" ") + 1;
      const token = beforeCaret.slice(tokenStart); //current word being completed
      const beforeToken = beforeCaret.slice(0, tokenStart);

      const argsBeforeToken = beforeToken.trim().length === 0 ? [] : beforeToken.trim().split(/\s+/);
      const isCompletingCommand = argsBeforeToken.length === 0;

      // Determine command name (if present) for file completions.
      const allArgs = inputValue.trim().length === 0 ? [] : inputValue.trim().split(/\s+/);
      const commandName = allArgs[0];

      if (isCompletingCommand) {
        const candidates = [...TERMINAL_COMMANDS];
        const matches = candidates.filter((c) => c.toLowerCase().startsWith(token.toLowerCase()));
        if (matches.length === 0) return;

        if (matches.length === 1) {
          const completed = matches[0] + " ";
          const newValue = inputValue.slice(0, tokenStart) + completed + inputValue.slice(caret);
          setInputAndMoveCaretToEnd(newValue);
          historyIndexRef.current = -1;
          return;
        }

        const lcp = longestCommonPrefix(matches);
        if (lcp.length > token.length) {
          const newValue = inputValue.slice(0, tokenStart) + lcp + inputValue.slice(caret);
          setInputAndMoveCaretToEnd(newValue);
          historyIndexRef.current = -1;
          return;
        }

        pushLine({ kind: "output", text: matches.join("\n") });
        queueMicrotask(() => inputRef.current?.focus());
        return;
      }

      // Completing an argument (file/dir) based on current directory
      const candidates = getCompletionCandidates(commandName, location);
      const matches = candidates.filter((c) => c.toLowerCase().startsWith(token.toLowerCase()));
      if (matches.length === 0) return;

      if (matches.length === 1) {
        const completed = matches[0];
        const newValue = inputValue.slice(0, tokenStart) + completed + inputValue.slice(caret);
        setInputAndMoveCaretToEnd(newValue);
        historyIndexRef.current = -1;
        return;
      }

      const lcp = longestCommonPrefix(matches);
      if (lcp.length > token.length) {
        const newValue = inputValue.slice(0, tokenStart) + lcp + inputValue.slice(caret);
        setInputAndMoveCaretToEnd(newValue);
        historyIndexRef.current = -1;
        return;
      }

      pushLine({ kind: "output", text: matches.join("\n") });
      queueMicrotask(() => inputRef.current?.focus());
      return;
    }

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

    const trimmed = value.trim();
    if (trimmed.length > 0) {
      const history = historyRef.current;
      if (history[history.length - 1] !== trimmed) history.push(trimmed);
    }
    historyIndexRef.current = -1;
    draftRef.current = "";

    const result = handleCommand(value, location, setLocation);

    // Special-case: clear
    if (result === "clear") {
      setLines([]);
    } else {
      pushLine({ kind: "output", text: result, format: typeof result === "string" && result.startsWith("<") ? "html" : "plain" });
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

        if (line.format === "html") {
          return (
            <div
              key={line.id}
              className="text-white"
              dangerouslySetInnerHTML={{ __html: line.text }}
            />
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
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="off"
          autoFocus
        />
      </div>
    </div>
  );
}