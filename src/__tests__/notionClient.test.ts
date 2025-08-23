import { NotionClient } from '../notionClient';
import { MCPError } from '../types';

jest.mock('@notionhq/client', () => ({
  Client: jest.fn().mockImplementation(() => ({
    blocks: {
      children: {
        append: jest.fn(),
      },
    },
    pages: {
      retrieve: jest.fn(),
    },
    users: {
      me: jest.fn(),
    },
  })),
}));

describe('NotionClient', () => {
  let notionClient: NotionClient;
  let mockNotion: any;

  beforeEach(() => {
    const { Client } = require('@notionhq/client');
    mockNotion = new Client();
    notionClient = new NotionClient({ apiToken: 'test-token' });
    (notionClient as any).notion = mockNotion;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('API トークンが必要', () => {
      expect(() => new NotionClient({ apiToken: '' })).toThrow(MCPError);
      expect(() => new NotionClient({ apiToken: '' })).toThrow('Notion API token is required');
    });

    test('有効なAPIトークンで正常に作成される', () => {
      expect(() => new NotionClient({ apiToken: 'valid-token' })).not.toThrow();
    });
  });

  describe('appendBlocksToPage', () => {
    test('ブロックを正常にページに追加できる', async () => {
      const pageId = 'test-page-id';
      const blocks = [{ type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: 'Test' } }] } }];

      mockNotion.blocks.children.append.mockResolvedValue({});

      await notionClient.appendBlocksToPage(pageId, blocks as any);

      expect(mockNotion.blocks.children.append).toHaveBeenCalledWith({
        block_id: pageId,
        children: blocks,
      });
    });

    test('Notion API エラーをMCPErrorでラップする', async () => {
      const pageId = 'test-page-id';
      const blocks = [];
      
      mockNotion.blocks.children.append.mockRejectedValue(new Error('API Error'));

      await expect(notionClient.appendBlocksToPage(pageId, blocks as any))
        .rejects.toThrow(MCPError);
    });
  });

  describe('getPageInfo', () => {
    test('ページ情報を正常に取得できる', async () => {
      const pageId = 'test-page-id';
      const mockPage = {
        id: pageId,
        url: 'https://notion.so/test-page',
        last_edited_time: '2023-01-01T00:00:00.000Z',
        properties: {
          title: {
            type: 'title',
            title: [{ plain_text: 'Test Page' }],
          },
        },
      };

      mockNotion.pages.retrieve.mockResolvedValue(mockPage);

      const result = await notionClient.getPageInfo(pageId);

      expect(result).toEqual({
        id: pageId,
        title: 'Test Page',
        url: 'https://notion.so/test-page',
        lastEditedTime: '2023-01-01T00:00:00.000Z',
      });
    });

    test('タイトルプロパティがない場合はUntitledを返す', async () => {
      const pageId = 'test-page-id';
      const mockPage = {
        id: pageId,
        url: 'https://notion.so/test-page',
        last_edited_time: '2023-01-01T00:00:00.000Z',
        properties: {},
      };

      mockNotion.pages.retrieve.mockResolvedValue(mockPage);

      const result = await notionClient.getPageInfo(pageId);

      expect(result.title).toBe('Untitled');
    });

    test('存在しないページの場合はエラーを投げる', async () => {
      const pageId = 'invalid-page-id';
      
      mockNotion.pages.retrieve.mockResolvedValue({});

      await expect(notionClient.getPageInfo(pageId))
        .rejects.toThrow(MCPError);
    });
  });

  describe('verifyConnection', () => {
    test('接続が成功する', async () => {
      mockNotion.users.me.mockResolvedValue({});

      const result = await notionClient.verifyConnection();

      expect(result).toBe(true);
    });

    test('接続が失敗する場合はエラーを投げる', async () => {
      mockNotion.users.me.mockRejectedValue(new Error('Unauthorized'));

      await expect(notionClient.verifyConnection())
        .rejects.toThrow(MCPError);
    });
  });
});