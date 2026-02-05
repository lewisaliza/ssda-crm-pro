
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Member, Contribution, Community, MemberStatus } from '../types';

interface DashboardProps {
  members: Member[];
  contributions: Contribution[];
  communities: Community[];
}

const DashboardView: React.FC<DashboardProps> = ({ members, contributions, communities }) => {
  const stats = useMemo(() => {
    const activeMembers = members.filter(m => m.status === MemberStatus.ACTIVE).length;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyGiving = contributions
      .filter(c => {
        const d = new Date(c.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, c) => sum + c.amount, 0);

    const participationRate = (members.filter(m => m.assignedCommunity).length / members.length) * 100;

    return { activeMembers, monthlyGiving, participationRate };
  }, []);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    const data = months.map((m, i) => {
      const total = contributions
        .filter(c => {
          const d = new Date(c.date);
          return d.getMonth() === i && d.getFullYear() === currentYear;
        })
        .reduce((sum, c) => sum + c.amount, 0);
      return { name: m, amount: total };
    });

    return data;
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
          <Icon className={color.replace('bg-', 'text-')} size={24} />
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );

  return (
    <div
      className="space-y-6 -m-4 md:-m-8 p-4 md:p-8 min-h-[calc(100vh-64px)]"
      style={{
        backgroundImage: 'url("/images/IMG_9806.JPG")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="flex justify-between items-end bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-600">Overview of church health and financial growth.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Members"
          value={stats.activeMembers}
          icon={Users}
          color="bg-blue-600"
          trend={12}
        />
        <StatCard
          title="Giving (Current Month)"
          value={`Tshs ${stats.monthlyGiving.toLocaleString()}`}
          icon={DollarSign}
          color="bg-green-600"
          trend={8}
        />
        <StatCard
          title="Participation Rate"
          value={`${stats.participationRate.toFixed(1)}%`}
          icon={Activity}
          color="bg-purple-600"
          trend={-2}
        />
        <StatCard
          title="Total Communities"
          value={communities.length}
          icon={TrendingUp}
          color="bg-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Financial Trends (YTD)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === new Date().getMonth() ? '#2563eb' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {contributions.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <DollarSign size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{c.memberName}</p>
                  <p className="text-xs text-slate-500">{c.type} • {c.date}</p>
                </div>
                <div className="text-sm font-bold text-slate-800">
                  +Tshs {c.amount}
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/finances"
            className="block text-center w-full mt-6 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            View All Transactions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
