import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const AUTO_COMPRESS_THRESHOLD = 1 * 1024 * 1024
const TARGET_MAX_BYTES = 900 * 1024

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const purpose = (formData.get('purpose') as string | null) || 'default'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'Datei ist zu groß (max. 10MB)' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const inputBuffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), 'public/uploads')
    await mkdir(uploadsDir, { recursive: true })

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

    if (isPdf) {
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      await writeFile(path.join(uploadsDir, filename), inputBuffer)
      return NextResponse.json({ url: `/uploads/${filename}` })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Ungültiger Dateityp' }, { status: 400 })
    }

    // Keep original resolution. Compress only files > 1MB.
    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-]/g, '_')
    const shouldCompress = file.size > AUTO_COMPRESS_THRESHOLD
    let outputBuffer: Buffer = Buffer.from(inputBuffer)
    const rawExt = (file.name.split('.').pop() || 'bin').toLowerCase()
    const safeExt = rawExt.replace(/[^a-z0-9]/g, '') || 'bin'
    let filename = `${Date.now()}-${baseName}.${safeExt}`

    // OG previews are most reliable as JPEG/PNG for social scrapers.
    if (purpose === 'og') {
      filename = `${Date.now()}-${baseName}.jpg`
      let quality = 88
      do {
        outputBuffer = await sharp(inputBuffer)
          .rotate()
          .jpeg({
            quality,
            mozjpeg: true,
            progressive: true,
          })
          .toBuffer()
        quality -= 5
      } while (outputBuffer.length > TARGET_MAX_BYTES && quality >= 60)
    } else if (shouldCompress) {
      filename = `${Date.now()}-${baseName}.webp`
      let quality = 86

      do {
        outputBuffer = await sharp(inputBuffer)
          .rotate()
          .webp({
            quality,
            effort: 4,
            smartSubsample: true,
          })
          .toBuffer()
        quality -= 6
      } while (outputBuffer.length > TARGET_MAX_BYTES && quality >= 52)
    }

    const filepath = path.join(uploadsDir, filename)

    await writeFile(filepath, outputBuffer)
    return NextResponse.json({
      url: `/uploads/${filename}`,
      compressed: purpose === 'og' ? true : shouldCompress,
      originalBytes: file.size,
      finalBytes: outputBuffer.length,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
