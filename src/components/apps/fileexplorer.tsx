"use client";

import React from 'react';
import {
  MdFolder,
  MdInsertDriveFile,
  MdHome,
  MdDescription,
  MdMusicNote,
  MdImage,
  MdMovie,
  MdSearch,
  MdViewModule,
  MdMoreVert,
  MdOutlinePlayCircle,
  MdArrowBack,
} from 'react-icons/md';
import { fileSystem, getDirectoryAtPath } from "@/lib/fileSystem";

type FileSystemLeafItem = {
  name: string;
  type: string;
  id: string;
  payload?: string;
};

type ExplorerItem = {
  id: string;
  name: string;
  iconStyle: string;
  onOpen?: () => void;
};

const SidebarItem = ({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <div
    style={{ ...styles.sidebarItem, ...(active ? styles.sidebarItemActive : {}) }}
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    <span style={styles.sidebarIcon}>{icon}</span>
    <span>{label}</span>
  </div>
);

const Sidebar = ({ currentPath, setCurrentPath }: { currentPath: string; setCurrentPath: (p: string) => void }) => (
  <div style={styles.sidebar}>
    <div style={{ paddingBottom: 20 }}>
      <SidebarItem
        icon={<MdHome />}
        label="Home"
        active={currentPath === "~/"}
        onClick={() => setCurrentPath("~/")}
      />
      <SidebarItem
        icon={<MdDescription />}
        label="Documents"
        active={currentPath.startsWith("~/Documents/")}
        onClick={() => setCurrentPath("~/Documents/")}
      />
      <SidebarItem
        icon={<MdMusicNote />}
        label="Music"
        active={currentPath.startsWith("~/Music/")}
        onClick={() => setCurrentPath("~/Music/")}
      />
      <SidebarItem
        icon={<MdImage />}
        label="Pictures"
        active={currentPath.startsWith("~/Pictures/")}
        onClick={() => setCurrentPath("~/Pictures/")}
      />
      <SidebarItem
        icon={<MdMovie />}
        label="Videos"
        active={currentPath.startsWith("~/Videos/")}
        onClick={() => setCurrentPath("~/Videos/")}
      />
    </div>
    <div style={styles.sidebarDivider} />
  </div>
);

const GridItem = ({ item }: { item: ExplorerItem }) => {
  let MainIcon;
  let iconColor = '#ccc'; // Default gray for files

  switch (item.iconStyle) {
    case 'folder': MainIcon = MdFolder; iconColor = '#4388ee'; break; // Kali Blue
    case 'app': MainIcon = MdOutlinePlayCircle; iconColor = '#ccc'; break;
    default: MainIcon = MdInsertDriveFile; break;
  }

  return (
    <div style={styles.gridItem} onClick={item.onOpen}>
      <div style={styles.iconWrapper}>
        <MainIcon size={64} color={iconColor} />
      </div>
      <span style={styles.gridItemLabel}>{item.name}</span>
    </div>
  );
};

const FileExplorer = () => {
  const [currentPath, setCurrentPath] = React.useState<string>("~/");

  const items = React.useMemo<ExplorerItem[]>(() => {
    const directory = getDirectoryAtPath(currentPath);

    if (Array.isArray(directory)) {
      return (directory as FileSystemLeafItem[]).map((entry) => {
        const payload = entry.payload;
        const onOpen = (() => {
          if (entry.type === "app" && payload) {
            return () => {
              const btn = document.getElementById(payload) as HTMLButtonElement | null;
              btn?.click();
            };
          }

          if (entry.type === "document" && entry.id) {
            return () => {
              const btn = document.getElementById(entry.id) as HTMLButtonElement | null;
              btn?.click();
            };
          }

          return undefined;
        })();

        return {
          id: entry.id ?? entry.name,
          name: entry.name,
          iconStyle: entry.type || "folder",
          onOpen,
        };
      });
    }

    const folderKeys = Object.keys(directory as Record<string, unknown>);
    return folderKeys.map((key) => {
      const folderName = key.endsWith("/") ? key.slice(0, -1) : key;
      return {
        id: `dir:${currentPath}${folderName}/`,
        name: folderName,
        iconStyle: "folder",
        onOpen: () => setCurrentPath(`~/${folderName}/`),
      };
    });
  }, [currentPath]);

  const goBackward = () => {
    if (currentPath === "~/") return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop(); 
    const newPath = parts.length === 1 ? "~/" : `~/${parts.slice(1).join("/")}/`;
    setCurrentPath(newPath);
  }

  return (
    <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={{display: 'flex', gap: 8, marginRight: 16}}>
              <MdArrowBack size={18} style={{ cursor: 'pointer', color: '#ccc' }} onClick={goBackward} />
            </div>
            <MdHome size={18} style={{ marginRight: 8, color: '#ccc', cursor: 'pointer' }} onClick={() => setCurrentPath("~/")}/>
            <span style={styles.headerTitle}>{currentPath}</span>
          </div>
          <div style={styles.headerRight}>
            <MdSearch size={22} style={styles.iconButton} />
            <MdViewModule size={22} style={styles.iconButton} />
            <MdMoreVert size={22} style={styles.iconButton} />
          </div>
        </div>
      <div style={styles.contentArea}>
        <Sidebar currentPath={currentPath} setCurrentPath={setCurrentPath} />
        <div style={styles.mainView}>
          {items.map((item) => (
            <GridItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Styles (CSS-in-JS object) ---
const theme = {
  bgDark: '#242424',    // Sidebar BG
  bgLight: '#2f2f2f',   // Main Content BG
  bgHeader: '#2f2f2f',  // Header BG
  textWhite: '#ffffff',
  textGray: '#cccccc',
  kaliBlue: '#4388ee',
  hoverBg: '#3a3a3a',
  borderColor: '#3a3a3a'
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: theme.bgDark,
    color: theme.textWhite,
    height: '100vh', // Using viewport height for demo
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  // Header Styles
  header: {
    height: '50px',
    backgroundColor: theme.bgHeader,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    borderBottom: `1px solid ${theme.borderColor}`,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 500,
  },
  headerTitle: {
    color: theme.textWhite,
    fontSize: '14px',
  },
  headerRight: {
    display: 'flex',
    gap: '16px',
    color: theme.textGray,
  },
  iconButton: {
    cursor: 'pointer',
  },
  // Layout Styles
  contentArea: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  // Sidebar Styles
  sidebar: {
    width: '240px',
    backgroundColor: theme.bgDark,
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  sidebarItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px 8px 24px',
    cursor: 'pointer',
    color: theme.textGray,
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  sidebarItemActive: {
    backgroundColor: theme.hoverBg,
    color: theme.textWhite,
  },
  sidebarIcon: {
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '20px',
  },
  sidebarDivider: {
    height: '1px',
    backgroundColor: theme.borderColor,
    margin: '8px 16px',
  },
  // Main Grid View Styles
  mainView: {
    flex: 1,
    backgroundColor: theme.bgLight,
    padding: '20px',
    overflowY: 'auto',
    display: 'grid',
    // Responsive grid: minimum 100px wide columns
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gridAutoRows: 'min-content',
    gap: '16px',
    alignContent: 'start',
  },
  gridItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '8px',
    cursor: 'pointer',
    borderRadius: '4px',
    // Note: Hover effect would usually be done in real CSS with :hover
    // backgroundColor: 'transparent',
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: '8px',
    width: '64px',
    height: '64px',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.bgLight, // Match background to create cutout effect
    borderRadius: '50%',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    color: theme.textGray,
    fontSize: '12px',
  },
  gridItemLabel: {
    fontSize: '13px',
    textAlign: 'center',
    wordBreak: 'break-word',
    color: theme.textWhite,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
};

export default FileExplorer;