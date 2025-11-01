import React, { useState } from 'react';
import { X, Calendar, Flag, Clock, Paperclip, MessageSquare, Play, Trash2, Copy, Settings, Timer, Zap } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { formatDate, getPriorityColor } from '../lib/utils';

const TaskDetails: React.FC = () => {
  const { selectedTask, setSelectedTask, updateTask, deleteTask, duplicateTask } = useTaskStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'times' | 'advanced'>('basic');
  
  if (!selectedTask) return null;

  const handleClose = () => {
    setSelectedTask(null);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(selectedTask.id);
      setSelectedTask(null);
    }
  };

  const handleDuplicate = () => {
    duplicateTask(selectedTask.id);
  };

  const handleStatusChange = (status: string) => {
    updateTask(selectedTask.id, { status: status as any });
  };

  const handlePriorityChange = (priority: string) => {
    updateTask(selectedTask.id, { priority: priority as any });
  };

  const completionPercentage = selectedTask.subtasks.length > 0
    ? Math.round((selectedTask.subtasks.filter(st => st.completed).length / selectedTask.subtasks.length) * 100)
    : 0;

  return (
    <div className="w-96 border-l border-border bg-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Task Details</h3>
          <button onClick={handleClose} className="p-1 hover:bg-accent rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeTab === 'basic' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
          >
            <Settings className="w-4 h-4" />
            Basic
          </button>
          <button
            onClick={() => setActiveTab('times')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeTab === 'times' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
          >
            <Timer className="w-4 h-4" />
            Times
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeTab === 'advanced' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
          >
            <Zap className="w-4 h-4" />
            Advanced
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Title - Always visible */}
        <div>
          {isEditing ? (
            <input
              type="text"
              value={selectedTask.title}
              onChange={(e) => updateTask(selectedTask.id, { title: e.target.value })}
              onBlur={() => setIsEditing(false)}
              className="w-full text-xl font-semibold bg-transparent border-b-2 border-primary focus:outline-none"
              autoFocus
            />
          ) : (
            <h2
              onClick={() => setIsEditing(true)}
              className="text-xl font-semibold cursor-pointer hover:text-primary transition-colors"
            >
              {selectedTask.title}
            </h2>
          )}
        </div>

        {/* BASIC TAB */}
        {activeTab === 'basic' && (
          <>
        {/* Progress */}
        {selectedTask.subtasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Properties */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Flag className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedTask.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="flex-1 px-2 py-1 bg-secondary border border-border rounded text-sm"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Flag className={`w-4 h-4 text-${getPriorityColor(selectedTask.priority)}-500`} />
            <select
              value={selectedTask.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="flex-1 px-2 py-1 bg-secondary border border-border rounded text-sm"
            >
              <option value="none">No Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <label className="text-xs text-muted-foreground block mb-1">Due Date</label>
                <input
                  type="date"
                  value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const currentDate = selectedTask.dueDate ? new Date(selectedTask.dueDate) : new Date();
                      const newDate = new Date(e.target.value);
                      newDate.setHours(currentDate.getHours(), currentDate.getMinutes());
                      updateTask(selectedTask.id, { dueDate: newDate.toISOString() as any });
                    } else {
                      updateTask(selectedTask.id, { dueDate: undefined });
                    }
                  }}
                  className="w-full px-2 py-1.5 bg-secondary border border-border rounded text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <label className="text-xs text-muted-foreground block mb-1">Due Time</label>
                <input
                  type="time"
                  value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toTimeString().slice(0, 5) : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const currentDate = selectedTask.dueDate ? new Date(selectedTask.dueDate) : new Date();
                      const [hours, minutes] = e.target.value.split(':');
                      currentDate.setHours(parseInt(hours), parseInt(minutes));
                      updateTask(selectedTask.id, { dueDate: currentDate.toISOString() as any });
                    }
                  }}
                  className="w-full px-2 py-1.5 bg-secondary border border-border rounded text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <label className="text-xs text-muted-foreground block mb-1">Estimated Duration (minutes)</label>
              <input
                type="number"
                placeholder="e.g., 30"
                value={selectedTask.estimatedTime || ''}
                onChange={(e) => updateTask(selectedTask.id, { estimatedTime: parseInt(e.target.value) || undefined })}
                className="w-full px-2 py-1.5 bg-secondary border border-border rounded text-sm"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm text-muted-foreground block mb-2">Description</label>
          <textarea
            value={selectedTask.description || ''}
            onChange={(e) => updateTask(selectedTask.id, { description: e.target.value })}
            placeholder="Add a description..."
            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Subtasks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Subtasks ({selectedTask.subtasks.length})</span>
            <button className="text-xs text-primary hover:underline">Add Subtask</button>
          </div>
          <div className="space-y-2">
            {selectedTask.subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={(e) => {
                    const updated = selectedTask.subtasks.map(st =>
                      st.id === subtask.id ? { ...st, completed: e.target.checked } : st
                    );
                    updateTask(selectedTask.id, { subtasks: updated });
                  }}
                  className="w-4 h-4"
                />
                <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Attachments */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Paperclip className="w-4 h-4" />
            <span>Attachments ({selectedTask.attachments.length})</span>
          </div>
          <button className="text-xs text-primary hover:underline">Add Attachment</button>
        </div>

        {/* Comments */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MessageSquare className="w-4 h-4" />
            <span>Comments ({selectedTask.comments.length})</span>
          </div>
          <button className="text-xs text-primary hover:underline">Add Comment</button>
        </div>

        {/* Time Tracking */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Play className="w-4 h-4" />
            <span>Time Entries ({selectedTask.timeEntries.length})</span>
          </div>
          <button className="text-xs text-primary hover:underline">Start Timer</button>
        </div>

        {/* Metadata */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Created: {formatDate(selectedTask.createdAt)}</div>
          <div>Updated: {formatDate(selectedTask.updatedAt)}</div>
          {selectedTask.completedAt && <div>Completed: {formatDate(selectedTask.completedAt)}</div>}
        </div>

        {/* Delete Task Button */}
        <div className="pt-4">
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete Task
          </button>
        </div>
          </>
        )}

        {/* TIMES TAB */}
        {activeTab === 'times' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">⏰ Date & Time</h3>
              
              {/* Show current date/time if set */}
              {selectedTask.dueDate && (
                <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="text-sm font-medium text-primary mb-1">Due Date & Time Set:</div>
                  <div className="text-lg font-bold">
                    {new Date(selectedTask.dueDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-md mt-1">
                    ⏰ {new Date(selectedTask.dueDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">📅 Due Date</label>
                  <input
                    type="date"
                    value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const currentDate = selectedTask.dueDate ? new Date(selectedTask.dueDate) : new Date();
                        const newDate = new Date(e.target.value);
                        newDate.setHours(currentDate.getHours(), currentDate.getMinutes());
                        updateTask(selectedTask.id, { dueDate: newDate.toISOString() as any });
                      } else {
                        updateTask(selectedTask.id, { dueDate: undefined });
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">🕐 Due Time</label>
                  <input
                    type="time"
                    value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toTimeString().slice(0, 5) : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const currentDate = selectedTask.dueDate ? new Date(selectedTask.dueDate) : new Date();
                        const [hours, minutes] = e.target.value.split(':');
                        currentDate.setHours(parseInt(hours), parseInt(minutes));
                        updateTask(selectedTask.id, { dueDate: currentDate.toISOString() as any });
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">⏱️ Estimated Duration</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="e.g., 30"
                      value={selectedTask.estimatedTime || ''}
                      onChange={(e) => updateTask(selectedTask.id, { estimatedTime: parseInt(e.target.value) || undefined })}
                      className="flex-1 px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm"
                    />
                    <span className="flex items-center px-3 bg-secondary border border-border rounded-lg text-sm text-muted-foreground">min</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold mb-4">🎯 Focus Mode</h3>
              <div className="space-y-4">
                <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Start Focus Timer
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-secondary rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Work Duration</div>
                    <div className="text-lg font-bold">25 min</div>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Break Duration</div>
                    <div className="text-lg font-bold">5 min</div>
                  </div>
                </div>

                <div className="p-3 bg-accent/50 rounded-lg text-sm text-muted-foreground">
                  💡 Focus mode uses the Pomodoro technique to help you stay productive
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADVANCED TAB */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">🏷️ Tags</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTask.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                    {String(tag)}
                  </span>
                ))}
              </div>
              <button className="text-xs text-primary hover:underline">Add Tag</button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">📎 Attachments</h3>
              <div className="text-sm text-muted-foreground mb-2">
                {selectedTask.attachments.length} attachment(s)
              </div>
              <button className="text-xs text-primary hover:underline">Add Attachment</button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">💬 Comments</h3>
              <div className="text-sm text-muted-foreground mb-2">
                {selectedTask.comments.length} comment(s)
              </div>
              <button className="text-xs text-primary hover:underline">Add Comment</button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">📊 Time Entries</h3>
              <div className="text-sm text-muted-foreground mb-2">
                {selectedTask.timeEntries.length} time entry(ies)
              </div>
              <button className="text-xs text-primary hover:underline">Start Timer</button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">🔄 Repeat</h3>
              <select
                value={selectedTask.repeatType}
                onChange={(e) => updateTask(selectedTask.id, { repeatType: e.target.value as any })}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm"
              >
                <option value="none">No Repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border flex gap-2">
        <button
          onClick={handleDuplicate}
          className="flex-1 px-3 py-2 bg-secondary hover:bg-accent rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Copy className="w-4 h-4" />
          Duplicate
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 px-3 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskDetails;
