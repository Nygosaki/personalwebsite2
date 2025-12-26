import { fileSystemToString, getDirectoryAtPath } from "@/lib/fileSystem";

export const TERMINAL_COMMANDS = ["help", "ls", "cd", "clear", "pwd", "echo", "open"] as const;
export type TerminalCommand = (typeof TERMINAL_COMMANDS)[number];

export default function handleCommand(
    command: string,
    location: string,
    setLocation: React.Dispatch<React.SetStateAction<string>>
): string {
    const trimmedCommand = command.trim().split(" ");
    let locationKey = location.split("/").filter(Boolean);
    let directory: any = getDirectoryAtPath(location);
    switch (trimmedCommand[0]) {
        case "help":
            return "coming soon";
        
        case "ls":
            return fileSystemToString(directory);

        case "cd":
            try {
                if (trimmedCommand[1] === "..") {
                    if (location === "~/") {return "";} else {
                    setLocation(locationKey.slice(0, locationKey.length - 1).join("/") + "/");
                    return ""
                    }
                }

                directory = directory[`${trimmedCommand[1]}`];
                console.log(directory);
                if (!directory) { throw new Error(`No such directory: ${trimmedCommand[1]}`);}
                
                setLocation(location + `${trimmedCommand[1]}`);
                return "";
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                return `cd: ${msg}`;
            }

        case "clear":
            return "clear";

        case "pwd":
            return location;

        case "echo":
            return trimmedCommand.slice(1).join(" ");

        case "open":
            var file = directory
            var file = (directory as readonly any[]).find((r: any) => r.name === trimmedCommand[1]);
            if (!file) return `open: ${trimmedCommand[1]} not found`;
            switch (file["type"]) {
                case "app":
                    const btn = document.getElementById(file["payload"]) as HTMLButtonElement | null;
                    if (!btn) {
                        return `open: application ${file["name"]} not found`;
                    }
                    btn.click();
                    return "";
                case "txt":
                    return file["payload"];
            }

        default:
            return `Unknown command: ${command}. Type 'help' for a list of available commands.`;
    }
} 