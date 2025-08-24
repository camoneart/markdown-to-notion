# Markdown to Notion MCP Server

**[English](/README.md)** | **Japanese**

`.md`ファイルの内容を、Notionに出力できるMCPサーバー

## 機能

- Markdownファイルの内容をNotionページに変換・出力
- Notion APIとの接続確認
- 現在のサーバー設定の確認

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/camoneart/md-to-notion
cd md-to-notion

# 依存関係のインストール
pnpm install

# TypeScriptのビルド
pnpm run build

# グローバルコマンドとして登録
pnpm link --global
```

## 設定

1. `.env.example`をコピーして`.env`ファイルを作成
2. Notion APIトークンを設定

```bash
cp .env.example .env
```

`.env`ファイルを編集:
```env
NOTION_API_TOKEN=your_notion_api_token_here

# オプション: デフォルトのNotionページID（設定するとページIDの指定を省略可能）
DEFAULT_NOTION_PAGE_ID=25896437dc5080a08556c2b278a4d19e
```

### Notion APIトークンの取得方法

1. [Notion Developers](https://www.notion.so/my-integrations)にアクセス
2. 「New integration」をクリック
3. インテグレーション名を入力（例：Markdown MCP Server）
4. ワークスペースを選択
5. 「Submit」をクリック
6. 表示されたトークンをコピー

## 使い方

### 1. MCPサーバーとして実行

```bash
# 開発モード
pnpm run dev

# プロダクションモード（ビルド後）
pnpm start
```

### 2. Claude Code等のMCPクライアントから利用

MCPクライアントの設定ファイル（`.mcp.json`）に以下を追加：

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

**注意:** 上記設定を使用するには、事前に `pnpm link --global` でグローバルコマンドとして登録する必要があります。

## 利用可能なツール

### md-to-notion
Markdownファイルの内容をNotionページに追加

**パラメータ:**
- `markdownFilePath`: マークダウンファイルのパス
- `notionPageId`: 追加先のNotionページID

**使用例:**
```
# ページIDを指定した場合
markdownFilePath: ./example.md
notionPageId: 1234567890abcdef1234567890abcdef

# デフォルトページIDを使用した場合（簡単！）
markdownFilePath: ./example.md
※ notionPageIdを省略するとDEFAULT_NOTION_PAGE_IDが使用されます
```

### verify-notion-connection
Notion APIへの接続確認

**パラメータ:** なし

## 利用可能なリソース

### config-info
現在のサーバー設定を表示

**URI:** `config://current`

## 開発

```bash
# テスト実行
pnpm test

# リンター実行
pnpm run lint

# 型チェック
pnpm run typecheck
```

## トラブルシューティング

### よくあるエラー

1. **"NOTION_API_TOKEN environment variable is required"**
   - `.env`ファイルにNotion APIトークンが設定されていません

2. **"Markdown file not found"**
   - 指定されたMarkdownファイルのパスが間違っています

3. **"Failed to retrieve Notion page"**
   - NotionページIDが間違っているか、インテグレーションにページへのアクセス権限がありません

### 権限の設定

Notionページにコンテンツを追加するには、作成したインテグレーションをページに接続する必要があります：

1. 対象のNotionページを開く
2. 右上の「⋯」（3点メニュー）をクリック
3. メニューから「Connections」を選択
4. 検索ボックスにインテグレーション名を入力
5. 表示されたインテグレーションを選択
6. 権限確認画面で「Confirm」をクリック

## License

Licensed under the [MIT License](./LICENSE).