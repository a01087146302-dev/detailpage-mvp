import { createId } from "@/lib/utils";
import type {
  DetailBlock,
  MediaItem,
  MediaKind,
  MediaSlotBlock,
  MediaSlotRole,
  ProductInfo,
  TextEntry
} from "@/types/editor";

const DEFAULT_VIDEO_ROLES: MediaSlotRole[] = [
  "hook_video",
  "empathy_video",
  "mood_video",
  "detail_video",
  "cta_video"
];

const DEFAULT_IMAGE_ROLES: MediaSlotRole[] = ["hero_image", "detail_image", "mood_image"];

export function getRoleMeta(role: MediaSlotRole) {
  switch (role) {
    case "hook_video":
      return {
        label: "후킹 영상",
        title: "오늘은 말 안 하고 싶다",
        description: "굳이 설명하지 않아도 분위기가 전달되는 한 장면"
      };
    case "empathy_video":
      return {
        label: "공감 영상",
        title: "이럴 때 더 입고 싶어요",
        description: "사람 만나기 싫고 그냥 편하고 싶은 날"
      };
    case "mood_video":
      return {
        label: "분위기 영상",
        title: "그냥 이 느낌이면 충분해요",
        description: "옷 자체보다 분위기가 먼저 기억되는 스타일"
      };
    case "detail_video":
      return {
        label: "디테일 영상",
        title: "가까이 보면 더 괜찮아요",
        description: "핏과 원단, 움직임에서 차이가 느껴집니다"
      };
    case "cta_video":
      return {
        label: "CTA 영상",
        title: "마음에 들면 지금 담아두세요",
        description: "분위기와 활용도를 같이 챙길 수 있는 한 장"
      };
    case "story_video":
      return {
        label: "추가 영상",
        title: "스토리 장면",
        description: "이 장면에 맞는 분위기와 흐름을 이어가는 블록"
      };
    case "hero_image":
      return {
        label: "대표 이미지",
        title: "첫 장면으로 충분한 이미지",
        description: "가장 먼저 시선을 잡는 대표 컷"
      };
    case "detail_image":
      return {
        label: "디테일 이미지",
        title: "가까이 볼수록 더 좋아요",
        description: "원단과 핏의 포인트를 더 또렷하게 보여줍니다"
      };
    case "mood_image":
      return {
        label: "분위기 이미지",
        title: "한 장으로 남는 분위기",
        description: "코디 전체의 무드를 정리해 주는 컷"
      };
    case "story_image":
      return {
        label: "추가 이미지",
        title: "스토리 이미지",
        description: "이 장면에 맞는 분위기와 흐름을 이어가는 블록"
      };
  }
}

function createMediaSlot(
  mediaKind: MediaKind,
  role: MediaSlotRole,
  mediaId: string | null,
  sequence?: number
): MediaSlotBlock {
  const meta = getRoleMeta(role);
  const numberedTitle =
    role === "story_video" || role === "story_image"
      ? `${meta.title} ${sequence ?? 1}`
      : meta.title;

  return {
    id: createId("block"),
    type: "mediaSlot",
    label: meta.label,
    hidden: false,
    mediaKind,
    role,
    mediaId,
    title: numberedTitle,
    description: meta.description
  };
}

export function regenerateMediaCopy(blocks: DetailBlock[]) {
  let storyVideoCount = 0;
  let storyImageCount = 0;

  return blocks.map((block) => {
    if (block.type !== "mediaSlot") {
      return block;
    }

    if (block.role === "story_video") {
      storyVideoCount += 1;
      const meta = getRoleMeta(block.role);
      return {
        ...block,
        label: meta.label,
        title: `${meta.title} ${storyVideoCount}`,
        description: meta.description
      };
    }

    if (block.role === "story_image") {
      storyImageCount += 1;
      const meta = getRoleMeta(block.role);
      return {
        ...block,
        label: meta.label,
        title: `${meta.title} ${storyImageCount}`,
        description: meta.description
      };
    }

    const meta = getRoleMeta(block.role);
    return {
      ...block,
      label: meta.label,
      title: meta.title,
      description: meta.description
    };
  });
}

