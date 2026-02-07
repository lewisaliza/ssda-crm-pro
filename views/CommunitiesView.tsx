
import React, { useMemo } from 'react';
import { Home, Users, MapPin, Calendar, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Community, Member } from '../types';

interface CommunitiesViewProps {
  communities: Community[];
  members: Member[];
  onAddCommunity: (community: Community) => Promise<void>;
  onEditCommunity: (community: Community) => Promise<void>;
  onDeleteCommunity: (id: string) => Promise<void>;
}

const CommunitiesView: React.FC<CommunitiesViewProps> = ({
  communities: initialCommunities,
  members,
  onAddCommunity,
  onEditCommunity,
  onDeleteCommunity
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCommunity, setEditingCommunity] = React.useState<Community | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    hostName: '',
    location: '',
    meetingDay: 'Friday',
    maxCapacity: 50
  });

  const handleOpenModal = (community?: Community) => {
    if (community) {
      setEditingCommunity(community);
      setFormData({
        name: community.name,
        hostName: community.hostName,
        location: community.location,
        meetingDay: community.meetingDay,
        maxCapacity: community.maxCapacity
      });
    } else {
      setEditingCommunity(null);
      setFormData({
        name: '',
        hostName: '',
        location: '',
        meetingDay: 'Wednesday',
        maxCapacity: 50
      });
    }
    setIsModalOpen(true);
  };

  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    if (!formData.name || !formData.hostName) return;
    setIsSaving(true);

    try {
      if (editingCommunity) {
        await onEditCommunity({
          ...editingCommunity,
          ...formData
        });
      } else {
        await onAddCommunity({
          id: `C${Date.now()}`,
          ...formData,
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save community:", error);
      alert("Failed to save community. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  const communities = useMemo(() => {
    return initialCommunities.map(c => {
      const count = members.filter(m => m.assignedCommunity === c.name).length;
      return { ...c, memberCount: count };
    });
  }, [initialCommunities, members]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Communities & Hosts</h2>
          <p className="text-slate-500">Small groups and fellowship circles.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={18} />
          <span>New Group</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {communities.map((c) => {
          const occupancy = (c.memberCount! / c.maxCapacity) * 100;
          return (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-blue-300 transition-colors cursor-pointer group">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <Home size={24} />
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${occupancy >= 90 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                    {occupancy >= 90 ? 'Limited' : 'Open'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-1">{c.name}</h3>
                <p className="text-sm text-slate-500 mb-6">Host: <span className="text-slate-700 font-medium">{c.hostName}</span></p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{c.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Calendar size={16} className="text-slate-400" />
                    <span>{c.meetingDay}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Users size={16} className="text-slate-400" />
                    <span>{c.memberCount} / {c.maxCapacity} Members</span>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                    <span>Capacity</span>
                    <span>{Math.round(occupancy)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${occupancy >= 90 ? 'bg-orange-500' : 'bg-blue-500'}`}
                      style={{ width: `${occupancy}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 group-hover:bg-blue-50 transition-colors">
                <span className="text-sm font-semibold text-slate-500">Actions</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(c)}
                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit Community"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this community?')) {
                        await onDeleteCommunity(c.id);
                      }
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete Community"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">
                {editingCommunity ? 'Edit Community' : 'New Community'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Community Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Northside Fellowship"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Host/Leader Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={formData.hostName}
                  onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                  placeholder="e.g. Sarah Johnson"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Host Home"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Day</label>
                  <select
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.meetingDay}
                    onChange={(e) => setFormData({ ...formData, meetingDay: e.target.value })}
                  >
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Capacity</label>
                <input
                  type="number"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.hostName || isSaving}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Plus size={18} />
                )}
                {isSaving ? 'Saving...' : (editingCommunity ? 'Save Changes' : 'Create Group')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunitiesView;
