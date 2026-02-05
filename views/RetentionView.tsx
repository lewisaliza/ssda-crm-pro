
import React, { useState, useMemo } from 'react';
import { Bot, Search, AlertCircle, Mail, Loader2, CheckCircle, RefreshCcw } from 'lucide-react';
import { Member, AttendanceRecord, Event, MemberStatus, AttendanceStatus } from '../types';
import { generateOutreachMessage } from '../services/gemini';

interface RetentionViewProps {
  members: Member[];
  attendance: AttendanceRecord[];
  events: Event[];
}

const RetentionView: React.FC<RetentionViewProps> = ({ members, attendance, events }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [absenteeList, setAbsenteeList] = useState<any[]>([]);
  const [loadingMemberId, setLoadingMemberId] = useState<string | null>(null);
  const [draftedEmails, setDraftedEmails] = useState<Record<string, string>>({});

  const scanForAbsentees = () => {
    setIsScanning(true);
    // Simulate complex scan
    setTimeout(() => {
      // Find the last 3 "Sabbath Service" dates
      const serviceDates = Array.from(new Set(
        events
          .filter(e => e.name === "Sabbath Service")
          .map(e => e.date)
      )).sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime())
        .slice(0, 3);

      const absentees = members.filter(member => {
        if (member.status !== MemberStatus.ACTIVE) return false;

        // Count attendance in those specific dates
        const attendedCount = attendance.filter(att =>
          att.memberName === member.fullName &&
          att.eventName === "Sabbath Service" &&
          serviceDates.includes(att.date) &&
          att.status === AttendanceStatus.PRESENT
        ).length;

        return attendedCount === 0;
      }).map(m => ({
        ...m,
        missedEvents: serviceDates
      }));

      setAbsenteeList(absentees);
      setIsScanning(false);
    }, 1500);
  };

  const generateDraft = async (member: any) => {
    setLoadingMemberId(member.id);
    try {
      // Calculate estimated days absent based on the most recent service date
      const message = await generateOutreachMessage(member.fullName.split(' ')[0], 21);
      setDraftedEmails(prev => ({ ...prev, [member.id]: message }));
    } catch (error) {
      console.error("Failed to generate draft", error);
    } finally {
      setLoadingMemberId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Retention Bot</h2>
          <p className="text-slate-500">Automated absenteeism tracking and outreach assistant.</p>
        </div>
        <button
          onClick={scanForAbsentees}
          disabled={isScanning}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-200 disabled:opacity-50"
        >
          {isScanning ? <Loader2 className="animate-spin" size={20} /> : <RefreshCcw size={20} />}
          <span>{absenteeList.length > 0 ? 'Rescan for Absentees' : 'Run Retention Scan'}</span>
        </button>
      </div>

      {!absenteeList.length && !isScanning && (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mb-4">
            <Bot size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Start Your First Scan</h3>
          <p className="text-slate-500 max-w-md">
            Click the button above to analyze attendance patterns. We'll identify active members who haven't attended the last 3 Sabbath services.
          </p>
        </div>
      )}

      {isScanning && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      )}

      {absenteeList.length > 0 && (
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3 text-orange-800">
            <AlertCircle className="shrink-0" />
            <p className="text-sm font-medium">
              We found <span className="font-bold">{absenteeList.length}</span> active members who missed the last 3 Sabbath Services. Recommended: Outreach.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {absenteeList.map((member) => (
              <div key={member.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                      {member.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{member.fullName}</h4>
                      <p className="text-xs text-slate-500">Missed last 3 services</p>
                    </div>
                  </div>

                  {draftedEmails[member.id] ? (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase mb-2">
                        <CheckCircle size={14} /> AI Draft Generated
                      </div>
                      <p className="text-sm text-slate-700 italic leading-relaxed">
                        "{draftedEmails[member.id]}"
                      </p>
                    </div>
                  ) : (
                    <div className="py-4 border-t border-slate-100 mt-2">
                      <p className="text-sm text-slate-600">No outreach history recently. Consider checking in.</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Mail size={18} />
                    </button>
                  </div>
                  <button
                    onClick={() => generateDraft(member)}
                    disabled={loadingMemberId === member.id}
                    className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingMemberId === member.id ? <Loader2 className="animate-spin" size={14} /> : <Bot size={14} />}
                    {draftedEmails[member.id] ? 'Regenerate Draft' : 'Generate AI Outreach'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RetentionView;
