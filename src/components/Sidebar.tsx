import React, { useState } from 'react';
import {
  Home,
  Calendar,
  FolderKanban,
  Target,
  Clock,
  TrendingUp,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Star,
  CheckCircle2,
  AlertCircle,
  Plus,
  Info,
} from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { cn } from '../lib/utils';
import SettingsModal from './Settings';
import DeveloperInfo from './DeveloperInfo';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showDeveloperInfo, setShowDeveloperInfo] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState<string>('Inbox');
  const { tasks, projects, setFilter, clearFilter, viewMode, setViewMode, setSearchQuery } = useTaskStore();
  
  const todayCount = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const today = new Date();
    const due = new Date(t.dueDate);
    return (
      today.getDate() === due.getDate() &&
      today.getMonth() === due.getMonth() &&
      today.getFullYear() === due.getFullYear()
    );
  }).length;
  
  const overdueCount = tasks.filter((t) => {
    if (!t.dueDate || t.status === 'completed') return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  const handleTodayFilter = () => {
    setActiveMenuItem('Today');
    clearFilter();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFilter({ 
      dateRange: { 
        start: new Date(today.setHours(0, 0, 0, 0)), 
        end: new Date(tomorrow.setHours(0, 0, 0, 0))
      },
      status: ['todo', 'in-progress']
    });
  };

  const handleUpcomingFilter = () => {
    setActiveMenuItem('Upcoming');
    clearFilter();
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setFilter({ 
      hasDueDate: true,
      status: ['todo', 'in-progress']
    });
  };

  const handleInboxFilter = () => {
    setActiveMenuItem('Inbox');
    clearFilter();
    setSearchQuery('');
  };

  const handleOverdueFilter = () => {
    setActiveMenuItem('Overdue');
    clearFilter();
    setFilter({ isOverdue: true });
  };

  const handleCompletedFilter = () => {
    setActiveMenuItem('Completed');
    clearFilter();
    setFilter({ status: ['completed'] });
  };

  const menuItems = [
    { 
      icon: Inbox, 
      label: 'Inbox', 
      count: tasks.filter((t) => t.status !== 'completed').length, 
      action: handleInboxFilter 
    },
    { 
      icon: Star, 
      label: 'Today', 
      count: todayCount, 
      action: handleTodayFilter 
    },
    { 
      icon: Calendar, 
      label: 'Upcoming', 
      count: tasks.filter((t) => t.dueDate && t.status !== 'completed').length, 
      action: handleUpcomingFilter 
    },
    { 
      icon: AlertCircle, 
      label: 'Overdue', 
      count: overdueCount, 
      action: handleOverdueFilter 
    },
    { 
      icon: CheckCircle2, 
      label: 'Completed', 
      count: tasks.filter((t) => t.status === 'completed').length, 
      action: handleCompletedFilter 
    },
  ];

  const viewOptions = [
    { icon: Home, label: 'List', value: 'list' as const },
    { icon: FolderKanban, label: 'Kanban', value: 'kanban' as const },
    { icon: Calendar, label: 'Calendar', value: 'calendar' as const },
    { icon: Clock, label: 'Timeline', value: 'timeline' as const },
    { icon: Target, label: 'Matrix', value: 'matrix' as const },
    { icon: TrendingUp, label: 'Gantt', value: 'gantt' as const },
  ];

  return (
    <div
      className={cn(
        'bg-card border-r border-border flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && <h2 className="font-semibold text-lg">Workspace</h2>}
        <button
          onClick={onToggle}
          className="p-1 hover:bg-accent rounded transition-colors"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {/* Quick Actions */}
        <div className="mb-6">
          {!collapsed && <p className="text-xs text-muted-foreground px-2 mb-2">QUICK ACCESS</p>}
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group',
                  activeMenuItem === item.label 
                    ? 'bg-accent text-accent-foreground' 
                    : 'hover:bg-accent'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.count > 0 && (
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        activeMenuItem === item.label
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/20 text-primary'
                      )}>
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Views */}
        <div className="mb-6">
          {!collapsed && <p className="text-xs text-muted-foreground px-2 mb-2">VIEWS</p>}
          <div className="space-y-1">
            {viewOptions.map((view) => (
              <button
                key={view.value}
                onClick={() => setViewMode(view.value)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  viewMode === view.value ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                )}
                title={collapsed ? view.label : undefined}
              >
                <view.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{view.label}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="mb-6">
          {!collapsed && (
            <div className="flex items-center justify-between px-2 mb-2">
              <p className="text-xs text-muted-foreground">PROJECTS</p>
              <button className="p-1 hover:bg-accent rounded" title="New Project">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="space-y-1">
            {projects.slice(0, 5).map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  setActiveMenuItem('');
                  clearFilter();
                  setFilter({ projects: [project.id] });
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                title={collapsed ? project.name : undefined}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                {!collapsed && <span className="truncate">{project.name}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-border space-y-1">
        <button
          onClick={() => setShowDeveloperInfo(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 transition-all group"
          title={collapsed ? 'Developer Info' : undefined}
        >
          <Info className="w-5 h-5 flex-shrink-0 text-purple-500" />
          {!collapsed && <span className="flex items-center gap-2">
            Developer Info
            <span className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-0.5 rounded-full">
              New
            </span>
          </span>}
        </button>
        
        <button
          onClick={() => setShowSettings(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
          title={collapsed ? 'Settings' : undefined}
        >
          <SettingsIcon className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      
      {/* Developer Info Modal */}
      {showDeveloperInfo && <DeveloperInfo onClose={() => setShowDeveloperInfo(false)} />}
    </div>
  );
};

export default Sidebar;
