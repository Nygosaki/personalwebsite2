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

  const pushLine = React.useCallback(
    (line: { kind: "input"; location: string; text: string } | { kind: "output"; text: string }) => {
      const id = nextIdRef.current++;
      setLines((prev) => [...prev, { id, ...line }]);
    },
    []
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    const value = (e.target as HTMLInputElement).value;
    pushLine({ kind: "input", location, text: value });

    const result = handleCommand(value, location, setLocation);

    // Special-case: clear
    if (result === "clear") {
      setLines([]);
    } else {
      pushLine({ kind: "output", text: result });
    }

    setInputValue("");
    // Keep typing without clicking back into the input
    queueMicrotask(() => inputRef.current?.focus());
    queueMicrotask(() => {inputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });});
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
          onChange={(e) => setInputValue(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>
    </div>
  );
}