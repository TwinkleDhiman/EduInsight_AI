import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, HelpCircle, User } from 'lucide-react';

export default function MobileBottomNav({ user }) {
  if (user?.role !== 'STUDENT') return null;

  const items = [
    { to: '/student/dashboard',    label: 'Home',      icon: LayoutDashboard },
    { to: '/student/learning-twin', label: 'My Learning', icon: BrainCircuit },
    { to: '/student/quiz',         label: 'Quiz',      icon: HelpCircle },
    { to: '/student/profile',      label: 'Profile',   icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around lg:hidden shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-3 rounded-xl transition-all
              ${isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
