
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle, Plus, X, Edit2, Trash2, CalendarDays } from 'lucide-react';
import { Event, AttendanceRecord, Member, AttendanceStatus } from '../types';

interface EventsViewProps {
  events: Event[];
  attendance: AttendanceRecord[];
  members: Member[];
  onAddAttendance: (record: AttendanceRecord) => void;
  onAddEvent: (event: Event) => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
}

const EventsView: React.FC<EventsViewProps> = ({
  events,
  attendance,
  members,
  onAddAttendance,
  onAddEvent,
  onEditEvent,
  onDeleteEvent
}) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'attendance'>('calendar');
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const [selectedEventId, setSelectedEventId] = useState('');

  // Event CRUD State
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventFormData, setEventFormData] = useState({
    name: '',
    date: '',
    type: 'Worship',
    responsibleCommunity: 'General'
  });

  // Attendance State
  const [newRecord, setNewRecord] = useState({
    memberName: '',
    status: AttendanceStatus.PRESENT
  });

  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  const filteredAttendance = attendance.filter(log => {
    if (!selectedDateFilter) return true;
    return log.date === selectedDateFilter;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleOpenEventModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setEventFormData({
        name: event.name,
        date: event.date,
        type: event.type,
        responsibleCommunity: event.responsibleCommunity
      });
    } else {
      setEditingEvent(null);
      setEventFormData({
        name: '',
        date: new Date().toISOString().split('T')[0],
        type: 'Worship',
        responsibleCommunity: 'General'
      });
    }
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = () => {
    if (!eventFormData.name || !eventFormData.date) return;

    if (editingEvent) {
      onEditEvent({
        ...editingEvent,
        ...eventFormData
      });
    } else {
      onAddEvent({
        id: `E${Date.now()}`,
        ...eventFormData
      });
    }
    setIsEventModalOpen(false);
  };

  const handleOpenAttendance = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsAttendanceModalOpen(true);
  };

  const handleAddAttendance = () => {
    if (!newRecord.memberName || !selectedEventId) return;

    const event = events.find(e => e.id === selectedEventId);

    const record = {
      date: event?.date || new Date().toISOString().split('T')[0],
      eventName: event?.name || 'Unknown Event',
      memberName: newRecord.memberName,
      status: newRecord.status
    };

    onAddAttendance(record);
    setIsAttendanceModalOpen(false);
    setNewRecord({
      memberName: '',
      status: AttendanceStatus.PRESENT
    });
    // Switch to logs tab to see the entry
    setActiveTab('attendance');
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Event Calendar</h2>
          <p className="text-slate-500">Plan and track church-wide activities.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'calendar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'attendance' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Attendance Logs
          </button>
        </div>
      </div>

      {activeTab === 'calendar' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <CalendarIcon size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{event.type}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{event.name}</h3>
              <div className="space-y-2 mb-6 flex-1">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock size={16} />
                  <span>{event.date} • 10:00 AM</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin size={16} />
                  <span>Main Sanctuary</span>
                </div>
              </div>
              <button
                onClick={() => handleOpenAttendance(event.id)}
                className="w-full py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-sm font-semibold">
                Mark Attendance
              </button>

              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEventModal(event)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this event?')) {
                      onDeleteEvent(event.id);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => handleOpenEventModal()}
            className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all gap-2 min-h-[200px]"
          >
            <Plus size={32} />
            <span className="font-medium">Schedule New Event</span>
          </button>

          {/* Event CRUD Modal */}
          {isEventModalOpen && (
            <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-xl font-bold text-slate-800">
                    {editingEvent ? 'Edit Event' : 'Schedule Event'}
                  </h3>
                  <button
                    onClick={() => setIsEventModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Event Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. Sabbath Service"
                      value={eventFormData.name}
                      onChange={(e) => setEventFormData({ ...eventFormData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={eventFormData.date}
                        onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                      <select
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={eventFormData.type}
                        onChange={(e) => setEventFormData({ ...eventFormData, type: e.target.value })}
                      >
                        <option value="Worship">Worship</option>
                        <option value="Fellowship">Fellowship</option>
                        <option value="Outreach">Outreach</option>
                        <option value="Special">Special</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Responsible Group</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. General or Youth Dept"
                      value={eventFormData.responsibleCommunity}
                      onChange={(e) => setEventFormData({ ...eventFormData, responsibleCommunity: e.target.value })}
                    />
                  </div>

                  <button
                    onClick={handleSaveEvent}
                    disabled={!eventFormData.name || !eventFormData.date}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CalendarDays size={18} />
                    {editingEvent ? 'Save Changes' : 'Schedule Event'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Modal (Renamed isModalOpen to isAttendanceModalOpen) */}
          {isAttendanceModalOpen && (
            <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-xl font-bold text-slate-800">Mark Attendance</h3>
                  <button
                    onClick={() => setIsAttendanceModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Event</p>
                    <p className="font-semibold text-blue-900">{events.find(e => e.id === selectedEventId)?.name}</p>
                    <p className="text-sm text-blue-700">{events.find(e => e.id === selectedEventId)?.date}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Member Name</label>
                    <div className="relative">
                      <select
                        className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full appearance-none"
                        value={newRecord.memberName}
                        onChange={(e) => setNewRecord({ ...newRecord, memberName: e.target.value })}
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          checked={newRecord.status === AttendanceStatus.PRESENT}
                          onChange={() => setNewRecord({ ...newRecord, status: AttendanceStatus.PRESENT })}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-sm text-slate-700">Present</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          checked={newRecord.status === AttendanceStatus.ABSENT}
                          onChange={() => setNewRecord({ ...newRecord, status: AttendanceStatus.ABSENT })}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-sm text-slate-700">Absent</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleAddAttendance}
                    disabled={!newRecord.memberName}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle size={18} />
                    Confirm Attendance
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="date"
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
              />
            </div>
            {selectedDateFilter && (
              <button
                onClick={() => setSelectedDateFilter('')}
                className="text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Clear Filter
              </button>
            )}
            <div className="ml-auto text-sm text-slate-500">
              Showing {filteredAttendance.length} records
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Event Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Member Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAttendance.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">{log.date}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">{log.eventName}</td>
                      <td className="px-6 py-4 text-sm text-slate-800">{log.memberName}</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${log.status === 'Present' ? 'text-green-600' : 'text-red-600'}`}>
                          <CheckCircle size={14} />
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredAttendance.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No attendance records found for this date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsView;
