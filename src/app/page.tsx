"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import Window from "@/components/desktop/window";
import Taskbar from "@/components/desktop/taskbar";
import DesktopSelectionArea from "@/components/desktop/desktop-selection-area";
import DocumentViewer from "@/components/apps/documentviewer";
import { fileSystem } from "@/lib/fileSystem";

type AppWindow = {
  id: string;
  appId: string;
  title: string;
  minimized: boolean;
  payload?: ReactNode;
};

export default function Home() {
  const [windows, setWindows] = useState<AppWindow[]>([]);

  const handleLaunch = (appId: string, payload?: ReactNode, title?: string) => {
    setWindows((prev) => {
      const idx = prev.findIndex((w) => w.appId === appId);
      if (idx !== -1) {
        // restore + bring to front
        const copy = [...prev];
        const existing = copy[idx];
        copy.splice(idx, 1);
        return [...copy, { ...existing, minimized: false }];
      } else {
        const id = `${appId}-${Date.now()}`;
        return [...prev, { id, appId, title: title ?? appId, minimized: false, payload }];
      }
    });
  };

  const toggleMinimize = (appId: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.appId === appId ? { ...w, minimized: !w.minimized } : w))
    );
  };

  const closeWindow = (appId: string) => {
    setWindows((prev) => prev.filter((w) => w.appId !== appId));
  };

  return (
    <DesktopSelectionArea>
      {/* Hidden launch buttons for terminal/file-explorer driven opens */}
      <div style={{ display: "none" }}>
        {(fileSystem["Documents/"] as readonly any[]).map((doc: any) => (
          <button
            key={doc.id}
            id={doc.id}
            onClick={() => {
              // Each open should create a new window instance.
              const instanceAppId = `doc:${doc.id}:${Date.now()}`;
              handleLaunch(instanceAppId, <DocumentViewer html={String(doc.payload ?? "")} />, String(doc.name ?? "Document"));
            }}
          />
        ))}
      </div>

      <video
        src="/wallpaper.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      />

      <div data-desktop-block-select="true" style={{ position: "relative", zIndex: 2 }}>
        {windows.map((w) => (
          <Window
            key={w.id}
            title={w.title}
            minimized={w.minimized}
            onMinimize={() => toggleMinimize(w.appId)}
            onClose={() => closeWindow(w.appId)}
            payload={w.payload}
          />
        ))}
      </div>

      <div data-desktop-block-select="true">
        <Taskbar onLaunch={handleLaunch} openWindows={windows} />
      </div>
    </DesktopSelectionArea>
  );
}
