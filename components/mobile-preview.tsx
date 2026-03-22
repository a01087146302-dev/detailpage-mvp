"use client";

import type { DetailBlock, MediaItem, MediaSlotBlock } from "@/types/editor";
import { SectionTitle } from "@/components/ui";

type MobilePreviewProps = {
  blocks: DetailBlock[];
  media: MediaItem[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
};

function getMedia(media: MediaItem[], id: string | null) {
  return media.find((item) => item.id === id) ?? null;
}

function MediaView({ item }: { item: MediaItem | null }) {
  if (!item) {
    return null;
  }

  if (item.type === "video") {
    return (
      <video
        className="w-full rounded-[24px] bg-black object-cover"
        src={item.url}
        controls
        muted
        playsInline
        preload="metadata"
      />
    );
  }

  return <img className="w-full rounded-[24px] object-cover" src={item.url} alt={item.name} />;
}

function renderMediaSlotCard(block: MediaSlotBlock, media: MediaItem[]) {
  const item = getMedia(media, block.mediaId);
  const isEmptySlot = !item;

  return (
    <div className="grid gap-3 rounded-[26px] bg-slate-50 p-3">
      <div>
        <h3 className="text-xl font-semibold">{block.title}</h3>
      </div>
      {isEmptySlot ? (
        <div className="flex min-h-56 items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-100 px-6 text-center text-sm leading-6 text-slate-500">
          {block.mediaKind === "video" ? "영상 업로드 필요" : "이미지 업로드 필요"}
        </div>
      ) : (
        <MediaView item={item} />
      )}
      <p className="text-sm leading-6 text-slate-600">
        {isEmptySlot
          ? `이 슬롯에 ${block.mediaKind === "video" ? "영상" : "이미지"}을 연결하면 현재 위치에 바로 미리보기 됩니다.`
          : block.description}
      </p>
    </div>
  );
}

export function MobilePreview({
  blocks,
  media,
  selectedBlockId,
  onSelectBlock
}: MobilePreviewProps) {
  const visibleBlocks = blocks.filter((block) => !block.hidden);
  const previewBlocks = visibleBlocks.filter((block) => {
    if (block.type !== "mediaSlot") {
      return true;
    }

    return true;
  });

  return (
    <div className="grid gap-4">
      <SectionTitle title="모바일 미리보기" description="등록된 영상과 이미지 블록이 상세페이지 흐름대로 표시됩니다." />
      <div className="mx-auto w-full max-w-[420px] rounded-[40px] border-[10px] border-ink bg-white p-4 shadow-phone">
        <div className="mb-4 flex justify-center">
          <div className="h-1.5 w-24 rounded-full bg-slate-300" />
        </div>
        <div className="grid gap-4">
          {previewBlocks.map((block) => (
            <button
              key={block.id}
              type="button"
              onClick={() => onSelectBlock(block.id)}
              className={`grid gap-3 rounded-[28px] p-1 text-left transition ${
                selectedBlockId === block.id ? "ring-2 ring-clay" : ""
              }`}
            >
              {block.type === "hero" ? (
                <div className="grid gap-2 rounded-[24px] bg-[linear-gradient(135deg,#172033,#31435c)] px-5 py-6 text-center text-white">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">Emotion Hook</p>
                  <h1 className="text-3xl font-bold leading-tight">{block.headline}</h1>
                  <p className="text-sm leading-6 text-white/75">{block.subheadline}</p>
                </div>
              ) : null}

              {block.type === "storyText" ? (
                <div className="rounded-[24px] border border-slate-200 px-5 py-6">
                  <h2 className="text-xl font-semibold">{block.title}</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{block.body}</p>
                </div>
              ) : null}

              {block.type === "mediaSlot" ? renderMediaSlotCard(block, media) : null}

              {block.type === "copy" ? (
                <div className="rounded-[28px] border border-[#d9c2b5] bg-[linear-gradient(135deg,#fff7f1,#f4e7dd)] px-5 py-6 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-clay">Recommend</p>
                  <h2 className="mt-2 text-2xl font-semibold">{block.title}</h2>
                  <div className="mt-4 grid gap-2">
                    {block.description
                      .split("\n")
                      .filter(Boolean)
                      .map((line) => (
                        <div key={line} className="rounded-2xl bg-white/80 px-4 py-3 text-sm leading-6 text-slate-700">
                          {line}
                        </div>
                      ))}
                  </div>
                </div>
              ) : null}

              {block.type === "materialLaundry" ? (
                <div className="rounded-[24px] bg-slate-50 px-5 py-5">
                  <h2 className="text-lg font-semibold">소재 / 세탁 정보</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    <strong>소재</strong>
                    {"\n"}
                    {block.materialInfo}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    <strong>세탁</strong>
                    {"\n"}
                    {block.laundryInfo}
                  </p>
                </div>
              ) : null}

              {block.type === "size" ? (
                <div className="rounded-[24px] border border-slate-200 px-5 py-5">
                  <h2 className="text-lg font-semibold">사이즈 정보</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{block.sizeInfo}</p>
                </div>
              ) : null}

              {block.type === "purchase" ? (
                <div className="grid gap-3 rounded-[24px] bg-[#faf7f2] px-4 py-5 text-center">
                  <a
                    href={block.link || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-ink px-5 py-4 text-sm font-semibold text-white"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {block.buttonLabel}
                  </a>
                  <p className="text-sm text-slate-500">{block.helperText}</p>
                </div>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
