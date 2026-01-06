"use client";

import React from "react";

type DocumentViewerProps = {
  payload: string;
};

function isProbablyUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function looksLikeHtml(value: string) {
  return /<\s*[a-zA-Z][\s\S]*?>/.test(value);
}

type GitHubRepo = {
  id: number;
  name: string;
  full_name?: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  updated_at: string;
  homepage?: string | null;
  language?: string | null;
  stargazers_count?: number;
  forks_count?: number;
};

function isGitHubRepoArray(data: unknown): data is GitHubRepo[] {
  if (!Array.isArray(data)) return false;
  const first = data[0] as any;
  if (!first || typeof first !== "object") return false;
  return (
    typeof first.name === "string" &&
    typeof first.html_url === "string" &&
    typeof first.updated_at === "string" &&
    typeof first.fork === "boolean"
  );
}

export default function DocumentViewer({ payload }: DocumentViewerProps) {
  const [remoteText, setRemoteText] = React.useState<string | null>(null);
  const [repos, setRepos] = React.useState<GitHubRepo[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      setLoading(false);
      setRepos(null);
      setRemoteText(payload);

      if (!isProbablyUrl(payload)) return;

      try {
        setLoading(true);
        const res = await fetch(payload);
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);

        const contentType = res.headers.get("content-type") ?? "";

        if (contentType.includes("application/json")) {
          const data = await res.json();
          if (isGitHubRepoArray(data)) {
            if (!cancelled) {
              setRepos(data);
              setRemoteText(null);
            }
            return;
          }

          const pretty = JSON.stringify(data, null, 2);
          if (!cancelled) setRemoteText(pretty);
          return;
        }

        const text = await res.text();
        if (!cancelled) setRemoteText(text);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to fetch");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [payload]);

  if (error) {
    return (
      <div className="p-4 bg-[#1a1b26]/60 backdrop-blur-xl select-text overflow-y-auto text-red-400">
        {error}
      </div>
    );
  }

  if (loading && repos === null && remoteText === null) {
    return (
      <div className="p-4 bg-[#1a1b26]/60 backdrop-blur-xl select-text overflow-y-auto text-gray-200">
        Loading…
      </div>
    );
  }

  if (repos) {
    const nonForks = repos.filter((r) => !r.fork);
    nonForks.sort((a, b) => {
      const ta = Date.parse(a.updated_at);
      const tb = Date.parse(b.updated_at);
      return tb - ta;
    });

    return (
      <div className="p-4 bg-[#1a1b26]/60 backdrop-blur-xl select-text overflow-y-auto text-gray-100">
        <div className="text-lg font-semibold mb-3">Projects</div>
        <div className="text-xs text-gray-400 mb-4">
          Showing non-fork repos sorted by last modified pulled directly from my github public repositories :3
        </div>

        <div className="space-y-3">
          {nonForks.map((repo) => (
            <div key={repo.id} className="border border-gray-800 rounded-lg p-3 bg-black/10">
              <div className="flex items-baseline justify-between gap-3">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-300 hover:underline font-medium"
                >
                  {repo.name}
                </a>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(repo.updated_at).toLocaleDateString()}
                </div>
              </div>
              {repo.description && (
                <div className="text-sm text-gray-200 mt-1">{repo.description}</div>
              )}
              <div className="text-xs text-gray-400 mt-2">
                {repo.language ? `Language: ${repo.language}` : ""}
                {typeof repo.stargazers_count === "number" ? `  ·  Stars: ${repo.stargazers_count}` : ""}
                {typeof repo.forks_count === "number" ? `  ·  Forks: ${repo.forks_count}` : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const text = remoteText ?? "";
  if (looksLikeHtml(text)) {
    return (
      <div
        className="p-4 bg-[#1a1b26]/60 backdrop-blur-xl select-text overflow-y-auto text-gray-100"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  return (
    <div className="p-4 bg-[#1a1b26]/60 backdrop-blur-xl select-text overflow-y-auto text-gray-100">
      <pre className="whitespace-pre-wrap wrap-break-word">{text}</pre>
    </div>
  );
}
