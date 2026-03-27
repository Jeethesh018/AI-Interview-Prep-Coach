/// <reference types="vite/client" />

interface PuterResponse {
  message?: {
    content?: string;
  };
  content?: string;
  text?: string;
}

interface Puter {
  ai: {
    chat: (prompt: string) => Promise<PuterResponse | string>;
  };
}

interface Window {
  puter?: Puter;
}
