"use client"

import { useState } from 'react'
import { Plus, Save, Loader2 } from 'lucide-react'

export default function AdminPage() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        thumbnail_url: '',
        video_url: '',
        genre: '',
        duration: '',
        year: new Date().getFullYear(),
        admin_key: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/movies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': formData.admin_key
                },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error('Failed')
            alert('Movie added successfully!')
            setFormData({ ...formData, title: '', description: '' }) // Reset some fields
        } catch (error) {
            alert('Error adding movie. Check Admin Key.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold border-b border-gray-800 pb-4">
                    Content Manager
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Admin Secret Key</label>
                        <input
                            required
                            type="password"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 focus:border-red-600 outline-none"
                            placeholder="Enter server admin key..."
                            value={formData.admin_key}
                            onChange={e => setFormData({ ...formData, admin_key: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Title</label>
                            <input
                                required
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 focus:border-blue-600 outline-none"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Year</label>
                            <input
                                type="number"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 focus:border-blue-600 outline-none"
                                value={formData.year}
                                onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Description</label>
                        <textarea
                            required
                            rows={4}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 focus:border-blue-600 outline-none resize-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Genre</label>
                            <input
                                required
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 focus:border-blue-600 outline-none"
                                placeholder="Action, Sci-Fi..."
                                value={formData.genre}
                                onChange={e => setFormData({ ...formData, genre: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Duration</label>
                            <input
                                required
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 focus:border-blue-600 outline-none"
                                placeholder="2h 15m"
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Thumbnail URL</label>
                        <input
                            required
                            type="url"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 focus:border-blue-600 outline-none"
                            placeholder="https://..."
                            value={formData.thumbnail_url}
                            onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Video Source URL (R2/S3)</label>
                        <input
                            required
                            type="url"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 focus:border-blue-600 outline-none"
                            placeholder="https://..."
                            value={formData.video_url}
                            onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                        {loading ? 'Adding to Library...' : 'Add Movie'}
                    </button>
                </form>
            </div>
        </div>
    )
}
