import React from 'react';
import { 
  HardDrive, FileType, Search, 
  FolderGit2, Terminal, Activity, Monitor, Settings, LogOut, Users,
  Menu, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({
  activeTab,
  setActiveTab,
  vitals,
  user,
  onLogout,
  onOpenSettings,
  onOpenUsers,
  isMobileOpen = false,
  onCloseMobile = () => {},
  isCollapsed = false,
  onToggleCollapse = () => {}
}) {
  const navItems = [
    { id: 'filesystem', label: 'Filesystem', code: '01', icon: HardDrive },
    { id: 'formats', label: 'Format Hub', code: '02', icon: FileType },
    { id: 'finder', label: 'AI Search', code: '03', icon: Search },
    { id: 'repos', label: 'hAIro Repos', code: '04', icon: FolderGit2 },
    { id: 'terminal', label: 'Terminal', code: '05', icon: Terminal },
    { id: 'desktop', label: 'Remote Desktop', code: '06', icon: Monitor },
    { id: 'telemetry', label: 'Telemetry & C2', code: '07', icon: Activity },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  return (
    <aside
      className={`
        bg-[#fafafa] border-r border-[#e5e7eb] flex flex-col justify-between select-none font-sans transition-all duration-300
        ${/* Mobile behavior: slide-over drawer */ ''}
        fixed inset-y-0 left-0 z-40 w-64 shadow-2xl
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        ${/* Desktop behavior: static in document flow */ ''}
        md:static md:translate-x-0 md:z-20 md:shadow-none
        ${isCollapsed ? 'md:w-16' : 'md:w-56'}
      `}
    >
      {/* Swiss Brand Header */}
      <div>
        <div className="p-3.5 sm:p-4 border-b border-[#e5e7eb] bg-[#ffffff] flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <img 
              src="/logo.png" 
              alt="NEhAIro.FS" 
              className="w-6 h-6 object-contain shrink-0" 
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm tracking-tight text-black font-mono leading-none truncate">
                  NEhAIro.FS
                </span>
                <span className="text-[10px] text-[#64748b] font-mono tracking-wider uppercase mt-0.5 truncate">
                  Workstation
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="p-1 hover:bg-[#f1f5f9] text-[#64748b] hover:text-black rounded md:hidden"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Minimize / Expand Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1 hover:bg-[#f1f5f9] text-[#64748b] hover:text-black rounded transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Minimize Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="p-2 space-y-1 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: isCollapsed ? 0 : 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 text-xs font-medium transition-all rounded-sm ${
                  isActive
                    ? 'bg-[#ffffff] text-black border-l-2 border-black shadow-xs font-semibold'
                    : 'text-[#4b5563] hover:text-black hover:bg-[#f3f4f6] border-l-2 border-transparent'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'space-x-0' : 'space-x-2.5'} min-w-0`}>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-[#6b7280]'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && (
                  <span className="text-[10px] font-mono text-[#9ca3af] shrink-0">
                    {item.code}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Swiss Telemetry Metric Footer */}
      <div className="p-3 border-t border-[#e5e7eb] space-y-3 bg-[#ffffff]">
        {!isCollapsed && vitals && vitals.cpu && (
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-2.5 space-y-2 text-[11px] font-mono">
            <div>
              <div className="flex items-center justify-between text-[#64748b] mb-1">
                <span>CPU</span>
                <span className="text-black font-bold">{vitals.cpu.load}%</span>
              </div>
              <div className="w-full bg-[#e2e8f0] h-1 overflow-hidden">
                <div
                  style={{ width: `${Math.min(vitals.cpu.load, 100)}%` }}
                  className="bg-black h-full"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[#64748b] mb-1">
                <span>RAM</span>
                <span className="text-black font-bold">{vitals.memory?.percent || 0}%</span>
              </div>
              <div className="w-full bg-[#e2e8f0] h-1 overflow-hidden">
                <div
                  style={{ width: `${Math.min(vitals.memory?.percent || 0, 100)}%` }}
                  className="bg-black h-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* User Card */}
        <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-2' : 'justify-between'} pt-1`}>
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-6 h-6 bg-black text-white flex items-center justify-center font-bold text-[10px] font-mono shrink-0">
              {user?.username?.slice(0, 2).toUpperCase() || 'OP'}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-black leading-none truncate">
                  {user?.username || 'Operator'}
                </span>
                <span className="text-[10px] text-[#16a34a] font-mono font-bold flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] inline-block mr-0.5" />
                  ONLINE
                </span>
              </div>
            )}
          </div>

          <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-1' : 'space-x-1'}`}>
            <button
              onClick={() => { onOpenUsers(); onCloseMobile(); }}
              title="User Management & Permissions"
              className="p-1.5 hover:bg-[#e5e7eb] text-[#6b7280] hover:text-black transition-colors rounded"
            >
              <Users className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { onOpenSettings(); onCloseMobile(); }}
              title="Settings"
              className="p-1.5 hover:bg-[#e5e7eb] text-[#6b7280] hover:text-black transition-colors rounded"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 hover:bg-[#e5e7eb] text-[#6b7280] hover:text-black transition-colors rounded"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
