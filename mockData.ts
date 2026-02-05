
import { Member, MemberStatus, Community, Event, AttendanceRecord, AttendanceStatus, Contribution, ContributionType } from './types';

export const MOCK_COMMUNITIES: Community[] = [
  { id: 'C1', name: 'Northside Fellowship', hostName: 'John Doe', location: '123 Maple St', meetingDay: 'Tuesday', maxCapacity: 20 },
  { id: 'C2', name: 'West End Grace', hostName: 'Sarah Smith', location: '456 Oak Rd', meetingDay: 'Wednesday', maxCapacity: 15 },
  { id: 'C3', name: 'Downtown Bridge', hostName: 'Mark Wilson', location: '789 Pine Ave', meetingDay: 'Thursday', maxCapacity: 25 },
];

export const MOCK_MEMBERS: Member[] = [
  { id: 'M1', fullName: 'Alice Johnson', phone: '555-0101', email: 'alice@example.com', address: '123 Maple St, Northside', passportPhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', status: MemberStatus.ACTIVE, assignedCommunity: 'Northside Fellowship', joinDate: '2023-01-15' },
  { id: 'M2', fullName: 'Bob Brown', phone: '555-0102', email: 'bob@example.com', address: '456 Oak Rd, West End', passportPhotoUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150', status: MemberStatus.ACTIVE, assignedCommunity: 'Northside Fellowship', joinDate: '2023-02-10' },
  { id: 'M3', fullName: 'Charlie Davis', phone: '555-0103', email: 'charlie@example.com', address: '789 Pine Ave, Downtown', status: MemberStatus.VISITOR, assignedCommunity: 'West End Grace', joinDate: '2024-03-05' },
  { id: 'M4', fullName: 'Diana Prince', phone: '555-0104', email: 'diana@example.com', address: '101 Hero Way, Metro', status: MemberStatus.ACTIVE, assignedCommunity: 'Downtown Bridge', joinDate: '2022-11-20' },
  { id: 'M5', fullName: 'Ethan Hunt', phone: '555-0105', email: 'ethan@example.com', address: '202 Spy Ln, Secret', status: MemberStatus.INACTIVE, assignedCommunity: 'Downtown Bridge', joinDate: '2021-06-12' },
];

export const MOCK_EVENTS: Event[] = [
  { id: 'E1', name: 'Sabbath Service', date: '2024-05-04', type: 'Worship', responsibleCommunity: 'General' },
  { id: 'E2', name: 'Sabbath Service', date: '2024-05-11', type: 'Worship', responsibleCommunity: 'General' },
  { id: 'E3', name: 'Sabbath Service', date: '2024-05-18', type: 'Worship', responsibleCommunity: 'General' },
  { id: 'E4', name: 'Youth Night', date: '2024-05-15', type: 'Special', responsibleCommunity: 'Downtown Bridge' },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { date: '2024-05-04', eventName: 'Sabbath Service', memberName: 'Alice Johnson', status: AttendanceStatus.PRESENT },
  { date: '2024-05-04', eventName: 'Sabbath Service', memberName: 'Bob Brown', status: AttendanceStatus.PRESENT },
  { date: '2024-05-04', eventName: 'Sabbath Service', memberName: 'Charlie Davis', status: AttendanceStatus.PRESENT },
  { date: '2024-05-11', eventName: 'Sabbath Service', memberName: 'Alice Johnson', status: AttendanceStatus.PRESENT },
  { date: '2024-05-11', eventName: 'Sabbath Service', memberName: 'Bob Brown', status: AttendanceStatus.ABSENT },
  { date: '2024-05-18', eventName: 'Sabbath Service', memberName: 'Alice Johnson', status: AttendanceStatus.PRESENT },
];

export const MOCK_CONTRIBUTIONS: Contribution[] = [
  { id: 'T1', date: '2024-05-05', memberName: 'Alice Johnson', amount: 100, type: ContributionType.TITHE },
  { id: 'T2', date: '2024-05-05', memberName: 'Bob Brown', amount: 50, type: ContributionType.OFFERING },
  { id: 'T3', date: '2024-05-12', memberName: 'Alice Johnson', amount: 100, type: ContributionType.TITHE },
  { id: 'T4', date: '2024-04-20', memberName: 'Diana Prince', amount: 250, type: ContributionType.TITHE },
];
