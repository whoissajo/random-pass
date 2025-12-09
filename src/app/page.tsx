import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import MovieCard from '@/components/MovieCard'
import { Movie } from '@/core/types'
import { headers } from 'next/headers'

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
        console.error("Failed to fetch movies", e)
        return []
    }
}

export default async function Home() {
    const movies = await getMovies()

    // Show empty state if no movies
    if (movies.length === 0) {
        return (
            <main className="relative min-h-screen bg-black">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-screen text-white gap-4">
                    <h1 className="text-4xl font-bold">Welcome to StreamApp</h1>
                    <p className="text-gray-400">No movies found. Go to <a href="/admin" className="text-red-500 hover:underline">/admin</a> to add content.</p>
                </div>
            </main>
        )
    }

    const heroMovie = movies[0]

    return (
        <main className="relative min-h-screen pb-20 overflow-x-hidden">
            <Navbar />
            <Hero movie={heroMovie} />

            <div className="px-4 md:px-16 space-y-8 -mt-32 relative z-10">
                <section>
                    <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 hover:text-gray-300 cursor-pointer transition-colors max-w-max">
                        Library
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {movies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}
