type AgoraModule = typeof import("agora-rtc-sdk-ng");

let agoraPromise: Promise<AgoraModule> | null = null;

/** Load the large RTC SDK only after a user explicitly joins or starts live video. */
export function loadAgoraSdk(): Promise<AgoraModule> {
  agoraPromise ??= import("agora-rtc-sdk-ng");
  return agoraPromise;
}
