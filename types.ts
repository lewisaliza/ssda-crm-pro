
export enum MemberStatus {
  ACTIVE = 'Active',
  VISITOR = 'Visitor',
  INACTIVE = 'Inactive'
}

export interface Member {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address?: string;
  passportPhotoUrl?: string;
  status: MemberStatus;
  assignedCommunity: string;
  joinDate: string;
  attendanceFrequency?: number;
  totalContributionYTD?: number;
}

export interface Community {
  id: string;
  name: string;
  hostName: string;
  location: string;
  meetingDay: string;
  maxCapacity: number;
  memberCount?: number;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  type: string;
  responsibleCommunity: string;
  location?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
}

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent'
}

export interface AttendanceRecord {
  date: string;
  eventName: string;
  memberName: string;
  status: AttendanceStatus;
}

export enum ContributionType {
  TITHE = 'Tithe',
  OFFERING = 'Offering',
  OTHER = 'Other'
}


export interface Contribution {
  id: string;
  date: string;
  memberName: string;
  amount: number;
  type: ContributionType;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  password?: string; // For form handling only
}
