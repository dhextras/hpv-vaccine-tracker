import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { validateClinicData } from "@/lib/utils/admin";

export async function POST(request: NextRequest) {
  try {
    const { clinics } = await request.json();

    if (!validateClinicData(clinics)) {
      return NextResponse.json(
        { error: "Invalid clinic data format" },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), "public", "config", "clinics.json");
    await writeFile(filePath, JSON.stringify(clinics, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update clinics" },
      { status: 500 }
    );
  }
}
