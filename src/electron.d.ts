interface FileResult {
  success: boolean;
  data?: string;
  error?: string;
}

interface ListFilesResult {
  success: boolean;
  files?: string[];
  error?: string;
}

interface WriteResult {
  success: boolean;
  error?: string;
}

interface ElectronAPI {
  readFile: (filename: string) => Promise<FileResult>;
  writeFile: (filename: string, content: string) => Promise<WriteResult>;
  deleteFile: (filename: string) => Promise<WriteResult>;
  listFiles: () => Promise<ListFilesResult>;
  checkUrlStatus: (url: string) => Promise<string>;
  addToInbox: (entry: unknown) => Promise<{ ok: boolean }>;
  openExternal: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
