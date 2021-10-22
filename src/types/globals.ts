export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Window {
    portalEnv: {
      REMOTE_1_URL: '__REMOTE_1_URL__';
      REMOTE_2_URL: '__REMOTE_2_URL__';
    };
  }
}
