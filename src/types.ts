export interface NotionConfig {
  apiToken: string;
}

export interface MarkdownToNotionRequest {
  markdownFilePath: string;
  notionPageId: string;
}

export interface MarkdownToNotionResponse {
  success: boolean;
  message: string;
  pageUrl?: string;
  blocksCreated?: number;
}

export interface NotionPageInfo {
  id: string;
  title: string;
  url: string;
  lastEditedTime: string;
}

export class MCPError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'MCPError';
  }
}