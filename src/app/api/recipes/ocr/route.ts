import { NextResponse } from "next/server";
import Tesseract from "tesseract.js";
import { parseIngredientString } from "@/lib/parse-ingredient";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Convert file to buffer for Tesseract
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data } = await Tesseract.recognize(buffer, "eng");

    const lines = data.text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 2);

    if (lines.length === 0) {
      return NextResponse.json(
        { error: "Could not read any text from the image. Try a clearer photo." },
        { status: 422 }
      );
    }

    const ingredients = lines.map((line) => parseIngredientString(line));

    return NextResponse.json({
      name: "",
      ingredients,
      prepMinutes: null,
      cookMinutes: null,
      baseServings: 4,
      tags: [],
    });
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json(
      { error: "Failed to process image. Try a different photo." },
      { status: 500 }
    );
  }
}
