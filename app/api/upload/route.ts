import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Sanitize filename and create unique timestamped name
    const originalName = file.name || "producto.png"
    const extension = path.extname(originalName) || ".png"
    const safeBase = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30)
    const filename = `${Date.now()}-${safeBase}${extension}`

    // Ensure public/images/uploads directory exists
    const uploadDir = path.join(process.cwd(), "public", "images", "uploads")
    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    const publicUrl = `/images/uploads/${filename}`
    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error("Error al procesar la subida de imagen:", error)
    return NextResponse.json(
      { error: "Error al guardar el archivo en el servidor" },
      { status: 500 }
    )
  }
}
