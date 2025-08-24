# Markdown to Notion MCP Server

**English** | **[Japanese](/README.ja.md)**

An MCP server that converts `.md` file content and outputs it to Notion.

## Features

- Convert Markdown file content to Notion page format and output
- Verify Notion API connection
- Display current server configuration

## Installation

```bash
# Clone the repository
git clone https://github.com/camoneart/markdown-to-notion
cd markdown-to-notion

# Install dependencies
pnpm install

# Build TypeScript
pnpm run build

# Register as global command
pnpm link --global
```

## Configuration

1. Copy `.env.example` to create `.env` file
2. Configure Notion API token

```bash
cp .env.example .env
```

Edit the `.env` file:
```env
NOTION_API_TOKEN=your_notion_api_token_here

# Optional: Default Notion page ID (enables page ID omission when set)
DEFAULT_NOTION_PAGE_ID=your_default_page_id_here
```

### How to get Notion API Token

1. Go to [Notion Developers](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Enter integration name (e.g., "Markdown MCP Server")
4. Select workspace
5. Click "Submit"
6. Copy the displayed token

## Usage

### 1. Run as MCP Server

```bash
# Development mode
pnpm run dev

# Production mode (after build)
pnpm start
```

### 2. Use from MCP clients like Claude Code

Add the following to your MCP client configuration file (`.mcp.json`):

```json
{
  "mcpServers": {
    "markdown-to-notion": {
      "type": "stdio",
      "command": "md-to-notion",
      "args": [],
      "env": {
        "NOTION_API_TOKEN": "your_notion_api_token_here",
        "DEFAULT_NOTION_PAGE_ID": "your_default_page_id_here"
      }
    }
  }
}
```

**Note:** To use the above configuration, you need to register it as a global command with `pnpm link --global` beforehand.

## Available Tools

### md-to-notion
Add Markdown file content to Notion page

**Parameters:**
- `markdownFilePath`: Path to the markdown file
- `notionPageId`: Notion page ID to append content to (optional)

**Usage Examples:**
```
# With page ID specified
markdownFilePath: ./example.md
notionPageId: 1234567890abcdef1234567890abcdef

# Using default page ID (simple!)
markdownFilePath: ./example.md
※ DEFAULT_NOTION_PAGE_ID is used when notionPageId is omitted
```

### verify-notion-connection
Verify Notion API connection

**Parameters:** None

## Available Resources

### config-info
Display current server configuration

**URI:** `config://current`

## Development

```bash
# Run tests
pnpm test

# Run linter
pnpm run lint

# Type check
pnpm run typecheck
```

## Troubleshooting

### Common Errors

1. **"NOTION_API_TOKEN environment variable is required"**
   - Notion API token is not set in `.env` file

2. **"Markdown file not found"**
   - The specified Markdown file path is incorrect

3. **"Failed to retrieve Notion page"**
   - Notion page ID is incorrect or integration doesn't have access permission to the page

### Permission Setup

To add content to a Notion page, you need to connect the created integration to the page:

1. Open the target Notion page
2. Click the "⋯" (three dots menu) in the top right
3. Select "Connections" from the menu
4. Enter the integration name in the search box
5. Select the displayed integration
6. Click "Confirm" on the permission confirmation screen

## License

Licensed under the [MIT License](./LICENSE).