"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Point = { x: number; y: number };

type SelectionRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type DesktopSelectionAreaProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

function toRect(start: Point, current: Point): SelectionRect {
  const left = Math.min(start.x, current.x);
  const top = Math.min(start.y, current.y);
  const width = Math.abs(current.x - start.x);
  const height = Math.abs(current.y - start.y);
  return { left, top, width, height };
}

export default function DesktopSelectionArea({
  children,
  className,
  style,
}: DesktopSelectionAreaProps) {
  const pointerIdRef = useRef<number | null>(null);
  const startRef = useRef<Point | null>(null);

  const [current, setCurrent] = useState<Point | null>(null);

  const rect = useMemo(() => {
    const start = startRef.current;
    if (!start || !current) return null;
    return toRect(start, current);
  }, [current]);

  const endDrag = (el?: HTMLElement, pointerId?: number) => {
    pointerIdRef.current = null;
    startRef.current = null;
    setCurrent(null);

    if (el && typeof pointerId === "number") {
      try {
        el.releasePointerCapture(pointerId);
      } catch {
        // ignore
      }
    }

    // Restore default browser behavior.
    document.body.style.userSelect = "";
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      endDrag();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      className={className}
      style={{ position: "relative", minHeight: "100vh", overflow: "hidden", ...style }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;

        const target = e.target as HTMLElement | null;
        if (target?.closest("[data-desktop-block-select='true']")) return;

        // Allow selection to start on wallpaper/video/background.
        pointerIdRef.current = e.pointerId;
        const startPoint = { x: e.clientX, y: e.clientY };
        startRef.current = startPoint;
        setCurrent(startPoint);

        // Prevent text selection while dragging.
        document.body.style.userSelect = "none";

        try {
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }}
      onPointerMove={(e) => {
        if (pointerIdRef.current !== e.pointerId) return;
        setCurrent({ x: e.clientX, y: e.clientY });
      }}
      onPointerUp={(e) => {
        if (pointerIdRef.current !== e.pointerId) return;
        endDrag(e.currentTarget as HTMLElement, e.pointerId);
      }}
      onPointerCancel={(e) => {
        if (pointerIdRef.current !== e.pointerId) return;
        endDrag(e.currentTarget as HTMLElement, e.pointerId);
      }}
    >
      {children}

      {rect && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed border border-blue-400/70 bg-blue-500/20"
          style={{
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
}
