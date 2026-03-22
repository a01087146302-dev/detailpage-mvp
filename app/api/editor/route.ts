import { NextResponse } from "next/server";
import { readEditorDocument, writeEditorDocument } from "@/lib/server-document";
import type { EditorState } from "@/types/editor";

export async function GET() {
  try {
    const document = await readEditorDocument();
    return NextResponse.json(document);
  } catch {
    return NextResponse.json({ message: "failed to load shared editor state" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { state?: EditorState };

    if (!body.state) {
      return NextResponse.json({ message: "state is required" }, { status: 400 });
    }

    const document = await writeEditorDocument(body.state);
    return NextResponse.json(document);
  } catch {
    return NextResponse.json({ message: "failed to save shared editor state" }, { status: 500 });
  }
}
