export function buildInviteUrl(inviteCode: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set("party", inviteCode);
  return url.toString();
}

export function getPartyCodeFromUrl(): string | null {
  const code = new URL(window.location.href).searchParams.get("party");
  return code?.trim() ? code.trim().toUpperCase() : null;
}

export function clearPartyCodeFromUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("party")) {
    return;
  }
  url.searchParams.delete("party");
  window.history.replaceState({}, "", url.toString());
}
