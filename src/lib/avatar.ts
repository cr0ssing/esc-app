export function getAvatarUrl(userId: string): string {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(userId)}`;
}
