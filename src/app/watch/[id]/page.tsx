import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

// Force dynamic behavior so it always fetches fresh data
export const dynamic = 'force-dynamic'

export default async function WatchPage({ params }: { params: { id: string } }) {
    // 1. Initialize Supabase
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 2. Fetch Movie
    const { data: movie } = await supabase
        .from('movies')
        .select('*')
        .eq('id', params.id)
        .single()

    // 3. Handle 404
    if (!movie) {
        return notFound()
    }

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
                src={movie.video_url}
                poster={movie.thumbnail_url}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    )
}
