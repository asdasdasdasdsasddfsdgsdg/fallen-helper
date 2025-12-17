'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateEvent() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        description: '',
        template: 'raid',
        guildId: '',
        channelId: ''
    });

    const [guilds, setGuilds] = useState<any[]>([]);
    const [channels, setChannels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch Guilds on Load
    useEffect(() => {
        async function fetchGuilds() {
            try {
                const res = await fetch('/api/guilds');
                const data = await res.json();
                if (data.guilds) {
                    setGuilds(data.guilds);
                }
            } catch (error) {
                console.error('Failed to fetch guilds:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchGuilds();
    }, []);

    // Update channels when guild changes
    useEffect(() => {
        const selectedGuild = guilds.find(g => g.id === formData.guildId);
        if (selectedGuild) {
            setChannels(selectedGuild.channels);
            setFormData(prev => ({ ...prev, channelId: '' })); // Reset channel
        }
    }, [formData.guildId, guilds]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.channelId) {
            alert("Please select a channel!");
            return;
        }

        try {
            const res = await fetch('/api/events/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                router.push('/dashboard');
            } else {
                alert('Failed: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error(error);
            alert('Failed to create event');
        }
    };

    if (loading) return <div className="text-white p-10">Loading servers...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <Link href="/dashboard" className="text-gray-400 hover:text-purple-400 mb-4 inline-block">&larr; Back to Dashboard</Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Form Section */}
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                    <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Event Title</label>
                            <input
                                type="text"
                                className="w-full bg-gray-700 border border-gray-600 rounded p-3 focus:outline-none focus:border-purple-500"
                                placeholder="e.g. Molten Core Raid"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {/* Server/Channel Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Server</label>
                                <select
                                    className="w-full bg-gray-700 border border-gray-600 rounded p-3 focus:outline-none focus:border-purple-500"
                                    value={formData.guildId}
                                    onChange={(e) => setFormData({ ...formData, guildId: e.target.value })}
                                >
                                    <option value="">Select Server</option>
                                    {guilds.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Channel</label>
                                <select
                                    className="w-full bg-gray-700 border border-gray-600 rounded p-3 focus:outline-none focus:border-purple-500"
                                    value={formData.channelId}
                                    onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                                    disabled={!formData.guildId}
                                >
                                    <option value="">Select Channel</option>
                                    {channels.map(c => (
                                        <option key={c.id} value={c.id}>#{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Date & Time</label>
                            <input
                                type="datetime-local"
                                className="w-full bg-gray-700 border border-gray-600 rounded p-3 focus:outline-none focus:border-purple-500"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Template</label>
                            <select
                                className="w-full bg-gray-700 border border-gray-600 rounded p-3 focus:outline-none focus:border-purple-500"
                                value={formData.template}
                                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                            >
                                <option value="raid">Raid (Standard)</option>
                                <option value="dungeon">Dungeon</option>
                                <option value="pvp">PVP Battleground</option>
                            </select>
                        </div>

                        <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded font-bold hover:opacity-90 transition">
                            Launch Event
                        </button>
                    </form>
                </div>

                {/* Preview Section */}
                <div className="bg-[#36393f] p-4 rounded-lg h-fit max-w-md">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-600"></div>
                        <div>
                            <div className="font-bold text-white">Fallen Helper <span className="text-[10px] bg-blue-600 px-1 rounded text-white ml-1">BOT</span></div>
                            <div className="text-xs text-gray-400">Today at 12:00 PM</div>
                        </div>
                    </div>

                    <div className="border-l-4 border-purple-600 bg-[#2f3136] p-4 rounded-r">
                        <h3 className="font-bold text-white text-lg">{formData.title || 'Event Title'}</h3>
                        <p className="text-gray-300 text-sm mt-2">{formData.description || 'Join us for an epic adventure!'}</p>

                        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                            <div className="text-gray-400">📅 Date</div>
                            <div className="text-white">{formData.date ? new Date(formData.date).toLocaleString() : 'TBD'}</div>
                            <div className="text-gray-400">⚔️ Template</div>
                            <div className="text-white capitalize">{formData.template}</div>
                            <div className="text-gray-400">📡 Channel</div>
                            <div className="text-white">
                                {channels.find(c => c.id === formData.channelId)?.name || '...'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
