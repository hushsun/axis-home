import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Lock, Unlock, MessageSquare, CheckCircle2, XCircle, Send, 
  User, LayoutDashboard, Wallet, CalendarClock, AlertTriangle, 
  ArrowRightLeft, Check, Plus, Coins, Pencil, Trash2, Save, LogOut, ShieldCheck,
  Settings2, PlusCircle, ClipboardCheck, History, CornerDownRight, PieChart, ChevronRight, ChevronLeft, 
  TrendingDown, TrendingUp, Droplets, Info, Layers, Image as ImageIcon, BookOpen, UploadCloud, Maximize2, X,
  Activity, Camera, MessageCircle, Reply, MoreHorizontal
} from 'lucide-react';

// ==========================================
// 1. 核心辅助组件：智能 Logo
// ==========================================
const AxisLogo = ({ size = "md" }) => {
  const [imgError, setImgError] = useState(false);
  const sizes = {
    sm: "w-8 h-8 rounded-lg p-0.5",
    md: "w-16 h-16 rounded-2xl p-1",
    lg: "w-24 h-24 rounded-3xl p-1.5"
  };
  if (imgError) {
    return (
      <div className={`${sizes[size]} bg-slate-900 flex items-center justify-center shadow-lg border border-slate-700`}>
        <span className="text-white font-black italic tracking-tighter text-center" style={{ fontSize: size === 'lg' ? '24px' : '12px' }}>AX</span>
      </div>
    );
  }
  return (
    <div className={`${sizes[size]} bg-white flex items-center justify-center shadow-2xl overflow-hidden border border-slate-100`}>
      <img src="/logo192.png" alt="Axis Logo" className="w-full h-full object-contain" onError={() => setImgError(true)} />
    </div>
  );
};

