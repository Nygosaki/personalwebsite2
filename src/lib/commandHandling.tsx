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
          const file = (directory as readonly any[]).find((r: any) => r.name === trimmedCommand[1]);
          if (!file) return `open: ${trimmedCommand[1]} not found`;
            switch (file["type"]) {
                case "app":
                    const btn = document.getElementById(file["payload"]) as HTMLButtonElement | null;
                    if (!btn) {
                        return `open: application ${file["name"]} not found`;
                    }
                    btn.click();
                    return "";
            case "document":
              const docBtn = document.getElementById(file["id"]) as HTMLButtonElement | null;
              if (!docBtn) {
                return `open: document ${file["name"]} not found`;
              }
              docBtn.click();
              return "";
                case "txt":
                    return file["payload"];
            }
          return "";
        
        case "blahaj":
            let c1
            let c2
            let c3
            let c4
            let c5
            switch (trimmedCommand[1]) {
              case 'trans':
                c1 = "#5BCEFA"
                c2 = "#F5A9B8"
                c3 = "#FFFFFF"
                c4 = "#F5A9B8"
                c5 = "#5BCEFA"
                break;
              case 'abrosexual':
                c1 = "#76CB93"
                c2 = "#B4E4CB"
                c3 = "#FCFEFF"
                c4 = "#E896B4"
                c5 = "#DB426C"
                break;
              case 'agender':
                c1 = "#000000"
                c2 = "#B9B9B9"
                c3 = "#FFFFFF"
                c4 = "#B8F483"
                c5 = "#FFFFFF"
                break;
              case 'ambiamorous':
                c1 = "#4646C3"
                c2 = "#4646C3"
                c3 = "#36368C"
                c4 = "#272754"
                c5 = "#181818"
                break;
              case 'aroace':
                c1 = "#E38D00"
                c2 = "#EDCE00"
                c3 = "#FFFFFF"
                c4 = "#62B0DD"
                c5 = "#1A3555"
                break;
              case 'gay':
                c1 = "#118C70"
                c2 = "#2DCDA9"
                c3 = "#97E7C0"
                c4 = "#EFEFFF"
                c5 = "#7AACE1"
                break;
              case 'ace':
                c1 = "#000000"
                c2 = "#A3A3A3"
                c3 = "#FFFFFF"
                c4 = "#800080"
                c5 = "#FFFFFF"
                break;
              case 'aro':
                c1 = "#3DA542"
                c2 = "#A7D379"
                c3 = "#FFFFFF"
                c4 = "#A9A9A9"
                c5 = "#000000"
                break;
              case 'bi':
                c1 = "#D60270"
                c2 = "#D60270"
                c3 = "#9B4F96"
                c4 = "#0038A8"
                c5 = "#0038A8"
                break;
              case 'genderfluid':
                c1 = "#FF75A2"
                c2 = "#FFFFFF"
                c3 = "#BE18D6"
                c4 = "#000000"
                c5 = "#333EBD"
                break;
              case 'genderqueer':
                c1 = "#B57EDC"
                c2 = "#FFFFFF"
                c3 = "#4A8123"
                c4 = "#FFFFFF"
                c5 = "#B57EDC"
                break;
              case 'nb':
                c1 = "#FFF430"
                c2 = "#FFFFFF"
                c3 = "#9C59D1"
                c4 = "#000000"
                c5 = "#FFF430"
                break;
              case 'omnisexual':
                c1 = "#CC6687"
                c2 = "#C51A73"
                c3 = "#000000"
                c4 = "#221E7F"
                c5 = "#5E5BAF"
                break;
              case 'bigender':
                c1 = "#C57AA3"
                c2 = "#EEA7CE"
                c3 = "#D6C8E9"
                c4 = "#FFFFFF"
                c5 = "#9BC8E9"
                break;
              case 'pansexual':
                c1 = "#FF218C"
                c2 = "#FFD800"
                c3 = "#21B1FF"
                c4 = "#FFD800"
                c5 = "#FF218C"
                break;
              case 'pangender':
                c1 = "#FFF798"
                c2 = "#FFDDCD"
                c3 = "#FFEBFB"
                c4 = "#FFFFFF"
                c5 = "#FFDDCD"
                break;
              case 'pride':
                c1 = "#E40303"
                c2 = "#FF8C00"
                c3 = "#FFED00"
                c4 = "#008026"
                c5 = "#004DFF"
                break;
              case 'philadelphia':
                c1 = "#000000"
                c2 = "#784F17"
                c3 = "#E40303"
                c4 = "#FF8C00"
                c5 = "#FFED00"
                break;
              case 'plural':
                c1 = "#33052A"
                c2 = "#704884"
                c3 = "#8584C6"
                c4 = "#94C3B1"
                c5 = "#F3EDBD"
                break;
              case 'polysexual':
                c1 = "#F61BB9"
                c2 = "#07D669"
                c3 = "#1C92F5"
                c4 = "#07D669"
                c5 = "#F61BB9"
                break;
              case 'progress':
                c1 = "#FFFFFF"
                c2 = "#F5A9B8"
                c3 = "#5BCEFA"
                c4 = "#784F17"
                c5 = "#000000"
                break;
              case 'lesbian':
                c1 = "#D52D00"
                c2 = "#EF7627"
                c3 = "#FF9A56"
                c4 = "#FFFFFF"
                c5 = "#D162A4"
                break;
              case 'queer':
                c1 = "#000000"
                c2 = "#99D9EA"
                c3 = "#00A2E8"
                c4 = "#B5E61D"
                c5 = "#FFFFFF"
                break;
              case 'demigender':
                c1 = "#808080"
                c2 = "#C5C5C5"
                c3 = "#FBFF75"
                c4 = "#FFFFFF"
                c5 = "#FBFF75"
                break;
              case 'demiboy':
                c1 = "#7F7F7F"
                c2 = "#C3C3C3"
                c3 = "#9AD9EA"
                c4 = "#FFFFFF"
                c5 = "#9AD9EA"
                break;
              case 'demigirl':
                c1 = "#7F7F7F"
                c2 = "#C3C3C3"
                c3 = "#FEAEC9"
                c4 = "#FFFFFF"
                c5 = "#FEAEC9"
                break;
              case 'bear':
                c1 = "#623804"
                c2 = "#D56300"
                c3 = "#FEDD63"
                c4 = "#FEE6B8"
                c5 = "#FFFFFF"
                break;
              case 'xenogender':
                c1 = "#FC6692"
                c2 = "#FD9998"
                c3 = "#FEB782"
                c4 = "#FCFEA6"
                c5 = "#84BBFF"
                break;
              case 'femboy':
                c1 = "#D260A5"
                c2 = "#E4AFCD"
                c3 = "#FEFEFE"
                c4 = "#57CEF8"
                c5 = "#FEFEFE"
                break;
              case 'genderfae':
                c1 = "#97C3A5"
                c2 = "#C3DEAE"
                c3 = "#F9FACD"
                c4 = "#FFFFFF"
                c5 = "#FCA2C4"
                break;
              case 'graysexual':
                c1 = "#740194"
                c2 = "#AEB1AA"
                c3 = "#FFFFFF"
                c4 = "#AEB1AA"
                c5 = "#740194"
                break;
              default:
                  c1 = "#5BCEFA"
                  c2 = "#F5A9B8"
                  c3 = "#FFFFFF"
                  c4 = "#F5A9B8"
                  c5 = "#5BCEFA"
                  break;
              }

            const art =
