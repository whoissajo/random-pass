import Link from 'next/link'
import { Play, Plus, ThumbsUp } from 'lucide-react'
import { Movie } from '@/core/types'

interface MovieCardProps {
    movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
    return (
        <div className="group relative h-36 min-w-[240px] md:h-40 md:min-w-[280px] bg-zinc-900 rounded overflow-hidden cursor-pointer transition-transform duration-300 hover:z-50 hover:scale-110">
            <img
                src={movie.thumbnail_url}
                alt={movie.title}
                className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
            />

            {/* Hover Card Content */}
            <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-zinc-800 shadow-xl flex flex-col justify-between p-4">
                <div className="w-full h-1/2 relative bg-zinc-900 mb-2 rounded-sm overflow-hidden">
                    <img src={movie.thumbnail_url} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Link href={`/watch/${movie.id}`} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors">
                            <Play className="w-4 h-4 fill-black text-black" />
                        </Link>
                        <button className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition-colors">
                            <Plus className="w-4 h-4 text-white" />
                        </button>
                        <button className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition-colors">
                            <ThumbsUp className="w-4 h-4 text-white" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold">
                        <span className="text-green-500">New</span>
                        <span>{movie.duration}</span>
                        <span className="border border-gray-500 px-1 text-[10px] rounded">HD</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-white">
                        {movie.genre}
                    </div>
                </div>
            </div>
        </div>
    )
}
