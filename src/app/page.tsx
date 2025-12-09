import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import MovieCard from '@/components/MovieCard'
import { Movie } from '@/core/types'
import { headers } from 'next/headers'

// Mock Data for demonstration (Fallback)
const mockMovie: Movie = {
    id: '1',
    title: 'Interstellar',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    thumbnail_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&h=800&fit=crop',
    video_url: '#',
    genre: 'Sci-Fi',
    duration: '2h 49m',
    year: 2014
}
const mockRow = Array(6).fill(mockMovie).map((m, i) => ({ ...m, id: `mock-${i}` }))

async function getMovies() {
    try {
        const host = headers().get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";

        // In server component, we need absolute URL
        const res = await fetch(`${protocol}://${host}/api/movies`, { cache: 'no-store' })
        if (!res.ok) return []
        const movies: Movie[] = await res.json()
        return movies
    } catch (e) {
        console.warn("Failed to fetch movies, using mock data")
        return []
    }
}

export default async function Home() {
    const movies = await getMovies()
    const displayMovies = movies.length > 0 ? movies : mockRow
    const heroMovie = displayMovies[0] || mockMovie

    return (
        <main className="relative min-h-screen pb-20 overflow-x-hidden">
            <Navbar />
            <Hero movie={heroMovie} />

            <div className="px-4 md:px-16 space-y-8 -mt-32 relative z-10">
                <section>
                    <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 hover:text-gray-300 cursor-pointer transition-colors max-w-max">
                        Trending Now
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {displayMovies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 hover:text-gray-300 cursor-pointer transition-colors max-w-max">
                        Top Rated
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {displayMovies.slice().reverse().map((movie) => (
                            <MovieCard key={`top-${movie.id}`} movie={movie} />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}
