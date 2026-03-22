"use client";

import type { DetailBlock, MediaItem, MediaSlotRole } from "@/types/editor";
import { Field, Input, SectionTitle, Select, Textarea } from "@/components/ui";

type EditPanelProps = {
  block: DetailBlock | null;
  media: MediaItem[];
  onUpdateBlock: (id: string, updater: (current: DetailBlock) => DetailBlock) => void;
};

const videoRoleOptions: Array<{ value: MediaSlotRole; label: string }> = [
  { value: "hook_video", label: "후킹 영상" },
  { value: "empathy_video", label: "공감 영상" },
  { value: "mood_video", label: "분위기 영상" },
  { value: "detail_video", label: "디테일 영상" },
  { value: "cta_video", label: "CTA 영상" },
  { value: "story_video", label: "추가 영상" }
];

const imageRoleOptions: Array<{ value: MediaSlotRole; label: string }> = [
  { value: "hero_image", label: "대표 이미지" },
  { value: "detail_image", label: "디테일 이미지" },
  { value: "mood_image", label: "분위기 이미지" },
  { value: "story_image", label: "추가 이미지" }
];

export function EditPanel({ block, media, onUpdateBlock }: EditPanelProps) {
  if (!block) {
    return (
      <div>
        <SectionTitle title="편집 패널" description="왼쪽 목록이나 중앙 미리보기에서 블록을 선택해 주세요." />
        <div className="rounded-3xl border border-dashed border-slate-300 px-4 py-10 text-sm text-slate-500">
          선택된 항목이 없습니다.
        </div>
      </div>
    );
  }

  const currentBlock = block;

  function update<T extends DetailBlock>(updater: (current: T) => T) {
    onUpdateBlock(currentBlock.id, (current) => updater(current as T));
  }

  return (
    <div>
      <SectionTitle title="편집 패널" description={`${block.label} 항목을 수정할 수 있습니다.`} />
      <div className="grid gap-3">
        <Field label="이름">
          <Input value={block.label} onChange={(event) => onUpdateBlock(block.id, (current) => ({ ...current, label: event.target.value }))} />
        </Field>

        {block.type === "hero" ? (
          <>
            <Field label="후킹 제목">
              <Input value={block.headline} onChange={(event) => update((current) => ({ ...current, headline: event.target.value }))} />
            </Field>
            <Field label="보조 설명">
              <Textarea rows={3} value={block.subheadline} onChange={(event) => update((current) => ({ ...current, subheadline: event.target.value }))} />
            </Field>
          </>
        ) : null}

        {block.type === "storyText" ? (
          <>
            <Field label="제목">
              <Input value={block.title} onChange={(event) => update((current) => ({ ...current, title: event.target.value }))} />
            </Field>
            <Field label="설명">
              <Textarea rows={6} value={block.body} onChange={(event) => update((current) => ({ ...current, body: event.target.value }))} />
            </Field>
          </>
        ) : null}

        {block.type === "copy" ? (
          <>
            <Field label="제목">
              <Input value={block.title} onChange={(event) => update((current) => ({ ...current, title: event.target.value }))} />
            </Field>
            <Field label="설명">
              <Textarea rows={6} value={block.description} onChange={(event) => update((current) => ({ ...current, description: event.target.value }))} />
            </Field>
          </>
        ) : null}

        {block.type === "mediaSlot" ? (
          <>
            <Field label="슬롯 타입">
              <Select
                value={block.role}
                onChange={(event) =>
                  update((current) => ({
                    ...current,
                    role: event.target.value as MediaSlotRole
                  }))
                }
              >
                {(block.mediaKind === "video" ? videoRoleOptions : imageRoleOptions).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="카피 제목">
              <Input value={block.title} onChange={(event) => update((current) => ({ ...current, title: event.target.value }))} />
            </Field>
            <Field label="카피 설명">
              <Textarea rows={5} value={block.description} onChange={(event) => update((current) => ({ ...current, description: event.target.value }))} />
            </Field>
            <Field label="미디어 교체">
              <Select
                value={block.mediaId ?? ""}
                onChange={(event) => update((current) => ({ ...current, mediaId: event.target.value || null }))}
              >
                <option value="">선택 안 함</option>
                {media
                  .filter((item) => item.type === block.mediaKind)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </Select>
            </Field>
          </>
        ) : null}

        {block.type === "materialLaundry" ? (
          <>
            <Field label="소재 정보">
              <Textarea rows={4} value={block.materialInfo} onChange={(event) => update((current) => ({ ...current, materialInfo: event.target.value }))} />
            </Field>
            <Field label="세탁 정보">
              <Textarea rows={4} value={block.laundryInfo} onChange={(event) => update((current) => ({ ...current, laundryInfo: event.target.value }))} />
            </Field>
          </>
        ) : null}

        {block.type === "size" ? (
          <Field label="사이즈 정보">
            <Textarea rows={5} value={block.sizeInfo} onChange={(event) => update((current) => ({ ...current, sizeInfo: event.target.value }))} />
          </Field>
        ) : null}

        {block.type === "purchase" ? (
          <>
            <Field label="버튼 문구">
              <Input value={block.buttonLabel} onChange={(event) => update((current) => ({ ...current, buttonLabel: event.target.value }))} />
            </Field>
            <Field label="설명">
              <Textarea rows={3} value={block.helperText} onChange={(event) => update((current) => ({ ...current, helperText: event.target.value }))} />
            </Field>
            <Field label="링크">
              <Input value={block.link} onChange={(event) => update((current) => ({ ...current, link: event.target.value }))} />
            </Field>
          </>
        ) : null}
      </div>
    </div>
  );
}
