import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const urls: Record<string, string> = {};

    const uploadPromises = Array.from(formData.entries()).map(
      async ([key, value]) => {
        if (value && value instanceof File) {
          const file = value as File;
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const isPdf =
            file.type === "application/pdf" ||
            file.name.toLowerCase().endsWith(".pdf");

          // Upload to Cloudinary using streams
          const secureUrl = await new Promise<string>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "student-registration",
                public_id: `${Date.now()}-${file.name.split(".")[0]}`.replace(
                  /[^a-zA-Z0-9-_]/g,
                  "",
                ),
                resource_type: "auto",
                // Only apply image transformations to non-PDF files to prevent rasterizing PDFs to single-page images
                ...(isPdf
                  ? {}
                  : {
                      transformation: [
                        { width: 1200, height: 1200, crop: "limit" }, // Limit dimensions to keep it compact
                        { quality: "auto:eco" }, // Compress quality to reduce file size under 200kb
                        { fetch_format: "auto" }, // Auto convert to webp/avif if possible
                      ],
                    }),
              },
              (error, result) => {
                if (error) {
                  console.error(`[Cloudinary Upload Error for ${key}]:`, error);
                  return reject(error);
                }
                resolve(result?.secure_url || "");
              },
            );
            uploadStream.end(buffer);
          });

          urls[key] = secureUrl;
        }
      },
    );

    await Promise.all(uploadPromises);

    return NextResponse.json({ success: true, urls });
  } catch (error: any) {
    console.error("[Upload API Route Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal Server Error during file upload",
      },
      { status: 500 },
    );
  }
}
