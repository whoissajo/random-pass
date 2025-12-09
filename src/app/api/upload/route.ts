import { NextResponse } from 'next/server'
import { getUploadUrl } from '@/core/r2'

export async function POST(request: Request) {
    // 1. Authenticate Admin
    const adminKey = request.headers.get('x-admin-key')
    if (adminKey !== process.env.ADMIN_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { filename, fileType } = await request.json()

        if (!filename || !fileType) {
            return NextResponse.json({ error: 'Missing filename or fileType' }, { status: 400 })
        }

        // 2. Generate Signed URL
        const { uploadUrl, publicUrl, key } = await getUploadUrl(filename, fileType)

        return NextResponse.json({ uploadUrl, publicUrl, key })
    } catch (error) {
        console.error('Upload Error:', error)
        return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
    }
}
