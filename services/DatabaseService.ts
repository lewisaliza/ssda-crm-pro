
import { Member, Community, Event, AttendanceRecord, Contribution, User } from '../types';

const API_URL = '/api';

// Initialize - effectively a ping to ensure backend is up
export const initializeDatabase = async () => {
    try {
        const res = await fetch(`${API_URL}/members`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Server not reachable');
        console.log('Connected to Backend API');
    } catch (e) {
        console.error('Failed to connect to backend', e);
    }
};

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// Data Access Object using Fetch API
export const DB = {
    // Members
    getMembers: async (): Promise<Member[]> => {
        try {
            const res = await fetch(`${API_URL}/members`, { headers: getHeaders() });
            if (!res.ok) return [];
            return await res.json();
        } catch (e) { console.error(e); return []; }
    },

    addMember: async (member: Member) => {
        await fetch(`${API_URL}/members`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(member)
        });
    },

    updateMember: async (member: Member) => {
        await fetch(`${API_URL}/members/${member.id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(member)
        });
    },

    deleteMember: async (id: string) => {
        await fetch(`${API_URL}/members/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
    },

    // Communities
    getCommunities: async (): Promise<Community[]> => {
        try {
            const res = await fetch(`${API_URL}/communities`, { headers: getHeaders() });
            if (!res.ok) return [];
            return await res.json();
        } catch (e) { console.error(e); return []; }
    },

    addCommunity: async (community: Community) => {
        await fetch(`${API_URL}/communities`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(community)
        });
    },

    updateCommunity: async (community: Community) => {
        await fetch(`${API_URL}/communities/${community.id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(community)
        });
    },

    deleteCommunity: async (id: string) => {
        await fetch(`${API_URL}/communities/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
    },

    // Events
    getEvents: async (): Promise<Event[]> => {
        try {
            const res = await fetch(`${API_URL}/events`, { headers: getHeaders() });
            if (!res.ok) return [];
            return await res.json();
        } catch (e) { console.error(e); return []; }
    },

    addEvent: async (event: Event) => {
        await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(event)
        });
    },

    updateEvent: async (event: Event) => {
        await fetch(`${API_URL}/events/${event.id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(event)
        });
    },

    deleteEvent: async (id: string) => {
        await fetch(`${API_URL}/events/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
    },

    // Attendance
    getAttendance: async (): Promise<AttendanceRecord[]> => {
        try {
            const res = await fetch(`${API_URL}/attendance`, { headers: getHeaders() });
            if (!res.ok) return [];
            return await res.json();
        } catch (e) { console.error(e); return []; }
    },

    addAttendance: async (record: AttendanceRecord) => {
        await fetch(`${API_URL}/attendance`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(record)
        });
    },

    // Contributions
    getContributions: async (): Promise<Contribution[]> => {
        try {
            const res = await fetch(`${API_URL}/contributions`, { headers: getHeaders() });
            if (!res.ok) return [];
            return await res.json();
        } catch (e) { console.error(e); return []; }
    },

    addContribution: async (contribution: Contribution) => {
        await fetch(`${API_URL}/contributions`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(contribution)
        });
    },

    // Users (Admin)
    getUsers: async (): Promise<User[]> => {
        try {
            const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
            if (!res.ok) return [];
            return await res.json();
        } catch (e) { console.error(e); return []; }
    },

    addUser: async (user: User) => {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(user)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to add user');
        }
    },

    updateUser: async (user: User) => {
        const res = await fetch(`${API_URL}/users/${user.id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(user)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to update user');
        }
    },

    deleteUser: async (id: number) => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to delete user');
        }
    }
};
