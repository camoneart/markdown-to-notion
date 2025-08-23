#!/usr/bin/env node

import { config } from 'dotenv';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { NotionClient } from './notionClient.js';
import { MarkdownParser } from './markdownParser.js';
import { MCPError, MarkdownToNotionRequest } from './types.js';

config();

class MarkdownMCPServer {
  private server: McpServer;
  private notionClient: NotionClient | null = null;
  private markdownParser: MarkdownParser;

  constructor() {
    this.server = new McpServer({
      name: 'md-mcp',
      version: '1.0.0',
    });

    this.markdownParser = new MarkdownParser();
    this.setupTools();
    this.setupResources();
  }

  private setupTools(): void {
    this.server.registerTool(
      'md-to-notion',
      {
        title: 'Markdown to Notion',
        description: 'Convert markdown file content to Notion page',
        inputSchema: {
          markdownFilePath: z.string().describe('Path to the markdown file'),
          notionPageId: z.string().describe('Notion page ID to append content to'),
        },
      },
      async ({ markdownFilePath, notionPageId }) => {
        try {
          const result = await this.handleMarkdownToNotion({
            markdownFilePath,
            notionPageId,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error) {
          const mcpError = error instanceof MCPError ? error : new MCPError(String(error));
          
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${mcpError.message}`,
              },
            ],
            isError: true,
          };
        }
      }
    );

    this.server.registerTool(
      'verify-notion-connection',
      {
        title: 'Verify Notion Connection',
        description: 'Test connection to Notion API',
        inputSchema: {},
      },
      async () => {
        try {
          await this.ensureNotionClient();
          const isConnected = await this.notionClient!.verifyConnection();

          return {
            content: [
              {
                type: 'text',
                text: `Notion connection: ${isConnected ? 'Success' : 'Failed'}`,
              },
            ],
          };
        } catch (error) {
          const mcpError = error instanceof MCPError ? error : new MCPError(String(error));
          
          return {
            content: [
              {
                type: 'text',
                text: `Connection failed: ${mcpError.message}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  private setupResources(): void {
    this.server.registerResource(
      'config-info',
      'config://current',
      {
        title: 'Current Configuration',
        description: 'Display current server configuration',
        mimeType: 'application/json',
      },
      async () => {
        const hasNotionToken = !!process.env.NOTION_API_TOKEN;
        
        return {
          contents: [
            {
              uri: 'config://current',
              text: JSON.stringify(
                {
                  name: 'md-mcp',
                  version: '1.0.0',
                  hasNotionToken,
                  environment: process.env.NODE_ENV || 'development',
                },
                null,
                2
              ),
            },
          ],
        };
      }
    );
  }

  private async ensureNotionClient(): Promise<void> {
    if (!this.notionClient) {
      const apiToken = process.env.NOTION_API_TOKEN;
      if (!apiToken) {
        throw new MCPError('NOTION_API_TOKEN environment variable is required', 'MISSING_CONFIG');
      }

      this.notionClient = new NotionClient({ apiToken });
    }
  }

  private async handleMarkdownToNotion(
    request: MarkdownToNotionRequest
  ): Promise<any> {
    await this.ensureNotionClient();

    this.markdownParser.validateMarkdownFile(request.markdownFilePath);

    const blocks = await this.markdownParser.parseFile(request.markdownFilePath);
    
    const pageInfo = await this.notionClient!.getPageInfo(request.notionPageId);
    
    await this.notionClient!.appendBlocksToPage(request.notionPageId, blocks);

    return {
      success: true,
      message: 'Markdown content successfully added to Notion page',
      pageUrl: pageInfo.url,
      blocksCreated: blocks.length,
      pageTitle: pageInfo.title,
    };
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

async function main(): Promise<void> {
  const server = new MarkdownMCPServer();
  await server.start();
  console.error('Markdown MCP Server is running...');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}