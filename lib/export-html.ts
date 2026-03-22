import type { DetailBlock, MediaItem } from "@/types/editor";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getMedia(media: MediaItem[], id: string | null) {
  return media.find((item) => item.id === id) ?? null;
}

function renderMedia(media: MediaItem | null, large = false) {
  if (!media) {
    return "";
  }

  if (media.type === "video") {
    return `<video src="${escapeHtml(media.url)}" controls muted playsinline preload="metadata" style="width:100%;display:block;border-radius:20px;${large ? "aspect-ratio:4/5;object-fit:cover;" : ""}"></video>`;
  }

  return `<img src="${escapeHtml(media.url)}" alt="${escapeHtml(media.name)}" style="width:100%;display:block;border-radius:20px;${large ? "aspect-ratio:4/5;object-fit:cover;" : ""}" />`;
}

export function buildExportHtml(blocks: DetailBlock[], media: MediaItem[]) {
  const visibleBlocks = blocks.filter((block) => !block.hidden);
  const firstMediaSlotId = visibleBlocks.find((block) => block.type === "mediaSlot" && block.mediaId)?.id ?? null;

  const sections = visibleBlocks
    .map((block) => {
      switch (block.type) {
        case "hero":
          return `
            <section style="display:grid;gap:16px;">
              <div style="display:grid;gap:10px;text-align:center;padding:24px;border-radius:20px;background:linear-gradient(135deg,#172033,#31435c);color:#ffffff;">
                <div style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.65);">Emotion Hook</div>
                <h1 style="margin:0;font-size:32px;line-height:1.25;">${escapeHtml(block.headline)}</h1>
                <p style="margin:0;color:rgba(255,255,255,0.78);line-height:1.7;">${escapeHtml(block.subheadline)}</p>
              </div>
            </section>
          `;
        case "storyText":
          return `
            <section style="padding:24px;border-radius:20px;background:#ffffff;border:1px solid #e5e7eb;">
              <h2 style="margin:0 0 10px;font-size:22px;">${escapeHtml(block.title)}</h2>
              <p style="margin:0;line-height:1.8;color:#374151;white-space:pre-wrap;">${escapeHtml(block.body)}</p>
            </section>
          `;
        case "copy":
          return `
            <section style="padding:24px;border-radius:24px;background:linear-gradient(135deg,#fff7f1,#f4e7dd);border:1px solid #d9c2b5;">
              <div style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#b86f52;font-weight:700;">Recommend</div>
              <h2 style="margin:10px 0 0;font-size:24px;">${escapeHtml(block.title)}</h2>
              <p style="margin:14px 0 0;line-height:1.8;color:#374151;white-space:pre-wrap;">${escapeHtml(block.description)}</p>
            </section>
          `;
        case "mediaSlot": {
          const item = getMedia(media, block.mediaId);
          if (!item) {
            return "";
          }

          return `
            <section style="display:grid;gap:12px;padding:12px;border-radius:22px;background:${block.id === firstMediaSlotId ? "#f6efe8" : "#f8fafc"};">
              <div>
                <div style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#94a3b8;">${escapeHtml(block.mediaKind)}</div>
                <h2 style="margin:6px 0 0;font-size:24px;">${escapeHtml(block.title)}</h2>
              </div>
              ${renderMedia(item, block.id === firstMediaSlotId)}
              <p style="margin:0;line-height:1.8;color:#4b5563;">${escapeHtml(block.description)}</p>
            </section>
          `;
        }
        case "materialLaundry":
          return `
            <section style="padding:24px;border-radius:20px;background:#f8fafc;">
              <h2 style="margin:0 0 16px;font-size:22px;">소재 / 세탁 정보</h2>
              <p style="margin:0 0 10px;line-height:1.7;"><strong>소재</strong><br />${escapeHtml(block.materialInfo)}</p>
              <p style="margin:0;line-height:1.7;"><strong>세탁</strong><br />${escapeHtml(block.laundryInfo)}</p>
            </section>
          `;
        case "size":
          return `
            <section style="padding:24px;border-radius:20px;background:#ffffff;border:1px solid #e5e7eb;">
              <h2 style="margin:0 0 10px;font-size:22px;">사이즈 정보</h2>
              <p style="margin:0;line-height:1.8;white-space:pre-wrap;">${escapeHtml(block.sizeInfo)}</p>
            </section>
          `;
        case "purchase":
          return `
            <section style="display:grid;gap:12px;text-align:center;padding:20px;border-radius:20px;background:#faf7f2;">
              <a href="${escapeHtml(block.link)}" style="display:inline-block;padding:16px 20px;border-radius:999px;background:#172033;color:#ffffff;text-decoration:none;font-weight:700;">
                ${escapeHtml(block.buttonLabel)}
              </a>
              <p style="margin:0;color:#6b7280;">${escapeHtml(block.helperText)}</p>
            </section>
          `;
      }
    })
    .join("");

  return `
<div style="max-width:420px;margin:0 auto;padding:24px;font-family:Pretendard,Arial,sans-serif;color:#172033;background:#ffffff;">
  <div style="display:grid;gap:20px;">
    ${sections}
  </div>
</div>`.trim();
}
