"use client";

import { useRef, useState } from "react";
import { createId } from "@/lib/utils";
import type { DetailBlock, MediaItem, MediaSlotBlock, MediaSlotRole, TextEntry } from "@/types/editor";
import { Button, Field, Input, SectionTitle, Select, Textarea } from "@/components/ui";

type MediaUploaderProps = {
  blocks: DetailBlock[];
  media: MediaItem[];
  textBlocks: TextEntry[];
  onAddMediaItem: (item: MediaItem) => void;
  onUpdateSlot: (id: string, updater: (slot: MediaSlotBlock) => MediaSlotBlock) => void;
  onMoveSlot: (id: string, direction: "up" | "down") => void;
  onDeleteSlot: (id: string) => void;
  onAddSlot: (kind: "video" | "image") => void;
  onRegenerateCopies: () => void;
  onAddTextBlock: (item: TextEntry) => void;
  onRemoveTextBlock: (id: string) => void;
};

const videoRoleOptions: Array<{ value: MediaSlotRole; label: string }> = [
  { value: "hook_video", label: "후킹 영상" },
  { value: "empathy_video", label: "공감 영상" },
  { value: "mood_video", label: "분위기 영상" },
  { value: "detail_video", label: "디테일 영상" },
  { value: "cta_video", label: "CTA 영상" },
  { value: "story_video", label: "일반 스토리 영상" }
];

const imageRoleOptions: Array<{ value: MediaSlotRole; label: string }> = [
  { value: "hero_image", label: "대표 이미지" },
  { value: "detail_image", label: "디테일 이미지" },
  { value: "mood_image", label: "분위기 이미지" },
  { value: "story_image", label: "일반 스토리 이미지" }
];

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsDataURL(file);
  });
}

function MediaThumbnail({ item }: { item: MediaItem | null }) {
  if (!item) {
    return (
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-xs text-slate-400">
        비어 있음
      </div>
    );
  }

  if (item.type === "video") {
    return (
      <video className="h-20 w-20 rounded-2xl bg-black object-cover" src={item.url} muted playsInline preload="metadata" />
    );
  }

  return <img className="h-20 w-20 rounded-2xl object-cover" src={item.url} alt={item.name} />;
}

export function MediaUploader({
  blocks,
  media,
  textBlocks,
  onAddMediaItem,
  onUpdateSlot,
  onMoveSlot,
  onDeleteSlot,
  onAddSlot,
  onRegenerateCopies,
  onAddTextBlock,
  onRemoveTextBlock
}: MediaUploaderProps) {
  const imageSlots = blocks.filter(
    (block): block is MediaSlotBlock => block.type === "mediaSlot" && block.mediaKind === "image"
  );
  const videoSlots = blocks.filter(
    (block): block is MediaSlotBlock => block.type === "mediaSlot" && block.mediaKind === "video"
  );

  const slotRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [textTitle, setTextTitle] = useState("");
  const [textBody, setTextBody] = useState("");

  async function handleSlotUpload(fileList: FileList | null, slot: MediaSlotBlock) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const file = fileList[0];
    const nextMedia: MediaItem = {
      id: createId("media"),
      type: slot.mediaKind,
      name: file.name,
      url: await fileToDataUrl(file)
    };

    onAddMediaItem(nextMedia);
    onUpdateSlot(slot.id, (current) => ({ ...current, mediaId: nextMedia.id }));
  }

  function addTextBlock() {
    if (!textTitle.trim() || !textBody.trim()) {
      window.alert("텍스트 블록 제목과 내용을 입력해 주세요.");
      return;
    }

    if (textBlocks.length >= 10) {
      window.alert("텍스트 블록은 최대 10개까지 등록할 수 있습니다.");
      return;
    }

    onAddTextBlock({
      id: createId("text"),
      title: textTitle.trim(),
      body: textBody.trim()
    });

    setTextTitle("");
    setTextBody("");
  }

  function renderSlotCard(slot: MediaSlotBlock, index: number, groupLength: number) {
    const item = media.find((mediaItem) => mediaItem.id === slot.mediaId) ?? null;

    return (
      <div key={slot.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
        <input
          ref={(element) => {
            slotRefs.current[slot.id] = element;
          }}
          type="file"
          accept={slot.mediaKind === "video" ? "video/*" : "image/*"}
          className="hidden"
          onChange={(event) => void handleSlotUpload(event.target.files, slot)}
        />

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              {slot.mediaKind === "video" ? "Video Slot" : "Image Slot"} {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-1 font-semibold text-slate-800">{slot.label}</h3>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="px-3 py-2" disabled={index === 0} onClick={() => onMoveSlot(slot.id, "up")}>
              위
            </Button>
            <Button variant="ghost" className="px-3 py-2" disabled={index === groupLength - 1} onClick={() => onMoveSlot(slot.id, "down")}>
              아래
            </Button>
            <Button variant="danger" className="px-3 py-2" onClick={() => onDeleteSlot(slot.id)}>
              삭제
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <div className="flex items-center gap-3">
            <MediaThumbnail item={item} />
            <div className="grid flex-1 gap-2">
              <Button variant="secondary" className="w-full" onClick={() => slotRefs.current[slot.id]?.click()}>
                {item ? "미디어 교체" : `${slot.mediaKind === "video" ? "영상" : "이미지"} 업로드`}
              </Button>
              <Select
                value={slot.role}
                onChange={(event) =>
                  onUpdateSlot(slot.id, (current) => ({
                    ...current,
                    role: event.target.value as MediaSlotRole
                  }))
                }
              >
                {(slot.mediaKind === "video" ? videoRoleOptions : imageRoleOptions).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <Field label="카피 제목">
            <Input value={slot.title} onChange={(event) => onUpdateSlot(slot.id, (current) => ({ ...current, title: event.target.value }))} />
          </Field>
          <Field label="카피 설명">
            <Textarea rows={3} value={slot.description} onChange={(event) => onUpdateSlot(slot.id, (current) => ({ ...current, description: event.target.value }))} />
          </Field>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div>
        <SectionTitle title="스토리 미디어" description="영상과 이미지를 슬롯 단위로 계속 확장할 수 있습니다." />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onAddSlot("video")}>영상 슬롯 추가</Button>
          <Button variant="secondary" onClick={() => onAddSlot("image")}>
            이미지 슬롯 추가
          </Button>
          <Button variant="ghost" onClick={onRegenerateCopies}>
            자동 카피 다시 생성
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <SectionTitle title="영상 슬롯" description={`총 ${videoSlots.length}개`} />
        {videoSlots.map((slot, index) => renderSlotCard(slot, index, videoSlots.length))}
      </div>

      <div className="grid gap-4">
        <SectionTitle title="이미지 슬롯" description={`총 ${imageSlots.length}개`} />
        {imageSlots.map((slot, index) => renderSlotCard(slot, index, imageSlots.length))}
      </div>

      <div>
        <SectionTitle title="텍스트 블록 입력" description="필요한 최소 설명만 보조로 추가합니다." />
        <div className="grid gap-3">
          <Field label="텍스트 제목">
            <Input value={textTitle} onChange={(event) => setTextTitle(event.target.value)} />
          </Field>
          <Field label="텍스트 내용">
            <Textarea rows={4} value={textBody} onChange={(event) => setTextBody(event.target.value)} />
          </Field>
          <Button onClick={addTextBlock}>텍스트 블록 추가</Button>
          <div className="grid gap-2">
            {textBlocks.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 px-3 py-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-slate-500">{item.body}</p>
                  </div>
                  <Button variant="ghost" className="px-3 py-2" onClick={() => onRemoveTextBlock(item.id)}>
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
