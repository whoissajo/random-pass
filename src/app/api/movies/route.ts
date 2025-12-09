import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use Service Role for Admin writes

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
    try {
        const { data: movies, error } = await supabase
            .from('movies')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(movies)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    // Simple Admin Protection
    const adminKey = request.headers.get('x-admin-key')
    if (adminKey !== process.env.ADMIN_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { title, description, thumbnail_url, video_url, genre, duration, year } = body

        const { data, error } = await supabase
            .from('movies')
            .insert([
                { title, description, thumbnail_url, video_url, genre, duration, year }
            ])
            .select()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add movie' }, { status: 500 })
    }
}
