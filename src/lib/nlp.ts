import { Priority, RepeatType } from '../types';
import { addDays, addWeeks, addMonths, endOfDay, setHours, setMinutes } from 'date-fns';

/**
 * Natural Language Processing for task creation
 * Inspired by Todoist's natural language input
 */

interface ParsedTask {
  title: string;
  dueDate?: Date;
  priority?: Priority;
  tags?: string[];
  projectName?: string;
  repeatType?: RepeatType;
  repeatInterval?: number;
  estimatedTime?: number;
}

// Priority keywords
const priorityKeywords: Record<string, Priority> = {
  'p1': 'critical',
  'p2': 'high',
  'p3': 'medium',
  'p4': 'low',
  'urgent': 'critical',
  'important': 'high',
  'critical': 'critical',
  'high priority': 'high',
  'low priority': 'low',
};

// Time keywords for due dates
const timeKeywords: Record<string, () => Date> = {
  'today': () => endOfDay(new Date()),
  'tomorrow': () => endOfDay(addDays(new Date(), 1)),
  'tonight': () => setHours(setMinutes(new Date(), 0), 20),
  'this evening': () => setHours(setMinutes(new Date(), 0), 18),
  'next week': () => endOfDay(addWeeks(new Date(), 1)),
  'next monday': () => {
    const date = new Date();
    const day = date.getDay();
    const daysUntilMonday = (8 - day) % 7 || 7;
    return endOfDay(addDays(date, daysUntilMonday));
  },
  'next tuesday': () => {
    const date = new Date();
    const day = date.getDay();
    const daysUntilTuesday = (9 - day) % 7 || 7;
    return endOfDay(addDays(date, daysUntilTuesday));
  },
  'next wednesday': () => {
    const date = new Date();
    const day = date.getDay();
    const daysUntilWednesday = (10 - day) % 7 || 7;
    return endOfDay(addDays(date, daysUntilWednesday));
  },
  'next thursday': () => {
    const date = new Date();
    const day = date.getDay();
    const daysUntilThursday = (11 - day) % 7 || 7;
    return endOfDay(addDays(date, daysUntilThursday));
  },
  'next friday': () => {
    const date = new Date();
    const day = date.getDay();
    const daysUntilFriday = (12 - day) % 7 || 7;
    return endOfDay(addDays(date, daysUntilFriday));
  },
  'next month': () => endOfDay(addMonths(new Date(), 1)),
};

// Repeat keywords
const repeatKeywords: Record<string, { type: RepeatType; interval?: number }> = {
  'daily': { type: 'daily', interval: 1 },
  'every day': { type: 'daily', interval: 1 },
  'weekly': { type: 'weekly', interval: 1 },
  'every week': { type: 'weekly', interval: 1 },
  'monthly': { type: 'monthly', interval: 1 },
  'every month': { type: 'monthly', interval: 1 },
  'yearly': { type: 'yearly', interval: 1 },
  'every year': { type: 'yearly', interval: 1 },
  'every 2 days': { type: 'daily', interval: 2 },
  'every 3 days': { type: 'daily', interval: 3 },
  'every 2 weeks': { type: 'weekly', interval: 2 },
  'biweekly': { type: 'weekly', interval: 2 },
};

/**
 * Parse natural language input into structured task data
 * Examples:
 * - "Buy groceries tomorrow at 5pm #shopping p1"
 * - "Review code every week @work"
 * - "Call mom tonight"
 * - "Submit report next friday p2"
 */
