"use client";

import type { DetailBlock } from "@/types/editor";
import { Button, SectionTitle } from "@/components/ui";
import { cn } from "@/lib/utils";

type BlockListProps = {
  blocks: DetailBlock[];
  selectedBlockId: string | null;
  onSelect: (id: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onToggleHidden: (id: string) => void;
  onDelete: (id: string) => void;
};

export function BlockList({
  blocks,
  selectedBlockId,
  onSelect,
  onMove,
  onToggleHidden,
  onDelete
}: BlockListProps) {
  function handleDragStart(event: React.DragEvent<HTMLButtonElement>, index: number) {
    event.dataTransfer.setData("text/plain", String(index));
  }

  function handleDrop(event: React.DragEvent<HTMLButtonElement>, index: number) {
    event.preventDefault();
    const fromIndex = Number(event.dataTransfer.getData("text/plain"));
    if (Number.isNaN(fromIndex)) {
      return;
    }
    onMove(fromIndex, index);
  }

  return (
    <div>
      <SectionTitle title="스토리 블록" description="드래그로 순서를 바꾸고, 숨김/삭제를 제어할 수 있습니다." />
      <div className="grid gap-2">
        {blocks.map((block, index) => (
          <button
            key={block.id}
            type="button"
            draggable
            onDragStart={(event) => handleDragStart(event, index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, index)}
            onClick={() => onSelect(block.id)}
            className={cn(
              "grid gap-3 rounded-3xl border px-4 py-4 text-left transition",
              block.id === selectedBlockId
                ? "border-ink bg-ink text-white"
                : "border-slate-200 bg-white hover:border-slate-300",
              block.hidden && "opacity-60"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] opacity-70">{String(index + 1).padStart(2, "0")}</p>
                <p className="mt-1 font-semibold">{block.label}</p>
              </div>
              <span className="rounded-full bg-black/5 px-2 py-1 text-xs">{block.type}</span>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={block.id === selectedBlockId ? "secondary" : "ghost"}
                className="px-3 py-2"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleHidden(block.id);
                }}
              >
                {block.hidden ? "보이기" : "숨기기"}
              </Button>
              <Button
                type="button"
                variant="danger"
                className="px-3 py-2"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(block.id);
                }}
              >
                삭제
              </Button>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
