export {};

declare global {
  interface Window {
    MotoAcquire?: {
      openVVRDrawer?: () => void;
    };
  }
}