export function parseNaturalLanguage(input: string): ParsedTask {
  let text = input;
  const parsed: ParsedTask = {
    title: '',
  };

  // Extract priority (p1, p2, p3, p4 or keywords)
  Object.entries(priorityKeywords).forEach(([keyword, priority]) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    if (regex.test(text)) {
      parsed.priority = priority;
      text = text.replace(regex, '').trim();
    }
  });

  // Extract tags (#tag)
  const tagMatches = text.match(/#(\w+)/g);
  if (tagMatches) {
    parsed.tags = tagMatches.map(tag => tag.substring(1));
    text = text.replace(/#\w+/g, '').trim();
  }

  // Extract project (@project)
  const projectMatch = text.match(/@(\w+)/);
  if (projectMatch) {
    parsed.projectName = projectMatch[1];
    text = text.replace(/@\w+/, '').trim();
  }

  // Extract repeat patterns
  Object.entries(repeatKeywords).forEach(([keyword, repeat]) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    if (regex.test(text)) {
      parsed.repeatType = repeat.type;
      parsed.repeatInterval = repeat.interval;
      text = text.replace(regex, '').trim();
    }
  });

  // Extract time estimates (e.g., "30min", "2h", "1.5h")
  const timeMatch = text.match(/(\d+(?:\.\d+)?)(min|mins|minute|minutes|h|hr|hrs|hour|hours)/i);
  if (timeMatch) {
    const value = parseFloat(timeMatch[1]);
    const unit = timeMatch[2].toLowerCase();
    if (unit.startsWith('h')) {
      parsed.estimatedTime = value * 60;
    } else {
      parsed.estimatedTime = value;
    }
    text = text.replace(timeMatch[0], '').trim();
  }

  // Extract due dates
  Object.entries(timeKeywords).forEach(([keyword, dateFunc]) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    if (regex.test(text)) {
      parsed.dueDate = dateFunc();
      text = text.replace(regex, '').trim();
    }
  });

  // Extract specific time (e.g., "at 3pm", "at 15:00")
  const timePatterns = [
    /at (\d{1,2}):?(\d{2})?\s*(am|pm)?/i,
    /(\d{1,2}):(\d{2})\s*(am|pm)?/i,
  ];

  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2] ? parseInt(match[2]) : 0;
      const meridiem = match[3]?.toLowerCase();

      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;

      if (!parsed.dueDate) {
        parsed.dueDate = new Date();
      }
      parsed.dueDate = setHours(setMinutes(parsed.dueDate, minutes), hours);
      text = text.replace(match[0], '').trim();
      break;
    }
  }

  // Extract dates in format MM/DD, DD/MM, YYYY-MM-DD
  const datePatterns = [
    /(\d{4})-(\d{2})-(\d{2})/,  // YYYY-MM-DD
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // MM/DD/YYYY
    /(\d{1,2})\/(\d{1,2})/,  // MM/DD
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (pattern.source.includes('\\d{4}')) {
        // YYYY-MM-DD
        parsed.dueDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      } else if (match[3]) {
        // MM/DD/YYYY
        parsed.dueDate = new Date(parseInt(match[3]), parseInt(match[1]) - 1, parseInt(match[2]));
      } else {
        // MM/DD (current year)
        const year = new Date().getFullYear();
        parsed.dueDate = new Date(year, parseInt(match[1]) - 1, parseInt(match[2]));
      }
      text = text.replace(match[0], '').trim();
      break;
    }
  }

  // Extract "in X days/weeks/months"
  const relativeMatch = text.match(/in (\d+) (day|days|week|weeks|month|months)/i);
  if (relativeMatch) {
    const value = parseInt(relativeMatch[1]);
    const unit = relativeMatch[2].toLowerCase();
    
    if (unit.startsWith('day')) {
      parsed.dueDate = endOfDay(addDays(new Date(), value));
    } else if (unit.startsWith('week')) {
      parsed.dueDate = endOfDay(addWeeks(new Date(), value));
    } else if (unit.startsWith('month')) {
      parsed.dueDate = endOfDay(addMonths(new Date(), value));
    }
    text = text.replace(relativeMatch[0], '').trim();
  }

  // Clean up extra spaces
  text = text.replace(/\s+/g, ' ').trim();
  
  // Whatever remains is the title
  parsed.title = text || 'New Task';

  return parsed;
}

/**
 * Suggest completions as user types
 */
export function suggestCompletions(input: string): string[] {
  const suggestions: string[] = [];
  const lowerInput = input.toLowerCase();

  // Suggest time keywords
  Object.keys(timeKeywords).forEach(keyword => {
    if (keyword.startsWith(lowerInput) || lowerInput.includes(keyword)) {
      suggestions.push(keyword);
    }
  });

  // Suggest priority
  if (lowerInput.includes('p') || lowerInput.includes('priority')) {
    suggestions.push('p1 (critical)', 'p2 (high)', 'p3 (medium)', 'p4 (low)');
  }

  // Suggest repeat patterns
  if (lowerInput.includes('every') || lowerInput.includes('repeat')) {
    suggestions.push('every day', 'every week', 'every month');
  }

  return suggestions.slice(0, 5);
}
