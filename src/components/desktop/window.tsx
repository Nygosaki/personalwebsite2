"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RiExpandDiagonalS2Line } from "react-icons/ri";
import { FaRegWindowMinimize } from "react-icons/fa";
import { CgClose } from "react-icons/cg";

interface TerminalWindowProps {
  title?: string;
  menu?: Record<string, Record<string, () => void>>;
  minimized?: boolean;
  onMinimize?: () => void;
  onClose?: () => void;
  payload?: React.ReactNode;
}

type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const MIN_WIDTH = 320;
const MIN_HEIGHT = 240;

const Window: React.FC<TerminalWindowProps> = ({
  title = "Window",
  menu = {
    Edit: { Copy: () => {}, Paste: () => {} },
    View: { Minimize: () => {onMinimize?.()} },
    Help: { "Source Code": () => {window.open('https://github.com/Nygosaki/personalwebsite2')?.focus()} },
  },
  minimized = false,
  onMinimize,
  onClose,
  payload
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });

  const preMaximizeRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
  } | null>(null);

  const resizeRef = useRef<{
    pointerId: number;
    dir: ResizeDir;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const clampToViewport = useCallback(
    (nextLeft: number, nextTop: number, nextWidth: number, nextHeight: number) => {
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      const clampedWidth = Math.max(MIN_WIDTH, Math.min(nextWidth, viewportW));
      const clampedHeight = Math.max(MIN_HEIGHT, Math.min(nextHeight, viewportH));

      const maxLeft = Math.max(0, viewportW - clampedWidth);
      const maxTop = Math.max(0, viewportH - clampedHeight);

      const clampedLeft = Math.min(Math.max(0, nextLeft), maxLeft);
      const clampedTop = Math.min(Math.max(0, nextTop), maxTop);

      return {
        x: clampedLeft,
        y: clampedTop,
        width: clampedWidth,
        height: clampedHeight,
      };
    },
    []
  );

  useEffect(() => {
    const initialWidth = Math.min(896, Math.max(MIN_WIDTH, window.innerWidth - 40));
    const initialHeight = Math.min(640, Math.max(MIN_HEIGHT, window.innerHeight - 120));
    const initialX = Math.max(0, Math.round((window.innerWidth - initialWidth) / 2));
    const initialY = Math.max(0, 80);
    const clamped = clampToViewport(initialX, initialY, initialWidth, initialHeight);
    setPosition({ x: clamped.x, y: clamped.y });
    setSize({ width: clamped.width, height: clamped.height });
  }, [clampToViewport]);

  useEffect(() => {
    const onResize = () => {
      setPosition((prevPos) => {
        const next = clampToViewport(
          prevPos.x,
          prevPos.y,
          size.width || MIN_WIDTH,
          size.height || MIN_HEIGHT
        );
        return { x: next.x, y: next.y };
      });
      setSize((prevSize) => {
        const next = clampToViewport(
          position.x,
          position.y,
          prevSize.width || MIN_WIDTH,
          prevSize.height || MIN_HEIGHT
        );
        return { width: next.width, height: next.height };
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampToViewport, position.x, position.y, size.width, size.height]);

  const onTitlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    // If the pointer started on an interactive control, don't begin a drag —
    // let that control handle the pointer (so its onClick works).
    const targetEl = e.target as HTMLElement | null;
    if (targetEl && targetEl.closest("button, [role='button'], a, input, textarea, select")) {
      return;
    }

    try {
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: position.x,
      startTop: position.y,
    };
  };

  const onTitlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const nextLeft = drag.startLeft + dx;
    const nextTop = drag.startTop + dy;
    const clamped = clampToViewport(nextLeft, nextTop, size.width, size.height);
    setPosition({ x: clamped.x, y: clamped.y });
  };

  const onTitlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const beginResize = (dir: ResizeDir) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    resizeRef.current = {
      pointerId: e.pointerId,
      dir,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: position.x,
      startTop: position.y,
      startWidth: size.width,
      startHeight: size.height,
    };
  };

  const onResizeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = resizeRef.current;
    if (!r || r.pointerId !== e.pointerId) return;

    const dx = e.clientX - r.startX;
    const dy = e.clientY - r.startY;

    let nextLeft = r.startLeft;
    let nextTop = r.startTop;
    let nextWidth = r.startWidth;
    let nextHeight = r.startHeight;

    const dir = r.dir;
    if (dir.includes("e")) nextWidth = r.startWidth + dx;
    if (dir.includes("s")) nextHeight = r.startHeight + dy;
    if (dir.includes("w")) {
      nextWidth = r.startWidth - dx;
      nextLeft = r.startLeft + dx;
    }
    if (dir.includes("n")) {
      nextHeight = r.startHeight - dy;
      nextTop = r.startTop + dy;
    }

    // If we hit min size while resizing from west/north, adjust position so the opposite edge stays put.
    if (dir.includes("w") && nextWidth < MIN_WIDTH) {
      nextLeft = r.startLeft + (r.startWidth - MIN_WIDTH);
      nextWidth = MIN_WIDTH;
    }
    if (dir.includes("n") && nextHeight < MIN_HEIGHT) {
      nextTop = r.startTop + (r.startHeight - MIN_HEIGHT);
      nextHeight = MIN_HEIGHT;
    }

    const clamped = clampToViewport(nextLeft, nextTop, nextWidth, nextHeight);
    setPosition({ x: clamped.x, y: clamped.y });
    setSize({ width: clamped.width, height: clamped.height });
  };

  const onResizeEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = resizeRef.current;
    if (!r || r.pointerId !== e.pointerId) return;
    resizeRef.current = null;
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const maximizeWindow = () => {
    if (size.width === window.innerWidth && size.height === window.innerHeight) {
      setPosition({ x: preMaximizeRef.current.x, y: preMaximizeRef.current.y });
      setSize({ width: preMaximizeRef.current.w, height: preMaximizeRef.current.h });
      return;
    }

    preMaximizeRef.current = { x: position.x, y: position.y, w: size.width, h: size.height };
    const clamped = clampToViewport(0, 0, window.innerWidth, window.innerHeight);
    setPosition({ x: clamped.x, y: clamped.y });
    setSize({ width: clamped.width, height: clamped.height });
  };

  return (
    <div
      id="terminal-window"
      className="fixed rounded-xl overflow-hidden shadow-2xl border border-gray-800 font-mono text-sm select-none flex flex-col"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        visibility: minimized ? "hidden" : "visible",
      }}
    >
      {/* Resize Handles */}
      <div className="absolute inset-x-2 top-0 h-2 cursor-n-resize touch-none z-60" onPointerDown={beginResize("n")} onPointerMove={onResizeMove} onPointerUp={onResizeEnd} />
      <div className="absolute inset-x-2 bottom-0 h-2 cursor-s-resize touch-none z-60" onPointerDown={beginResize("s")} onPointerMove={onResizeMove} onPointerUp={onResizeEnd} />
      <div className="absolute inset-y-2 left-0 w-2 cursor-w-resize touch-none z-60" onPointerDown={beginResize("w")} onPointerMove={onResizeMove} onPointerUp={onResizeEnd} />
      <div className="absolute inset-y-2 right-0 w-2 cursor-e-resize touch-none z-60" onPointerDown={beginResize("e")} onPointerMove={onResizeMove} onPointerUp={onResizeEnd} />
      <div className="absolute left-0 top-0 w-3 h-3 cursor-nw-resize touch-none z-60" onPointerDown={beginResize("nw")} onPointerMove={onResizeMove} onPointerUp={onResizeEnd} />
      <div className="absolute right-0 top-0 w-3 h-3 cursor-ne-resize touch-none z-60" onPointerDown={beginResize("ne")} onPointerMove={onResizeMove} onPointerUp={onResizeEnd} />
      <div className="absolute left-0 bottom-0 w-3 h-3 cursor-sw-resize touch-none z-60" onPointerDown={beginResize("sw")} onPointerMove={onResizeMove} onPointerUp={onResizeEnd} />
      <div className="absolute right-0 bottom-0 w-3 h-3 cursor-se-resize touch-none z-60" onPointerDown={beginResize("se")} onPointerMove={onResizeMove} onPointerUp={onResizeEnd} />

      {/* Title Bar */}
      <div
        id="title-bar"
        className="bg-[#1a1b26] px-4 py-2 flex items-center justify-between relative h-10 cursor-move touch-none"
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={onTitlePointerUp}
      >

        {/* Left' Window Controls */}
        <div id="window-controls" className="flex space-x-2 z-10">
        </div>

        {/* Center: Window Title */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium pointer-events-none">
          {title}
        </div>

        {/* Right Window Controls */}
        <div id="window-controls" className="flex items-center space-x-4 text-gray-400 z-10">
          <button
            className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] overflow-hidden flex items-center justify-center"
            onClick={onMinimize}
          >
            <FaRegWindowMinimize id="WindowControlIcon" style={{ transform: "translateY(-3px)" }} color="black" size={8} strokeWidth={1.5} opacity={0} />
          </button>

          <button
            className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] overflow-hidden flex items-center justify-center"
            onClick={maximizeWindow}
          >
            <RiExpandDiagonalS2Line id="WindowControlIcon" color="black" size={10} strokeWidth={1.5} opacity={0} />
          </button>

          <button
            className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] overflow-hidden flex items-center justify-center"
            onClick={onClose}
          >
            <CgClose id="WindowControlIcon" color="black" size={9} strokeWidth={1.5} opacity={0} />
          </button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="bg-[#24283b] px-2 flex text-gray-300 border-b border-gray-800 text-xs relative z-50">
        {Object.entries(menu).map(([menuTitle, items]) => (
          <div key={menuTitle} className="relative group">
            
            {/* Top Level Menu Item */}
            <button className="px-3 py-1.5 hover:bg-[#3b4261] focus:bg-[#3b4261] outline-none transition-colors cursor-default">
              {menuTitle}
            </button>

            {/* Submenu Dropdown 
               - Hidden by default
               - Block on group-hover (when parent div is hovered)
            */}
            <div className="hidden group-hover:block absolute top-full left-0 min-w-40 bg-[#24283b] border border-gray-700 shadow-xl py-1 rounded-b-md rounded-r-md">
              {Object.entries(items).map(([subMenuTitle, action]) => (
                <button
                  key={subMenuTitle}
                  onClick={action}
                  className="w-full text-left px-4 py-1.5 hover:bg-[#3b4261] text-gray-300 hover:text-white transition-colors whitespace-nowrap block"
                >
                  {subMenuTitle}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
        {payload}
    </div>
  );
};

export default Window;