export function createNewMediaSlot(mediaKind: MediaKind, existingBlocks: DetailBlock[]) {
  const existingCount = existingBlocks.filter(
    (block) => block.type === "mediaSlot" && block.mediaKind === mediaKind
  ).length;

  if (mediaKind === "video") {
    const role = DEFAULT_VIDEO_ROLES[existingCount] ?? "story_video";
    const storyIndex =
      role === "story_video"
        ? existingBlocks.filter((block) => block.type === "mediaSlot" && block.role === "story_video").length + 1
        : undefined;
    return createMediaSlot("video", role, null, storyIndex);
  }

  const role = DEFAULT_IMAGE_ROLES[existingCount] ?? "story_image";
  const storyIndex =
    role === "story_image"
      ? existingBlocks.filter((block) => block.type === "mediaSlot" && block.role === "story_image").length + 1
      : undefined;
  return createMediaSlot("image", role, null, storyIndex);
}

export function generateDraftBlocks(
  product: ProductInfo,
  media: MediaItem[],
  textEntries: TextEntry[]
): DetailBlock[] {
  const videos = media.filter((item) => item.type === "video");
  const images = media.filter((item) => item.type === "image");

  const videoSlots = Array.from({ length: 5 }, (_, index) =>
    createMediaSlot("video", DEFAULT_VIDEO_ROLES[index]!, videos[index]?.id ?? null)
  );

  const extraVideoSlots = videos.slice(5).map((item, index) =>
    createMediaSlot("video", "story_video", item.id, index + 1)
  );

  const imageSlots = Array.from({ length: 3 }, (_, index) =>
    createMediaSlot("image", DEFAULT_IMAGE_ROLES[index]!, images[index]?.id ?? null)
  );

  const extraImageSlots = images.slice(3).map((item, index) =>
    createMediaSlot("image", "story_image", item.id, index + 1)
  );

  return [
    {
      id: createId("block"),
      type: "hero",
      label: "감정 후킹",
      hidden: false,
      headline: textEntries[0]?.title || "오늘은 말 안 하고 싶다",
      subheadline: textEntries[0]?.body || "말보다 분위기로 하루를 설명하고 싶은 순간을 위한 티셔츠"
    },
    {
      id: createId("block"),
      type: "storyText",
      label: "공감 상황",
      hidden: false,
      title: "이럴 때 더 입고 싶어요",
      body: ["- 출근하기 싫은 날", "- 사람 만나기 귀찮은 날", "- 그냥 편하게 있고 싶은 날"].join("\n")
    },
    ...videoSlots,
    ...extraVideoSlots,
    ...imageSlots,
    ...extraImageSlots,
    {
      id: createId("block"),
      type: "copy",
      label: "추천 포인트",
      hidden: false,
      title: "이런 분께 추천해요",
      description: [
        "영상과 이미지 중심으로 감정을 보여주고 싶은 브랜드",
        "텍스트보다 분위기와 착용 장면을 먼저 전달하고 싶은 상품",
        "스토리 흐름으로 상세페이지를 빠르게 구성하고 싶은 경우"
      ].join("\n")
    },
    {
      id: createId("block"),
      type: "storyText",
      label: "제품 정보",
      hidden: false,
      title: product.productName || "제품 정보",
      body:
        textEntries[1]?.body ||
        `${product.tagline}\n\n상품 설명은 보조로 두고, 미디어 중심으로 흐름을 이어갈 수 있게 구성했습니다.`
    },
    {
      id: createId("block"),
      type: "materialLaundry",
      label: "소재/세탁",
      hidden: false,
      materialInfo: product.materialInfo,
      laundryInfo: product.laundryInfo
    },
    {
      id: createId("block"),
      type: "size",
      label: "사이즈",
      hidden: false,
      sizeInfo: product.sizeInfo
    },
    {
      id: createId("block"),
      type: "purchase",
      label: "구매 CTA",
      hidden: false,
      buttonLabel: "지금 보러 가기",
      helperText: "분위기가 마음에 들었다면 구매 페이지에서 옵션과 가격을 확인해 보세요.",
      link: product.purchaseLink
    }
  ];
}
