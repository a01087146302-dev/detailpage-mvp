import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { initialEditorState } from "@/lib/mock-data";
import type { EditorState } from "@/types/editor";

type StoredEditorDocument = {
  state: EditorState;
  updatedAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DOCUMENT_PATH = path.join(DATA_DIR, "shared-editor-state.json");

function createInitialDocument(): StoredEditorDocument {
  return {
    state: {
      ...initialEditorState,
      selectedBlockId: null
    },
    updatedAt: new Date().toISOString()
  };
}

function isValidDocument(value: unknown): value is StoredEditorDocument {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<StoredEditorDocument>;
  return Boolean(candidate.state && typeof candidate.updatedAt === "string");
}

async function persistDocument(document: StoredEditorDocument) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DOCUMENT_PATH, JSON.stringify(document, null, 2), "utf-8");
  return document;
}

export async function readEditorDocument() {
  try {
    const raw = await readFile(DOCUMENT_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!isValidDocument(parsed)) {
      throw new Error("invalid shared editor document");
    }

    return parsed;
  } catch {
    const initial = createInitialDocument();

    try {
      await persistDocument(initial);
    } catch {
      return initial;
    }

    return initial;
  }
}

export async function writeEditorDocument(state: EditorState) {
  const document: StoredEditorDocument = {
    state: {
      ...state,
      selectedBlockId: null
    },
    updatedAt: new Date().toISOString()
  };

  return persistDocument(document);
}
