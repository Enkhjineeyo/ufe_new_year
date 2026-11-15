export type PostKind = "lost" | "found";

export interface Post {
  id: number;
  kind: PostKind;
  title: string;
  body: string;
  location: string;
  imageUrl: string | null;
  author: string;
  isMine: boolean;
  resolved: boolean;
  createdAt: string;
  commentCount: number;
}

export interface Comment {
  id: number;
  body: string;
  author: string;
  isMine: boolean;
  isPostAuthor: boolean;
  createdAt: string;
}

export const KIND_LABEL: Record<PostKind, string> = { lost: "ГЭЭСЭН", found: "ОЛСОН" };
