import React, { useState, useEffect } from 'react';
import { Menu, Settings, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import FileSystemExplorer from './components/FileSystemExplorer';
import FormatHub from './components/FormatHub';
import AiFileFinder from './components/AiFileFinder';
import RepoManagerConsole from './components/RepoManagerConsole';
import TerminalPanel from './components/TerminalPanel';
import RemoteDesktop from './components/RemoteDesktop';
import NodeTelemetry from './components/NodeTelemetry';
import FileViewerModal from './components/FileViewerModal';
import SettingsModal from './components/SettingsModal';
import LoginModal from './components/LoginModal';
import UserManagementModal from './components/UserManagementModal';
import IntroAnimation from './components/IntroAnimation';
import { api, WS_BASE } from './services/api';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState('filesystem');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nehairo_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Global State
  const [vitals, setVitals] = useState(null);
  const [repos, setRepos] = useState([]);
  const [activeRepo, setActiveRepo] = useState(null);

  // Terminal Logs
  const [shellLogs, setShellLogs] = useState('');

  // Modals
  const [viewerFile, setViewerFile] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);

  // WebSocket Ref
  const wsRef = React.useRef(null);

  const tabLabels = {
    filesystem: { name: 'Filesystem', code: '01' },
    formats: { name: 'Format Hub', code: '02' },
    finder: { name: 'AI Search', code: '03' },
    repos: { name: 'hAIro Repos', code: '04' },
    terminal: { name: 'Terminal', code: '05' },
    desktop: { name: 'Remote Desktop', code: '06' },
    telemetry: { name: 'Telemetry & C2', code: '07' },
  };

  useEffect(() => {
    loadInitialData();
    connectWebSocket();

    const interval = setInterval(() => {
      loadVitals();
    }, 10000);

    return () => {
      clearInterval(interval);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const loadInitialData = async () => {
    loadVitals();
    loadRepos();
  };

  const loadVitals = async () => {
    try {
      const res = await api.getVitals();
      setVitals(res.data);
    } catch (e) {}
  };

  const loadRepos = async () => {
    try {
      const res = await api.getRepos();
      const list = res.data || [];
      setRepos(list);
      const active = list.find(r => r.isActive) || list[0] || null;
      setActiveRepo(active);
    } catch (e) {}
  };

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(WS_BASE);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'TERMINAL_OUTPUT') {
            setShellLogs(prev => prev + data.text);
          } else if (data.type === 'REPOS_UPDATED') {
            setRepos(data.repos || []);
          } else if (data.type === 'ACTIVE_REPO_CHANGED') {
            loadRepos();
          } else if (data.type === 'TASK_COMPLETED' || data.type === 'TASK_UPDATED') {
            loadRepos();
          }
        } catch (e) {}
      };

      ws.onclose = () => {
        setTimeout(connectWebSocket, 3000);
      };
    } catch (e) {}
  };

  const handleSelectRepo = async (repoId) => {
    try {
      const res = await api.selectRepo(repoId);
      setActiveRepo(res.data);
      loadRepos();
    } catch (e) {
      alert(`Error selecting repo: ${e.message}`);
    }
  };

  const handleSendShellInput = (command) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'SHELL_INPUT',
        repoId: activeRepo?.id,
        command,
        cwd: activeRepo?.localPath || 'C:\\'
      }));
    }
  };

  const handleOpenFile = (filePath, fileName) => {
    setViewerFile({ path: filePath, name: fileName });
  };

  const handleLogout = () => {
    localStorage.removeItem('nehairo_token');
    localStorage.removeItem('nehairo_user');
    setUser(null);
  };

  // 1. Google-Style Intro Animation
  if (showIntro) {
    return <IntroAnimation onComplete={() => setShowIntro(false)} />;
  }

  // 2. Authentication Modal
  if (!user) {
    return <LoginModal onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="flex h-screen w-screen bg-[#ffffff] text-[#09090b] overflow-hidden select-none font-sans relative">
      {/* Mobile Drawer Backdrop Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Swiss Responsive Navigation Sidebar (Drawer on mobile, collapsible on desktop) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        vitals={vitals}
        user={user}
        onLogout={handleLogout}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenUsers={() => setUsersOpen(true)}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#ffffff]">
        {/* Mobile Top Header (Visible on phones / screens < md) */}
        <header className="flex md:hidden items-center justify-between px-3 py-2 bg-white border-b border-[#e2e8f0] shrink-0 z-10 font-mono">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 -ml-1 text-black hover:bg-[#f1f5f9] rounded transition-colors"
              title="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-1.5">
              <img src="/logo.png" alt="NEhAIro.FS" className="w-5 h-5 object-contain" />
              <span className="font-extrabold text-xs text-black">
                NEhAIro.FS
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] px-2 py-0.5 bg-[#f1f5f9] border border-[#cbd5e1] text-black font-bold">
              {tabLabels[activeTab]?.code || '01'} {tabLabels[activeTab]?.name || ''}
            </span>
            <button
              onClick={() => setUsersOpen(true)}
              className="p-1 text-[#64748b] hover:text-black rounded"
              title="Users & Permissions"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1 text-[#64748b] hover:text-black rounded"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Tab Viewport */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#ffffff]">
          {activeTab === 'filesystem' && (
            <FileSystemExplorer
              onOpenFile={handleOpenFile}
              onRefreshVitals={loadVitals}
            />
          )}

          {activeTab === 'formats' && (
            <FormatHub
              onOpenFile={handleOpenFile}
              currentPath="C:\\Users\\Lenovo\\OneDrive\\Documents"
            />
          )}

          {activeTab === 'finder' && (
            <AiFileFinder onOpenFile={handleOpenFile} />
          )}

          {activeTab === 'repos' && (
            <RepoManagerConsole
              activeRepo={activeRepo}
              repos={repos}
              onSelectRepo={handleSelectRepo}
              onRefreshRepos={loadRepos}
              onOpenFile={handleOpenFile}
            />
          )}

          {activeTab === 'terminal' && (
            <TerminalPanel
              shellLogs={shellLogs}
              onSendShellInput={handleSendShellInput}
              onClearShellLogs={() => setShellLogs('')}
              currentCwd={activeRepo?.localPath || 'C:\\'}
            />
          )}

          {activeTab === 'desktop' && (
            <RemoteDesktop />
          )}

          {activeTab === 'telemetry' && (
            <NodeTelemetry
              vitals={vitals}
              onRefreshVitals={loadVitals}
            />
          )}
        </main>
      </div>

      {/* File Viewer Modal */}
      {viewerFile && (
        <FileViewerModal
          isOpen={!!viewerFile}
          filePath={viewerFile.path}
          fileName={viewerFile.name}
          onClose={() => setViewerFile(null)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={usersOpen}
        onClose={() => setUsersOpen(false)}
        currentUser={user}
      />
    </div>
  );
}
