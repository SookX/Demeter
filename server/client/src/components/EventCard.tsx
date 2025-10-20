import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle } from 'lucide-react';

interface EventItem {
  _id: string;
  eventType: 'News' | 'Reminder' | 'Tip';
  eventDate: string;
  markRead: boolean;
  details: string;
}

export default function EventCard() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'news' | 'reminder' | 'tip'>('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) loadEvents(token);
  }, []);

  const loadEvents = async (token: string) => {
    try {
      const res = await axios.get('https://demeter-9xs8.onrender.com/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data?.events?.event_list || []);
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (eventId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.put(`https://demeter-9xs8.onrender.com/events/${eventId}/mark-read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(events.map(e => e._id === eventId ? { ...e, markRead: true } : e));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const filteredEvents = filter === 'all'
    ? events
    : events.filter(e => e.eventType.toLowerCase() === filter);

  const getEventColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'news': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'reminder': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'tip': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="h-8 bg-green-100 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-green-50 rounded animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-green-800 flex items-center gap-2">
          <span className="text-2xl">📅</span>
          Events & Notifications
        </h2>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['all','news','reminder','tip'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type as any)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              filter === type ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            {type === 'all' ? 'All' : type}
            {type !== 'all' && ` (${events.filter(e => e.eventType.toLowerCase() === type).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-green-600">
            <div className="text-4xl mb-2">📭</div>
            <p>No events to display</p>
          </div>
        ) : filteredEvents.map(event => {
          let title = '';
          let description = '';
          let emoji = '';

          if (event.eventType === 'Reminder') {
            title = 'Reminder';
            description = event.details;
            emoji = '💧';
          } else {
            const [e, t, d] = event.details.split('\n');
            emoji = e || '🪴';
            title = t || 'Untitled Event';
            description = d || '';
          }

          return (
            <div key={event._id} className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${getEventColor(event.eventType)} ${event.markRead ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">{emoji}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm mb-2">{description}</p>
                  <div className="flex items-center justify-between text-xs opacity-75">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(event.eventDate).toLocaleDateString()}
                    </div>
                    {!event.markRead && (
                      <button onClick={() => markAsRead(event._id)} className="flex items-center gap-1 hover:opacity-100 transition-opacity">
                        <CheckCircle size={12} /> Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
