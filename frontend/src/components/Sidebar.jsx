import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  HelpCircle, 
  Users, 
  BarChart3, 
  LogOut, 
  GraduationCap,
  ClipboardList,
  TrendingUp
} from 'lucide-react';


export default function Sidebar({ user, isOpen, setIsOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('eduinsight_token');
    localStorage.removeItem('eduinsight_user');
    navigate('/login');
  };

  const studentLinks = [
    { to: '/student/dashboard',    label: 'Dashboard',  icon: LayoutDashboard },
    { to: '/student/learning-twin', label: 'My Learning', icon: BrainCircuit },
    { to: '/student/quiz',         label: 'Take Quiz',  icon: HelpCircle },
    { to: '/student/profile',      label: 'Profile',    icon: Users },
  ];

  const teacherLinks = [
    { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teacher/students', label: 'My Students', icon: Users },
    { to: '/teacher/quiz-manager', label: 'Quiz Manager', icon: ClipboardList },
    { to: '/teacher/class-performance', label: 'Class Performance', icon: TrendingUp },
  ];


  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/models', label: 'Model Performance', icon: BarChart3 },
  ];

  let links = studentLinks;
  let portalTitle = 'Student Portal';
  if (user?.role === 'ADMIN') {
    links = adminLinks;
    portalTitle = 'Admin Portal';
  } else if (user?.role === 'TEACHER') {
    links = teacherLinks;
    portalTitle = 'Teacher Portal';
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 w-64 bg-slate-900 text-slate-300 z-50 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide">EduInsight AI</h1>
            <p className="text-xs text-blue-400 font-medium">Smarter Insights, Better Learning</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {portalTitle}
          </div>

          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white font-semibold text-sm border border-slate-700">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role?.toLowerCase() || 'Student'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
