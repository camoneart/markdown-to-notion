import { readFile } from 'fs/promises';
import { markdownToBlocks } from '@tryfabric/martian';
import { MCPError } from './types.js';

export class MarkdownParser {
  async parseFile(filePath: string): Promise<any[]> {
    try {
      const markdownContent = await readFile(filePath, 'utf-8');
      return this.parseContent(markdownContent);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new MCPError(`Markdown file not found: ${filePath}`, 'FILE_NOT_FOUND');
      }
      throw new MCPError(
        `Failed to read markdown file: ${error.message}`,
        'FILE_READ_ERROR'
      );
    }
  }

  async parseContent(markdownContent: string): Promise<any[]> {
    try {
      if (!markdownContent.trim()) {
        throw new MCPError('Markdown content is empty', 'EMPTY_CONTENT');
      }

      const blocks = markdownToBlocks(markdownContent);
      
      if (!blocks || blocks.length === 0) {
        throw new MCPError('Failed to parse markdown content', 'PARSE_ERROR');
      }

      return blocks;
    } catch (error: any) {
      if (error instanceof MCPError) {
        throw error;
      }
      throw new MCPError(
        `Failed to parse markdown content: ${error.message}`,
        'PARSE_ERROR'
      );
    }
  }

  validateMarkdownFile(filePath: string): void {
    if (!filePath) {
      throw new MCPError('Markdown file path is required', 'INVALID_FILE_PATH');
    }

    if (!filePath.endsWith('.md') && !filePath.endsWith('.markdown')) {
      throw new MCPError(
        'File must be a markdown file (.md or .markdown)',
        'INVALID_FILE_TYPE'
      );
    }
  }
}