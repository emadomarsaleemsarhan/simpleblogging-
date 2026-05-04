export type PostStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "ARCHIVED";

const allowedTransitions: Record<PostStatus, PostStatus[]> = {
  DRAFT: ["IN_REVIEW", "ARCHIVED"],
  IN_REVIEW: ["DRAFT", "APPROVED", "ARCHIVED"],
  APPROVED: ["IN_REVIEW", "PUBLISHED", "ARCHIVED"],
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};

export function canTransitionPostStatus(from: PostStatus, to: PostStatus) {
  return allowedTransitions[from].includes(to);
}
