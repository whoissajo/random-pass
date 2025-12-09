"use client"

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function WatchPage() {
    const params = useParams()
    const id = params.id as string

    // In a real app, fetch movie by ID here.
    // For demo, we use a sample video.
    const sampleVideoUrl = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

    return (
        <div className="w-screen h-screen bg-black overflow-hidden relative">
            <Link
                href="/"
                className="absolute top-8 left-8 z-50 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
            >
                <ArrowLeft className="w-8 h-8" />
            </Link>

            <video
                className="w-full h-full object-contain focus:outline-none"
                autoPlay
                controls
                src={sampleVideoUrl}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    )
}
