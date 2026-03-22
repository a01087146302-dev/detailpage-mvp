"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BlockList } from "@/components/block-list";
import { EditPanel } from "@/components/edit-panel";
import { MediaUploader } from "@/components/media-uploader";
import { MobilePreview } from "@/components/mobile-preview";
import { ProductForm } from "@/components/product-form";
import { Button, Panel, SectionTitle, Textarea } from "@/components/ui";
import { createNewMediaSlot, generateDraftBlocks, regenerateMediaCopy } from "@/lib/draft";
import { buildExportHtml } from "@/lib/export-html";
import { initialEditorState } from "@/lib/mock-data";
import { fetchSharedEditorState, saveSharedEditorState } from "@/lib/storage";
import type { DetailBlock, EditorState, MediaItem, MediaSlotBlock, ProductInfo, TextEntry } from "@/types/editor";

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [target] = next.splice(fromIndex, 1);
  if (!target) {
    return items;
  }

  next.splice(toIndex, 0, target);
  return next;
}

function isMediaSlot(block: DetailBlock): block is MediaSlotBlock {
  return block.type === "mediaSlot";
}

function getInitialSelection(state: EditorState) {
  return state.blocks[0]?.id ?? null;
}

export function EditorApp() {
  const [state, setState] = useState<EditorState>(initialEditorState);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(getInitialSelection(initialEditorState));
  const [isLoaded, setIsLoaded] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [saveState, setSaveState] = useState<"loading" | "saving" | "saved" | "error">("loading");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const skipSaveRef = useRef(true);
  const pendingLocalChangesRef = useRef(false);
  const lastServerUpdateRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const document = await fetchSharedEditorState();
        if (cancelled) {
          return;
        }

        skipSaveRef.current = true;
        pendingLocalChangesRef.current = false;
        lastServerUpdateRef.current = document.updatedAt;
        setState(document.state);
        setSelectedBlockId(getInitialSelection(document.state));
        setLastSyncedAt(document.updatedAt);
        setSaveState("saved");
      } catch {
        if (cancelled) {
          return;
        }

        skipSaveRef.current = true;
        pendingLocalChangesRef.current = false;
        setState(initialEditorState);
        setSelectedBlockId(getInitialSelection(initialEditorState));
        setLastSyncedAt(null);
        setSaveState("error");
      } finally {
        if (!cancelled) {
          setIsLoaded(true);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }

    pendingLocalChangesRef.current = true;
    setSaveState("saving");

    const timeout = window.setTimeout(async () => {
      try {
        const document = await saveSharedEditorState(state);
        pendingLocalChangesRef.current = false;
        lastServerUpdateRef.current = document.updatedAt;
        setLastSyncedAt(document.updatedAt);
        setSaveState("saved");
      } catch {
        pendingLocalChangesRef.current = false;
        setSaveState("error");
      }
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [isLoaded, state]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const interval = window.setInterval(async () => {
      if (pendingLocalChangesRef.current || saveState === "saving") {
        return;
      }

      try {
        const document = await fetchSharedEditorState();
        if (document.updatedAt !== lastServerUpdateRef.current) {
          skipSaveRef.current = true;
          pendingLocalChangesRef.current = false;
          lastServerUpdateRef.current = document.updatedAt;
          setState(document.state);
          setLastSyncedAt(document.updatedAt);
          setSaveState("saved");
          setSelectedBlockId((current) =>
            document.state.blocks.some((block) => block.id === current) ? current : getInitialSelection(document.state)
          );
        }
      } catch {
        setSaveState("error");
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isLoaded, saveState]);

  const selectedBlock = useMemo(
    () => state.blocks.find((block) => block.id === selectedBlockId) ?? null,
    [state.blocks, selectedBlockId]
  );

  const exportHtml = useMemo(() => buildExportHtml(state.blocks, state.media), [state.blocks, state.media]);

  const saveStatusLabel =
    saveState === "loading"
      ? "불러오는 중"
      : saveState === "saving"
        ? "저장 중"
        : saveState === "saved"
          ? "저장 완료"
          : "연결 오류";

  function updateProduct<K extends keyof ProductInfo>(key: K, value: ProductInfo[K]) {
    setState((current) => ({
      ...current,
      product: {
        ...current.product,
        [key]: value
      }
    }));
  }

  function addMediaItem(item: MediaItem) {
    setState((current) => ({
      ...current,
      media: [...current.media, item]
    }));
  }

  function cleanupUnusedMedia(current: EditorState, mediaId: string | null) {
    if (!mediaId) {
      return current.media;
    }

    const stillUsed = current.blocks.some((block) => block.type === "mediaSlot" && block.mediaId === mediaId);
    return stillUsed ? current.media : current.media.filter((item) => item.id !== mediaId);
  }

  function updateSlot(id: string, updater: (slot: MediaSlotBlock) => MediaSlotBlock) {
    setState((current) => {
      const previous = current.blocks.find((block) => block.id === id);
      const nextBlocks = current.blocks.map((block) =>
        block.id === id && block.type === "mediaSlot" ? updater(block) : block
      );

      const nextState = {
        ...current,
        blocks: nextBlocks
      };

      return {
        ...nextState,
        media: cleanupUnusedMedia(nextState, previous && previous.type === "mediaSlot" ? previous.mediaId : null)
      };
    });
  }

  function moveSlot(id: string, direction: "up" | "down") {
    setState((current) => {
      const index = current.blocks.findIndex((block) => block.id === id);
      if (index === -1) {
        return current;
      }

      const source = current.blocks[index];
      if (!isMediaSlot(source)) {
        return current;
      }

      const candidates = current.blocks
        .map((block, candidateIndex) => ({ block, candidateIndex }))
        .filter(({ block }) => isMediaSlot(block) && block.mediaKind === source.mediaKind);

      const slotIndex = candidates.findIndex(({ candidateIndex }) => candidateIndex === index);
      if (slotIndex === -1) {
        return current;
      }

      const targetSlot = direction === "up" ? candidates[slotIndex - 1] : candidates[slotIndex + 1];
      if (!targetSlot) {
        return current;
      }

      return {
        ...current,
        blocks: moveItem(current.blocks, index, targetSlot.candidateIndex)
      };
    });
  }

  function deleteSlot(id: string) {
    setState((current) => {
      const target = current.blocks.find((block) => block.id === id);
      const nextBlocks = current.blocks.filter((block) => block.id !== id);
      const nextState = {
        ...current,
        blocks: nextBlocks
      };

      setSelectedBlockId((currentId) => (currentId === id ? nextBlocks[0]?.id ?? null : currentId));

      return {
        ...nextState,
        media: cleanupUnusedMedia(nextState, target && target.type === "mediaSlot" ? target.mediaId : null)
      };
    });
  }

  function addSlot(kind: "video" | "image") {
    setState((current) => {
      const nextSlot = createNewMediaSlot(kind, current.blocks);
      const lastKindIndex = [...current.blocks]
        .map((block, index) => ({ block, index }))
        .filter(({ block }) => block.type === "mediaSlot" && block.mediaKind === kind)
        .at(-1)?.index;

      const nextBlocks = [...current.blocks];
      if (lastKindIndex === undefined) {
        nextBlocks.push(nextSlot);
      } else {
        nextBlocks.splice(lastKindIndex + 1, 0, nextSlot);
      }

      setSelectedBlockId(nextSlot.id);

      return {
        ...current,
        blocks: nextBlocks
      };
    });
  }

  function addTextBlock(item: TextEntry) {
    setState((current) => ({
      ...current,
      textBlocks: [...current.textBlocks, item]
    }));
  }

  function removeTextBlock(id: string) {
    setState((current) => ({
      ...current,
      textBlocks: current.textBlocks.filter((item) => item.id !== id)
    }));
  }

  function createDraft() {
    const blocks = generateDraftBlocks(state.product, state.media, state.textBlocks);
    setState((current) => ({
      ...current,
      blocks
    }));
    setSelectedBlockId(blocks[0]?.id ?? null);
  }

  function updateBlock(id: string, updater: (current: DetailBlock) => DetailBlock) {
    setState((current) => ({
      ...current,
      blocks: current.blocks.map((block) => (block.id === id ? updater(block) : block))
    }));
  }

  function regenerateCopies() {
    setState((current) => ({
      ...current,
      blocks: regenerateMediaCopy(current.blocks)
    }));
  }

  function toggleHidden(id: string) {
    updateBlock(id, (current) => ({ ...current, hidden: !current.hidden }));
  }

  function deleteBlock(id: string) {
    const target = state.blocks.find((block) => block.id === id);
    if (target?.type === "mediaSlot") {
      deleteSlot(id);
      return;
    }

    setState((current) => {
      const nextBlocks = current.blocks.filter((block) => block.id !== id);
      setSelectedBlockId((currentId) => (currentId === id ? nextBlocks[0]?.id ?? null : currentId));
      return {
        ...current,
        blocks: nextBlocks
      };
    });
  }

  function moveBlock(fromIndex: number, toIndex: number) {
    setState((current) => ({
      ...current,
      blocks: moveItem(current.blocks, fromIndex, toIndex)
    }));
  }

  function resetDemo() {
    skipSaveRef.current = true;
    setState(initialEditorState);
    setSelectedBlockId(getInitialSelection(initialEditorState));
    setSaveState(isLoaded ? "saved" : "loading");
  }

  return (
    <main className="min-h-screen px-4 py-6 lg:px-6">
      <div className="mx-auto max-w-[1600px]">
        <Panel className="mb-6 overflow-hidden bg-[linear-gradient(135deg,rgba(23,32,51,0.98),rgba(63,88,118,0.92))] text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">Media Story Detail Editor</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight lg:text-4xl">
                영상과 이미지를 계속 확장하면서
                <br />
                스토리형 상세페이지를 빠르게 만듭니다.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
                텍스트는 최소화하고, 미디어 블록 중심으로 흐름을 구성했습니다. 자동 카피 생성과 순서 변경 결과가
                미리보기에 바로 반영됩니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={createDraft}>초안 재생성</Button>
              <Button variant="secondary" onClick={() => setShowExport((current) => !current)}>
                HTML export
              </Button>
              <Button variant="ghost" onClick={resetDemo}>
                더미 데이터로 초기화
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/75">
            <span>저장 상태: {saveStatusLabel}</span>
            <span>마지막 동기화: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : "-"}</span>
          </div>
        </Panel>

        {showExport ? (
          <Panel className="mb-6">
            <SectionTitle
              title="HTML Export"
              description="현재 보이는 상세페이지 구조를 하나의 HTML 문자열로 확인할 수 있습니다."
            />
            <Textarea readOnly rows={14} value={exportHtml} className="font-mono text-xs leading-6" />
          </Panel>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(360px,1fr)_360px]">
          <div className="grid gap-6">
            <Panel>
              <ProductForm product={state.product} onChange={updateProduct} />
            </Panel>
            <Panel>
              <MediaUploader
                blocks={state.blocks}
                media={state.media}
                textBlocks={state.textBlocks}
                onAddMediaItem={addMediaItem}
                onUpdateSlot={updateSlot}
                onMoveSlot={moveSlot}
                onDeleteSlot={deleteSlot}
                onAddSlot={addSlot}
                onRegenerateCopies={regenerateCopies}
                onAddTextBlock={addTextBlock}
                onRemoveTextBlock={removeTextBlock}
              />
            </Panel>
            <Panel>
              <BlockList
                blocks={state.blocks}
                selectedBlockId={selectedBlockId}
                onSelect={setSelectedBlockId}
                onMove={moveBlock}
                onToggleHidden={toggleHidden}
                onDelete={deleteBlock}
              />
            </Panel>
          </div>

          <Panel className="min-h-[700px]">
            <MobilePreview
              blocks={state.blocks}
              media={state.media}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
            />
          </Panel>

          <Panel>
            <EditPanel block={selectedBlock} media={state.media} onUpdateBlock={updateBlock} />
          </Panel>
        </div>
      </div>
    </main>
  );
}
