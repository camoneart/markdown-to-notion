import { Client } from '@notionhq/client';
import { NotionConfig, MCPError, NotionPageInfo } from './types.js';

export class NotionClient {
  private notion: Client;

  constructor(config: NotionConfig) {
    if (!config.apiToken) {
      throw new MCPError('Notion API token is required', 'MISSING_API_TOKEN');
    }
    
    this.notion = new Client({
      auth: config.apiToken,
    });
  }

  async appendBlocksToPage(pageId: string, blocks: any[]): Promise<void> {
    try {
      await this.notion.blocks.children.append({
        block_id: pageId,
        children: blocks,
      });
    } catch (error: any) {
      throw new MCPError(
        `Failed to append blocks to Notion page: ${error.message}`,
        'NOTION_API_ERROR'
      );
    }
  }

  async getPageInfo(pageId: string): Promise<NotionPageInfo> {
    try {
      const page = await this.notion.pages.retrieve({ page_id: pageId });
      
      if (!('properties' in page)) {
        throw new MCPError('Page not found or access denied', 'PAGE_NOT_FOUND');
      }

      const title = this.extractPageTitle(page.properties);
      
      return {
        id: page.id,
        title,
        url: page.url,
        lastEditedTime: page.last_edited_time,
      };
    } catch (error: any) {
      if (error instanceof MCPError) {
        throw error;
      }
      throw new MCPError(
        `Failed to retrieve Notion page: ${error.message}`,
        'NOTION_API_ERROR'
      );
    }
  }

  private extractPageTitle(properties: any): string {
    for (const property of Object.values(properties as Record<string, any>)) {
      if (property.type === 'title' && property.title) {
        return property.title.map((t: any) => t.plain_text).join('');
      }
    }
    return 'Untitled';
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.notion.users.me({});
      return true;
    } catch (error: any) {
      throw new MCPError(
        `Failed to verify Notion connection: ${error.message}`,
        'CONNECTION_ERROR'
      );
    }
  }
}