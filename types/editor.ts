export type MediaKind = "image" | "video";

export type MediaItem = {
  id: string;
  type: MediaKind;
  name: string;
  url: string;
};

export type TextEntry = {
  id: string;
  title: string;
  body: string;
};

export type ProductInfo = {
  productName: string;
  tagline: string;
  purchaseLink: string;
  materialInfo: string;
  laundryInfo: string;
  sizeInfo: string;
};

export type MediaSlotRole =
  | "hook_video"
  | "empathy_video"
  | "mood_video"
  | "detail_video"
  | "cta_video"
  | "story_video"
  | "hero_image"
  | "detail_image"
  | "mood_image"
  | "story_image";

export type BlockType =
  | "hero"
  | "storyText"
  | "copy"
  | "mediaSlot"
  | "materialLaundry"
  | "size"
  | "purchase";

type BlockBase = {
  id: string;
  type: BlockType;
  label: string;
  hidden: boolean;
};

export type HeroBlock = BlockBase & {
  type: "hero";
  headline: string;
  subheadline: string;
};

export type StoryTextBlock = BlockBase & {
  type: "storyText";
  title: string;
  body: string;
};

export type CopyBlock = BlockBase & {
  type: "copy";
  title: string;
  description: string;
};

export type MediaSlotBlock = BlockBase & {
  type: "mediaSlot";
  mediaKind: MediaKind;
  role: MediaSlotRole;
  mediaId: string | null;
  title: string;
  description: string;
};

export type MaterialLaundryBlock = BlockBase & {
  type: "materialLaundry";
  materialInfo: string;
  laundryInfo: string;
};

export type SizeBlock = BlockBase & {
  type: "size";
  sizeInfo: string;
};

export type PurchaseBlock = BlockBase & {
  type: "purchase";
  buttonLabel: string;
  helperText: string;
  link: string;
};

export type DetailBlock =
  | HeroBlock
  | StoryTextBlock
  | CopyBlock
  | MediaSlotBlock
  | MaterialLaundryBlock
  | SizeBlock
  | PurchaseBlock;

export type EditorState = {
  product: ProductInfo;
  media: MediaItem[];
  textBlocks: TextEntry[];
  blocks: DetailBlock[];
  selectedBlockId: string | null;
};
