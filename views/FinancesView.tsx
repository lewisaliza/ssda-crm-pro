
import React, { useMemo, useState } from 'react';
import { DollarSign, Download, Filter, Search, PlusCircle, X, Calendar as CalendarIcon, ListFilter, FileText, FileSpreadsheet } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '../utils/exportUtils';
import { Contribution, Member, ContributionType } from '../types';

interface FinancesViewProps {
  contributions: Contribution[];
  members: Member[];
  onAddContribution: (contribution: Contribution) => void;
}

const FinancesView: React.FC<FinancesViewProps> = ({ contributions, members, onAddContribution }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newEntry, setNewEntry] = React.useState({
    memberName: '',
    amount: '',
    type: ContributionType.TITHE,
    date: new Date().toISOString().split('T')[0]
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterYear, setFilterYear] = useState<string>('ALL');
  const [filterDateRange, setFilterDateRange] = useState<string>('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    // Basic filtered data
    let data = filteredContributions;

    // If a specific member is selected via checkbox, narrow down to just them
    if (selectedMember) {
      data = data.filter(c => c.memberName === selectedMember);
    }

    const dataToExport = data.map(c => ({
      Date: c.date,
      Member: c.memberName,
      Type: c.type,
      Amount: c.amount,
      ID: c.id
    }));

    const filename = `finances_report_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      exportToCSV(dataToExport, filename);
    } else if (format === 'excel') {
      exportToExcel(dataToExport, filename);
    } else if (format === 'pdf') {
      const columns = [
        { header: 'Date', dataKey: 'Date' },
        { header: 'Member', dataKey: 'Member' },
        { header: 'Type', dataKey: 'Type' },
        { header: 'Amount', dataKey: 'Amount' }
      ];
      exportToPDF(dataToExport, columns, 'Financial Contributions Report', filename);
    }
    setShowExportMenu(false);
  };

  const availableYears = useMemo(() => {
    const years = new Set(contributions.map(c => new Date(c.date).getFullYear()));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a: number, b: number) => b - a);
  }, [contributions]);

  const handleAddEntry = () => {
    if (!newEntry.memberName || !newEntry.amount) return;

    const entry = {
      id: `T${Date.now()}`,
      memberName: newEntry.memberName,
      amount: parseFloat(newEntry.amount),
      type: newEntry.type,
      date: newEntry.date
    };

    onAddContribution(entry);
    setIsModalOpen(false);
    setNewEntry({
      memberName: '',
      amount: '',
      type: ContributionType.TITHE,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const filteredContributions = useMemo(() => {
    return contributions.filter(c => {
      // 1. Filter by Name
      const matchesSearch = c.memberName.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Filter by Type
      const matchesType = filterType === 'ALL' || c.type === filterType;

      // 3. Filter by Year
      let matchesYear = true;
      if (filterYear !== 'ALL') {
        matchesYear = new Date(c.date).getFullYear() === parseInt(filterYear);
      }

      // 4. Filter by Date Range
      let matchesDate = true;
      if (filterDateRange !== 'ALL') {
        const d = new Date(c.date);
        const now = new Date();

        if (filterDateRange === 'WEEK') {
          // Last 7 days
          const diffTime = Math.abs(now.getTime() - d.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          matchesDate = diffDays <= 7;
        } else if (filterDateRange === 'MONTH') {
          matchesDate = d.getMonth() === now.getMonth();
        } else if (filterDateRange === 'LAST_WEEK') {
          // 7 to 14 days ago (Previous week)
          const diffTime = Math.abs(now.getTime() - d.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          matchesDate = diffDays > 7 && diffDays <= 14;
        } else if (filterDateRange === 'LAST_MONTH') {
          const lastMonthDate = new Date();
          lastMonthDate.setMonth(now.getMonth() - 1);
          matchesDate = d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
        } else if (filterDateRange === 'CUSTOM') {
          if (customStartDate && customEndDate) {
            matchesDate = d >= new Date(customStartDate) && d <= new Date(customEndDate);
          } else if (customStartDate) {
            matchesDate = d >= new Date(customStartDate);
          } else if (customEndDate) {
            matchesDate = d <= new Date(customEndDate);
          }
        }
      }

      return matchesSearch && matchesType && matchesDate && matchesYear;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [contributions, searchTerm, filterType, filterDateRange, filterYear, customStartDate, customEndDate]);

  const stats = useMemo(() => {
    const total = filteredContributions.reduce((sum, c) => sum + c.amount, 0);
    const tithes = filteredContributions.filter(c => c.type === ContributionType.TITHE).reduce((sum, c) => sum + c.amount, 0);
    const offerings = filteredContributions.filter(c => c.type !== ContributionType.TITHE).reduce((sum, c) => sum + c.amount, 0);
    return { total, tithes, offerings };
  }, [filteredContributions]);

  const handleOpenModal = () => {
    let defaultMemberName = '';

    if (selectedMember) {
      // Priority 1: Explicitly selected member from checkbox
      defaultMemberName = selectedMember;
    } else if (searchTerm) {
      // Priority 2: Auto-select if search term matches a member
      const matchingMembers = members.filter(m =>
        m.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (matchingMembers.length === 1) {
        defaultMemberName = matchingMembers[0].fullName;
      } else {
        // Try strict match if multiple results (e.g. "John" matches "John Doe" and "John Smith")
        const exactMatch = members.find(m =>
          m.fullName.toLowerCase() === searchTerm.trim().toLowerCase()
        );
        if (exactMatch) defaultMemberName = exactMatch.fullName;
      }
    }

    setNewEntry({
      memberName: defaultMemberName,
      amount: '',
      type: ContributionType.TITHE,
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financial Contributions</h2>
          <p className="text-slate-500">Record and manage donations and offerings.</p>
        </div>
        <div className="flex items-center gap-2">

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium">
              <Download size={18} />
              <span>Export</span>
            </button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Export Format
                  </div>
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-green-700 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FileSpreadsheet size={16} />
                    <span>Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-700 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FileText size={16} />
                    <span>CSV (.csv)</span>
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-700 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FileText size={16} />
                    <span>PDF Document</span>
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <PlusCircle size={18} />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Record Contribution</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Member Name</label>
                <div className="relative">
                  <select
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full appearance-none"
                    value={newEntry.memberName}
                    onChange={(e) => setNewEntry({ ...newEntry, memberName: e.target.value })}
                  >
                    <option value="">Select a member...</option>
                    {members.map(member => (
                      <option key={member.id} value={member.fullName}>
                        {member.fullName}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-500">Links to Members Directory</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={newEntry.type}
                    onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as ContributionType })}
                  >
                    {Object.values(ContributionType).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (Tshs)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                />
              </div>

              <button
                onClick={handleAddEntry}
                disabled={!newEntry.memberName || !newEntry.amount}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircle size={18} />
                Confirm Entry
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-6 rounded-xl shadow-lg text-white">
          <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">
            Total {filterYear !== 'ALL' ? filterYear : 'Giving'} {filterDateRange !== 'ALL' ? `(${filterDateRange})` : ''}
          </p>
          <h3 className="text-3xl font-bold">Tshs {stats.total.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Total Tithes</p>
          <h3 className="text-3xl font-bold text-slate-800">Tshs {stats.tithes.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Offerings & Others</p>
          <h3 className="text-3xl font-bold text-slate-800">Tshs {stats.offerings.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by member name..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm font-medium"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="ALL">All Types</option>
                {Object.values(ContributionType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm font-medium"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="ALL">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm font-medium"
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
              >
                <option value="ALL">All Time</option>
                <option value="WEEK">This Week</option>
                <option value="MONTH">This Month</option>
                <option value="LAST_WEEK">Last Week</option>
                <option value="LAST_MONTH">Last Month</option>
                <option value="CUSTOM">Custom Range</option>
              </select>
            </div>

            {filterDateRange === 'CUSTOM' && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                <input
                  type="date"
                  className="px-3 py-2 border border-slate-300 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
                <span className="text-slate-400">-</span>
                <input
                  type="date"
                  className="px-3 py-2 border border-slate-300 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">Select</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredContributions.map((c) => (
                <tr key={c.id} className={`transition-colors ${selectedMember === c.memberName ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedMember === c.memberName}
                      onChange={() => setSelectedMember(selectedMember === c.memberName ? null : c.memberName)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.date}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{c.memberName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${c.type === ContributionType.TITHE ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}
                  `}>
                      {c.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-slate-800">Tshs {c.amount.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
              {filteredContributions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancesView;