`<span class="c1">                                          ,(((/                                 </span>
<span class="c2">                                        /(((((                                  </span>
<span class="c3">                                       ((((#((                              (// </span>
<span class="c4">                                      (((((((.                           *(((/  </span>
<span class="c5">                                    /(######/                          *((((/   </span>
<span class="c1">                                 *//%#####((/                         ((#((/    </span>
<span class="c2">               ,*/********/////////////////(//*           (%*      ,((##((      </span>
<span class="c3">      ,*/((///(//////////((/(///////(/////(////*,(*#((/(/((//////###(###(/(     </span>
<span class="c4">   /(((((((//((///((////((((((/(((((((((((((((((/(((##((#%(##(/((///*(&#(##/    </span>
<span class="c5">  /#((%(#(((((//#((((((((((((((((((((((((#(((((((((((/##(((((//((//*    ####(/  </span>
<span class="c1">   (((###(###(#(#####(###############((#((((((((/((//(((#/(/////            ,,  </span>
<span class="c2">     ,(###%####%&%#############(#(#(####(((((((/(((/////*//,                    </span>
<span class="c3">         . .....*#(#######(((###(#(##(##(((/(/(/////,                           </span>
<span class="c4">          .. ....,..........,..*#%#######/(                                     </span>
<span class="c5">               ..  .............,*%%%%#%((((/                                   </span>
<span class="c1">                       **,,,****//*(##((###(#(((                                </span>
<span class="c2">                                        &#(#/#((((((((#                         </span>`;

            return `<pre class="blahaj" style="--c1:${c1};--c2:${c2};--c3:${c3};--c4:${c4};--c5:${c5};">${art}</pre>`;
        case "neofetch":
          document.title = "Oh Bread!"
          return '<pre class="neofetch"> <p>       _,met$$$$$gg.</p><p>    ,g$$$$$$$$$$$$$$$P.</p><p>  ,g$$P"     """Y$$.".</p><p> ,$$P\'              `$$$.</p><p>\',$$P       ,ggs.     `$$b:   <span class="neofetchtext">' + "user" + '</span>@<span class="neofetchtext">nygosaki</span></p><p>`d$$\'     ,$P"\'   <span class="neofetchtext">.</span>    $$$    --------------------------------</p><p> $$P      d$\'     <span class="neofetchtext">,</span>    $$P    <span class="neofetchtext">OS</span>: Debian GNU/Linux 11 (bullseye) x86_64</p><p> $$:      $$.   <span class="neofetchtext">-</span>    ,d$$\'    <span class="neofetchtext">Host</span>: Google Compute Engine</p><p> $$;      Y$b._   _,d$P\'      <span class="neofetchtext">Kernel</span>: 6.1.42+</p><p> Y$$.    <span class="neofetchtext">`.</span>`"Y$$$$P"\'         <span class="neofetchtext">Uptime</span>: 1+ years</p><p> `$$b      <span class="neofetchtext">"-.__</span>              <span class="neofetchtext">Packages</span>: 733 (dpkg)</p><p>  `Y$$                        <span class="neofetchtext">Shell</span>: bash 5.1.4</p><p>   `Y$$.                      <span class="neofetchtext">Terminal</span>: /dev/pts/1</p><p>     `$$b.                    <span class="neofetchtext">CPU</span>: Intel Xeon (4) @ 2.199GHz</p><p>       `Y$$b.                 <span class="neofetchtext">Memory</span>: ' + (Math.floor(Math.random() * (16002 - 300 + 1)) + 300) + 'MiB / 16002MiB</p><p>          `"Y$b._</p><p>              `"""                                    </p><p>                                                      </p></pre>';
        default:
            return `Unknown command: ${command}. Type 'help' for a list of available commands.`;
    }
} 