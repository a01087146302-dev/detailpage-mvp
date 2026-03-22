import { initialEditorState } from "@/lib/mock-data";
import type { EditorState } from "@/types/editor";

export type SharedEditorResponse = {
  state: EditorState;
  updatedAt: string;
};

const EDITOR_API = "/api/editor";
const REQUEST_TIMEOUT_MS = 5000;

function createFallbackResponse(): SharedEditorResponse {
  return {
    state: {
      ...initialEditorState,
      selectedBlockId: null
    },
    updatedAt: new Date().toISOString()
  };
}

async function requestEditor<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(input, {
      cache: "no-store",
      ...init,
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`editor request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function fetchSharedEditorState() {
  try {
    return await requestEditor<SharedEditorResponse>(EDITOR_API);
  } catch {
    return createFallbackResponse();
  }
}

export async function saveSharedEditorState(state: EditorState) {
  return requestEditor<SharedEditorResponse>(EDITOR_API, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      state: {
        ...state,
        selectedBlockId: null
      }
    })
  });
}
