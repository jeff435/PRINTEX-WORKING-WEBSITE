import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart3, 
  Boxes, 
  FileText, 
  PlusCircle, 
  LineChart, 
  Bot, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Search,
  Plus,
  ArrowRight,
  User as UserIcon,
  ShieldCheck,
  Package,
  ShoppingCart,
  AlertTriangle,
  History,
  Trash2,
  Edit,
  Eye,
  Printer,
  ChevronRight,
  Key,
  Database,
  Sparkles,
  CreditCard,
  Send,
  CloudUpload,
  Copy,
  LayoutDashboard
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { signIn, signUp, verifyToken, User } from "@/lib/auth";
import { cn } from "@/lib/utils";

// --- Types ---
interface Part {
  id: string | number;
  category: string;
  partNum: string;
  desc: string;
  stock: number;
  minStock: number;
  priceKsh: number;
  supplier?: string;
  location?: string;
  image?: string | null;
}

// --- Auth Component ---
function AuthScreen({ onLogin }: { onLogin: (user: User, token: string) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const data = await signIn(formData.email, formData.password);
        onLogin(data.user, data.token);
        toast.success("Welcome back!");
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const data = await signUp(formData.email, formData.password, formData.fullName);
        onLogin(data.user, data.token);
        toast.success("Account created successfully!");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0d1b2a] flex items-center justify-center p-4 z-[9999]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#112236] border border-[#24527a] rounded-2xl p-8 w-full max-w-[420px] shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-br from-[#00d4ff] to-[#0099cc] rounded-2xl mx-auto mb-4 flex items-center justify-center font-mono text-2xl font-bold text-white shadow-[0_0_30px_rgba(0,212,255,0.4)]">
            PX
          </div>
          <h1 className="font-display text-2xl font-extrabold text-[#e8f4fd]">PRINTEX ENGINEERS</h1>
          <p className="text-sm text-[#7ab3d4] mt-1">Inventory Management System</p>
        </div>

        <div className="flex bg-[#162c42] rounded-lg p-1 mb-6">
          <button 
            onClick={() => setIsLogin(true)}
            className={cn(
              "flex-1 py-2 rounded-md text-sm font-semibold transition-all",
              isLogin ? "bg-[#00d4ff] text-white" : "text-[#7ab3d4] hover:text-white"
            )}
          >
            Sign In
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={cn(
              "flex-1 py-2 rounded-md text-sm font-semibold transition-all",
              !isLogin ? "bg-[#00d4ff] text-white" : "text-[#7ab3d4] hover:text-white"
            )}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#7ab3d4] uppercase tracking-wider font-medium">Full Name</label>
              <input 
                type="text" 
                required
                className="w-full bg-[#162c42] border border-[#24527a] rounded-lg px-4 py-2 text-white outline-hidden focus:border-[#00d4ff] transition-all"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[11px] text-[#7ab3d4] uppercase tracking-wider font-medium">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-[#162c42] border border-[#24527a] rounded-lg px-4 py-2 text-white outline-hidden focus:border-[#00d4ff] transition-all"
              placeholder="you@example.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] text-[#7ab3d4] uppercase tracking-wider font-medium">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-[#162c42] border border-[#24527a] rounded-lg px-4 py-2 text-white outline-hidden focus:border-[#00d4ff] transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#7ab3d4] uppercase tracking-wider font-medium">Confirm Password</label>
              <input 
                type="password" 
                required
                className="w-full bg-[#162c42] border border-[#24527a] rounded-lg px-4 py-2 text-white outline-hidden focus:border-[#00d4ff] transition-all"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-[#00d4ff] to-[#0099cc] text-white font-bold py-3 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>{isLogin ? <><LogOut className="w-4 h-4" /> Sign In</> : <><PlusCircle className="w-4 h-4" /> Create Account</>}</>
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-[#162c42] rounded-lg border border-dashed border-[#2d6595]">
          <p className="text-[11px] text-[#7ab3d4] font-semibold mb-1">⚡ Quick Demo Access</p>
          <p className="text-[11px] text-[#4a7fa0]">Sign in with your email or create a new account to start managing your inventory.</p>
        </div>
      </motion.div>
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("printex_token"));
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const data = await verifyToken(token);
          if (data.valid) {
            setUser(data.user);
          } else {
            setToken(null);
            localStorage.removeItem("printex_token");
          }
        } catch (err) {
          setToken(null);
          localStorage.removeItem("printex_token");
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const handleLogin = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem("printex_token", newToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("printex_token");
    toast.info("Signed out");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0d1b2a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00d4ff]/30 border-t-[#00d4ff] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthScreen onLogin={handleLogin} />
        <Toaster position="bottom-right" richColors />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-[#0d1b2a] text-[#e8f4fd] overflow-hidden">
      <Toaster position="bottom-right" richColors />
      
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 230 : 0, x: sidebarOpen ? 0 : -230 }}
        className="bg-[#112236] border-r border-[#24527a] flex flex-col z-50 h-full fixed lg:relative shadow-2xl"
      >
        <div className="p-6 border-b border-[#24527a] flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-[#00d4ff] to-[#0099cc] rounded-lg flex items-center justify-center font-mono font-bold text-white shadow-lg shrink-0">
            PX
          </div>
          <div className="overflow-hidden whitespace-nowrap">
            <p className="font-display font-extrabold text-sm tracking-tight">PRINTEX</p>
            <p className="text-[10px] text-[#7ab3d4] tracking-widest uppercase">ENGINEERS LTD</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <p className="px-6 text-[10px] text-[#4a7fa0] uppercase tracking-widest font-bold mb-2">Main</p>
          <nav className="space-y-1">
            <NavItem active={currentPage === "dashboard"} icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" onClick={() => setCurrentPage("dashboard")} />
            <NavItem active={currentPage === "inventory"} icon={<Boxes className="w-4 h-4" />} label="Inventory" onClick={() => setCurrentPage("inventory")} badge="0" />
            
            <p className="px-6 text-[10px] text-[#4a7fa0] uppercase tracking-widest font-bold mt-6 mb-2">Business</p>
            <NavItem active={currentPage === "invoices"} icon={<FileText className="w-4 h-4" />} label="Invoices" onClick={() => setCurrentPage("invoices")} />
            <NavItem active={currentPage === "createInvoice"} icon={<PlusCircle className="w-4 h-4" />} label="New Invoice" onClick={() => setCurrentPage("createInvoice")} />
            
            <p className="px-6 text-[10px] text-[#4a7fa0] uppercase tracking-widest font-bold mt-6 mb-2">Tools</p>
            <NavItem active={currentPage === "reports"} icon={<BarChart3 className="w-4 h-4" />} label="Reports" onClick={() => setCurrentPage("reports")} />
            <NavItem active={currentPage === "ai"} icon={<Bot className="w-4 h-4" />} label="AI Assistant" onClick={() => setCurrentPage("ai")} badge="NEW" badgeColor="bg-[#00d4ff]" />
            <NavItem active={currentPage === "settings"} icon={<Settings className="w-4 h-4" />} label="Settings" onClick={() => setCurrentPage("settings")} />
          </nav>
        </div>

        <div className="p-4 border-t border-[#24527a] bg-[#162c42]/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#00d4ff] to-[#0099cc] flex items-center justify-center font-bold text-white shadow-md">
              {user.fullName[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{user.fullName}</p>
              <p className="text-[10px] text-[#7ab3d4] uppercase">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-[#ff5252] border border-[#ff5252]/30 rounded-lg hover:bg-[#ff5252]/10 transition-all"
          >
            <LogOut className="w-3 h-3" /> Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0d1b2a]">
        <header className="h-16 bg-[#112236] border-b border-[#24527a] flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-[#7ab3d4] hover:text-white transition-all">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-display font-bold text-lg capitalize">{currentPage.replace(/([A-Z])/g, ' $1')}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#00e676] rounded-full animate-pulse shadow-[0_0_8px_#00e676]" />
            <button className="w-10 h-10 rounded-lg bg-[#1a3350] border border-[#24527a] flex items-center justify-center text-[#7ab3d4] hover:text-white transition-all">
              <LineChart className="w-4 h-4" />
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <PlaceholderPage name={currentPage} />
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, badge, badgeColor = "bg-[#ff5252]" }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-6 py-2.5 transition-all group relative",
        active ? "bg-[#00d4ff]/10 text-[#00d4ff] border-l-2 border-[#00d4ff]" : "text-[#7ab3d4] hover:bg-[#162c42] hover:text-white"
      )}
    >
      <span className={cn("transition-all", active ? "text-[#00d4ff]" : "text-[#4a7fa0] group-hover:text-white")}>
        {icon}
      </span>
      <span className="text-sm font-semibold whitespace-nowrap">{label}</span>
      {badge && (
        <span className={cn("ml-auto text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full", badgeColor)}>
          {badge}
        </span>
      )}
    </button>
  );
}

function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full opacity-30 text-center space-y-4">
      <div className="w-24 h-24 bg-[#1a3350] rounded-3xl flex items-center justify-center border border-[#24527a]">
        <Boxes className="w-12 h-12" />
      </div>
      <div>
        <h3 className="text-xl font-bold uppercase tracking-widest">{name}</h3>
        <p className="text-sm">Page content under implementation</p>
      </div>
    </div>
  );
}