// ==========================================
// 2. 交互式 SVG 饼图组件
// ==========================================
const BudgetPieChart = ({ categories, onSelect }) => {
  const totalCategoryBudget = useMemo(() => 
    categories.reduce((acc, cat) => acc + cat.items.reduce((s, i) => s + i.budget, 0), 0)
  , [categories]);

  let cumulativePercent = 0;
  const colors = ["#06b6d4", "#3b82f6", "#8b5cf6", "#f43f5e", "#f59e0b", "#10b981", "#ec4899", "#f97316"];

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="relative flex flex-col items-center py-6 font-sans">
      <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-64 h-64 -rotate-90 transform drop-shadow-2xl transition-all duration-700">
        {totalCategoryBudget === 0 ? (
          <circle cx="0" cy="0" r="1" fill="#f1f5f9" className="opacity-50" />
        ) : (
          categories.map((cat, index) => {
            const catBudget = cat.items.reduce((s, i) => s + i.budget, 0);
            if (catBudget <= 0) return null;
            
            const percent = catBudget / totalCategoryBudget;
            if (percent >= 0.999) {
              return (
                <circle key={cat.id} cx="0" cy="0" r="1" fill={colors[index % colors.length]} 
                  className="cursor-pointer hover:opacity-90 transition-opacity outline-none" onClick={() => onSelect(cat.id)} />
              );
            }

            const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
            cumulativePercent += percent;
            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
            const largeArcFlag = percent > 0.5 ? 1 : 0;
            
            return (
              <path key={cat.id} d={`M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`}
                fill={colors[index % colors.length]} className="cursor-pointer hover:opacity-90 transition-opacity outline-none"
                onClick={() => onSelect(cat.id)}
              />
            );
          })
        )}
        <circle cx="0" cy="0" r="0.55" fill="white" />
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] text-center pointer-events-none">
        <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Ratio</div>
        <div className="text-xs font-black text-slate-900 tracking-tighter italic leading-none text-center">资金<br/>结构</div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-10 px-2 w-full">
        {categories.map((cat, index) => {
           const catBudget = cat.items.reduce((s, i) => s + i.budget, 0);
           const percent = totalCategoryBudget > 0 ? ((catBudget / totalCategoryBudget) * 100).toFixed(1) : 0;
           return (
             <button key={cat.id} onClick={() => onSelect(cat.id)} className="flex items-center gap-2.5 text-left group transition-transform active:scale-95 leading-none">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: colors[index % colors.length] }}></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-900 leading-tight uppercase truncate max-w-[120px]">{cat.name}</span>
                  <span className="text-[8px] font-bold text-slate-400 tabular-nums">{percent}%占比</span>
                </div>
             </button>
           );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 3. 初始预设数据
// ==========================================
const DEFAULT_SPACES = [
  { id: 's_entrance', name: '玄关', icon: '👟' },
  { id: 's_living', name: '客厅', icon: '🛋️' },
  { id: 's_dining', name: '餐厅', icon: '🍽️' },
  { id: 's_master_br', name: '主卧', icon: '🛏️' },
  { id: 's_kids_room', name: '儿童房', icon: '👶' },
  { id: 's_study', name: '多功能房', icon: '📚' },
  { id: 's_kitchen', name: '厨房', icon: '🍳' },
  { id: 's_master_ba', name: '主卫', icon: '🚿' },
  { id: 's_guest_ba', name: '次卫', icon: '🚽' }
];

const INITIAL_CATEGORIES = [
  { id: 'c1', name: '结构工程', items: [
    { id: 'i1_1', name: '拆除与砌墙工程', budget: 20000, actual: 0 },
    { id: 'i1_2', name: '封窗/系统窗', budget: 55000, actual: 0 },
    { id: 'i1_3', name: '基础泥木工程', budget: 20000, actual: 0 }
  ]},
  { id: 'c2', name: '水电工程', items: [
    { id: 'i2_1', name: '强弱电施工', budget: 25000, actual: 0 },
    { id: 'i2_2', name: '给排水系统', budget: 15000, actual: 0 },
    { id: 'i2_3', name: '全屋水处理', budget: 20000, actual: 0 },
    { id: 'i2_4', name: '暖通系统(基础)', budget: 30000, actual: 0 }
  ]},
  { id: 'c3', name: '装修主材', items: [
    { id: 'i3_1', name: '地材(木地板/瓷砖)', budget: 65000, actual: 0 },
    { id: 'i3_2', name: '卫浴洁具', budget: 50000, actual: 0 },
    { id: 'i3_3', name: '室内门/踢脚线', budget: 35000, actual: 0 },
    { id: 'i3_4', name: '涂料/墙面艺术', budget: 25000, actual: 0 },
    { id: 'i3_5', name: '厨卫吊顶与照明', budget: 15000, actual: 0 }
  ]},
  { id: 'c4', name: '全屋定制', items: [
    { id: 'i4_1', name: '玄关/走廊收纳', budget: 25000, actual: 0 },
    { id: 'i4_2', name: '厨房橱柜', budget: 45000, actual: 0 },
    { id: 'i4_3', name: '主卧衣帽间/次卧柜', budget: 80000, actual: 0 },
    { id: 'i4_4', name: '多功能书房/餐厅柜', budget: 35000, actual: 0 },
    { id: 'i4_5', name: '电视背景墙/护墙', budget: 25000, actual: 0 }
  ]},
  { id: 'c5', name: '家用电器', items: [
    { id: 'i5_1', name: '厨房大电', budget: 55000, actual: 0 },
    { id: 'i5_2', name: '洗烘系统', budget: 25000, actual: 0 },
    { id: 'i5_3', name: '视听与智能家电', budget: 40000, actual: 0 },
    { id: 'i5_4', name: '生活小电', budget: 15000, actual: 0 }
  ]},
  { id: 'c6', name: '家具软装', items: [
    { id: 'i6_1', name: '客厅组合家具', budget: 35000, actual: 0 },
    { id: 'i6_2', name: '餐厅家具', budget: 15000, actual: 0 },
    { id: 'i6_3', name: '卧室床品', budget: 20000, actual: 0 },
    { id: 'i6_4', name: '窗帘布艺', budget: 10000, actual: 0 }
  ]}
];

const INITIAL_TIMELINE = [
  { id: 't_1', date: '2026-03-01', title: '正式启动设计，开始确认各空间需求', phase: 1, phaseName: '第一阶段：深度设计与方案定稿', done: false },
  { id: 't_2', date: '2026-03-15', title: '草图平面布局定案，明确墙体改动方向', phase: 1, phaseName: '第一阶段：深度设计与方案定稿', done: false },
  { id: 't_3', date: '2026-04-01', title: 'CAD平面深化完成，确定插座/水路/灯位坐标', phase: 1, phaseName: '第一阶段：深度设计与方案定稿', done: false },
  { id: 't_4', date: '2026-04-15', title: 'SU模型推敲完成，初步确定空间透视关系', phase: 1, phaseName: '第一阶段：深度设计与方案定稿', done: false },
  { id: 't_5', date: '2026-04-30', title: 'SU模型深化完成，空间比例、立面细节全面定稿', phase: 1, phaseName: '第一阶段：深度设计与方案定稿', done: false },
  { id: 't_6', date: '2026-05-20', title: '全套施工图交付完成（含节点大样）', phase: 1, phaseName: '第一阶段：深度设计与方案定稿', done: false },
  { id: 't_7', date: '2026-05-31', title: '主材选样确认，瓷砖、地板、卫浴及涂料样板封样', phase: 1, phaseName: '第一阶段：深度设计与方案定稿', done: false },
  { id: 't_8', date: '2026-06-10', title: '预订系统窗（下单生产，确保9月初能封窗）', phase: 2, phaseName: '第二阶段：物资预订与交房准备', done: false },
  { id: 't_9', date: '2026-07-15', title: '全屋定制初步选色、五金配件及板材型号锁定', phase: 2, phaseName: '第二阶段：物资预订与交房准备', done: false },
  { id: 't_10', date: '2026-08-10', title: '选定全屋家电型号，向设计师交付精准尺寸图', phase: 2, phaseName: '第二阶段：物资预订与交房准备', done: false },
  { id: 't_11', date: '2026-08-31', title: '房屋正式交房，现场复核原始结构', phase: 2, phaseName: '第二阶段：物资预订与交房准备', done: false },
  { id: 't_12', date: '2026-09-05', title: '正式开工，办理装修证，完成工地成品保护', phase: 3, phaseName: '第三阶段：基础施工与隐蔽工程', done: false },
  { id: 't_13', date: '2026-09-07', title: '开始结构拆改及铲墙皮（周一启动）', phase: 3, phaseName: '第三阶段：基础施工与隐蔽工程', done: false },
  { id: 't_14', date: '2026-09-15', title: '结构拆改完成，开始新砌墙体及门洞修整', phase: 3, phaseName: '第三阶段：基础施工与隐蔽工程', done: false },
  { id: 't_15', date: '2026-09-21', title: '系统窗外框安装', phase: 3, phaseName: '第三阶段：基础施工与隐蔽工程', done: false },
  { id: 't_16', date: '2026-09-23', title: '水电工进场，强弱电、给排水开槽及布线', phase: 3, phaseName: '第三阶段：基础施工与隐蔽工程', done: false },
  { id: 't_17', date: '2026-10-16', title: '水电验收完成，进行全屋水压及电路检测', phase: 3, phaseName: '第三阶段：基础施工与隐蔽工程', done: false },
  { id: 't_18', date: '2026-10-19', title: '中央空调、新风系统、全屋地暖安装', phase: 3, phaseName: '第三阶段：基础施工与隐蔽工程', done: false },
  { id: 't_19', date: '2026-10-30', title: '地暖回填及地面找平完成', phase: 3, phaseName: '第三阶段：基础施工与隐蔽工程', done: false },
  { id: 't_20', date: '2026-11-02', title: '木工进场，吊顶造型、无主灯基层施工', phase: 4, phaseName: '第四阶段：泥木攻坚与春节停工', done: false },
  { id: 't_21', date: '2026-11-10', title: '泥工进场，卫生间防水施工及48小时闭水试验', phase: 4, phaseName: '第四阶段：泥木攻坚与春节停工', done: false },
  { id: 't_22', date: '2026-11-16', title: '开始瓷砖铺贴', phase: 4, phaseName: '第四阶段：泥木攻坚与春节停工', done: false },
  { id: 't_23', date: '2026-12-15', title: '泥木基础完工，墙面找平完成', phase: 4, phaseName: '第四阶段：泥木攻坚与春节停工', done: false },
  { id: 't_24', date: '2026-12-17', title: '全屋定制最终精准复测', phase: 4, phaseName: '第四阶段：泥木攻坚与春节停工', done: false },
  { id: 't_25', date: '2026-12-22', title: '定制工厂正式下单排产锁定档期', phase: 4, phaseName: '第四阶段：泥木攻坚与春节停工', done: false },
  { id: 't_26', date: '2027-01-04', title: '油漆工进场，批刮全屋第一、二遍腻子', phase: 4, phaseName: '第四阶段：泥木攻坚与春节停工', done: false },
  { id: 't_27', date: '2027-01-15', title: '工人返乡，工地停工', phase: 4, phaseName: '第四阶段：泥木攻坚与春节停工', done: false },
  { id: 't_28', date: '2027-02-14', title: '春节停工期结束（利用冬季干燥期让腻子干透）', phase: 4, phaseName: '第四阶段：泥木攻坚与春节停工', done: false },
  { id: 't_29', date: '2027-02-15', title: '工人回沪复工，开始腻子精磨及喷涂', phase: 4, phaseName: '第四阶段：泥木攻坚与春节停工', done: false },
  { id: 't_30', date: '2027-03-01', title: '全屋定制柜体及护墙板进场安装', phase: 5, phaseName: '第五阶段：硬装封口与半年散味期', done: false },
  { id: 't_31', date: '2027-03-15', title: '木地板铺设、室内门及踢脚线安装', phase: 5, phaseName: '第五阶段：硬装封口与半年散味期', done: false },
  { id: 't_32', date: '2027-03-25', title: '灯具、开关面板、卫浴五金安装', phase: 5, phaseName: '第五阶段：硬装封口与半年散味期', done: false },
  { id: 't_33', date: '2027-03-31', title: '硬装施工正式完工，全屋开荒保洁', phase: 5, phaseName: '第五阶段：硬装封口与半年散味期', done: false },
  { id: 't_34', date: '2027-04-01', title: '正式开始长期通风散味（配合新风）', phase: 5, phaseName: '第五阶段：硬装封口与半年散味期', done: false },
  { id: 't_35', date: '2027-05-15', title: '全屋大家电进场安装及联网调试', phase: 5, phaseName: '第五阶段：硬装封口与半年散味期', done: false },
  { id: 't_36', date: '2027-06-01', title: '活动家具陆续进场', phase: 5, phaseName: '第五阶段：硬装封口与半年散味期', done: false },
  { id: 't_37', date: '2027-07-01', title: '环保治理公司上门检测，二次甲醛治理', phase: 5, phaseName: '第五阶段：硬装封口与半年散味期', done: false },
  { id: 't_38', date: '2027-08-10', title: '环保验收合格，最终检测报告确认', phase: 5, phaseName: '第五阶段：硬装封口与半年散味期', done: false },
  { id: 't_39', date: '2027-08-15', title: '正式搬入新家', phase: 5, phaseName: '第五阶段：硬装封口与半年散味期', done: false }
];

const INITIAL_POSTS = [];

// --- 算法辅助 ---
const parseDate = (d) => new Date(d.split('-')[0], d.split('-')[1] - 1, d.split('-')[2]);
const getDaysDiff = (d1, d2) => Math.round((parseDate(d2).getTime() - parseDate(d1).getTime()) / 86400000);
const getDaysFromToday = (d1) => Math.round((new Date().setHours(0,0,0,0) - parseDate(d1).getTime()) / 86400000);
const formatTime = (ts) => {
  const d = new Date(ts);
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const getPostImageGridClass = (total, index) => {
  if (total === 1) return 'col-span-12 aspect-[4/3]';
  if (total === 2) return 'col-span-6 aspect-square';
  if (total === 3) return index === 0 ? 'col-span-12 aspect-[21/9]' : 'col-span-6 aspect-square';
  if (total === 4) return 'col-span-6 aspect-square';
  return 'col-span-4 aspect-square';
};

const tagColors = {
  '设计': 'bg-purple-100 text-purple-700',
  '现场': 'bg-emerald-100 text-emerald-700',
  '灵感': 'bg-amber-100 text-amber-700',
  '感触': 'bg-blue-100 text-blue-700',
};

export default function App() {
  // 注入隐藏系统级滚动条的 CSS，提升移动端顺滑感
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // --- 核心全局状态 ---
  const [projectUsers, setProjectUsers] = useState(null); 
  const [currentUser, setCurrentUser] = useState(null);   
  const [loginInput, setLoginInput] = useState('');
  const [loginAvatar, setLoginAvatar] = useState(null);
  const [setupInput, setSetupInput] = useState({ manager: '', partner: '' });
  const [view, setView] = useState('login'); 

  // --- 业务状态库 ---
  const [spaces, setSpaces] = useState(DEFAULT_SPACES);
  const [activeSpace, setActiveSpace] = useState(DEFAULT_SPACES[0]);
  const [activeTab, setActiveTab] = useState('spaces'); 
  const [requirements, setRequirements] = useState([]); 
  const [inputText, setInputText] = useState('');
  const [counterProposalText, setCounterProposalText] = useState(''); 
  
  const [totalBudgetState, setTotalBudgetState] = useState({ value: 800000, status: 'locked', proposal: null });
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [activeCategoryId, setActiveCategoryId] = useState(null); 
  const [timeline, setTimeline] = useState(INITIAL_TIMELINE);

  const [visualsTab, setVisualsTab] = useState('intent');
  const [visualActiveSpaceId, setVisualActiveSpaceId] = useState(DEFAULT_SPACES[0].id);
  const [intentImages, setIntentImages] = useState({}); 
  const [materials, setMaterials] = useState([]); 

  const [feedPosts, setFeedPosts] = useState(INITIAL_POSTS);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ header: '', description: '', images: [], tag: '现场' });
  const [commentInputs, setCommentInputs] = useState({}); 
  const [replyingTo, setReplyingTo] = useState(null); 
  const [expandedComments, setExpandedComments] = useState({});
  
  const [isEditingIntents, setIsEditingIntents] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', remark: '', url: '' });

  const intentFileInputRef = useRef(null);
  const postFileInputRef = useRef(null);

  const [isManagingSpaces, setIsManagingSpaces] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false); 
  const [isManagingTimeline, setIsManagingTimeline] = useState(false); 
  const [showAddSpaceModal, setShowAddSpaceModal] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [editModal, setEditModal] = useState(null); 

  // --- 辅助函数：获取用户信息 (安全防崩) ---
  const getUserInfo = (id) => {
    if (projectUsers && projectUsers[id]) return projectUsers[id];
    return { id, name: '未知', color: 'bg-slate-300', textColor: 'text-white', avatar: null };
  };

  // --- 预算计算 ---
  const spentTotal = useMemo(() => categories.reduce((sum, cat) => sum + cat.items.reduce((s, i) => s + (i.actual || 0), 0), 0), [categories]);
  const committedTotal = useMemo(() => categories.reduce((sum, cat) => sum + cat.items.reduce((s, i) => s + (i.actual === 0 ? i.budget : 0), 0), 0), [categories]);
  const displayTotalBudget = useMemo(() => totalBudgetState.proposal ? totalBudgetState.proposal.value : totalBudgetState.value, [totalBudgetState]);
  const remainingTotal = Math.max(0, displayTotalBudget - spentTotal - committedTotal);
  const planTotalSum = useMemo(() => categories.reduce((sum, cat) => sum + cat.items.reduce((s, i) => s + i.budget, 0), 0), [categories]);
  const isPlanOverBudget = planTotalSum > displayTotalBudget;
  const activeCategory = useMemo(() => categories.find(c => c.id === activeCategoryId), [categories, activeCategoryId]);

  // --- 基础处理逻辑 ---
  const handleSetup = (e) => {
    e.preventDefault();
    if (!setupInput.manager || !setupInput.partner) return;
    setProjectUsers({
      user_a: { id: 'user_a', name: setupInput.manager, role: '主理人', color: 'bg-slate-900', textColor: 'text-white', avatar: null },
      user_b: { id: 'user_b', name: setupInput.partner, role: '合伙人', color: 'bg-stone-500', textColor: 'text-white', avatar: null }
    });
    setView('login');
  };

  const handleLoginAvatarUpload = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    setLoginAvatar(URL.createObjectURL(file));
    e.target.value = null;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    let matchedId = null;
    if (loginInput === projectUsers?.user_a.name) matchedId = 'user_a';
    else if (loginInput === projectUsers?.user_b.name) matchedId = 'user_b';
    
    if (matchedId) {
      const updatedUser = { ...projectUsers[matchedId] };
      if (loginAvatar) {
          updatedUser.avatar = loginAvatar;
          setProjectUsers(prev => ({ ...prev, [matchedId]: updatedUser }));
      }
      setCurrentUser(updatedUser);
    } else {
      alert('身份未识别，请输入正确的姓名');
    }
  };

  const addRequirement = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;
    setRequirements([...requirements, {
      id: Date.now().toString(), spaceId: activeSpace.id, text: inputText.trim(),
      creatorId: currentUser.id, status: 'pending', votes: { [currentUser.id]: 'agree' },
      history: [], currentRound: 1
    }]);
    setInputText('');
  };

  const handleVote = (reqId, vote) => {
    setRequirements(prev => prev.map(req => {
      if (req.id !== reqId) return req;
      const newVotes = { ...req.votes, [currentUser.id]: vote };
      let newStatus = req.status;
      if (newVotes.user_a === 'agree' && newVotes.user_b === 'agree') newStatus = 'locked';
      else if (vote === 'disagree') {
        if (req.currentRound >= 3) newStatus = 'unresolved';
        else newStatus = 'disputed';
      }
      return { ...req, votes: newVotes, status: newStatus };
    }));
  };

  const submitCounterProposal = (reqId) => {
    if (!counterProposalText.trim()) return;
    setRequirements(prev => prev.map(req => {
      if (req.id !== reqId) return req;
      return {
        ...req,
        text: counterProposalText.trim(),
        creatorId: currentUser.id,
        status: 'pending',
        votes: { [currentUser.id]: 'agree' },
        history: [...req.history, { round: req.currentRound, text: req.text, creatorId: req.creatorId }],
        currentRound: req.currentRound + 1
      };
    }));
    setCounterProposalText('');
  };

  const executeEditAction = (e) => {
    e.preventDefault();
    const { type, catId, itemId, val1, val2, name } = editModal;
    if (type === 'total_budget') setTotalBudgetState(prev => ({ ...prev, status: 'pending', proposal: { value: Number(val1), by: currentUser.id } }));
    else if (type === 'add_item') setCategories(prev => prev.map(c => c.id === catId ? { ...c, items: [...c.items, { id: Date.now().toString(), name, budget: Number(val1), actual: 0 }] } : c));
    else if (type === 'edit_item_full') setCategories(prev => prev.map(c => c.id === catId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, name, budget: Number(val1), actual: Number(val2) } : i) } : c));
    else if (type === 'add_category') setCategories([...categories, { id: `c_${Date.now()}`, name, items: [] }]);
    else if (type === 'rename_category') setCategories(prev => prev.map(c => c.id === catId ? { ...c, name } : c));
    else if (type === 'edit_timeline') setTimeline(prev => prev.map(t => t.id === itemId ? { ...t, date: val1, title: name } : t));
    else if (type === 'add_timeline_node') {
      const targetDate = new Date(val1).getTime();
      let closestPhase = 5;
      let closestPhaseName = '自定义阶段';
      if(timeline.length > 0) {
        const sorted = [...timeline].sort((a,b) => Math.abs(new Date(a.date).getTime() - targetDate) - Math.abs(new Date(b.date).getTime() - targetDate));
        closestPhase = sorted[0].phase;
        closestPhaseName = sorted[0].phaseName;
      }
      setTimeline(prev => [...prev, { id: `t_${Date.now()}`, date: val1, title: name, phase: closestPhase, phaseName: closestPhaseName, done: false }]);
    }
    setEditModal(null);
  };

  const confirmBudget = (agree) => {
    setTotalBudgetState(prev => {
      if (agree && prev.proposal) return { value: prev.proposal.value, status: 'locked', proposal: null };
      return { ...prev, status: 'locked', proposal: null };
    });
  };

  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    if (activeCategoryId === id) setActiveCategoryId(null);
  };

  const deleteSpace = (id) => {
    if (spaces.length <= 1) {
      alert("请至少保留一个空间维度！");
      return;
    }
    const updatedSpaces = spaces.filter(s => s.id !== id);
    setSpaces(updatedSpaces);
    if (activeSpace.id === id) setActiveSpace(updatedSpaces[0]);
    if (visualActiveSpaceId === id) setVisualActiveSpaceId(updatedSpaces[0].id);
  };
  
  const deleteTimelineNode = (id) => {
    setTimeline(prev => prev.filter(t => t.id !== id));
  };

  const handleAddSpaceSubmit = (e) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;
    const newSpace = { id: `s_${Date.now()}`, name: newSpaceName.trim(), icon: '🏠' };
    setSpaces([...spaces, newSpace]);
    setActiveSpace(newSpace);
    setNewSpaceName('');
    setShowAddSpaceModal(false);
  };

  const toggleTimelineNodeDone = (id) => {
    setTimeline(prev => prev.map(n => n.id === id ? { ...n, done: !n.done } : n));
  };

  // --- 视觉模块逻辑 ---
  const handleIntentUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const currentIntents = intentImages[visualActiveSpaceId] || [];
    if (currentIntents.length >= 5) return;
    setIntentImages(prev => ({
      ...prev, [visualActiveSpaceId]: [...(prev[visualActiveSpaceId] || []), { id: Date.now().toString(), url: URL.createObjectURL(file) }]
    }));
    e.target.value = null; 
  };

  const handleDeleteIntent = (imageId) => {
    setIntentImages(prev => ({
      ...prev, [visualActiveSpaceId]: prev[visualActiveSpaceId].filter(img => img.id !== imageId)
    }));
  };

  const handleMaterialImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewMaterial(prev => ({ ...prev, url: URL.createObjectURL(file) }));
    e.target.value = null;
  };

  const submitNewMaterial = (e) => {
    e.preventDefault();
    if (!newMaterial.url || !newMaterial.title.trim()) return;
    setMaterials([{ id: Date.now().toString(), ...newMaterial }, ...materials]);
    setShowMaterialModal(false);
    setNewMaterial({ title: '', remark: '', url: '' });
  };

  const deleteMaterial = (id) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  // --- 动态模块处理 ---
  const handlePostImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (newPost.images.length + files.length > 9) {
        alert('最多只能上传9张图片！'); return;
    }
    const newImages = files.map(file => ({
      id: Date.now() + Math.random().toString(),
      url: URL.createObjectURL(file)
    }));
    setNewPost(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    e.target.value = null;
  };

  const handleAddPost = (e) => {
    e.preventDefault();
    if(!newPost.header.trim()) return;
    const post = { id: `p_${Date.now()}`, creatorId: currentUser.id, ...newPost, timestamp: Date.now(), comments: [] };
    setFeedPosts([post, ...feedPosts]);
    setShowPostModal(false);
    setNewPost({ header: '', description: '', images: [], tag: '现场' });
  };

  const handleAddComment = (postId) => {
    const text = commentInputs[postId];
    if(!text || !text.trim()) return;
    setFeedPosts(prev => prev.map(post => {
        if(post.id !== postId) return post;
        if(replyingTo && replyingTo.postId === postId) {
            return {
                ...post, comments: post.comments.map(c => c.id === replyingTo.commentId ? { ...c, replies: [...(c.replies||[]), { id: `r_${Date.now()}`, creatorId: currentUser.id, text: text.trim(), timestamp: Date.now() }] } : c)
            };
        } else {
            return { ...post, comments: [...post.comments, { id: `c_${Date.now()}`, creatorId: currentUser.id, text: text.trim(), timestamp: Date.now(), replies: [] }] };
        }
    }));
    setCommentInputs(prev => ({...prev, [postId]: ''}));
    setReplyingTo(null);
  };

  // ==========================================
  // 渲染视图
  // ==========================================

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-900">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center flex flex-col items-center">
            <AxisLogo size="lg" />
            <h1 className="text-2xl font-black mt-6 tracking-tight italic">Axis 共线</h1>
            <p className="text-slate-400 text-[10px] mt-2 uppercase tracking-[0.2em] font-bold">Consensus Decision Ledger</p>
          </div>
          {(!projectUsers || view === 'setup') ? (
            <form onSubmit={handleSetup} className="space-y-4">
              <div className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-100 space-y-4">
                <input type="text" required value={setupInput.manager} onChange={e => setSetupInput({...setupInput, manager: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[16px] font-bold outline-none focus:ring-2 focus:ring-slate-900 shadow-inner" placeholder="主理人姓名" />
                <input type="text" required value={setupInput.partner} onChange={e => setSetupInput({...setupInput, partner: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[16px] font-bold outline-none focus:ring-2 focus:ring-slate-900 shadow-inner" placeholder="合伙人姓名" />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all uppercase text-xs tracking-widest">Initialize</button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-100 flex flex-col items-center gap-4">
                <div className="relative w-24 h-24 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden hover:border-slate-400 transition-colors group cursor-pointer shadow-inner">
                  {loginAvatar ? (
                    <img src={loginAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 group-hover:text-slate-600">
                      <Camera size={24} />
                      <span className="text-[9px] font-black uppercase mt-1 tracking-widest">上传头像</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleLoginAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <input type="text" required value={loginInput} onChange={e => setLoginInput(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-center text-[16px] font-black focus:ring-2 focus:ring-slate-900 outline-none shadow-inner" placeholder="您的姓名" />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all uppercase text-xs tracking-widest">Enter Space</button>
              <button type="button" onClick={() => setView('setup')} className="w-full text-slate-300 text-[10px] font-black uppercase tracking-widest py-2">Create New Project</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const phaseStyleMap = {
    1: { dot: 'bg-sky-500', text: 'text-sky-600', from: 'from-sky-500', to: 'to-sky-500' },
    2: { dot: 'bg-indigo-500', text: 'text-indigo-600', from: 'from-indigo-500', to: 'to-indigo-500' },
    3: { dot: 'bg-amber-500', text: 'text-amber-600', from: 'from-amber-500', to: 'to-amber-500' },
    4: { dot: 'bg-rose-500', text: 'text-rose-600', from: 'from-rose-500', to: 'to-rose-500' },
    5: { dot: 'bg-emerald-500', text: 'text-emerald-600', from: 'from-emerald-500', to: 'to-emerald-500' }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex justify-center sm:py-10 font-sans selection:bg-sky-100">
      {/* 核心修复：h-[100dvh] 确保容器不被撑破，从而让内部 overflow 滚动生效，保护底部导航不被遮挡 */}
      <div className="w-full max-w-[400px] bg-white h-[100dvh] sm:h-[800px] sm:rounded-[40px] shadow-2xl relative flex flex-col overflow-hidden border-x border-slate-200">
        
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-5 py-4 pt-5 sm:pt-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <AxisLogo size="sm" />
            <h1 className="text-xs font-black tracking-widest uppercase italic">Axis</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white rounded-full p-1 pl-3 shadow-sm border border-slate-100">
               <span className="text-[10px] font-bold text-slate-900">{currentUser.role}: {currentUser.name}</span>
               {currentUser.avatar ? (
                  <img src={currentUser.avatar} className="w-6 h-6 rounded-full object-cover shadow-sm" alt="avatar" />
               ) : (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${currentUser.color} ${currentUser.textColor} shadow-sm`}>
                     {currentUser.name.substring(0,1)}
                  </div>
               )}
            </div>
            <button onClick={() => { setCurrentUser(null); setLoginAvatar(null); setLoginInput(''); }} className="text-slate-300 hover:text-red-500 transition-colors p-1"><LogOut size={16} /></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 pb-40 relative scroll-smooth scrollbar-hide">
          
          {/* TAB 1: 基准 */}
          {activeTab === 'spaces' && (
             <div className="animate-in fade-in duration-500 space-y-6">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Dimension Registry</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setIsManagingSpaces(!isManagingSpaces)} className={`p-2 rounded-full shadow-sm transition-all ${isManagingSpaces ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Settings2 size={14}/>
                        </button>
                        <button onClick={() => setShowAddSpaceModal(true)} className="p-2 bg-slate-900 text-white rounded-full shadow-lg active:scale-90 transition-transform"><Plus size={14}/></button>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {spaces.map(s => (
                        <button key={s.id} onClick={() => !isManagingSpaces && setActiveSpace(s)} className={`p-4 rounded-2xl border transition-all relative ${activeSpace.id === s.id && !isManagingSpaces ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105 z-10' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}>
                            {isManagingSpaces && (
                                <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md" onClick={(e) => { e.stopPropagation(); deleteSpace(s.id); }}>
                                    <Trash2 size={10}/>
                                </div>
                            )}
                            <span className="text-xl mb-1 block leading-none">{s.icon}</span>
                            <span className="text-[10px] font-bold uppercase truncate w-full block tracking-tighter">{s.name}</span>
                        </button>
                    ))}
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-xl font-black italic text-slate-900">{activeSpace.name} 的想法</h3>
                    {requirements.filter(r => r.spaceId === activeSpace.id).length === 0 && (
                        <div className="py-20 text-center opacity-40 italic text-sm font-bold text-slate-400">暂无执念...</div>
                    )}
                    {requirements.filter(r => r.spaceId === activeSpace.id).map(req => {
                        const isLocked = req.status === 'locked';
                        const isDisputed = req.status === 'disputed';
                        const isUnresolved = req.status === 'unresolved';
                        const isAuthor = req.creatorId === currentUser.id;
                        const creatorInfo = getUserInfo(req.creatorId);

                        return (
                          <div key={req.id} className={`p-5 rounded-[28px] border transition-all ${isLocked ? 'bg-slate-50 border-slate-200' : isUnresolved ? 'bg-red-50 border-red-100' : isDisputed ? 'bg-orange-50/50 border-orange-100 shadow-sm' : 'bg-white border-slate-100 shadow-sm'}`}>
                            <div className="flex justify-between items-center mb-4 border-b border-slate-100/50 pb-3">
                              <div className="flex items-center gap-2">
                                {creatorInfo.avatar ? (
                                  <img src={creatorInfo.avatar} className="w-5 h-5 rounded-full object-cover shadow-sm" alt="avatar" />
                                ) : (
                                  <span className={`w-2 h-2 rounded-full ${creatorInfo.color}`}></span>
                                )}
                                <span className="text-xs font-black text-slate-500">{creatorInfo.name} 提案</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">R.{req.currentRound}</span>
                                {isLocked && <div className="text-[9px] bg-emerald-500 text-white px-2 rounded-full flex items-center gap-1 shadow-sm font-bold italic tracking-tighter"><Check size={10}/> 锁定</div>}
                                {isUnresolved && <div className="text-[9px] bg-red-600 text-white px-2 rounded-full flex items-center gap-1 shadow-sm font-bold italic tracking-tighter"><AlertTriangle size={10}/> 最终分歧</div>}
                              </div>
                            </div>
                            {req.history.map((h, i) => (
                              <div key={i} className="mb-2 pl-3 border-l-2 border-slate-200 opacity-40">
                                <p className="text-xs line-through text-slate-400 leading-snug font-mono italic">{h.text}</p>
                              </div>
                            ))}
                            <p className={`text-base font-semibold leading-relaxed ${isLocked ? 'text-slate-500 opacity-60' : isUnresolved ? 'text-red-700' : 'text-slate-800'}`}>
                              {isDisputed && <CornerDownRight size={14} className="inline mr-2 text-orange-400" />}
                              {req.text}
                            </p>
                            {!isLocked && !isUnresolved && !isDisputed && (
                              <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-100">
                                <button onClick={() => !isAuthor && handleVote(req.id, 'disagree')} disabled={isAuthor} className={`transition-all ${isAuthor ? 'opacity-20 cursor-not-allowed scale-90' : 'text-slate-300 hover:text-red-500 active:scale-90'}`}><XCircle size={24}/></button>
                                <button onClick={() => handleVote(req.id, 'agree')} className="bg-slate-100 text-slate-900 p-2 rounded-xl active:scale-90 transition-all shadow-sm font-black italic"><CheckCircle2 size={24}/></button>
                              </div>
                            )}
                            {isDisputed && (
                                <div className="mt-4 pt-4 border-t border-orange-100 animate-in slide-in-from-top-2">
                                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2 italic font-bold">输入修正建议 / ROUND {req.currentRound}：</p>
                                    <div className="flex gap-2">
                                        <input type="text" value={counterProposalText} onChange={e => setCounterProposalText(e.target.value)} placeholder="输入修正后的 Plan B..." className="flex-1 bg-white border border-orange-200 rounded-xl px-4 py-2 text-[16px] focus:ring-1 focus:ring-orange-400 outline-none shadow-inner" />
                                        <button onClick={() => submitCounterProposal(req.id)} className="bg-orange-500 text-white px-4 rounded-xl shadow-lg active:scale-90 transition-transform font-black"><Send size={16}/></button>
                                    </div>
                                </div>
                            )}
                          </div>
                        );
                    })}
                </div>
             </div>
          )}

          {/* TAB 2: 预算 */}
          {activeTab === 'budget' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center mb-4 text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                  <span>Total Project Capital 总预算</span>
                  <button onClick={() => setEditModal({ type: 'total_budget', title: '修改总预算', val1: displayTotalBudget })} className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"><Pencil size={12} /></button>
                </div>
                {totalBudgetState.status === 'pending' ? (
                  <div className="bg-amber-50 rounded-[24px] p-4 border border-amber-100 flex justify-between items-center animate-in zoom-in shadow-sm">
                    <div>
                        <div className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mb-1">提案总容量</div>
                        <div className="text-2xl font-black text-amber-600 font-mono tracking-tighter italic">¥{totalBudgetState.proposal.value.toLocaleString()}</div>
                    </div>
                    {totalBudgetState.proposal.by !== currentUser.id && (
                        <div className="flex gap-2">
                          <button onClick={() => confirmBudget(false)} className="bg-white p-2 rounded-xl text-slate-400 shadow-sm transition-all active:scale-90"><XCircle size={18}/></button>
                          <button onClick={() => confirmBudget(true)} className="bg-slate-900 p-2 rounded-xl text-white shadow-md transition-all active:scale-90"><CheckCircle2 size={18}/></button>
                        </div>
                    )}
                  </div>
                ) : (
                  <div className="text-4xl font-black tracking-tighter text-slate-900 font-mono italic">¥{totalBudgetState.value.toLocaleString()}</div>
                )}
              </div>

              {/* 水池 UI */}
              <div className="relative h-[440px] w-full bg-slate-50 border border-slate-200 rounded-[56px] overflow-hidden shadow-inner flex flex-col-reverse transition-all">
                 <div className="bg-gradient-to-t from-sky-800 to-sky-600 transition-all duration-700 shadow-[0_-8px_40px_rgba(7,89,133,0.4)] relative flex items-center px-8" 
                      style={{ height: `${Math.min(100, (spentTotal / (displayTotalBudget || 1)) * 100)}%`, minHeight: spentTotal > 0 ? '60px' : '0px' }}>
                    <div className="text-white">
                        <div className="flex items-center gap-1 opacity-60 mb-1">
                            <Droplets size={10}/>
                            <span className="text-[9px] font-black uppercase tracking-widest italic">Invoiced 已付</span>
                        </div>
                        <span className="text-2xl font-black tracking-tighter font-mono italic">¥{spentTotal.toLocaleString()}</span>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/20 backdrop-blur-sm"></div>
                 </div>
                 <div className="bg-sky-200/40 transition-all duration-1000 border-t border-white/50 relative flex items-center px-8" 
                      style={{ height: `${Math.min(100, (committedTotal / (displayTotalBudget || 1)) * 100)}%`, minHeight: committedTotal > 0 ? '50px' : '0px' }}>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-sky-600 uppercase tracking-widest mb-1 opacity-80 italic font-bold">Committed 待支</span>
                        <span className="text-lg font-black text-sky-600 font-mono tracking-tight italic">¥{committedTotal.toLocaleString()}</span>
                    </div>
                 </div>
                 <div className="flex-1 flex items-center px-8 relative" style={{ minHeight: '60px' }}>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1 font-bold italic">Remaining 剩余容量</span>
                        <span className="text-xl font-black text-slate-400 font-mono italic tracking-tighter">¥{remainingTotal.toLocaleString()}</span>
                    </div>
                 </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-[40px] p-6 shadow-sm overflow-hidden mb-12">
                <div className="flex justify-between items-center mb-2 px-2">
                  <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Allocation Matrix</h3>
                  <button onClick={() => setIsManagingCategories(true)} className="flex items-center gap-1.5 text-[9px] font-bold text-slate-900 bg-slate-50 px-3 py-1.5 rounded-full uppercase tracking-tighter transition-all hover:bg-slate-100 shadow-sm border border-slate-100">
                    <Layers size={12}/> 类别规划
                  </button>
                </div>
                <div className="px-2 mb-2 flex items-baseline gap-2">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-mono tracking-tighter">Planned Total:</span>
                   <span className={`text-xl font-black tracking-tight font-mono ${isPlanOverBudget ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
                     ¥{planTotalSum.toLocaleString()}
                   </span>
                   {isPlanOverBudget && <AlertTriangle size={14} className="text-red-600" />}
                </div>
                <BudgetPieChart categories={categories} onSelect={(id) => setActiveCategoryId(id)} />
              </div>
            </div>
          )}

          {/* TAB 3: 清单 */}
          {activeTab === 'summary' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-20">
               <div className="text-center py-6">
                <h2 className="text-2xl font-black tracking-tighter italic uppercase text-slate-900">Collaboration Ledger</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1 text-center italic">Final Decision Baseline</p>
              </div>
              
              {requirements.some(r => r.status === 'unresolved') && (
                <div className="space-y-4 px-1 animate-in zoom-in">
                   <div className="flex items-center gap-2">
                     <AlertTriangle className="text-red-600" size={18} />
                     <h3 className="text-sm font-black text-red-600 uppercase tracking-widest italic">遗留分歧 (需面谈)</h3>
                   </div>
                   {requirements.filter(r => r.status === 'unresolved').map(req => (
                     <div key={req.id} className="p-5 bg-red-50 border border-red-100 rounded-[32px] shadow-sm">
                        <p className="text-sm font-bold text-red-800 leading-snug"><span className="opacity-40 font-mono italic">[{spaces.find(s => s.id === req.spaceId)?.name}]</span> {req.text}</p>
                     </div>
                   ))}
                </div>
              )}

              <div className="space-y-8 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 px-1">
                   <ClipboardCheck className="text-slate-900" size={18} />
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">已达成共识 Baseline</h3>
                </div>
                {spaces.map(space => {
                  const lockedReqs = requirements.filter(r => r.spaceId === space.id && r.status === 'locked');
                  if (lockedReqs.length === 0) return null;
                  return (
                    <div key={space.id} className="relative px-2 mb-8 animate-in fade-in">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">{space.icon}</span>
                        <span className="font-black text-xs uppercase tracking-widest text-slate-400 italic">{space.name}</span>
                      </div>
                      <div className="space-y-5 ml-4 border-l border-slate-100 pl-5 text-slate-700">
                        {lockedReqs.map(req => (
                          <div key={req.id} className="flex gap-3 items-start animate-in fade-in">
                            <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={14} />
                            <p className="text-sm font-bold leading-relaxed">{req.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: 视觉 */}
          {activeTab === 'visuals' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-20">
              <div className="flex bg-slate-200/60 p-1.5 rounded-full mb-6 relative shadow-inner">
                 <button onClick={() => setVisualsTab('intent')} className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-full transition-all relative z-10 ${visualsTab === 'intent' ? 'text-slate-900 shadow-sm bg-white' : 'text-slate-500 hover:text-slate-700'}`}>空间意向</button>
                 <button onClick={() => setVisualsTab('material')} className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-full transition-all relative z-10 ${visualsTab === 'material' ? 'text-slate-900 shadow-sm bg-white' : 'text-slate-500 hover:text-slate-700'}`}>全域材料</button>
              </div>

              {visualsTab === 'intent' && (
                <div className="space-y-6 animate-in slide-in-from-left-4">
                  <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-5 px-5">
                    {spaces.map(s => (
                      <button key={s.id} onClick={() => setVisualActiveSpaceId(s.id)}
                        className={`flex-shrink-0 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border ${
                          visualActiveSpaceId === s.id ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-200'
                        }`}>
                        {s.name}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-end mb-4 px-1">
                     <div>
                       <h3 className="text-xl font-black italic text-slate-900 leading-none">{spaces.find(s=>s.id === visualActiveSpaceId)?.name} 意向定调</h3>
                       <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Max 5 Images Per Space</p>
                     </div>
                     <button onClick={() => setIsEditingIntents(!isEditingIntents)} className={`p-2 rounded-xl transition-all ${isEditingIntents ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400 hover:text-slate-900'}`}>
                        <Settings2 size={16} />
                     </button>
                  </div>

                  <div className="flex flex-col gap-4">
                     {(intentImages[visualActiveSpaceId] || []).map((img) => (
                       <div key={img.id} className="relative rounded-[24px] overflow-hidden shadow-md group bg-slate-100 w-full">
                         <img src={img.url} alt="Intent" className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => !isEditingIntents && setPreviewImage(img.url)} />
                         {isEditingIntents && (
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center animate-in fade-in">
                             <button onClick={() => handleDeleteIntent(img.id)} className="p-4 bg-red-500 text-white rounded-full shadow-xl active:scale-90 transition-transform"><Trash2 size={24}/></button>
                           </div>
                         )}
                       </div>
                     ))}
                  </div>
                  
                  {(() => {
                     const currentCount = (intentImages[visualActiveSpaceId] || []).length;
                     const isFull = currentCount >= 5;
                     return (
                        <div className="mt-6">
                           <input type="file" accept="image/*" ref={intentFileInputRef} onChange={handleIntentUpload} className="hidden" />
                           <button 
                             onClick={() => !isFull && !isEditingIntents && intentFileInputRef.current.click()}
                             disabled={isFull || isEditingIntents}
                             className={`w-full py-6 rounded-[24px] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${
                               isFull ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-400 hover:border-slate-900 hover:text-slate-900 active:scale-95'
                             }`}
                           >
                             {isFull ? (
                               <>
                                 <AlertTriangle size={24} className="text-amber-500" />
                                 <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">精简意向以保证空间调性的一致性</span>
                               </>
                             ) : (
                               <>
                                 <UploadCloud size={28} />
                                 <span className="text-xs font-black uppercase tracking-widest">Upload Key Vision ({currentCount}/5)</span>
                               </>
                             )}
                           </button>
                        </div>
                     );
                  })()}
                </div>
              )}

              {visualsTab === 'material' && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                   <div className="flex justify-between items-center mb-6 px-1">
                      <div>
                        <h3 className="text-xl font-black italic text-slate-900 leading-none">全局材料库</h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Material & Texture Audit</p>
                      </div>
                      <button onClick={() => setShowMaterialModal(true)} className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"><Plus size={18}/></button>
                   </div>
                   
                   {materials.length === 0 && (
                      <div className="py-20 text-center text-slate-300 font-black italic text-sm">暂无材料入库...</div>
                   )}

                   <div className="columns-2 gap-3 space-y-3">
                      {materials.map(m => (
                        <div key={m.id} className="break-inside-avoid bg-white p-2 rounded-[24px] shadow-sm border border-slate-100 group relative">
                           <div className="relative rounded-[16px] overflow-hidden cursor-pointer" onClick={() => setPreviewImage(m.url)}>
                             <img src={m.url} alt={m.title} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                               <Maximize2 className="text-white drop-shadow-md" size={24} />
                             </div>
                           </div>
                           <div className="pt-3 pb-1 px-2">
                             <div className="flex justify-between items-start gap-2">
                               <h4 className="font-black text-sm text-slate-900 leading-snug">{m.title}</h4>
                               <button onClick={() => deleteMaterial(m.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                             </div>
                             {m.remark && <p className="text-[10px] text-slate-500 mt-1.5 font-bold leading-relaxed">{m.remark}</p>}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: 逆推工期 (Timeline) */}
          {activeTab === 'timeline' && (() => {
            const sortedTimeline = [...timeline].sort((a, b) => new Date(a.date) - new Date(b.date));
            
            return (
            <div className="animate-in fade-in duration-500 space-y-6 pt-2 pb-24">
               <div className="flex justify-between items-center mb-8 px-2">
                  <div>
                    <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Project Master Schedule</h2>
                    <p className="text-xl font-black tracking-tight text-slate-900 italic mt-1">全案进度节点推演</p>
                  </div>
                  <button onClick={() => setIsManagingTimeline(true)} className="flex items-center gap-1.5 text-[9px] font-bold text-slate-900 bg-slate-50 px-3 py-1.5 rounded-full uppercase tracking-tighter transition-all hover:bg-slate-100 shadow-sm border border-slate-100">
                    <Layers size={12}/> 节点规划
                  </button>
               </div>

               <div className="relative text-slate-900 ml-2">
                  {sortedTimeline.map((node, index) => {
                    const nextNode = sortedTimeline[index + 1];
                    const diffDays = nextNode ? getDaysDiff(node.date, nextNode.date) : 0;
                    const dynamicPadding = nextNode ? Math.max(32, Math.min(150, diffDays * 3.5)) : 0; 
                    const isFirstOfPhase = index === 0 || sortedTimeline[index - 1].phase !== node.phase;
                    
                    let pastRatio = 0;
                    if (nextNode) {
                       if (diffDays <= 0) {
                          pastRatio = getDaysFromToday(node.date) >= 0 ? 100 : 0;
                       } else {
                          const passedDays = getDaysFromToday(node.date);
                          pastRatio = Math.max(0, Math.min(100, (passedDays / diffDays) * 100));
                       }
                    }

                    const isLate = getDaysFromToday(node.date) > 0 && !node.done;

                    return (
                      <div key={node.id} className="relative flex gap-4 items-start group" style={{ paddingBottom: `${dynamicPadding}px` }}>
                        <div className="flex flex-col items-center absolute left-0 top-4 bottom-0 w-4">
                          <div className={`w-3.5 h-3.5 rounded-full z-10 shadow-sm ring-4 ring-slate-50 relative shrink-0 transition-colors ${node.done ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                          {nextNode && (
                            <div 
                              className="w-1 absolute transition-all"
                              style={{ 
                                top: '14px', bottom: '-16px', 
                                background: `linear-gradient(to bottom, #ef4444 ${pastRatio}%, #e2e8f0 ${pastRatio}%)` 
                              }}
                            ></div>
                          )}
                        </div>

                        <div className="flex-1 ml-6 -mt-1">
                          {isFirstOfPhase && (
                            <div className="text-[10px] font-black uppercase tracking-widest mb-3 px-2.5 py-1 rounded inline-block bg-slate-900 text-white shadow-md">
                              {node.phaseName}
                            </div>
                          )}
                          <div className="flex justify-between items-center bg-white border border-slate-100 hover:border-slate-200 p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
                            <div className="flex-1 cursor-pointer pr-4" onClick={() => setEditModal({ type: 'edit_timeline', itemId: node.id, title: '修改节点计划', name: node.title, val1: node.date })}>
                              <div className={`text-[11px] font-bold font-mono tracking-widest mb-1.5 flex items-center gap-2 ${isLate ? 'text-red-500' : 'text-slate-400'}`}>
                                 {node.date.replace(/-/g, '.')}
                                 {isLate && <span className="bg-red-50 text-red-500 px-1.5 py-0.5 rounded text-[9px] uppercase font-black tracking-tighter">延期预警</span>}
                              </div>
                              <div className={`text-sm font-black leading-snug transition-all ${node.done ? 'text-slate-400 line-through opacity-70' : 'text-slate-800'}`}>{node.title}</div>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleTimelineNodeDone(node.id); }}
                              className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${node.done ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'border-slate-200 text-slate-300 hover:border-emerald-400 hover:text-emerald-400 bg-slate-50'}`}
                            >
                              <Check size={20} strokeWidth={node.done ? 4 : 3} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>
            );
          })()}

          {/* TAB 6: 动态 (Moments Feed) */}
          {activeTab === 'feed' && (
             <div className="animate-in fade-in duration-500 space-y-6 pb-24">
                <div className="space-y-8">
                   {feedPosts.length === 0 && (
                      <div className="py-20 text-center text-slate-300 font-black italic text-sm">暂无项目动态，点击右下角新增...</div>
                   )}
                   {feedPosts.map(post => {
                      const isOwner = post.creatorId === currentUser.id;
                      const author = getUserInfo(post.creatorId);
                      const isExpanded = expandedComments[post.id];
                      const visibleComments = isExpanded ? post.comments : post.comments.slice(-2);

                      return (
                        <div key={post.id} className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100">
                           <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                 {author.avatar ? (
                                    <img src={author.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover shadow-md border border-slate-100" />
                                 ) : (
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs ${author.color} shadow-md`}>
                                      {author.name.substring(0,1)}
                                    </div>
                                 )}
                                 <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-900 leading-none mb-1">{author.name}</span>
                                    <span className="text-[10px] font-bold text-slate-400 font-mono tracking-widest leading-none">{formatTime(post.timestamp)}</span>
                                 </div>
                              </div>
                              <div className="flex gap-2 items-center">
                                <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest ${tagColors[post.tag] || 'bg-slate-100 text-slate-600'}`}>{post.tag}</span>
                                {isOwner && (
                                   <button onClick={() => { if(window.confirm('确认删除动态？')) setFeedPosts(prev=>prev.filter(p=>p.id!==post.id)); }} className="text-slate-300 hover:text-red-500 active:scale-90 p-1">
                                      <Trash2 size={16}/>
                                   </button>
                                )}
                              </div>
                           </div>

                           <h3 className="text-base font-black text-slate-900 mb-2 leading-tight">{post.header}</h3>
                           {post.description && <p className="text-sm font-medium text-slate-600 leading-relaxed mb-4">{post.description}</p>}

                           {post.images.length > 0 && (
                              <div className="grid grid-cols-12 gap-1.5 rounded-xl overflow-hidden mb-4">
                                {post.images.map((img, i) => (
                                  <div key={img.id} className={`relative overflow-hidden cursor-pointer group ${getPostImageGridClass(post.images.length, i)}`} onClick={() => setPreviewImage(img.url)}>
                                     <img src={img.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="post media" />
                                  </div>
                                ))}
                              </div>
                           )}

                           <div className="bg-slate-50 rounded-2xl p-4 mt-2">
                              <div className="space-y-3">
                                 {visibleComments.map(c => {
                                    const cAuthor = getUserInfo(c.creatorId);
                                    return (
                                     <div key={c.id} className="text-xs">
                                        <div>
                                          <span className="font-black text-slate-900 mr-2 inline-flex items-center gap-1 translate-y-[2px]">
                                             {cAuthor.avatar ? <img src={cAuthor.avatar} className="w-4 h-4 rounded-full object-cover inline-block" alt="avatar" /> : <div className={`w-4 h-4 rounded-full inline-flex items-center justify-center text-[8px] text-white ${cAuthor.color}`}>{cAuthor.name.substring(0,1)}</div>}
                                             {cAuthor.name}:
                                          </span>
                                          <span className="text-slate-700 font-medium leading-relaxed">{c.text}</span>
                                          <button onClick={() => setReplyingTo({ postId: post.id, commentId: c.id, name: cAuthor.name })} className="ml-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase">回复</button>
                                        </div>
                                        {c.replies?.map(r => {
                                           const rAuthor = getUserInfo(r.creatorId);
                                           return (
                                             <div key={r.id} className="ml-4 mt-1.5 pl-2 border-l-2 border-slate-200 text-xs">
                                                <span className="font-black text-slate-900 mr-1">{rAuthor.name}</span>
                                                <span className="text-slate-400 mr-1 text-[10px] font-bold">回复</span>
                                                <span className="font-black text-slate-900 mr-2">{cAuthor.name}:</span>
                                                <span className="text-slate-700 font-medium">{r.text}</span>
                                             </div>
                                           );
                                        })}
                                     </div>
                                    );
                                 })}
                                 {post.comments.length > 2 && (
                                     <button onClick={() => setExpandedComments(prev => ({...prev, [post.id]: !prev[post.id]}))} className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest pt-2">
                                        {isExpanded ? '收起评论 (Collapse)' : `展开全部 ${post.comments.length} 条评论 (Expand)`}
                                     </button>
                                 )}
                              </div>

                              <div className="mt-4 flex gap-2 items-center bg-white p-1 rounded-full border border-slate-200 focus-within:ring-2 ring-slate-900 transition-all">
                                {replyingTo?.postId === post.id && (
                                  <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-1.5 rounded-full font-black flex items-center gap-1 whitespace-nowrap ml-1">
                                    <Reply size={10}/> {replyingTo.name}
                                    <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => setReplyingTo(null)}/>
                                  </span>
                                )}
                                <input 
                                  className="flex-1 bg-transparent px-3 py-1.5 text-[16px] sm:text-xs font-bold outline-none placeholder-slate-300"
                                  placeholder={replyingTo?.postId === post.id ? "回复讨论..." : "添加评论..."}
                                  value={commentInputs[post.id] || ''}
                                  onChange={e => setCommentInputs({...commentInputs, [post.id]: e.target.value})}
                                  onKeyDown={e => { if(e.key === 'Enter') handleAddComment(post.id); }}
                                />
                                <button onClick={() => handleAddComment(post.id)} disabled={!commentInputs[post.id]?.trim()} className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-full disabled:bg-slate-100 disabled:text-slate-300 transition-colors mr-0.5 shrink-0">
                                  <Send size={12}/>
                                </button>
                              </div>
                           </div>
                        </div>
                      );
                   })}
                </div>
             </div>
          )}
        </main>

        {/* 修复：绝对悬浮输入框，防底部遮挡与键盘弹起 */}
        {activeTab === 'spaces' && !isManagingSpaces && (
          <div className="absolute bottom-20 left-0 right-0 z-40 bg-gradient-to-t from-slate-100 via-slate-100/90 to-transparent pt-6 pb-4 px-5">
            <form onSubmit={addRequirement} className="bg-white/95 backdrop-blur-xl p-2 rounded-[32px] border border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex gap-2">
              <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} placeholder={`对【${activeSpace.name}】的执念...`} className="flex-1 bg-transparent border-none px-5 py-4 text-[16px] font-bold focus:ring-0 outline-none placeholder:text-slate-300 italic" />
              <button type="submit" disabled={!inputText.trim()} className="bg-slate-900 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform disabled:opacity-20 font-bold shrink-0"><Send size={20} /></button>
            </form>
          </div>
        )}

        {/* FAB 悬浮发帖按钮 */}
        {activeTab === 'feed' && (
          <button onClick={() => setShowPostModal(true)} className="absolute bottom-28 right-6 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40 hover:bg-slate-800">
             <Plus size={28} />
          </button>
        )}

        {/* 全局底部导航 */}
        <nav className="absolute bottom-0 w-full bg-white/95 border-t border-slate-100 flex h-20 px-2 pb-6 sm:pb-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          {[
            { id: 'spaces', icon: LayoutDashboard, label: '基准' },
            { id: 'summary', icon: ClipboardCheck, label: '清单' },
            { id: 'visuals', icon: ImageIcon, label: '视觉' },
            { id: 'budget', icon: Wallet, label: '预算' },
            { id: 'timeline', icon: CalendarClock, label: '排期' },
            { id: 'feed', icon: Activity, label: '动态' }
          ].map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setIsManagingSpaces(false); setIsManagingCategories(false); setIsManagingTimeline(false); }} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${activeTab === t.id ? 'text-slate-900 scale-105' : 'text-slate-300 hover:text-slate-400'}`}>
              <t.icon size={20} className={activeTab === t.id ? 'stroke-[3px]' : 'stroke-2'} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${activeTab === t.id ? 'opacity-100' : 'opacity-40'}`}>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* --- 抽屉与弹窗组件群 (支持点击背景关闭) --- */}

        {/* 发帖 Modal */}
        {showPostModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={() => { setShowPostModal(false); setNewPost({ header:'', description:'', images:[], tag:'现场' }); }}>
             <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
                <div className="p-5 flex justify-between items-center border-b border-slate-100">
                  <h3 className="font-black italic text-lg">发布新动态</h3>
                  <button onClick={() => { setShowPostModal(false); setNewPost({ header:'', description:'', images:[], tag:'现场' }); }}><XCircle className="text-slate-400" size={24}/></button>
                </div>
                <div className="p-5 overflow-y-auto flex-1 space-y-5">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">动态标签 TAG</label>
                     <div className="flex flex-wrap gap-2">
                        {['设计', '现场', '灵感', '感触'].map(t => (
                          <button key={t} type="button" onClick={() => setNewPost({...newPost, tag: t})} className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${newPost.tag === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>{t}</button>
                        ))}
                     </div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">标题 HEADER</label>
                     <input type="text" value={newPost.header} onChange={e => setNewPost({...newPost, header: e.target.value})} placeholder="一句话概括当前进度..." className="w-full bg-slate-50 rounded-xl p-3 text-[16px] font-bold outline-none focus:ring-2 focus:ring-slate-900" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">详情 DESC</label>
                     <textarea value={newPost.description} onChange={e => setNewPost({...newPost, description: e.target.value})} placeholder="记录现场情况或设计构思 (选填)..." className="w-full bg-slate-50 rounded-xl p-3 text-[16px] font-bold outline-none focus:ring-2 focus:ring-slate-900 h-24 resize-none" />
                   </div>
                   <div className="space-y-2">
                     <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">现场影像 MEDIA</label>
                       <span className="text-[10px] font-bold text-slate-400">{newPost.images.length}/9</span>
                     </div>
                     <div className="grid grid-cols-4 gap-2">
                        {newPost.images.map(img => (
                          <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group">
                             <img src={img.url} className="w-full h-full object-cover" alt="preview" />
                             <button type="button" onClick={() => setNewPost({...newPost, images: newPost.images.filter(i=>i.id !== img.id)})} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                          </div>
                        ))}
                        {newPost.images.length < 9 && (
                          <div onClick={() => postFileInputRef.current.click()} className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                             <Plus size={20} />
                          </div>
                        )}
                        <input type="file" multiple accept="image/*" ref={postFileInputRef} onChange={handlePostImageUpload} className="hidden" />
                     </div>
                   </div>
                </div>
                <div className="p-5 border-t border-slate-100">
                  <button type="button" onClick={handleAddPost} disabled={!newPost.header.trim()} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest disabled:opacity-40 disabled:scale-100 active:scale-95 transition-all">Publish 发布</button>
                </div>
             </div>
          </div>
        )}

        {/* 视觉材料上传 Modal */}
        {showMaterialModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-6" onClick={() => { setShowMaterialModal(false); setNewMaterial({ title: '', remark: '', url: ''}); }}>
            <div className="bg-white w-full max-w-xs rounded-[40px] p-8 shadow-2xl animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-black italic mb-6">入库新材料</h3>
              <form onSubmit={submitNewMaterial} className="space-y-4">
                <div className="relative h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center overflow-hidden hover:border-slate-400 transition-colors">
                  {newMaterial.url ? (
                    <img src={newMaterial.url} className="w-full h-full object-cover" alt="preview" />
                  ) : (
                    <>
                      <UploadCloud className="text-slate-300 mb-2" size={32} />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">点击上传实拍图</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleMaterialImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <input type="text" value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} placeholder="材料名称 (如: 潘多拉岩板)" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[16px] font-bold focus:ring-2 focus:ring-slate-900 outline-none" required />
                <textarea value={newMaterial.remark} onChange={e => setNewMaterial({...newMaterial, remark: e.target.value})} placeholder="备注说明 (如: 品牌、型号、尺寸等)" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[16px] font-bold focus:ring-2 focus:ring-slate-900 outline-none resize-none h-24" />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => { setShowMaterialModal(false); setNewMaterial({ title: '', remark: '', url: ''}); }} className="flex-1 bg-slate-100 text-slate-400 font-black py-4 rounded-3xl text-xs uppercase tracking-widest active:scale-95">Cancel</button>
                  <button type="submit" disabled={!newMaterial.url || !newMaterial.title.trim()} className="flex-1 bg-slate-900 text-white font-black py-4 rounded-3xl text-xs uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Upload</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 大图预览 Modal */}
        {previewImage && (
          <div className="fixed inset-0 bg-black/95 z-[300] flex flex-col animate-in fade-in duration-300" onClick={() => setPreviewImage(null)}>
            <div className="p-6 flex justify-end">
              <button onClick={() => setPreviewImage(null)} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"><X size={24}/></button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <img src={previewImage} alt="Fullscreen Preview" className="max-w-full max-h-full rounded-lg shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
            </div>
          </div>
        )}

        {/* Timeline 节点规划抽屉 */}
        {isManagingTimeline && (
          <div className="absolute inset-0 bg-white z-[70] flex flex-col animate-in slide-in-from-bottom duration-300 text-slate-900">
            <header className="px-5 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white shadow-sm z-10">
              <button onClick={() => setIsManagingTimeline(false)} className="p-2 -ml-2 text-slate-400 active:scale-90 transition-transform"><ChevronLeft size={24}/></button>
              <h2 className="text-lg font-black italic tracking-tighter uppercase font-bold">节点规划 Planning</h2>
              <button onClick={() => setEditModal({ type: 'add_timeline_node', title: '新增工期节点', name: '', val1: '' })} className="p-2 bg-slate-900 text-white rounded-xl shadow-lg active:scale-90 transition-transform"><Plus size={18}/></button>
            </header>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4 italic">Manage Timeline Nodes</p>
              {[...timeline].sort((a, b) => new Date(a.date) - new Date(b.date)).map(node => (
                <div key={node.id} className="bg-white p-4 rounded-[24px] border border-slate-200 flex items-center justify-between shadow-sm animate-in fade-in transition-all hover:border-slate-400">
                  <div className="flex flex-col gap-1 flex-1 pr-4">
                    <span className="text-[10px] font-black text-slate-400 font-mono tracking-widest">{node.date.replace(/-/g, '.')}</span>
                    <span className="text-sm font-black text-slate-900 leading-snug">{node.title}</span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditModal({ type: 'edit_timeline', itemId: node.id, title: '修改节点计划', name: node.title, val1: node.date })} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-900 active:scale-90 transition-all"><Pencil size={16}/></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteTimelineNode(node.id); }} className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white active:scale-90 transition-all"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 类别规划抽屉 */}
        {isManagingCategories && (
          <div className="absolute inset-0 bg-white z-[70] flex flex-col animate-in slide-in-from-bottom duration-300 text-slate-900">
            <header className="px-5 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white shadow-sm z-10">
              <button onClick={() => setIsManagingCategories(false)} className="p-2 -ml-2 text-slate-400 active:scale-90 transition-transform"><ChevronLeft size={24}/></button>
              <h2 className="text-lg font-black italic tracking-tighter uppercase font-bold">类别规划 Planning</h2>
              <button onClick={() => setEditModal({ type: 'add_category', title: '新增费用类目', name: '' })} className="p-2 bg-slate-900 text-white rounded-xl shadow-lg active:scale-90 transition-transform"><Plus size={18}/></button>
            </header>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4 italic">Manage Allocation Categories</p>
              {categories.map(cat => (
                <div key={cat.id} className="bg-white p-5 rounded-[28px] border border-slate-200 flex items-center justify-between shadow-sm animate-in fade-in transition-all hover:border-slate-400">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs uppercase shadow-sm">{cat.name.substring(0,2)}</div>
                    <span className="text-sm font-black text-slate-900">{cat.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditModal({ type: 'rename_category', catId: cat.id, title: '重命名类目', name: cat.name })} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-900 active:scale-90 transition-all"><Pencil size={16}/></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }} className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white active:scale-90 transition-all"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 类目明细抽屉 */}
        {activeCategoryId && activeCategory && (
          <div className="absolute inset-0 bg-white z-[60] flex flex-col animate-in slide-in-from-right duration-300 text-slate-900">
            <header className="px-5 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white shadow-sm z-10">
              <button onClick={() => setActiveCategoryId(null)} className="p-2 -ml-2 text-slate-400 active:scale-90 transition-transform"><ChevronLeft size={24}/></button>
              <h2 className="text-lg font-black tracking-tighter uppercase italic">{activeCategory.name}</h2>
              <button onClick={() => setEditModal({ type: 'add_item', catId: activeCategoryId, title: `为 ${activeCategory.name} 增加项`, name: '', val1: '' })} className="p-2 bg-slate-900 text-white rounded-xl shadow-lg active:scale-90 transition-transform"><Plus size={18}/></button>
            </header>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50 pb-10">
               <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden mb-2">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Category Financial Audit</div>
                  <div className="grid grid-cols-2 gap-8">
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1 tracking-widest opacity-80 italic">Plan 预算总额</span>
                        <span className="text-xl font-black italic tracking-tighter tabular-nums font-mono">¥{activeCategory.items.reduce((s, i) => s + i.budget, 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1 tracking-widest opacity-80 italic">Used 实际支付</span>
                        <span className={`text-xl font-black italic tracking-tighter tabular-nums font-mono ${activeCategory.items.reduce((s, i) => s + i.actual, 0) > activeCategory.items.reduce((s, i) => s + i.budget, 0) ? 'text-red-400' : 'text-sky-400'}`}>
                            ¥{activeCategory.items.reduce((s, i) => s + i.actual, 0).toLocaleString()}
                        </span>
                      </div>
                  </div>
                  <div className="mt-8 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 transition-all duration-1000" style={{ width: `${Math.min(100, (activeCategory.items.reduce((s, i) => s + i.actual, 0) / (activeCategory.items.reduce((s, i) => s + i.budget, 0) || 1)) * 100)}%` }}></div>
                  </div>
               </div>
               {activeCategory.items.map(item => {
                 const itemOver = item.actual > item.budget;
                 return (
                 <div key={item.id} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:border-slate-400 group">
                    <div className="flex justify-between items-start mb-6">
                      <div onClick={() => setEditModal({ type: 'edit_item_full', catId: activeCategoryId, itemId: item.id, title: '编辑明细项', name: item.name, val1: item.budget, val2: item.actual })} className="flex flex-col cursor-pointer active:opacity-60">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 italic underline decoration-dotted font-bold">Click to Edit / 修改内容</span>
                        <span className="text-base font-black text-slate-900 tracking-tight">{item.name}</span>
                      </div>
                      <button onClick={() => setCategories(prev => prev.map(c => c.id === activeCategoryId ? { ...c, items: c.items.filter(i => i.id !== item.id) } : c))} className="text-slate-200 hover:text-red-500 p-1 active:scale-90 transition-all"><Trash2 size={16}/></button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div onClick={() => setEditModal({ type: 'edit_item_full', catId: activeCategoryId, itemId: item.id, title: '编辑预算额', name: item.name, val1: item.budget, val2: item.actual })}
                           className="bg-slate-50 p-4 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-all shadow-inner">
                        <div className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest italic">Plan 预算</div>
                        <div className="text-lg font-black text-slate-900 italic tracking-tighter tabular-nums font-mono">¥{item.budget.toLocaleString()}</div>
                      </div>
                      <div onClick={() => setEditModal({ type: 'edit_item_full', catId: activeCategoryId, itemId: item.id, title: '录入实际支付', name: item.name, val1: item.budget, val2: item.actual })} 
                           className={`p-4 rounded-2xl cursor-pointer active:scale-95 transition-all shadow-md border ${itemOver ? 'bg-red-50 border-red-200' : 'bg-sky-900 border-sky-800'}`}>
                        <div className={`text-[9px] font-black uppercase mb-2 flex justify-between tracking-widest italic ${itemOver ? 'text-red-500' : 'text-sky-300'}`}>
                            Actual 实付 <Pencil size={10} />
                        </div>
                        <div className={`text-lg font-black italic tracking-tighter tabular-nums font-mono ${itemOver ? 'text-red-600' : 'text-white'}`}>
                            ¥{item.actual.toLocaleString()}
                        </div>
                        {itemOver && <div className="absolute top-2 right-2 text-red-500"><AlertTriangle size={10} /></div>}
                      </div>
                    </div>
                 </div>
               )})}
            </div>
          </div>
        )}

        {/* 通用底层编辑弹窗 (支持外部点击关闭) */}
        {editModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-6" onClick={() => setEditModal(null)}>
            <div className="bg-white w-full max-w-xs rounded-[40px] p-10 shadow-2xl animate-in zoom-in duration-300 border border-slate-100 text-slate-900" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-black italic mb-2 tracking-tighter">{editModal.title}</h3>
              <p className="text-[10px] text-slate-400 font-bold mb-8 uppercase tracking-widest italic">Audit Decision</p>
              <form onSubmit={executeEditAction} className="space-y-6">
                {(editModal.type === 'add_item' || editModal.type === 'add_category' || editModal.type === 'edit_item_full' || editModal.type === 'rename_category' || editModal.type === 'add_timeline_node' || editModal.type === 'edit_timeline') && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 italic">描述名称 / Name</label>
                    <input autoFocus type="text" value={editModal.name || ''} onChange={e => setEditModal({...editModal, name: e.target.value})} 
                           className="w-full bg-slate-50 border-none rounded-2xl p-5 text-[16px] font-bold outline-none ring-1 ring-slate-100 focus:ring-slate-900 shadow-inner transition-all" placeholder="输入名称" required />
                  </div>
                )}
                {(editModal.type === 'total_budget' || editModal.type === 'add_item' || editModal.type === 'edit_item_full') && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 italic">数额 / Plan (¥)</label>
                    <div className="relative font-mono font-black">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-black">¥</span>
                      <input type="number" value={editModal.val1 || ''} onChange={e => setEditModal({...editModal, val1: e.target.value})} 
                             className="w-full bg-slate-50 border-none rounded-2xl p-5 pl-10 text-[16px] font-black outline-none ring-1 ring-slate-100 focus:ring-slate-900 shadow-inner transition-all text-slate-900" placeholder="0.00" required />
                    </div>
                  </div>
                )}
                {editModal.type === 'edit_item_full' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <label className="text-[9px] font-black text-sky-400 uppercase tracking-widest pl-1 italic">实际支付 / Actual (¥)</label>
                    <div className="relative font-mono font-black">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-black">¥</span>
                      <input type="number" value={editModal.val2 || 0} onChange={e => setEditModal({...editModal, val2: e.target.value})} 
                             className="w-full bg-slate-50 border-none rounded-2xl p-5 pl-10 text-[16px] font-black outline-none ring-1 ring-sky-200 focus:ring-sky-500 shadow-inner transition-all text-slate-900" placeholder="0.00" />
                    </div>
                  </div>
                )}
                {(editModal.type === 'edit_timeline' || editModal.type === 'add_timeline_node') && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 italic">节点日期 / Date</label>
                    <div className="relative font-mono font-black">
                      <input type="date" value={editModal.val1 || ''} onChange={e => setEditModal({...editModal, val1: e.target.value})} 
                             className="w-full bg-slate-50 border-none rounded-2xl p-5 text-[16px] font-black outline-none ring-1 ring-slate-100 focus:ring-slate-900 shadow-inner transition-all text-slate-900" required />
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditModal(null)} className="flex-1 bg-slate-100 text-slate-400 text-xs font-black py-5 rounded-3xl uppercase tracking-widest active:scale-95 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 bg-slate-900 text-white text-xs font-black py-5 rounded-3xl shadow-xl uppercase active:scale-95 transition-all">Confirm</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 弹窗：新增空间 */}
        {showAddSpaceModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6" onClick={() => setShowAddSpaceModal(false)}>
            <div className="bg-white w-full max-w-xs rounded-[32px] p-10 shadow-2xl animate-in zoom-in duration-300 border border-slate-100 text-slate-900" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-black italic mb-2 tracking-tighter">新增维度</h3>
              <p className="text-[10px] text-slate-400 font-bold mb-8 uppercase tracking-widest italic">Create Shared Dimension</p>
              <form onSubmit={handleAddSpaceSubmit} className="space-y-6">
                <input autoFocus type="text" value={newSpaceName} onChange={e => setNewSpaceName(e.target.value)} 
                       className="w-full bg-slate-50 border-none rounded-2xl p-5 text-[16px] font-bold outline-none ring-1 ring-slate-100 focus:ring-slate-900 shadow-inner transition-all" placeholder="空间名称 (如：儿童房)" />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowAddSpaceModal(false)} className="flex-1 bg-slate-100 text-slate-400 text-xs font-black py-5 rounded-3xl uppercase active:scale-95 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 bg-slate-900 text-white text-xs font-black py-5 rounded-3xl shadow-xl uppercase active:scale-95 transition-all">Confirm</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}