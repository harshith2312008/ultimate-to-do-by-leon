import React from 'react';
import { Zap, Moon, Sun, LogOut, User } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { useAuthStore } from '../store/authStore';

const TitleBar: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const { user, logout } = useAuthStore();

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <div className="h-12 bg-card border-b border-border flex items-center justify-between px-6 select-none">
      <div className="flex items-center gap-3">
        <Zap className="w-5 h-5 text-primary" />
        <span className="text-lg font-bold">Ultimate Todo</span>
      </div>
      
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
            <User className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{user.name}</span>
          </div>
        )}
        
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center hover:bg-accent rounded-lg transition-colors"
          title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {user && (
          <button
            onClick={logout}
            className="w-9 h-9 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TitleBar;
