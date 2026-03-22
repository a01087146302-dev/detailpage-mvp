# 티셔츠 상세페이지 자동생성 편집기 MVP

영상, 이미지, 텍스트를 업로드해서 모바일 기준 상세페이지 초안을 만들고, 블록 단위로 순서 변경, 텍스트 수정, 숨김, 삭제, 대표 미디어 교체를 할 수 있는 Next.js MVP입니다.

## 폴더 구조

```text
detailpage-mvp/
├─ app/
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ block-list.tsx
│  ├─ edit-panel.tsx
│  ├─ editor-app.tsx
│  ├─ media-uploader.tsx
│  ├─ mobile-preview.tsx
│  ├─ product-form.tsx
│  └─ ui.tsx
├─ lib/
│  ├─ draft.ts
│  ├─ export-html.ts
│  ├─ mock-data.ts
│  ├─ storage.ts
│  └─ utils.ts
├─ types/
│  └─ editor.ts
├─ next.config.ts
├─ package.json
├─ postcss.config.js
├─ tailwind.config.ts
└─ tsconfig.json
```

## 핵심 컴포넌트 설계

- `EditorApp`: 전체 상태 관리, localStorage 저장, 초안 생성, HTML export
- `ProductForm`: 상품 기본정보 입력
- `MediaUploader`: 이미지/영상 업로드와 텍스트 블록 등록
- `BlockList`: 블록 순서 변경, 숨김, 삭제
- `MobilePreview`: 모바일 상세페이지 실시간 미리보기
- `EditPanel`: 선택된 블록 텍스트/대표 미디어 수정

## 상태 데이터 타입 설계

- `ProductInfo`: 상품 기본정보
- `MediaItem`: 이미지/영상 메타데이터와 미리보기 URL
- `TextEntry`: 사용자 입력 설명 텍스트
- `DetailBlock`: 상세페이지 블록 유니온 타입
- `EditorState`: 편집기 전체 상태

상세 정의는 `types/editor.ts`에 있습니다.

## 초기 더미 데이터

`lib/mock-data.ts`에 데모용 상품 정보, 샘플 미디어, 텍스트 블록을 넣어 두었습니다. 첫 실행 후 바로 초안 생성 흐름을 확인할 수 있습니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 다음 단계 개선 제안

1. HTML export에 클립보드 복사와 파일 저장 추가
2. 블록별 필수값 유효성 검사와 빈 필드 경고 추가
3. 상품군별 상세페이지 템플릿 프리셋 추가
4. 미디어 업로드 전 리사이즈/썸네일 생성 추가
5. 추후 백엔드 도입을 대비한 저장 API 계층 분리
