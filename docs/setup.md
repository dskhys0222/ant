# セットアップガイド

このドキュメントでは、Antプロジェクトの開発環境を構築する方法を説明します。

## 前提条件

以下のソフトウェアがインストールされていることを確認してください：

### 必須

- **Node.js** (v18以上)
- **npm** (v9以上)
- **Git**

### Tauriアプリ開発用（オプション）

- **Rust** (最新版)
- **Tauri CLI**

## インストール手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd ant
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、必要な環境変数を設定します：

```env
# API エンドポイント
NEXT_PUBLIC_API_HOST=your-api-host.com

# その他の環境変数（必要に応じて追加）
```

### 4. Panda CSSの初期化

```bash
npm run prepare
```

## 開発サーバーの起動

### Webアプリの開発

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてアプリを確認できます。

### Tauriデスクトップアプリの開発

Rust環境が必要です。まずRustをインストールしてください：

```bash
# Rustのインストール（Windows）
winget install Rustlang.Rustup

# または公式サイトからインストール
# https://rustup.rs/
```

Tauriアプリの開発モードを起動：

```bash
npm run tauri dev
```

## 利用可能なスクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | Next.js開発サーバーを起動 |
| `npm run build` | プロダクション用ビルド |
| `npm run start` | プロダクションサーバーを起動 |
| `npm run lint` | コードの静的解析 |
| `npm run format` | コードフォーマット |
| `npm run test` | テストの実行 |
| `npm run tauri dev` | Tauriアプリの開発モード |
| `npm run tauri build` | Tauriアプリのビルド |
| `npm run storybook` | Storybookの起動 |

## 開発ツールの設定

### VS Code（推奨）

以下の拡張機能をインストールすることを推奨します：

- TypeScript and JavaScript Language Features
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Rust Analyzer（Tauri開発用）
- Biome（フォーマット・リント用）

### エディタ設定

プロジェクトルートの `.vscode/settings.json` で推奨設定が含まれています。

## トラブルシューティング

### よくある問題と解決方法

#### 1. Node.js のバージョンエラー

```bash
# Node.jsのバージョンを確認
node --version

# nvm使用の場合（必要に応じて適切なバージョンに切り替え）
nvm use 18
```

#### 2. 依存関係のインストールエラー

```bash
# node_modules と package-lock.json を削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

#### 3. Panda CSSの生成エラー

```bash
# Panda CSSの再生成
npm run prepare
```

#### 4. Tauri関連のエラー

```bash
# Rustの更新
rustup update

# Tauri CLIの再インストール
cargo install tauri-cli
```

#### 5. ポートが使用中のエラー

```bash
# 別のポートを使用
npm run dev -- --port 3001
```

## 開発のベストプラクティス

### 1. コードスタイル

- Biomeの設定に従ってコードを記述
- 保存時に自動フォーマットが適用されます

### 2. コミット前のチェック

```bash
# リント実行
npm run lint

# テスト実行
npm run test

# ビルド確認
npm run build
```

### 3. ブランチ戦略

- `main`: プロダクション用
- `develop`: 開発用
- `feature/*`: 機能開発用

### 4. 型安全性

- TypeScriptの型チェックを常に活用
- `any`型の使用を避ける
- Zodスキーマを使用したバリデーション

## パフォーマンス最適化

### 1. 開発時のパフォーマンス向上

```bash
# Turbopackを使用した高速開発（Next.js 15）
npm run dev  # 既にTurbopackが有効
```

### 2. ビルド最適化

- 不要なライブラリの削除
- 適切なcode splittingの活用
- 画像最適化の実装

## セキュリティ設定

### 1. 依存関係の脆弱性チェック

```bash
npm audit
npm audit fix
```

### 2. 環境変数の管理

- 機密情報は `.env.local` に記載
- `.env.example` にテンプレートを作成
- `.env.local` は `.gitignore` に含める

## 次のステップ

セットアップが完了したら、以下のドキュメントを参照してください：

- [コンポーネントガイド](./components.md) - UIコンポーネントの開発方法
- [API仕様](./api.md) - バックエンドとの連携方法
- [セキュリティ](./security.md) - セキュリティ実装の詳細

## サポート

セットアップで問題が発生した場合は、Issuesで質問してください。
