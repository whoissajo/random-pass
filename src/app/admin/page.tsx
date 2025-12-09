"use client"

import { useState, useRef } from 'react'
import { Plus, Save, Loader2, UploadCloud, Film, Image as ImageIcon } from 'lucide-react'

// Helper to interact with our API
async function getPresignedUrl(filename: string, fileType: string, adminKey: string) {
    const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ filename, fileType })
    })
    if (!res.ok) throw new Error('Auth failed or API error')
    return res.json()
}

async function uploadToR2(url: string, file: File | Blob) {
    await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
    })
}

export default function AdminPage() {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('')
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        genre: '',
        duration: '',
        year: new Date().getFullYear(),
        admin_key: ''
    })

    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null)
    const [thumbnailPreview, setThumbnailPreview] = useState<string>('')

    // Refs for auto-thumbnail generation
    const videoHiddenRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setVideoFile(file)
            // Estimate duration or just clear
            generateRandomThumbnail(file)
        }
    }

    const generateRandomThumbnail = (file: File) => {
        setStatus('Generating Thumbnail...')
        const video = videoHiddenRef.current
        if (!video) return

        const url = URL.createObjectURL(file)
        video.src = url
        video.crossOrigin = "anonymous"

        video.onloadedmetadata = () => {
            // Seek to random time (e.g., 20% to 80% marks)
            const randomTime = Math.random() * (video.duration * 0.6) + (video.duration * 0.2)
            video.currentTime = randomTime

            // Auto-fill duration roughly
            const hours = Math.floor(video.duration / 3600)
            const mins = Math.floor((video.duration % 3600) / 60)
            setFormData(prev => ({ ...prev, duration: `${hours}h ${mins}m` }))
        }

        video.onseeked = () => {
            const ctx = canvasRef.current?.getContext('2d')
            if (ctx && canvasRef.current) {
                canvasRef.current.width = video.videoWidth
                canvasRef.current.height = video.videoHeight
                ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)

                canvasRef.current.toBlob((blob) => {
                    if (blob) {
                        setThumbnailBlob(blob)
                        setThumbnailPreview(URL.createObjectURL(blob))
                        setStatus('Thumbnail Ready!')
                    }
                }, 'image/jpeg', 0.85)
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!videoFile || !thumbnailBlob) {
            alert('Please select a video and ensure thumbnail is generated')
            return
        }

        setLoading(true)
        try {
            // 1. Upload Video
            setStatus('Uploading Video to R2...')
            const vidData = await getPresignedUrl(videoFile.name, videoFile.type, formData.admin_key)
            await uploadToR2(vidData.uploadUrl, videoFile)

            // 2. Upload Thumbnail
            setStatus('Uploading Thumbnail to R2...')
            const thumbName = `thumb-${videoFile.name.split('.')[0]}.jpg`
            const thumbData = await getPresignedUrl(thumbName, 'image/jpeg', formData.admin_key)
            await uploadToR2(thumbData.uploadUrl, thumbnailBlob)

            // 3. Save to Supabase
            setStatus('Saving Metadata...')
            const res = await fetch('/api/movies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': formData.admin_key
                },
                body: JSON.stringify({
                    ...formData,
                    video_url: vidData.publicUrl,
                    thumbnail_url: thumbData.publicUrl
                })
            })

            if (!res.ok) throw new Error('Database Error')

            alert('Movie Added Successfully!')
            setVideoFile(null)
            setThumbnailPreview('')
            setStatus('')
            // clear form...
        } catch (error) {
            console.error(error)
            alert(`Error: ${error}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold border-b border-gray-800 pb-4">
                    Admin Studio
                </h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 space-y-4">
                        <label className="text-sm font-medium text-red-500">Security</label>
                        <input
                            required
                            type="password"
                            className="w-full bg-black border border-zinc-700 rounded p-3 focus:border-red-500 outline-none"
                            placeholder="Admin API Key"
                            value={formData.admin_key}
                            onChange={e => setFormData({ ...formData, admin_key: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-lg font-medium">1. Select Video</label>
                            <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-500 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="video/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleVideoSelect}
                                />
                                <Film className="w-12 h-12 text-zinc-500" />
                                <p className="text-zinc-400">
                                    {videoFile ? videoFile.name : 'Click to Upload Video (MP4/MKV)'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-lg font-medium">2. Computed Thumbnail</label>
                            <div className="aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-700 relative flex items-center justify-center">
                                {thumbnailPreview ? (
                                    <img src={thumbnailPreview} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                                        <ImageIcon className="w-8 h-8" />
                                        <span className="text-xs">Auto-generated from video</span>
                                    </div>
                                )}
                            </div>
                            {/* Hidden Elements for Processing */}
                            <video ref={videoHiddenRef} className="hidden" />
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-lg font-medium">3. Details</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                required
                                className="bg-zinc-900 border border-zinc-800 rounded p-3"
                                placeholder="Title"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                            <input
                                type="number"
                                className="bg-zinc-900 border border-zinc-800 rounded p-3"
                                placeholder="Year"
                                value={formData.year}
                                onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                            />
                            <input
                                required
                                className="bg-zinc-900 border border-zinc-800 rounded p-3"
                                placeholder="Genre"
                                value={formData.genre}
                                onChange={e => setFormData({ ...formData, genre: e.target.value })}
                            />
                            <input
                                required
                                className="bg-zinc-900 border border-zinc-800 rounded p-3"
                                placeholder="Duration"
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                            />
                        </div>
                        <textarea
                            required
                            rows={3}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-3"
                            placeholder="Description"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <UploadCloud className="w-6 h-6" />}
                        {loading ? status : 'Upload to R2 & Publish'}
                    </button>
                </form>
            </div>
        </div>
    )
}
