import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Get registered users from localStorage
const getRegisteredUsers = () => {
  const stored = localStorage.getItem('registered-users');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }
  return [];
};

// Save registered users to localStorage
const saveRegisteredUsers = (users: Array<{ id: string; name: string; email: string; password: string }>) => {
  localStorage.setItem('registered-users', JSON.stringify(users));
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const users = getRegisteredUsers();
        const user = users.find((u: any) => u.email === email && u.password === password);
        
        if (user) {
          set({ 
            user: { id: user.id, name: user.name, email: user.email },
            isAuthenticated: true 
          });
          return true;
        }
        
        return false;
      },

      register: async (name: string, email: string, password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const users = getRegisteredUsers();
        
        // Check if user already exists
        const existingUser = users.find((u: any) => u.email === email);
        if (existingUser) {
          return false;
        }
        
        // Create new user
        const newUser = {
          id: crypto.randomUUID(),
          name,
          email,
          password,
        };
        
        users.push(newUser);
        saveRegisteredUsers(users);
        
        set({ 
          user: { id: newUser.id, name: newUser.name, email: newUser.email },
          isAuthenticated: true 
        });
        
        return true;
      },

      logout: () => set((state) => {
        if (state.user) {
          // Clear user-specific task data
          localStorage.removeItem(`tasks-${state.user.id}`);
        }
        return { user: null, isAuthenticated: false };
      }),

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
