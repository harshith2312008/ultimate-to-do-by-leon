import React, { useState, useRef } from 'react';
import { Plus, Search, Filter, MoreVertical, Download, Upload, Sparkles, FileText } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import ListView from './views/ListView';
import KanbanView from './views/KanbanView';
import CalendarView from './views/CalendarView';
import TimelineView from './views/TimelineView';
import MatrixView from './views/MatrixView';
import GanttView from './views/GanttView';
import HabitTracker from './HabitTracker';
import { cn } from '../lib/utils';
import { exportToJSON, importFromJSON } from '../lib/utils';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MainContentProps {
  sidebarCollapsed: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ sidebarCollapsed }) => {
  const { viewMode, searchQuery, setSearchQuery, addTask, tasks } = useTaskStore();
  const [showFilters, setShowFilters] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQuickAdd = () => {
    const now = new Date();
    const newTask = {
      id: crypto.randomUUID(),
      title: 'New Task',
      description: '',
      status: 'todo' as const,
      priority: 'none' as const,
      tags: [],
      subtasks: [],
      attachments: [],
      comments: [],
      timeEntries: [],
      repeatType: 'none' as const,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      dueDate: undefined,
      startDate: undefined,
      completedAt: undefined,
      projectId: undefined,
    };
    addTask(newTask as any);
    toast.success('New task created!');
  };

  const handleExportJSON = () => {
    const data = { tasks, exportDate: new Date() };
    exportToJSON(data, `tasks-backup-${new Date().toISOString().split('T')[0]}.json`);
    toast.success('Tasks exported as JSON!');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Task Report', 105, 15, { align: 'center' });
    
    // Date and Summary
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${date}`, 105, 22, { align: 'center' });
    doc.text(`Total Tasks: ${tasks.length}`, 105, 28, { align: 'center' });
    
    // Statistics
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;
    
    doc.text(`Completed: ${completed} | In Progress: ${inProgress} | To Do: ${todo} | Overdue: ${overdue}`, 105, 34, { align: 'center' });
    
    // Tasks Table
    const tableData = tasks.map(task => [
      task.title,
      task.status.replace('-', ' ').toUpperCase(),
      task.priority.toUpperCase(),
      task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date',
      task.description?.substring(0, 40) + (task.description && task.description.length > 40 ? '...' : '') || 'No description',
    ]);
    
    autoTable(doc, {
      startY: 40,
      head: [['Task', 'Status', 'Priority', 'Due Date', 'Description']],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 40 },
    });
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      doc.text('Ultimate Todo - Made with ❤️ by Karnam Harshith', 105, 285, { align: 'center' });
    }
    
    doc.save(`tasks-report-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Tasks exported as PDF!');
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromJSON(file);
      if (data.tasks && Array.isArray(data.tasks)) {
        // Import tasks
        data.tasks.forEach((task: any) => addTask(task));
        toast.success(`Imported ${data.tasks.length} tasks!`);
      } else {
        toast.error('Invalid file format');
      }
    } catch (error) {
      toast.error('Failed to import tasks');
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderView = () => {
    switch (viewMode) {
      case 'list':
        return <ListView />;
      case 'kanban':
        return <KanbanView />;
      case 'calendar':
        return <CalendarView />;
      case 'timeline':
        return <TimelineView />;
      case 'matrix':
        return <MatrixView />;
      case 'gantt':
        return <GanttView />;
      case 'habits' as any:
        return <HabitTracker />;
      default:
        return <ListView />;
    }
  };

  return (
    <div className={cn('flex-1 flex flex-col bg-background overflow-hidden')}>
      {/* Toolbar */}
      <div className="h-16 border-b border-border px-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            showFilters ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          )}
          title="Filters"
        >
          <Filter className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setShowAIMenu(!showAIMenu)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          title="AI Assistant"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">AI</span>
        </button>

        <button
          onClick={handleQuickAdd}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          title="New Task (Ctrl+N)"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Task</span>
        </button>
        
        <div className="relative group">
          <button className="p-2 hover:bg-accent rounded-lg transition-colors" title="More options">
            <MoreVertical className="w-5 h-5" />
          </button>
          <div className="absolute right-0 top-full mt-2 w-56 glass rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-1">
            <button 
              onClick={handleExportPDF}
              className="w-full px-4 py-2 text-left hover:bg-accent flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Export as PDF</span>
            </button>
            <button 
              onClick={handleExportJSON}
              className="w-full px-4 py-2 text-left hover:bg-accent flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>Export as JSON</span>
            </button>
            <div className="h-px bg-border my-1"></div>
            <button 
              onClick={handleImport}
              className="w-full px-4 py-2 text-left hover:bg-accent flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Import Tasks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* AI Assistant Menu */}
      {showAIMenu && (
        <div className="absolute top-20 right-6 w-80 glass rounded-lg shadow-xl p-4 z-50 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI Assistant
            </h3>
            <button onClick={() => setShowAIMenu(false)} className="text-muted-foreground hover:text-foreground">
              ×
            </button>
          </div>
          <div className="space-y-2">
            <button className="w-full px-4 py-3 bg-secondary hover:bg-accent rounded-lg text-left transition-colors">
              <div className="font-medium">Smart Categorize</div>
              <div className="text-xs text-muted-foreground">Auto-categorize tasks by priority</div>
            </button>
            <button className="w-full px-4 py-3 bg-secondary hover:bg-accent rounded-lg text-left transition-colors">
              <div className="font-medium">Suggest Due Dates</div>
              <div className="text-xs text-muted-foreground">AI-powered deadline suggestions</div>
            </button>
            <button className="w-full px-4 py-3 bg-secondary hover:bg-accent rounded-lg text-left transition-colors">
              <div className="font-medium">Break Down Tasks</div>
              <div className="text-xs text-muted-foreground">Split complex tasks into subtasks</div>
            </button>
            <button className="w-full px-4 py-3 bg-secondary hover:bg-accent rounded-lg text-left transition-colors">
              <div className="font-medium">Productivity Insights</div>
              <div className="text-xs text-muted-foreground">Get AI-powered analytics</div>
            </button>
          </div>
        </div>
      )}


      {/* Filters Panel */}
      {showFilters && (
        <div className="border-b border-border p-4 bg-card">
          <div className="flex gap-4 flex-wrap">
            <select className="px-3 py-1.5 bg-secondary border border-border rounded-lg text-sm">
              <option>All Status</option>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
            <select className="px-3 py-1.5 bg-secondary border border-border rounded-lg text-sm">
              <option>All Priority</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select className="px-3 py-1.5 bg-secondary border border-border rounded-lg text-sm">
              <option>All Projects</option>
            </select>
          </div>
        </div>
      )}

      {/* Main View */}
      <div className="flex-1 overflow-hidden">
        {renderView()}
      </div>
    </div>
  );
};

export default MainContent;
