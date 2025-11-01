import React, { useState } from 'react';
import { X, Moon, Sun, Palette, Bell, Keyboard, Globe } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { cn } from '../lib/utils';

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { settings, updateSettings, updatePomodoroSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'appearance' | 'notifications' | 'pomodoro' | 'shortcuts'>('appearance');

  const tabs = [
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'pomodoro' as const, label: 'Pomodoro', icon: Globe },
    { id: 'shortcuts' as const, label: 'Shortcuts', icon: Keyboard },
  ];

  const accentColors = [
    { name: 'Blue', value: '#3b82f6', hsl: '217 91% 60%' },
    { name: 'Purple', value: '#a855f7', hsl: '271 91% 65%' },
    { name: 'Pink', value: '#ec4899', hsl: '330 81% 60%' },
    { name: 'Green', value: '#10b981', hsl: '160 84% 39%' },
    { name: 'Orange', value: '#f97316', hsl: '25 95% 53%' },
    { name: 'Red', value: '#ef4444', hsl: '0 84% 60%' },
  ];

  const handleColorChange = (color: typeof accentColors[0]) => {
    updateSettings({ accentColor: color.value });
    // Apply the color to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary', color.hsl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-border p-4 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Theme</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateSettings({ theme: 'light' })}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors',
                        settings.theme === 'light' ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent'
                      )}
                    >
                      <Sun className="w-5 h-5" />
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => updateSettings({ theme: 'dark' })}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors',
                        settings.theme === 'dark' ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent'
                      )}
                    >
                      <Moon className="w-5 h-5" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Accent Color</h3>
                  <div className="grid grid-cols-6 gap-3">
                    {accentColors.map(color => (
                      <button
                        key={color.value}
                        onClick={() => handleColorChange(color)}
                        className={cn(
                          'aspect-square rounded-lg border-2 transition-all hover:scale-110',
                          settings.accentColor === color.value ? 'border-white ring-2 ring-offset-2 ring-primary' : 'border-transparent'
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Font Size</h3>
                  <div className="flex gap-3">
                    {(['small', 'medium', 'large'] as const).map(size => (
                      <button
                        key={size}
                        onClick={() => updateSettings({ fontSize: size })}
                        className={cn(
                          'flex-1 p-3 rounded-lg border-2 transition-colors capitalize',
                          settings.fontSize === size ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Default View</h3>
                  <select
                    value={settings.defaultView}
                    onChange={(e) => updateSettings({ defaultView: e.target.value as any })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="list">List</option>
                    <option value="kanban">Kanban</option>
                    <option value="calendar">Calendar</option>
                    <option value="timeline">Timeline</option>
                    <option value="matrix">Matrix</option>
                    <option value="gantt">Gantt</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Enable Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive notifications for tasks and reminders</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.enabled}
                      onChange={(e) => updateSettings({
                        notifications: { ...settings.notifications, enabled: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Desktop Notifications</h3>
                    <p className="text-sm text-muted-foreground">Show desktop notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.showDesktopNotifications}
                      onChange={(e) => updateSettings({
                        notifications: { ...settings.notifications, showDesktopNotifications: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Sound</h3>
                    <p className="text-sm text-muted-foreground">Play sound for notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.soundEnabled}
                      onChange={(e) => updateSettings({
                        notifications: { ...settings.notifications, soundEnabled: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Reminder Time</h3>
                  <p className="text-sm text-muted-foreground mb-4">Minutes before due date</p>
                  <input
                    type="number"
                    value={settings.notifications.reminderTime}
                    onChange={(e) => updateSettings({
                      notifications: { ...settings.notifications, reminderTime: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                    max="1440"
                  />
                </div>
              </div>
            )}

            {activeTab === 'pomodoro' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Work Duration (minutes)</h3>
                  <input
                    type="number"
                    value={settings.pomodoroSettings.workDuration}
                    onChange={(e) => updatePomodoroSettings({ workDuration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    max="120"
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Short Break Duration (minutes)</h3>
                  <input
                    type="number"
                    value={settings.pomodoroSettings.shortBreakDuration}
                    onChange={(e) => updatePomodoroSettings({ shortBreakDuration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    max="30"
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Long Break Duration (minutes)</h3>
                  <input
                    type="number"
                    value={settings.pomodoroSettings.longBreakDuration}
                    onChange={(e) => updatePomodoroSettings({ longBreakDuration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    max="60"
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Sessions Until Long Break</h3>
                  <input
                    type="number"
                    value={settings.pomodoroSettings.sessionsUntilLongBreak}
                    onChange={(e) => updatePomodoroSettings({ sessionsUntilLongBreak: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    max="10"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Auto-start Breaks</h3>
                    <p className="text-sm text-muted-foreground">Automatically start break timers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pomodoroSettings.autoStartBreaks}
                      onChange={(e) => updatePomodoroSettings({ autoStartBreaks: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Auto-start Pomodoros</h3>
                    <p className="text-sm text-muted-foreground">Automatically start work timers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pomodoroSettings.autoStartPomodoros}
                      onChange={(e) => updatePomodoroSettings({ autoStartPomodoros: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">New Task</h3>
                    <div className="px-4 py-2 bg-muted rounded-lg text-sm font-mono">
                      {settings.shortcuts.newTask}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Search</h3>
                    <div className="px-4 py-2 bg-muted rounded-lg text-sm font-mono">
                      {settings.shortcuts.search}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Toggle Sidebar</h3>
                    <div className="px-4 py-2 bg-muted rounded-lg text-sm font-mono">
                      {settings.shortcuts.toggleSidebar}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Quick Add</h3>
                    <div className="px-4 py-2 bg-muted rounded-lg text-sm font-mono">
                      {settings.shortcuts.quickAdd}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Keyboard shortcuts help you navigate and use the app more efficiently.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
