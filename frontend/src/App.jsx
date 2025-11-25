import React, { useState, useEffect } from 'react';
import { 
  Plus, X, User, Activity, Brain, Flame, Check, ChevronRight, ChevronDown, ChevronUp,
  Trash2, LogOut, Edit2, Calendar, Briefcase, 
  Coffee, PieChart, BarChart2, Save, BookOpen, Moon, Sun, Mail, Lock, User as UserIcon, ArrowRight
} from 'lucide-react';
import axios from 'axios'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const authApi = {
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const res = await api.post('/token', formData);
    return res.data;
  },
  signup: (email, password) => api.post('/users/', { email, password }),
  me: () => api.get('/users/me/'),
};

const habitApi = {
  getAll: () => api.get('/habits/'),
  create: (name, category) => api.post('/habits/', { name, category }),
  toggle: (id, date) => api.put(`/habits/${id}/toggle?date=${date}`),
  delete: (id) => api.delete(`/habits/${id}`),
};

const CATEGORIES = {
  Health: { color: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', icon: Activity },
  Work: { color: 'bg-blue-500', light: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', icon: Briefcase },
  Mindfulness: { color: 'bg-violet-500', light: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', icon: Brain },
  Education: { color: 'bg-amber-500', light: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', icon: BookOpen },
  Lifestyle: { color: 'bg-pink-500', light: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400', icon: Coffee },
  General: { color: 'bg-slate-500', light: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', icon: Activity },
};

const getLast7Days = () => Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return d.toISOString().split('T')[0];
});

const AggregateBarChart = ({ habits, color }) => {
  const last7 = getLast7Days();
  const data = last7.map(date => 
    habits.reduce((acc, h) => acc + ((h.completed_dates || []).includes(date) ? 1 : 0), 0)
  );
  const maxPossible = habits.length || 1; 

  return (
    <div className="flex items-end justify-between h-full w-full gap-2 px-2">
      {data.map((count, i) => {
        const percentage = (count / maxPossible) * 100;
        const dayLabel = new Date(last7[i]).toLocaleDateString('en-US', { weekday: 'short' });
        return (
          <div key={i} className="flex flex-col items-center justify-end h-full flex-1 group">
            <div className="relative w-full h-full flex items-end justify-center">
               <div className={`w-full max-w-[24px] rounded-t-md transition-all duration-500 ${percentage > 0 ? color : 'bg-gray-100 dark:bg-slate-800'}`} style={{ height: `${Math.max(percentage, 5)}%` }}></div>
            </div>
            <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mt-2 uppercase">{dayLabel}</div>
          </div>
        );
      })}
    </div>
  );
};

const DonutChart = ({ percent, color }) => {
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-gray-100 dark:text-slate-800" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={`${color.replace('bg-', 'text-')} transition-all duration-1000 ease-out`} />
      </svg>
      <div className="absolute flex flex-col items-center"><span className="text-2xl font-extrabold text-gray-900 dark:text-white">{percent}%</span></div>
    </div>
  );
};

const LoginView = ({ onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-gray-100 dark:border-slate-800 relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
            <p className="text-gray-500 dark:text-slate-400">Sign in to continue your streak</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="name@example.com"/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="••••••••"/>
              </div>
            </div>
            <button onClick={() => onLogin(email, password)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 mt-6">Sign In <ArrowRight size={20} /></button>
          </div>
          <div className="text-center mt-8 text-sm text-gray-500 dark:text-slate-400">Don't have an account? <button onClick={onSwitchToSignup} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Create Account</button></div>
        </div>
      </div>
    </div>
  );
};

const SignupView = ({ onSignup, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl shadow-purple-900/10 border border-gray-100 dark:border-slate-800 relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Create Account</h1>
            <p className="text-gray-500 dark:text-slate-400">Start your journey today</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="John Doe"/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="name@example.com"/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="••••••••"/>
              </div>
            </div>
            <button onClick={() => onSignup(name, email, password)} className="w-full bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-gray-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2 mt-6">Sign Up <ArrowRight size={20} /></button>
          </div>
          <div className="text-center mt-8 text-sm text-gray-500 dark:text-slate-400">Already have an account? <button onClick={onSwitchToLogin} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Sign In</button></div>
        </div>
      </div>
    </div>
  );
};

const ProfileView = ({ user, updateUser, habits, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);

  const handleSave = () => {
    updateUser({ ...user, name: editName, email: editEmail });
    setIsEditing(false);
  };

  const totalHabits = habits.length;
  const totalCompletions = habits.reduce((acc, h) => acc + (h.completed_dates || []).length, 0);
  const last7 = getLast7Days();
  const completionsLast7Days = habits.reduce((acc, h) => acc + (h.completed_dates || []).filter(d => last7.includes(d)).length, 0);
  const possibleCompletions = totalHabits * 7;
  const globalEfficiency = possibleCompletions > 0 ? Math.round((completionsLast7Days / possibleCompletions) * 100) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in slide-in-from-right duration-300 pb-24">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800 mb-8 transition-colors">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3"><h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{user.name}</h2></div>
                <p className="text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-2">{user.email}</p>
              </div>
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0">{user.name ? user.name[0].toUpperCase() : 'U'}</div>
            </div>
             <div className="flex justify-center md:justify-start gap-4 mt-6">
                 <div className="bg-gray-50 dark:bg-slate-800 px-6 py-3 rounded-2xl border border-gray-100 dark:border-slate-700 text-center"><div className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase">Total Habits</div><div className="text-xl font-black text-gray-900 dark:text-white">{totalHabits}</div></div>
                 <div className="bg-gray-50 dark:bg-slate-800 px-6 py-3 rounded-2xl border border-gray-100 dark:border-slate-700 text-center"><div className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase">Completions</div><div className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-1">{totalCompletions} <Flame size={16} className="text-orange-500" /></div></div>
             </div>
          </div>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analytics & Progress</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col justify-between min-h-[300px] transition-colors">
           <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400"><BarChart2 size={20} /></div>
                <h3 className="font-bold text-gray-800 dark:text-slate-200">Weekly Overview</h3>
          </div>
          <div className="flex-1 pt-4"><AggregateBarChart habits={habits} color="bg-blue-500" /></div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center min-h-[300px] transition-colors">
           <div className="flex items-center gap-2 mb-8 w-full">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400"><PieChart size={20} /></div>
            <h3 className="font-bold text-gray-800 dark:text-slate-200">Weekly Efficiency</h3>
          </div>
          <DonutChart percent={globalEfficiency} color="bg-emerald-500" />
        </div>
      </div>
      <div className="flex justify-center"><button onClick={onLogout} className="bg-red-50 dark:bg-red-900/20 text-red-500 px-8 py-3 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2"><LogOut size={20} /> Log Out</button></div>
    </div>
  );
};

const HabitDetailView = ({ habit, onBack, onToggleDay, onDelete }) => {
  if (!habit) return null;
  const theme = CATEGORIES[habit.category] || CATEGORIES.General;
  const Icon = theme.icon;
  const last7 = getLast7Days();
  const completedLast7 = last7.map(date => (habit.completed_dates || []).includes(date));
  const completedCount = completedLast7.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 7) * 100);
  
  return (
    <div className="p-6 max-w-5xl mx-auto animate-in slide-in-from-right duration-300 pb-24">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white font-bold bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"><ChevronRight className="rotate-180" size={20} /> Back</button>
        <button onClick={() => onDelete(habit.id)} className="bg-red-50 dark:bg-red-900/20 text-red-500 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"><Trash2 size={20} /> Delete Habit</button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800 p-8 md:p-10 overflow-hidden relative transition-colors">
        <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full ${theme.light} opacity-50 blur-3xl`}></div>
        <div className="relative z-10">
          <div className="flex items-center gap-5 mb-8">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${theme.light} ${theme.text} shadow-inner`}><Icon size={32} /></div>
            <div><div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 ${theme.light} ${theme.text}`}>{habit.category}</div><h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{habit.name}</h1></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
             <div className="bg-gray-50 dark:bg-slate-800 rounded-3xl p-6 flex flex-col justify-center items-center border border-gray-100 dark:border-slate-700 transition-colors"><div className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase">Total Completions</div><div className="text-3xl font-black text-gray-800 dark:text-white mt-1 flex items-center gap-2">{(habit.completed_dates || []).length} <Flame className="text-orange-500" /></div></div>
             <div className="bg-gray-50 dark:bg-slate-800 rounded-3xl p-6 flex flex-col justify-center items-center border border-gray-100 dark:border-slate-700 transition-colors"><div className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase">7-Day Efficiency</div><div className="text-3xl font-black text-gray-800 dark:text-white mt-1">{progressPercent}%</div></div>
             <div className="bg-gray-50 dark:bg-slate-800 rounded-3xl p-6 flex flex-col justify-center items-center border border-gray-100 dark:border-slate-700 transition-colors"><div className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase">Last 7 Days</div><div className="text-3xl font-black text-gray-800 dark:text-white mt-1">{completedCount}/7</div></div>
          </div>
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Calendar size={18} className={theme.text} /> Recent History</h3>
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {last7.map((date, idx) => {
               const isDone = (habit.completed_dates || []).includes(date);
               const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
               return (
                <button key={date} onClick={() => onToggleDay(habit.id, date)} className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-300 group ${isDone ? `${theme.color} text-white shadow-lg scale-105` : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                  <span className="text-xs font-bold mb-1">{dayName}</span>
                  {isDone ? <Check size={20} strokeWidth={4} /> : <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-gray-400"></div>}
                </button>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ user, habits, onAdd, onSelect, onToggle }) => {
  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter(h => (h.completed_dates || []).includes(today)).length;
  const last7 = getLast7Days();

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Hello, <span className="text-blue-600 dark:text-blue-400">{user.name}</span>!
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">
            You've completed <span className="text-blue-600 dark:text-blue-400 font-bold">{completedToday}</span> habits today.
          </p>
        </div>
        <button 
          onClick={onAdd} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 flex items-center gap-2 transition-all active:scale-95 hover:-translate-y-1 hover:shadow-xl font-bold"
        >
          <Plus size={20} /> Add Habit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map((habit) => {
          const theme = CATEGORIES[habit.category] || CATEGORIES.General;
          const Icon = theme.icon;
          const isDoneToday = (habit.completed_dates || []).includes(today);
          
          return (
            <div key={habit.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-visible">
              <button 
                  onClick={(e) => { e.stopPropagation(); onToggle(habit.id, today); }}
                  className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm z-20 ${isDoneToday ? `${theme.color} text-white shadow-md scale-110` : 'bg-gray-100 dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700 hover:border-gray-400'}`}
              >
                  <Check size={20} strokeWidth={4} className={isDoneToday ? 'opacity-100' : 'opacity-20 hover:opacity-100 transition-opacity'} />
              </button>

              <div onClick={() => onSelect(habit.id)} className="cursor-pointer">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-4 rounded-2xl ${theme.light} ${theme.text} group-hover:scale-110 transition-transform`}><Icon size={24} /></div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.light} ${theme.text}`}>{habit.category}</div>
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-1">{habit.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 font-medium mb-6"><Flame size={14} className="text-orange-500" /> {(habit.completed_dates || []).length} total</div>
                  <div className="space-y-2"><div className="flex justify-between text-xs font-bold text-gray-400 dark:text-slate-500"><span>Today</span><span>{isDoneToday ? 'Completed' : 'Pending'}</span></div><div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${theme.color} rounded-full transition-all duration-500 ease-out`} style={{ width: isDoneToday ? '100%' : '0%' }}></div></div></div>
              </div>
            </div>
          );
        })}
        {habits.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-400 dark:text-slate-500">
            <p>No habits yet. Click "Add Habit" to start!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const HabitModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState(''); 
  const [category, setCategory] = useState('Health');
  useEffect(() => { if(isOpen) { setName(''); setCategory('Health'); } }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-gray-800 dark:text-white">New Habit</h2><button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-400 dark:text-slate-500 transition-colors"><X size={24} /></button></div>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(CATEGORIES).map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${category === cat ? `${CATEGORIES[cat].color} text-white shadow-md` : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>{cat}</button>
              ))}
            </div>
          </div>
          <div><label className="block text-xs font-bold text-gray-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">Habit Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="e.g. Drink Water" /></div>
          <button onClick={() => { if (name) { onSave(name, category); onClose(); }}} className="w-full mt-4 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-gray-200 dark:shadow-none transition-all active:scale-95 hover:-translate-y-1 hover:shadow-xl">Create Habit</button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP CONTAINER ---

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [view, setView] = useState('dashboard');
  const [authView, setAuthView] = useState('login');
  const [darkMode, setDarkMode] = useState(false);
  const [habits, setHabits] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchHabits();
    } else {
      // If no token, we stay in auth view, but we don't force 'login' here
      // to allow toggling between login/signup
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await authApi.me();
      const userData = res.data;
      // Name fallback
      if (!userData.name) userData.name = userData.email.split('@')[0];
      setUser(userData);
    } catch {
      handleLogout();
    }
  };

  const fetchHabits = async () => {
    try {
      const res = await habitApi.getAll();
      setHabits(res.data);
    } catch(e) { console.error(e); }
  };

  const handleLogin = async (email, password) => {
    setAuthError('');
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('token', res.access_token);
      setToken(res.access_token);
    } catch (err) {
      setAuthError('Login failed. Please check credentials.');
    }
  };

  const handleSignup = async (name, email, password) => {
    setAuthError('');
    try {
      // Note: Backend currently ignores 'name', but we send it.
      // You'd need to update backend schemas/models to store it properly.
      await authApi.signup(email, password);
      const res = await authApi.login(email, password);
      localStorage.setItem('token', res.access_token);
      setToken(res.access_token);
    } catch (err) {
      setAuthError('Signup failed. Email might be taken.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setHabits([]);
    setAuthView('login');
  };

  const handleSaveHabit = async (name, category) => {
    try {
      await habitApi.create(name, category);
      fetchHabits();
    } catch(e) { console.error(e); }
  };

  const handleToggleDay = async (id, date) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const dates = h.completed_dates || [];
        const newDates = dates.includes(date) ? dates.filter(d => d !== date) : [...dates, date];
        return { ...h, completed_dates: newDates };
      }
      return h;
    }));
    try { await habitApi.toggle(id, date); } catch(e) { fetchHabits(); }
  };

  const handleDeleteHabit = async (id) => {
    if (window.confirm('Delete this habit?')) {
      try {
        await habitApi.delete(id);
        setHabits(prev => prev.filter(h => h.id !== id));
        setView('dashboard');
      } catch (e) {
        console.error("Failed to delete", e);
        alert("Failed to delete habit. Ensure backend is running.");
      }
    }
  };

  const activeHabit = habits.find(h => h.id === selectedId);

  const Header = () => (
    <header className="flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-100 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-8">
        <button onClick={() => setView('dashboard')} className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight hover:opacity-80 transition-opacity">
          Habit<span className="text-blue-600 dark:text-blue-400">Tracker</span>
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setDarkMode(!darkMode)} 
          className="p-2 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        {user && (
          <button onClick={() => setView('profile')} className="flex items-center gap-3 pl-1 pr-4 py-1 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full border border-gray-200 dark:border-slate-700 transition-all group">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:scale-105 transition-transform">
               {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <span className="text-sm font-bold text-gray-700 dark:text-slate-300 hidden sm:inline">{user.name}</span>
          </button>
        )}
      </div>
    </header>
  );

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-gray-900 dark:text-white selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-300">
        <Header />
        <main>
          {/* AUTH LOGIC */}
          {!user ? (
            authView === 'login' ? (
              <LoginView onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} />
            ) : (
              <SignupView onSignup={handleSignup} onSwitchToLogin={() => setAuthView('login')} />
            )
          ) : (
            /* APP LOGIC */
            <>
              {view === 'dashboard' && (
                <Dashboard 
                  user={user} 
                  habits={habits} 
                  onAdd={() => setIsModalOpen(true)} 
                  onSelect={(id) => { setSelectedId(id); setView('habit-detail'); }} 
                  onToggle={handleToggleDay}
                />
              )}
              {view === 'habit-detail' && activeHabit && (
                <HabitDetailView 
                  habit={activeHabit} 
                  onBack={() => setView('dashboard')} 
                  onToggleDay={handleToggleDay} 
                  onDelete={handleDeleteHabit} 
                />
              )}
              {view === 'profile' && (
                <ProfileView 
                  user={user} 
                  updateUser={setUser} 
                  habits={habits} 
                  onLogout={handleLogout} 
                />
              )}
            </>
          )}
        </main>
        <HabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveHabit} />
      </div>
    </div>
  );
}
