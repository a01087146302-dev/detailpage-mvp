"use client";

import type { ProductInfo } from "@/types/editor";
import { Field, Input, SectionTitle, Textarea } from "@/components/ui";

type ProductFormProps = {
  product: ProductInfo;
  onChange: <K extends keyof ProductInfo>(key: K, value: ProductInfo[K]) => void;
};

export function ProductForm({ product, onChange }: ProductFormProps) {
  return (
    <div>
      <SectionTitle title="상품 기본정보" description="초안 생성과 상세 정보 블록에 공통으로 사용됩니다." />
      <div className="grid gap-3">
        <Field label="상품명">
          <Input value={product.productName} onChange={(event) => onChange("productName", event.target.value)} />
        </Field>
        <Field label="한 줄 설명">
          <Textarea
            rows={3}
            value={product.tagline}
            onChange={(event) => onChange("tagline", event.target.value)}
          />
        </Field>
        <Field label="구매 링크">
          <Input value={product.purchaseLink} onChange={(event) => onChange("purchaseLink", event.target.value)} />
        </Field>
        <Field label="소재 정보">
          <Textarea
            rows={3}
            value={product.materialInfo}
            onChange={(event) => onChange("materialInfo", event.target.value)}
          />
        </Field>
        <Field label="세탁 정보">
          <Textarea
            rows={3}
            value={product.laundryInfo}
            onChange={(event) => onChange("laundryInfo", event.target.value)}
          />
        </Field>
        <Field label="사이즈 정보">
          <Textarea rows={3} value={product.sizeInfo} onChange={(event) => onChange("sizeInfo", event.target.value)} />
        </Field>
      </div>
    </div>
  );
}
