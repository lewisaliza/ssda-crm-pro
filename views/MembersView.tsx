
import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Filter, MoreVertical, Mail, Phone, X, Edit2, Trash2, Camera, Upload, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '../utils/exportUtils';

import { Member, AttendanceRecord, Contribution, Community, MemberStatus } from '../types';

interface MembersViewProps {
  members: Member[];
  attendance: AttendanceRecord[];
  contributions: Contribution[];
  communities: Community[];

  onAddMember: (member: Member) => Promise<void>;
  onEditMember: (member: Member) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
}

const MembersView: React.FC<MembersViewProps> = ({
  members,
  attendance,
  contributions,
  communities,
  onAddMember,
  onEditMember,
  onDeleteMember
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCommunity, setFilterCommunity] = useState<string>('ALL');

  const [newMember, setNewMember] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    passportPhotoUrl: '',
    assignedCommunity: '',
    status: MemberStatus.VISITOR,
    joinDate: new Date().toISOString().split('T')[0]
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; memberId: string | null; memberName: string | null }>({
    isOpen: false,
    memberId: null,
    memberName: null
  });
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    // 1. Determine which members to export
    let membersToExport = filteredMembers;
    if (selectedMembers.size > 0) {
      membersToExport = filteredMembers.filter(m => selectedMembers.has(m.id));
    }

    const dataToExport = membersToExport.map(m => ({
      Name: m.fullName,
      Email: m.email,
      Phone: m.phone,
      Address: m.address || '',
      Status: m.status,
      Community: m.assignedCommunity || 'Unassigned',
      JoinDate: m.joinDate,
      Attendance: m.attendanceFrequency || 0,
      TotalGiving: m.totalContributionYTD || 0
    }));

    const filename = `members_report_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      exportToCSV(dataToExport, filename);
    } else if (format === 'excel') {
      exportToExcel(dataToExport, filename);
    } else if (format === 'pdf') {
      const columns = [
        { header: 'Name', dataKey: 'Name' },
        { header: 'Email', dataKey: 'Email' },
        { header: 'Status', dataKey: 'Status' },
        { header: 'Community', dataKey: 'Community' },
        { header: 'Visits', dataKey: 'Attendance' },
        { header: 'Giving', dataKey: 'TotalGiving' }
      ];
      exportToPDF(dataToExport, columns, 'Members Directory Report', filename);
    }
    setShowExportMenu(false);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.memberId) {
      await onDeleteMember(deleteConfirmation.memberId);
      setDeleteConfirmation({ isOpen: false, memberId: null, memberName: null });
    }
  };

  const handleOpenModal = (member?: Member) => {
    if (member) {
      setEditingMember(member);
      setNewMember({
        fullName: member.fullName,
        email: member.email,
        phone: member.phone,
        address: member.address || '',
        passportPhotoUrl: member.passportPhotoUrl || '',
        assignedCommunity: member.assignedCommunity || '',
        status: member.status,
        joinDate: member.joinDate || new Date().toISOString().split('T')[0]
      });
      setActiveMenuId(null); // Close menu
    } else {
      setEditingMember(null);
      setNewMember({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        passportPhotoUrl: '',
        assignedCommunity: '',
        status: MemberStatus.VISITOR,
        joinDate: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveMember = async () => {
    if (!newMember.fullName) return;
    setIsSaving(true);

    try {
      if (editingMember) {
        await onEditMember({
          ...editingMember,
          ...newMember
        });
      } else {
        const member = {
          id: `M${Date.now()}`,
          fullName: newMember.fullName,
          email: newMember.email,
          phone: newMember.phone,
          address: newMember.address,
          passportPhotoUrl: newMember.passportPhotoUrl,
          assignedCommunity: newMember.assignedCommunity,
          status: newMember.status,
          joinDate: newMember.joinDate
        };
        await onAddMember(member);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save member:", error);
      alert("Failed to save member. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const processedMembers = useMemo(() => {
    return members.map(m => {
      const memberAttendance = attendance.filter(a => a.memberName === m.fullName).length;
      const memberContributions = contributions
        .filter(c => c.memberName === m.fullName)
        .reduce((sum, c) => sum + c.amount, 0);
      return { ...m, attendanceFrequency: memberAttendance, totalContributionYTD: memberContributions };
    });
  }, [members, attendance, contributions]);

  const filteredMembers = processedMembers.filter(m => {
    const matchesSearch = m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || m.status === filterStatus;
    const matchesCommunity = filterCommunity === 'ALL' ||
      (filterCommunity === 'Unassigned' ? !m.assignedCommunity : m.assignedCommunity === filterCommunity);

    return matchesSearch && matchesStatus && matchesCommunity;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Members Directory</h2>
          <p className="text-slate-500">Manage and view all church members.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-sm"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export</span>
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
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <UserPlus size={18} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">
                {editingMember ? 'Edit Member Details' : 'New Member Registration'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden bg-slate-50 cursor-pointer hover:border-blue-500 transition-colors relative">
                    {newMember.passportPhotoUrl ? (
                      <img
                        src={newMember.passportPhotoUrl}
                        alt="Passport"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                        <Camera size={32} className="mb-2" />
                        <span className="text-xs">Upload Photo</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewMember({ ...newMember, passportPhotoUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  {newMember.passportPhotoUrl && (
                    <button
                      onClick={() => setNewMember({ ...newMember, passportPhotoUrl: '' })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                      title="Remove photo"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-500">Square Passport Photo</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. John Doe"
                  value={newMember.fullName}
                  onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john@example.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+255..."
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 123 Maple Street, District B"
                  value={newMember.address}
                  onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Community</label>
                <div className="relative">
                  <select
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full appearance-none"
                    value={newMember.assignedCommunity}
                    onChange={(e) => setNewMember({ ...newMember, assignedCommunity: e.target.value })}
                  >
                    <option value="">Select a community...</option>
                    {communities.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-500">Assign to a Cell Group / Community</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={newMember.status}
                  onChange={(e) => setNewMember({ ...newMember, status: e.target.value as MemberStatus })}
                >
                  {Object.values(MemberStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={newMember.joinDate}
                  onChange={(e) => setNewMember({ ...newMember, joinDate: e.target.value })}
                />
              </div>

              <button
                onClick={handleSaveMember}
                disabled={!newMember.fullName || isSaving}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <UserPlus size={18} />
                )}
                {isSaving ? 'Saving...' : (editingMember ? 'Save Changes' : 'Register Member')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search members by name or email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-300 text-slate-600 hover:bg-white'}`}
              >
                <Filter size={18} />
                <span className="text-sm font-medium">Filters</span>
              </button>

              {showFilters && (
                <>
                  <div
                    className="fixed inset-0 z-10 bg-transparent"
                    onClick={() => setShowFilters(false)}
                  />
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-xl border border-slate-100 p-4 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                        <select
                          className="w-full p-2 text-sm border border-slate-200 rounded-md bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="ALL">All Statuses</option>
                          {Object.values(MemberStatus).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Community</label>
                        <select
                          className="w-full p-2 text-sm border border-slate-200 rounded-md bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={filterCommunity}
                          onChange={(e) => setFilterCommunity(e.target.value)}
                        >
                          <option value="ALL">All Communities</option>
                          <option value="Unassigned">Unassigned</option>
                          {communities.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      {(filterStatus !== 'ALL' || filterCommunity !== 'ALL') && (
                        <button
                          onClick={() => { setFilterStatus('ALL'); setFilterCommunity('ALL'); }}
                          className="w-full text-xs text-red-600 hover:text-red-700 font-medium text-center pt-2 border-t border-slate-100"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    checked={filteredMembers.length > 0 && selectedMembers.size === filteredMembers.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers(new Set(filteredMembers.map(m => m.id)));
                      } else {
                        setSelectedMembers(new Set());
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Community</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Attendance</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Giving YTD</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMembers.map((m) => {
                const isSelected = selectedMembers.has(m.id);
                return (
                  <tr key={m.id} className={`transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const newSelected = new Set(selectedMembers);
                          if (isSelected) {
                            newSelected.delete(m.id);
                          } else {
                            newSelected.add(m.id);
                          }
                          setSelectedMembers(newSelected);
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold overflow-hidden border border-slate-200">
                          {m.passportPhotoUrl ? (
                            <img src={m.passportPhotoUrl} alt={m.fullName} className="w-full h-full object-cover" />
                          ) : (
                            m.fullName.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{m.fullName}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500 flex items-center gap-1"><Mail size={12} />{m.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`
                      px-2 py-1 text-xs font-medium rounded-full
                      ${m.status === MemberStatus.ACTIVE ? 'bg-green-100 text-green-700' : ''}
                      ${m.status === MemberStatus.VISITOR ? 'bg-blue-100 text-blue-700' : ''}
                      ${m.status === MemberStatus.INACTIVE ? 'bg-slate-100 text-slate-700' : ''}
                    `}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">{m.assignedCommunity || 'Unassigned'}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-semibold text-slate-800">{m.attendanceFrequency}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Visits</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">{m.joinDate || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-semibold text-slate-800">Tshs {m.totalContributionYTD?.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Total</div>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setMenuPosition({ top: rect.bottom, right: window.innerWidth - rect.right });
                          setActiveMenuId(activeMenuId === m.id ? null : m.id);
                        }}
                        className={`p-2 rounded-md transition-colors ${activeMenuId === m.id ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                      >
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            No members found matching your search.
          </div>
        )}
      </div>

      {/* Floating Action Menu (Fixed Position) */}
      {activeMenuId && (() => {
        const m = members.find(mem => mem.id === activeMenuId);
        if (!m) return null;
        return (
          <>
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setActiveMenuId(null)}
            />
            <div
              className="fixed w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200"
              style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px` }}
            >
              <button
                onClick={() => handleOpenModal(m)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
              >
                <Edit2 size={16} />
                Edit Details
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmation({
                    isOpen: true,
                    memberId: m.id,
                    memberName: m.fullName
                  });
                  setActiveMenuId(null);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Member
              </button>
            </div>
          </>
        );
      })()}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Member?</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete <span className="font-bold text-slate-800">{deleteConfirmation.memberName}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmation({ isOpen: false, memberId: null, memberName: null })}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersView;
