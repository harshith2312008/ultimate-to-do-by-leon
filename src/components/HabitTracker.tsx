import { useState } from 'react';
import { Plus, Check, TrendingUp, Calendar, X, Edit2, Archive } from 'lucide-react';
import { useHabitStore, Habit, HabitFrequency, HabitGoalType } from '../store/habitStore';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';

export default function HabitTracker() {
  const { getActiveHabits, getTodayHabits, addHabit, updateHabit, archiveHabit, markHabitComplete, markHabitIncomplete, getHabitCompletion, getHabitStats } = useHabitStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<'today' | 'all'>('today');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const displayHabits = viewMode === 'today' ? getTodayHabits() : getActiveHabits();

  const handleToggleHabit = (habitId: string, date: Date) => {
    const completion = getHabitCompletion(habitId, date);
    if (completion) {
      markHabitIncomplete(habitId, date);
      toast.success('Marked as incomplete');
    } else {
      markHabitComplete(habitId, date);
      toast.success('Great job! 🎉');
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Habit Tracker</h1>
            <p className="text-sm text-white/60 mt-1">Build consistent habits</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Habit
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'today'
                ? 'bg-accent text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Today's Habits
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'all'
                ? 'bg-accent text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            All Habits
          </button>
        </div>
      </div>

      {/* Habit List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {displayHabits.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No habits yet. Create one to get started!</p>
          </div>
        ) : (
          displayHabits.map(habit => {
            const stats = getHabitStats(habit.id);
            const today = new Date();
            const weekDays = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

            return (
              <div
                key={habit.id}
                className="glass rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${habit.color}30`, color: habit.color }}
                    >
                      {habit.icon || '⭐'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{habit.name}</h3>
                      {habit.description && (
                        <p className="text-sm text-white/60">{habit.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {stats.currentStreak} day streak
                        </span>
                        <span className="text-xs text-white/40">
                          {stats.completionRate}% (30 days)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingHabit(habit)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
                      title="Edit habit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Archive this habit?')) {
                          archiveHabit(habit.id);
                          toast.success('Habit archived');
                        }
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
                      title="Archive habit"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Week View */}
                <div className="flex gap-2">
                  {weekDays.map(day => {
                    const isCompleted = !!getHabitCompletion(habit.id, day);
                    const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => handleToggleHabit(habit.id, day)}
                        className={`flex-1 aspect-square rounded-lg transition-all ${
                          isCompleted
                            ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                            : isToday
                            ? 'bg-white/20 border-2 border-accent text-white'
                            : 'bg-white/5 border-2 border-white/10 text-white/40 hover:bg-white/10'
                        }`}
                        title={format(day, 'MMM d')}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className="text-xs font-medium">{format(day, 'EEE')[0]}</span>
                          {isCompleted && <Check className="w-4 h-4 mt-1" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Habit Modal */}
      {(showAddForm || editingHabit) && (
        <HabitForm
          habit={editingHabit}
          onClose={() => {
            setShowAddForm(false);
            setEditingHabit(null);
          }}
          onSave={(habit) => {
            if (editingHabit) {
              updateHabit(editingHabit.id, habit);
              toast.success('Habit updated');
            } else {
              addHabit({
                ...habit,
                id: crypto.randomUUID(),
                createdAt: new Date(),
                archived: false,
              });
              toast.success('Habit created');
            }
            setShowAddForm(false);
            setEditingHabit(null);
          }}
        />
      )}
    </div>
  );
}

interface HabitFormProps {
  habit?: Habit | null;
  onClose: () => void;
  onSave: (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void;
}

function HabitForm({ habit, onClose, onSave }: HabitFormProps) {
  const [name, setName] = useState(habit?.name || '');
  const [description, setDescription] = useState(habit?.description || '');
  const [icon, setIcon] = useState(habit?.icon || '⭐');
  const [color, setColor] = useState(habit?.color || '#3b82f6');
  const [frequency, setFrequency] = useState<HabitFrequency>(habit?.frequency || 'daily');
  const [goalType] = useState<HabitGoalType>(habit?.goalType || 'completion');
  const [goalValue] = useState(habit?.goalValue || 1);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const icons = ['⭐', '🎯', '💪', '📚', '🏃', '🧘', '💼', '🎨', '🍎', '💧'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      frequency,
      goalType,
      goalValue,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl max-w-md w-full border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {habit ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="e.g., Morning Exercise"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="30 minutes of cardio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {icons.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-lg text-xl transition-all ${
                    icon === i
                      ? 'bg-accent scale-110'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Color</label>
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-opacity"
            >
              {habit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
