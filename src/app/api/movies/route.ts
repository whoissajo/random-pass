import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { deleteFile } from '@/core/r2'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
    try {
        const { data: movies, error } = await supabase
            .from('movies')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Supabase Error:', error)
            throw error
        }

        return NextResponse.json(movies || [])
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const adminKey = request.headers.get('x-admin-key')
    if (adminKey !== process.env.ADMIN_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { title, description, thumbnail_url, video_url, genre, duration, year } = body

        const { data, error } = await supabase
            .from('movies')
            .insert([{ title, description, thumbnail_url, video_url, genre, duration, year }])
            .select()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const adminKey = request.headers.get('x-admin-key')
    if (adminKey !== process.env.ADMIN_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        // 1. Get record to find R2 keys
        const { data: movie } = await supabase.from('movies').select('*').eq('id', id).single()

        // 2. Delete from DB
        const { error } = await supabase.from('movies').delete().eq('id', id)
        if (error) throw error

        // 3. Cleanup R2
        if (movie) {
            try {
                if (movie.video_url && movie.video_url.includes('/')) {
                    const videoKey = movie.video_url.split('/').pop()
                    if (videoKey) await deleteFile(videoKey)
                }
                if (movie.thumbnail_url && movie.thumbnail_url.includes('/')) {
                    const thumbKey = movie.thumbnail_url.split('/').pop()
                    if (thumbKey) await deleteFile(thumbKey)
                }
            } catch (e) {
                console.error("R2 Cleanup Failed", e)
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
