import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, Settings, Zap, FileText, BarChart } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { fuzzySearch } from '../lib/utils';

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose }) => {
  const { tasks, setSelectedTask } = useTaskStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = [
    {
      id: 'new-task',
      label: 'Create New Task',
      icon: <Plus className="w-4 h-4" />,
      action: () => console.log('New task'),
      category: 'Actions',
    },
    {
      id: 'today',
      label: 'View Today Tasks',
      icon: <Calendar className="w-4 h-4" />,
      action: () => console.log('Today'),
      category: 'Views',
    },
    {
      id: 'analytics',
      label: 'View Analytics',
      icon: <BarChart className="w-4 h-4" />,
      action: () => console.log('Analytics'),
      category: 'Views',
    },
    {
      id: 'settings',
      label: 'Open Settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => console.log('Settings'),
      category: 'Actions',
    },
  ];

  const taskCommands: Command[] = tasks
    .filter((task) => fuzzySearch(query, task.title))
    .slice(0, 10)
    .map((task) => ({
      id: task.id,
      label: task.title,
      icon: <FileText className="w-4 h-4" />,
      action: () => {
        setSelectedTask(task);
        onClose();
      },
      category: 'Tasks',
    }));

  const allCommands = query
    ? [...taskCommands, ...commands.filter((cmd) => fuzzySearch(query, cmd.label))]
    : commands;

  const groupedCommands = allCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, allCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allCommands[selectedIndex]) {
          allCommands[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, allCommands, onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-32 z-50 animate-fade-in">
      <div className="w-full max-w-2xl bg-card rounded-lg shadow-2xl border border-border animate-slide-in overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search tasks or commands..."
            className="flex-1 bg-transparent focus:outline-none text-lg"
            autoFocus
          />
          <kbd className="px-2 py-1 bg-secondary rounded text-xs">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <div key={category}>
              <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-secondary">
                {category}
              </div>
              {cmds.map((cmd, index) => {
                const globalIndex = allCommands.indexOf(cmd);
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                      globalIndex === selectedIndex
                        ? 'bg-primary/10 border-l-2 border-l-primary'
                        : 'hover:bg-accent'
                    }`}
                  >
                    {cmd.icon}
                    <span className="flex-1 text-left">{cmd.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
          {allCommands.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No results found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-secondary/50 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background rounded">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background rounded">↵</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background rounded">ESC</kbd>
            <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
