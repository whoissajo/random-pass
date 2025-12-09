import { NextResponse } from 'next/server'
import { getUploadUrl } from '@/core/r2'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase (Admin Context)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
    const apiKey = request.headers.get('x-api-key')

    if (apiKey !== process.env.ADMIN_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { filename, fileType } = await request.json()
        if (!filename) return NextResponse.json({ error: 'Filename required' }, { status: 400 })

        // 1. Generate R2 URLs
        const { uploadUrl, publicUrl } = await getUploadUrl(filename, fileType || 'video/mp4')

        // 2. Derive Metadata
        // Remove extension and replace dashes/underscores with spaces for a cleaner title
        const rawName = filename.split('.').slice(0, -1).join('.') || filename
        const title = rawName.replace(/[-_]/g, ' ')

        // Default placeholder thumbnail (Dark gray box or generic image)
        // You can replace this with a real hosted image URL if you have one
        const defaultThumbnail = "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800&auto=format&fit=crop"

        // 3. Auto-Insert into Database
        const { error } = await supabase
            .from('movies')
            .insert([{
                title: title,
                description: 'Uploaded via API',
                video_url: publicUrl,
                thumbnail_url: defaultThumbnail,
                genre: 'Upload',
                duration: 'Unknown',
                year: new Date().getFullYear()
            }])

        if (error) {
            console.error("DB Insert Error:", error)
            // We continue even if DB fails? No, better warn user.
            return NextResponse.json({ error: 'Database sync failed' }, { status: 500 })
        }

        return NextResponse.json({
            uploadUrl,
            publicUrl,
            message: 'Upload URL generated and Movie added to Library'
        })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
