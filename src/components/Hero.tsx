import { Play, Info } from 'lucide-react'
import { Movie } from '@/core/types'

interface HeroProps {
    movie: Movie;
}

export default function Hero({ movie }: HeroProps) {
    return (
        <div className="relative h-[80vh] w-full mb-8">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={movie.thumbnail_url}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute bottom-[20%] left-4 md:left-16 max-w-2xl space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg tracking-tight">
                    {movie.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span className="text-green-400 font-bold">98% Match</span>
                    <span>{movie.year}</span>
                    <span className="border border-gray-500 px-1 text-xs rounded">HD</span>
                    <span>{movie.duration}</span>
                </div>
                <p className="text-lg text-gray-200 drop-shadow-md line-clamp-3">
                    {movie.description}
                </p>

                <div className="flex items-center gap-4 pt-4">
                    <button className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded hover:bg-white/90 transition-colors font-bold text-lg">
                        <Play className="fill-black w-5 h-5" /> Play
                    </button>
                    <button className="flex items-center gap-2 bg-gray-500/70 text-white px-8 py-3 rounded hover:bg-gray-500/50 transition-colors font-bold text-lg backdrop-blur-sm">
                        <Info className="w-5 h-5" /> More Info
                    </button>
                </div>
            </div>
        </div>
    )
}
