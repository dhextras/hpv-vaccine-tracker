import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { validateProgramConfig } from "@/lib/utils/admin";

export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json();

    if (!validateProgramConfig(config)) {
      return NextResponse.json(
        { error: "Invalid program config format" },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), "public", "config", "program_config.json");
    await writeFile(filePath, JSON.stringify(config, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update config" },
      { status: 500 }
    );
  }
}
