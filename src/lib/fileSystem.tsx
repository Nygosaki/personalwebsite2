export const fileSystem = {
  "Applications/": [
    { name: "firefox.app", type: "app", id: "firefox", payload: `firefox` },
    { name: "terminal.app", type: "app", id: "terminal", payload: `terminal` },
    { name: "explorer.app", type: "app", id: "explorer", payload: `explorer` },
    { name: "musicplayer.app", type: "app", id: "musicplayer", payload: `musicplayer` }
  ],
  "Documents/": [
    { name: "aboutMe.html", type: "document", id: "aboutme", payload: "aboutme" },
    { name: "projects.html", type: "document", id: "projects", payload: "projects" }
  ],
  "Pictures/": [],
  "Music/": [],
  "Videos/": []
} as const;

export function fileSystemToString(directory: any): string {
  if (Array.isArray(directory)) {
    return directory.map((item: any) => item.name).join("\n");
  } else {
    return Object.keys(directory).join("\n");
  }
}

export function getDirectoryAtPath(path: string): any {
  let directory: any = fileSystem;
  let locationKey = path.split("/").filter(Boolean);
    for (let i = 1; i < locationKey.length; i++) {
        directory = directory[`${locationKey[i]}/`];
    }
    return directory;
}


export type FileSystem = typeof fileSystem;