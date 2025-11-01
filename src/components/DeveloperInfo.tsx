import React from 'react';
import { X, Code, Heart, Zap, Github, Linkedin, Mail } from 'lucide-react';

interface DeveloperInfoProps {
  onClose: () => void;
}

const DeveloperInfo: React.FC<DeveloperInfoProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="glass rounded-2xl w-full max-w-2xl overflow-hidden border border-border">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
              <Code className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">KARNAM HARSHITH</h2>
              <p className="text-white/90 flex items-center gap-2">
                <Heart className="w-4 h-4 fill-current" />
                Passionate Developer
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4" />
            <span>Building Amazing Apps with Love & Code</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              About the Developer
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Hello! I'm <span className="font-semibold text-foreground">Karnam Harshith</span>, 
              a passionate full-stack developer who loves creating intuitive and powerful applications. 
              I believe in building software that not only works flawlessly but also brings joy to users.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">✨ Ultimate Todo App</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This app is crafted with dedication and attention to detail, featuring:
            </p>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                6 Powerful View Modes
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                AI-Powered Features
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                Beautiful Dark Mode
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                Mobile Optimized
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                Drag & Drop Support
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                Export/Import Tasks
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">🚀 Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Vite', 'DnD Kit'].map(tech => (
                <span key={tech} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Connect Section */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-lg font-bold mb-3">💬 Connect With Me</h3>
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-accent rounded-lg transition-colors">
                <Github className="w-5 h-5" />
                <span className="text-sm font-medium">GitHub</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-accent rounded-lg transition-colors">
                <Linkedin className="w-5 h-5" />
                <span className="text-sm font-medium">LinkedIn</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-secondary hover:bg-accent rounded-lg transition-colors">
                <Mail className="w-5 h-5" />
                <span className="text-sm font-medium">Email</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              Made with
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
              by Karnam Harshith
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              © 2025 Ultimate Todo. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperInfo;
