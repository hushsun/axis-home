import React, { useState, useMemo, useEffect } from 'react';
import { 
  Lock, Unlock, MessageSquare, CheckCircle2, XCircle, Send, 
  User, LayoutDashboard, Wallet, CalendarClock, AlertTriangle, 
  ArrowRightLeft, Check, Plus, Coins
} from 'lucide-react';
import { supabase } from './supabaseClient';

// --- 基础配置 ---
const USERS = {
  A: { id: 'user_a', name: '主理人', color: 'bg-slate-800', textColor: 'text-slate-100', tokens: 2 },
  B: { id: 'user_b', name: '合伙人', color: 'bg-stone-500', textColor: 'text-stone-50', tokens: 3 }
};

const INITIAL_SPACES = [
  { id: 's_living', name: '客餐厅', icon: '🛋️' },
  { id: 's_master', name: '主卧', icon: '🛏️' },
  { id: 's_kitchen', name: '厨房', icon: '🍳' }
];

const INITIAL_CATEGORIES = {
  c_hard: { id: 'c_hard', name: '硬装基建', allocated: 250000, spent: 50000 },
  c_custom: { id: 'c_custom', name: '全屋定制', allocated: 200000, spent: 0 },
  c_soft: { id: 'c_soft', name: '软装家具', allocated: 150000, spent: 20000 },
  c_appliance: { id: 'c_appliance', name: '家用电器', allocated: 100000, spent: 80000 }
};

const INITIAL_TIMELINE = [
  { id: 't_1', date: '2026.04.15', title: '水电交底与开槽', tasks: [{ id: 'tk_1', desc: '确认全屋插座与弱电点位', assignee: 'user_a', done: true }] },
  { id: 't_4', date: '2026.08.01', title: '交付入住', isDeadline: true, tasks: [] }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(USERS.A);
  const [activeTab, setActiveTab] = useState('spaces'); 
  const [activeSpace, setActiveSpace] = useState(INITIAL_SPACES[0]);
  const [requirements, setRequirements] = useState([]); // 初始为空，由云端填充
  const [inputText, setInputText] = useState('');
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [expenses, setExpenses] = useState([]);
  const [timeline, setTimeline] = useState(INITIAL_TIMELINE);

  // --- 核心：云端同步逻辑 ---
  useEffect(() => {
    // 1. 获取全量数据
    const fetchRequirements = async () => {
      const { data, error } = await supabase
        .from('requirements')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) setRequirements(data);
    };

    fetchRequirements();

    // 2. 开启实时监听 (Realtime)
    const channel = supabase
      .channel('db_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requirements' }, (payload) => {
        console.log('检测到数据变动:', payload);
        fetchRequirements(); // 只要数据库变了，就重新刷新列表
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // --- 交互逻辑：添加需求 ---
  const handleAddRequirement = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const { error } = await supabase
      .from('requirements')
      .insert([{ 
        spaceId: activeSpace.id, 
        text: inputText.trim(), 
        creatorId: currentUser.id, 
        status: 'pending', 
        votes: { [currentUser.id]: 'agree' } 
      }]);

    if (!error) setInputText('');
    else alert("同步失败，请检查网络");
  };

  // --- 交互逻辑：投票 ---
  const handleVote = async (reqId, voteType) => {
    const req = requirements.find(r => r.id === reqId);
    if (!req) return;

    const newVotes = { ...req.votes, [currentUser.id]: voteType };
    
    // 逻辑计算
    let newStatus = 'pending';
    if (newVotes.user_a === 'agree' && newVotes.user_b === 'agree') newStatus = 'locked';
    else if (newVotes.user_a === 'disagree' || newVotes.user_b === 'disagree') newStatus = 'rejected';

    await supabase
      .from('requirements')
      .update({ votes: newVotes, status: newStatus })
      .eq('id', reqId);
  };

  const totalBudget = useMemo(() => Object.values(categories).reduce((acc, c) => acc + c.allocated, 0), [categories]);
  const totalSpent = useMemo(() => Object.values(categories).reduce((acc, c) => acc + c.spent, 0), [categories]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex justify-center">
      <div className="w-full max-w-[400px] bg-white min-h-screen shadow-2xl relative flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-5 py-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-900 rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-black">AX</span>
            </div>
            <h1 className="text-base font-bold tracking-widest uppercase">Axis</h1>
          </div>
          <button onClick={() => setCurrentUser(currentUser.id === 'user_a' ? USERS.B : USERS.A)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold ${currentUser.color} ${currentUser.textColor}`}>
            <User size={14} /> 切换: {currentUser.name}
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 pb-24">
          {activeTab === 'spaces' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-2">
                {INITIAL_SPACES.map(s => (
                  <button key={s.id} onClick={() => setActiveSpace(s)} className={`p-3 rounded-xl border flex flex-col items-center ${activeSpace.id === s.id ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                    <span className="text-2xl mb-1">{s.icon}</span>
                    <span className="text-[10px] font-bold">{s.name}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {requirements.filter(r => r.spaceId === activeSpace.id).map(req => (
                  <div key={req.id} className={`p-4 rounded-xl border ${req.status === 'locked' ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {req.creatorId === 'user_a' ? '主理人' : '合伙人'} 提议
                      </span>
                      {req.status === 'locked' && <div className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded flex items-center gap-1"><Lock size={10}/> 已锁定</div>}
                    </div>
                    <p className="text-sm font-medium mb-3">{req.text}</p>
                    {req.status !== 'locked' && (
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                        <button onClick={() => handleVote(req.id, 'disagree')} className={`p-1.5 rounded-md ${req.votes?.[currentUser.id] === 'disagree' ? 'text-orange-500' : 'text-slate-300'}`}><XCircle size={20}/></button>
                        <button onClick={() => handleVote(req.id, 'agree')} className={`p-1.5 rounded-md ${req.votes?.[currentUser.id] === 'agree' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}><CheckCircle2 size={20}/></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddRequirement} className="flex gap-2">
                <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} placeholder="输入想法..." className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-slate-900" />
                <button type="submit" className="bg-slate-900 text-white rounded-xl px-4"><Send size={18}/></button>
              </form>
            </div>
          )}

          {/* 预算和工期部分保持原样... */}
          {activeTab === 'budget' && (
             <div className="space-y-6">
               <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">已支出总计</div>
                 <div className="text-3xl font-light mb-4">¥{totalSpent.toLocaleString()}</div>
                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-400 transition-all duration-1000" style={{width: `${(totalSpent/totalBudget)*100}%`}}></div>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 {Object.values(categories).map(c => (
                   <div key={c.id} className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                     <div className="text-[10px] font-bold text-slate-400 mb-1">{c.name}</div>
                     <div className="text-sm font-bold">¥{(c.allocated - c.spent).toLocaleString()}</div>
                   </div>
                 ))}
               </div>
             </div>
          )}
        </main>

        {/* Footer Nav */}
        <nav className="fixed bottom-0 w-full max-w-[400px] bg-white border-t border-slate-100 flex h-16 px-4 z-20">
          {['spaces', 'budget', 'timeline'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeTab === t ? 'text-slate-900' : 'text-slate-300'}`}>
              {t === 'spaces' && <LayoutDashboard size={20}/>}
              {t === 'budget' && <Wallet size={20}/>}
              {t === 'timeline' && <CalendarClock size={20}/>}
              <span className="text-[9px] font-bold uppercase tracking-widest">{t === 'spaces' ? '基准' : t === 'budget' ? '预算' : '工期'}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}