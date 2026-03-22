import { generateDraftBlocks } from "@/lib/draft";
import { createId } from "@/lib/utils";
import type { EditorState } from "@/types/editor";

const placeholderImage =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80";
const placeholderImageTwo =
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80";
const placeholderVideo =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const product = {
  productName: "데일리 실루엣 오버핏 티셔츠",
  tagline: "하루 종일 편안하고, 사진에서는 더 깔끔하게 보이는 베이직 티셔츠",
  purchaseLink: "https://example.com/products/daily-silhouette-tee",
  materialInfo: "면 78%, 폴리에스터 22% 혼방으로 부드러운 터치감과 안정적인 형태감을 함께 잡았습니다.",
  laundryInfo:
    "찬물 단독 세탁을 권장하며, 건조기 사용은 피해 주세요. 뒤집어서 세탁하면 프린팅과 원단 손상을 줄일 수 있습니다.",
  sizeInfo: "FREE: 총장 72cm / 어깨 55cm / 가슴 60cm / 소매 24cm"
};

const media = [
  {
    id: createId("media"),
    type: "video" as const,
    name: "후킹 영상 샘플",
    url: placeholderVideo
  },
  {
    id: createId("media"),
    type: "image" as const,
    name: "대표 이미지",
    url: placeholderImage
  },
  {
    id: createId("media"),
    type: "image" as const,
    name: "디테일 이미지",
    url: placeholderImageTwo
  }
];

const textBlocks = [
  {
    id: createId("text"),
    title: "오늘은 말 안 하고 싶다",
    body: "굳이 길게 설명하지 않아도, 영상과 이미지 흐름만으로 기분이 전달되는 상세페이지를 만들 수 있습니다."
  },
  {
    id: createId("text"),
    title: "제품 설명",
    body: "상품 설명은 아래쪽에서 간결하게 보조하고, 상단은 영상과 이미지로 스토리 흐름을 먼저 보여줍니다."
  }
];

export const initialEditorState: EditorState = {
  product,
  media,
  textBlocks,
  blocks: generateDraftBlocks(product, media, textBlocks),
  selectedBlockId: null
};
