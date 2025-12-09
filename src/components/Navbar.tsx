import Link from 'next/link'
import { Search, Bell, User } from 'lucide-react'

export default function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-4md:px-16 py-4 bg-gradient-to-b from-black/80 to-transparent transition-all duration-300">
            <div className="flex items-center gap-8">
                <Link href="/" className="text-2xl font-bold text-red-600 tracking-tighter hover:scale-105 transition-transform">
                    STREAMFLIX
                </Link>
                <div className="hidden md:flex gap-6 text-sm font-medium text-gray-300">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <Link href="#" className="hover:text-white transition-colors">Series</Link>
                    <Link href="#" className="hover:text-white transition-colors">Movies</Link>
                    <Link href="#" className="hover:text-white transition-colors">New & Popular</Link>
                </div>
            </div>

            <div className="flex items-center gap-6 text-white">
                <Search className="w-5 h-5 cursor-pointer hover:text-gray-300 transition-colors" />
                <Bell className="w-5 h-5 cursor-pointer hover:text-gray-300 transition-colors" />
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center cursor-pointer hover:ring-2 ring-white transition-all">
                    <User className="w-5 h-5" />
                </div>
            </div>
        </nav>
    )
}
