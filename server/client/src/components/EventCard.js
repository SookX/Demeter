import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle } from 'lucide-react';
export default function EventCard() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token)
            loadEvents(token);
    }, []);
    const loadEvents = async (token) => {
        try {
            const res = await axios.get('http://localhost:3000/events', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEvents(res.data?.events?.event_list || []);
        }
        catch (err) {
            console.error('Error loading events:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const markAsRead = async (eventId) => {
        const token = localStorage.getItem('token');
        if (!token)
            return;
        try {
            await axios.put(`http://localhost:3000/events/${eventId}/mark-read`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEvents(events.map(e => e._id === eventId ? { ...e, markRead: true } : e));
        }
        catch (err) {
            console.error('Error marking as read:', err);
        }
    };
    const filteredEvents = filter === 'all'
        ? events
        : events.filter(e => e.eventType.toLowerCase() === filter);
    const getEventColor = (type) => {
        switch (type.toLowerCase()) {
            case 'news': return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'reminder': return 'bg-amber-50 border-amber-200 text-amber-800';
            case 'tip': return 'bg-green-50 border-green-200 text-green-800';
            default: return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6", children: [_jsx("div", { className: "h-8 bg-green-100 rounded w-1/3 mb-4 animate-pulse" }), _jsx("div", { className: "space-y-3", children: [1, 2, 3].map(i => _jsx("div", { className: "h-20 bg-green-50 rounded animate-pulse" }, i)) })] }));
    }
    return (_jsxs("div", { className: "bg-white rounded-2xl shadow-lg p-6", children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsxs("h2", { className: "text-xl font-semibold text-green-800 flex items-center gap-2", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDCC5" }), "Events & Notifications"] }) }), _jsx("div", { className: "flex gap-2 mb-4 flex-wrap", children: ['all', 'news', 'reminder', 'tip'].map(type => (_jsxs("button", { onClick: () => setFilter(type), className: `px-4 py-2 rounded-lg font-medium capitalize transition-colors ${filter === type ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`, children: [type === 'all' ? 'All' : type, type !== 'all' && ` (${events.filter(e => e.eventType.toLowerCase() === type).length})`] }, type))) }), _jsx("div", { className: "space-y-3 max-h-96 overflow-y-auto", children: filteredEvents.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-green-600", children: [_jsx("div", { className: "text-4xl mb-2", children: "\uD83D\uDCED" }), _jsx("p", { children: "No events to display" })] })) : filteredEvents.map(event => {
                    let title = '';
                    let description = '';
                    let emoji = '';
                    if (event.eventType === 'Reminder') {
                        title = 'Reminder';
                        description = event.details;
                        emoji = '💧';
                    }
                    else {
                        const [e, t, d] = event.details.split('\n');
                        emoji = e || '🪴';
                        title = t || 'Untitled Event';
                        description = d || '';
                    }
                    return (_jsx("div", { className: `border-2 rounded-lg p-4 transition-all hover:shadow-md ${getEventColor(event.eventType)} ${event.markRead ? 'opacity-60' : ''}`, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "text-3xl flex-shrink-0", children: emoji }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "font-semibold mb-1", children: title }), _jsx("p", { className: "text-sm mb-2", children: description }), _jsxs("div", { className: "flex items-center justify-between text-xs opacity-75", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Clock, { size: 12 }), new Date(event.eventDate).toLocaleDateString()] }), !event.markRead && (_jsxs("button", { onClick: () => markAsRead(event._id), className: "flex items-center gap-1 hover:opacity-100 transition-opacity", children: [_jsx(CheckCircle, { size: 12 }), " Mark as read"] }))] })] })] }) }, event._id));
                }) })] }));
}
