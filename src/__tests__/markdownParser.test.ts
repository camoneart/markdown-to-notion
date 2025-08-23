import { MarkdownParser } from '../markdownParser';
import { MCPError } from '../types';
import { readFile } from 'fs/promises';

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));

jest.mock('@tryfabric/martian', () => ({
  markdownToBlocks: jest.fn(),
}));

const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;
const { markdownToBlocks } = require('@tryfabric/martian');

describe('MarkdownParser', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
    jest.clearAllMocks();
  });

  describe('validateMarkdownFile', () => {
    test('有効な.mdファイルパスを受け入れる', () => {
      expect(() => parser.validateMarkdownFile('test.md')).not.toThrow();
      expect(() => parser.validateMarkdownFile('test.markdown')).not.toThrow();
    });

    test('空のファイルパスを拒否する', () => {
      expect(() => parser.validateMarkdownFile('')).toThrow(MCPError);
      expect(() => parser.validateMarkdownFile('')).toThrow('Markdown file path is required');
    });

    test('マークダウン以外のファイル拡張子を拒否する', () => {
      expect(() => parser.validateMarkdownFile('test.txt')).toThrow(MCPError);
      expect(() => parser.validateMarkdownFile('test.txt')).toThrow('File must be a markdown file');
    });
  });

  describe('parseFile', () => {
    test('マークダウンファイルを正常にパースできる', async () => {
      const filePath = 'test.md';
      const mockContent = '# Hello World\nThis is a test.';
      const mockBlocks = [{ type: 'heading_1', heading_1: { rich_text: [{ text: { content: 'Hello World' } }] } }];

      mockReadFile.mockResolvedValue(mockContent);
      markdownToBlocks.mockReturnValue(mockBlocks);

      const result = await parser.parseFile(filePath);

      expect(mockReadFile).toHaveBeenCalledWith(filePath, 'utf-8');
      expect(markdownToBlocks).toHaveBeenCalledWith(mockContent);
      expect(result).toEqual(mockBlocks);
    });

    test('存在しないファイルの場合はエラーを投げる', async () => {
      const filePath = 'non-existent.md';
      const error = new Error('ENOENT: no such file or directory');
      (error as any).code = 'ENOENT';

      mockReadFile.mockRejectedValue(error);

      await expect(parser.parseFile(filePath)).rejects.toThrow(MCPError);
      await expect(parser.parseFile(filePath)).rejects.toThrow('Markdown file not found');
    });

    test('ファイル読み取りエラーの場合はエラーを投げる', async () => {
      const filePath = 'test.md';
      
      mockReadFile.mockRejectedValue(new Error('Permission denied'));

      await expect(parser.parseFile(filePath)).rejects.toThrow(MCPError);
      await expect(parser.parseFile(filePath)).rejects.toThrow('Failed to read markdown file');
    });
  });

  describe('parseContent', () => {
    test('マークダウンコンテンツを正常にパースできる', async () => {
      const content = '# Title\nContent here';
      const mockBlocks = [{ type: 'heading_1' }];

      markdownToBlocks.mockReturnValue(mockBlocks);

      const result = await parser.parseContent(content);

      expect(markdownToBlocks).toHaveBeenCalledWith(content);
      expect(result).toEqual(mockBlocks);
    });

    test('空のコンテンツの場合はエラーを投げる', async () => {
      await expect(parser.parseContent('')).rejects.toThrow(MCPError);
      await expect(parser.parseContent('')).rejects.toThrow('Markdown content is empty');
      await expect(parser.parseContent('   ')).rejects.toThrow(MCPError);
    });

    test('パース結果が空の場合はエラーを投げる', async () => {
      const content = '# Title';
      
      markdownToBlocks.mockReturnValue([]);

      await expect(parser.parseContent(content)).rejects.toThrow(MCPError);
      await expect(parser.parseContent(content)).rejects.toThrow('Failed to parse markdown content');
    });

    test('パースでエラーが発生した場合はMCPErrorでラップする', async () => {
      const content = '# Title';
      
      markdownToBlocks.mockImplementation(() => {
        throw new Error('Parse error');
      });

      await expect(parser.parseContent(content)).rejects.toThrow(MCPError);
    });
  });
});