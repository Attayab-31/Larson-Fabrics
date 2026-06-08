export const PRELOADER_PENDING_CLASS = "preloader-pending";

export const PRELOADER_COMPLETE_EVENT = "larson:preloader-complete";

export function lockPreloaderPending(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.add(PRELOADER_PENDING_CLASS);
}

export function unlockPreloaderPending(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove(PRELOADER_PENDING_CLASS);
  window.dispatchEvent(new CustomEvent(PRELOADER_COMPLETE_EVENT));
}
