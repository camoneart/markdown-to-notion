# 機能名: Markdown MCP Server

- 日付: 2025-08-24 02:47:15
- 概要: MarkdownファイルをNotionページに変換・出力するModel Context Protocol (MCP) サーバーの実装
- 実装内容: 
  - TypeScriptプロジェクトの初期化とセットアップ
  - MCP SDK を使用したサーバー実装
  - Notion API クライアントの実装
  - Martianライブラリを使用したMarkdown→Notion変換機能
  - テストコード（TDD方式）の作成
  - 設定ファイルとドキュメントの整備

- 設計意図: 
  - MCPプロトコルに準拠することで、Claude Code等の様々なクライアントから利用可能
  - Notion API とMartianライブラリを組み合わせて、MardownからNotionブロック形式への確実な変換を実現
  - エラーハンドリングを統一化するためのMCPErrorクラスの実装
  - 環境変数による設定管理でセキュリティを確保

- 副作用: 
  - `exactOptionalPropertyTypes`をfalseに設定する必要があった（Martianライブラリの型互換性のため）
  - Jest設定がESモジュールとの相性で複雑になったため、シンプルな設定に変更
  - Notion APIトークンが必須のため、トークン取得の手順をREADMEに詳しく記載

- 関連ファイル:
  - `src/index.ts` - MCPサーバーのメインエントリーポイント
  - `src/notionClient.ts` - Notion API クライアント
  - `src/markdownParser.ts` - Markdown パーサー
  - `src/types.ts` - 型定義
  - `src/__tests__/` - テストコード
  - `package.json` - 依存関係とスクリプト設定
  - `tsconfig.json` - TypeScript設定
  - `.env.example` - 環境変数テンプレート
  - `README.md` - 詳細な使用方法とセットアップ手順