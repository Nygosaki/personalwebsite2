"use client";
import React from 'react';
// Import necessary icons from react-icons
import { MdApps, MdSettings } from 'react-icons/md';
import {
  FaCompass,
  FaFirefox,
  FaFolder,
  FaShoppingBag,
  FaRegBell,
  FaBatteryThreeQuarters,
  FaVolumeUp,
  FaBluetoothB,
  FaWifi,
} from 'react-icons/fa';
import { FcMusic } from "react-icons/fc";
import { VscTerminalPowershell } from 'react-icons/vsc';
import Firefox from '@/components/apps/firefox';
import Terminal from '@/components/apps/terminal';
import MusicPlayer from '@/components/apps/musicplayer';

interface QuickLaunchIconProps {
  icon: React.ReactNode;
  isActive?: number; // 0 = inactive, 1 = minimized, 2 = active
  id?: string;
  onClick?: (id: string) => void; // receives the app id
}

const QuickLaunchIcon = ({ icon, isActive = 0, id, onClick }: QuickLaunchIconProps) => (
  <button
    id={id}
    onClick={() => id && onClick?.(id)}
    className={`relative flex items-center justify-center w-10 h-full hover:bg-white/10 rounded transition-colors duration-200 focus:outline-none ${isActive === 2 ? 'bg-white/10' : ''}`}
  >
    {icon}
    {/* Blue underline for active app */}
      {isActive === 1 && (<div className="absolute bottom-0 w-1/2 h-0.5 bg-blue-400"></div>)}
      {isActive === 2 && (<div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>)}
  </button>
);

type TaskbarProps = {
  onLaunch?: (appId: string, payload?: React.ReactNode) => void;
  openWindows?: Array<{ appId: string; minimized: boolean }>;
};

const Taskbar = ({ onLaunch, openWindows = [] }: TaskbarProps) => {
  const getIsActive = (appId: string): number => {
    const matches = openWindows.filter((w) => w.appId === appId);
    if (matches.length === 0) return 0;
    return matches.some((w) => !w.minimized) ? 2 : 1;
  };

  const formatTime24 = (d: Date) => {
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const formatDateShort = (d: Date) =>
    d.toLocaleDateString('en-UK', { day: 'numeric', month: 'numeric', year: '2-digit' });

  // State for current time/date (initialized from current Date)
  const [time, setTime] = React.useState<string>(() => formatTime24(new Date()));
  const [date, setDate] = React.useState<string>(() => formatDateShort(new Date()));

  React.useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setTime(formatTime24(now));
      setDate(formatDateShort(now));
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return (
    // Main Taskbar Container
    <div className="fixed bottom-0 left-0 w-full h-12 bg-[#2d2d2d] text-gray-300 flex items-center justify-between px-2 font-sans text-sm select-none shadow-md z-50 border-t border-gray-800">
      
      {/* --- Left Section: Menus and Quick Launch --- */}
      <div className="flex items-center h-full">
        {/* "Applications" & "Places" Menus */}
        <TopMenuButton icon={<MdApps size={22} className="text-gray-400" />} text="Applications" />
        <TopMenuButton icon={<FaCompass size={18} className="text-gray-400" />} text="Places" />

        {/* Vertical Separator */}
        <div className="h-6 w-px bg-gray-700 mx-2"></div>

        {/* Quick Launch Icons */}
        <div className="flex items-center space-x-1 h-full">
          <QuickLaunchIcon id="terminal" icon={<VscTerminalPowershell size={20} />} onClick={(id)=>onLaunch?.(id, <Terminal />)} isActive={getIsActive("terminal")} />
          <QuickLaunchIcon id="folder" icon={<FaFolder size={18} className="text-blue-500" />} onClick={(id)=>onLaunch?.(id)} isActive={getIsActive("folder")} />
          <QuickLaunchIcon id="musicplayer" icon={<FcMusic size={24} />} onClick={(id)=>onLaunch?.(id, <MusicPlayer />)} isActive={getIsActive("musicplayer")} />
          <QuickLaunchIcon id="firefox" icon={<FaFirefox size={18} className="text-orange-500" />} onClick={(id)=>onLaunch?.(id, <Firefox />)} isActive={getIsActive("firefox")} />
        </div>
      </div>

      {/* --- Middle Section (Spacer) --- */}
      <div className="grow"></div>

      {/* --- Right Section: System Tray & Clock --- */}
      <div className="flex items-center space-x-4 h-full">

        {/* System Tray Icons */}
        <div className="flex items-center space-x-2 text-gray-400">
          <TrayIcon icon={<FaRegBell size={16} />} />
          <TrayIcon icon={<FaBatteryThreeQuarters size={16} />} />
          <TrayIcon icon={<FaVolumeUp size={16} />} />
          <TrayIcon icon={<FaBluetoothB size={14} />} />
          <TrayIcon icon={<FaWifi size={16} />} />
        </div>

        {/* Clock and Date */}
        <div className="flex flex-col justify-center text-xs text-right leading-tight mr-1">
          <span className="font-medium text-gray-200">{time}</span>
          <span className="text-gray-500">{date}</span>
        </div>

      </div>
    </div>
  );
};

// --- Helper Components for cleaner code ---

// For "Applications" and "Places"
const TopMenuButton = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <button className="flex items-center space-x-2 px-3 h-full hover:bg-white/10 rounded transition-colors duration-200 focus:outline-none">
    {icon}
    <span className="font-medium">{text}</span>
  </button>
);

// For system tray icons (bell, battery, etc.)
const TrayIcon = ({ icon }: { icon: React.ReactNode }) => (
  <div className="p-1.5 hover:bg-white/10 rounded-full cursor-pointer transition-colors duration-200">
    {icon}
  </div>
);

export default Taskbar;