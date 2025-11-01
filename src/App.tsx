import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import TaskDetails from './components/TaskDetails';
import QuickAdd from './components/QuickAdd';
import CommandPalette from './components/CommandPalette';
import PomodoroTimer from './components/PomodoroTimer';
import Login from './components/Login';
import { useTaskStore } from './store/taskStore';
import { useSettingsStore } from './store/settingsStore';
import { usePomodoroStore } from './store/pomodoroStore';
import { useAuthStore } from './store/authStore';

function App() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  // Collapse sidebar by default on mobile (screen width < 768px)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);
  const { selectedTask } = useTaskStore();
  const { settings } = useSettingsStore();
  const { tick } = usePomodoroStore();
  const { isAuthenticated } = useAuthStore();

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.fontSize = fontSizes[settings.fontSize];
  }, [settings.fontSize]);

  // Apply accent color on mount
  useEffect(() => {
    // Color changes are handled in Settings component
  }, [settings.accentColor]);

  // Pomodoro timer
  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      
      // Quick Add
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowQuickAdd(true);
      }
      
      // Toggle Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
      
      // Close dialogs
      if (e.key === 'Escape') {
        setShowQuickAdd(false);
        setShowCommandPalette(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for IPC events
  useEffect(() => {
    const { ipcRenderer } = window as any;
    if (ipcRenderer) {
      ipcRenderer.on('quick-add', () => setShowQuickAdd(true));
      ipcRenderer.on('quick-search', () => setShowCommandPalette(true));
    }
  }, []);

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            className: 'glass',
          }}
        />
        <Login />
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          className: 'glass',
        }}
      />
      
      <TitleBar />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <MainContent sidebarCollapsed={sidebarCollapsed} />
        
        {selectedTask && <TaskDetails />}
      </div>
      
      <PomodoroTimer />
      
      {showQuickAdd && <QuickAdd onClose={() => setShowQuickAdd(false)} />}
      
      {showCommandPalette && <CommandPalette onClose={() => setShowCommandPalette(false)} />}
    </div>
  );
}

export default App;
