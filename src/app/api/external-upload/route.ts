import { NextResponse } from 'next/server'
import { getUploadUrl } from '@/core/r2'

// This endpoint is slightly different - it might use a different key or mechanism
// But for now, we'll reuse the ADMIN_KEY for simplicity, or allowed origins.
export async function POST(request: Request) {
    const apiKey = request.headers.get('x-api-key')

    // You might want a separate EXTERNAL_API_KEY in env, but reusing ADMIN_KEY for now as requested
    if (apiKey !== process.env.ADMIN_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { filename, fileType } = await request.json()
        const { uploadUrl, publicUrl } = await getUploadUrl(filename, fileType)
        return NextResponse.json({ uploadUrl, publicUrl })
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
