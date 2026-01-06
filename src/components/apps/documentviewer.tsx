"use client";

import React from "react";

type DocumentViewerProps = {
  html: string;
};

export default function DocumentViewer({ html }: DocumentViewerProps) {
  return (
    <div className="bg-white/5 text-white select-text overflow-auto flex-1 min-h-0 p-4">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
