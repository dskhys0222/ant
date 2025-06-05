# デプロイメント

このドキュメントでは、Antアプリケーションのデプロイメント方法について説明します。

## デプロイメント戦略

Antは以下の形態でデプロイできます：

1. **Webアプリケーション**: Vercel、Netlify等のプラットフォーム
2. **デスクトップアプリ**: Tauriによるネイティブアプリ
3. **セルフホスト**: 独自サーバーでのホスティング

## Webアプリケーションのデプロイ

### Vercelでのデプロイ

#### 前提条件

- Vercelアカウント
- GitHubリポジトリ

#### デプロイ手順

1. **Vercelプロジェクトの作成**

   ```bash
   # Vercel CLIのインストール
   npm install -g vercel
   
   # ログイン
   vercel login
   
   # プロジェクトの初期化
   vercel
   ```

2. **環境変数の設定**

   Vercelダッシュボードで以下の環境変数を設定：

   ```env
   NEXT_PUBLIC_API_HOST=your-api-host.com
   NODE_ENV=production
   ```

3. **ビルド設定**

   `vercel.json`:

   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "out",
     "framework": "nextjs",
     "functions": {
       "app/**/*.ts": {
         "runtime": "nodejs18.x"
       }
     }
   }
   ```

4. **自動デプロイの設定**
   - GitHubとの連携設定
   - mainブランチへのプッシュで自動デプロイ
   - プレビューデプロイの有効化

#### パフォーマンス最適化

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 静的エクスポート設定
  output: 'export',
  trailingSlash: true,
  
  // 画像最適化
  images: {
    unoptimized: true,
  },
  
  // 圧縮設定
  compress: true,
  
  // PWA設定（オプション）
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
```

### Netlifyでのデプロイ

#### デプロイ設定

`netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## デスクトップアプリのデプロイ

### Tauriアプリのビルド

#### 開発環境の準備

1. **Rustのインストール**

   ```bash
   # Windows
   winget install Rustlang.Rustup
   
   # macOS
   brew install rustup
   
   # Linux
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **ターゲットプラットフォームの追加**

   ```bash
   # Windows
   rustup target add x86_64-pc-windows-msvc
   
   # macOS
   rustup target add x86_64-apple-darwin
   rustup target add aarch64-apple-darwin
   
   # Linux
   rustup target add x86_64-unknown-linux-gnu
   ```

#### ビルドプロセス

1. **プロダクションビルド**

   ```bash
   # Webアプリのビルド
   npm run build
   
   # Tauriアプリのビルド
   npm run tauri build
   ```

2. **クロスプラットフォームビルド**

   ```bash
   # Windows向け
   npm run tauri build -- --target x86_64-pc-windows-msvc
   
   # macOS向け
   npm run tauri build -- --target x86_64-apple-darwin
   npm run tauri build -- --target aarch64-apple-darwin
   
   # Linux向け
   npm run tauri build -- --target x86_64-unknown-linux-gnu
   ```

#### 署名とパッケージング

**Windows**:

```bash
# コード署名証明書の設定
$env:TAURI_PRIVATE_KEY = Get-Content -Path "private-key.pem" -Raw
$env:TAURI_KEY_PASSWORD = "your-password"

# ビルド実行
npm run tauri build
```

**macOS**:

```bash
# Apple Developer証明書の設定
export APPLE_CERTIFICATE = "Developer ID Application: Your Name"
export APPLE_CERTIFICATE_PASSWORD = "password"

# ビルドと公証
npm run tauri build
```

### GitHub Actionsによる自動ビルド

`.github/workflows/build.yml`:

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        platform: [macos-latest, ubuntu-latest, windows-latest]
    
    runs-on: ${{ matrix.platform }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
        
      - name: Install dependencies
        run: npm ci
        
      - name: Build web app
        run: npm run build
        
      - name: Build Tauri app
        run: npm run tauri build
        
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: app-${{ matrix.platform }}
          path: src-tauri/target/release/bundle/
```

## 継続的インテグレーション/継続的デプロイ（CI/CD）

### GitHub Actionsワークフロー

`.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linting
        run: npm run lint
        
      - name: Run tests
        run: npm run test
        
      - name: Run build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 環境管理

### 環境別設定

#### 開発環境 (Development)

```env
NODE_ENV=development
NEXT_PUBLIC_API_HOST=localhost:8000
NEXT_PUBLIC_DEBUG=true
```

#### ステージング環境 (Staging)

```env
NODE_ENV=staging
NEXT_PUBLIC_API_HOST=staging-api.example.com
NEXT_PUBLIC_DEBUG=false
```

#### 本番環境 (Production)

```env
NODE_ENV=production
NEXT_PUBLIC_API_HOST=api.example.com
NEXT_PUBLIC_DEBUG=false
```

### 設定ファイルの管理

```typescript
// src/config/env.ts
const config = {
  apiHost: process.env.NEXT_PUBLIC_API_HOST || 'localhost:8000',
  debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
  environment: process.env.NODE_ENV || 'development',
};

export default config;
```

## モニタリングと分析

### パフォーマンス監視

1. **Web Vitals**

   ```typescript
   // src/app/layout.tsx
   import { Analytics } from '@vercel/analytics/react';
   
   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <html lang="ja">
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

2. **エラー追跡**

   ```typescript
   // src/utils/error-tracking.ts
   export function trackError(error: Error, context?: any) {
     console.error('Error tracked:', error);
     // Sentry、Bugsnag等のエラー追跡サービスに送信
   }
   ```

### ログ管理

```typescript
// src/utils/logger.ts
class Logger {
  static info(message: string, meta?: any) {
    console.log(`[INFO] ${message}`, meta);
  }
  
  static error(message: string, error?: Error) {
    console.error(`[ERROR] ${message}`, error);
  }
  
  static warn(message: string, meta?: any) {
    console.warn(`[WARN] ${message}`, meta);
  }
}

export default Logger;
```

## セキュリティ考慮事項

### HTTPS強制

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ];
  },
};
```

### 環境変数の保護

```bash
# 機密情報の暗号化
echo "sensitive-data" | gpg --symmetric --armor

# CI/CDでの復号化
echo "$ENCRYPTED_SECRET" | gpg --decrypt --quiet --batch --passphrase "$GPG_PASSPHRASE"
```

## バックアップとリカバリ

### データベースバックアップ

```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# データベースバックアップ
mongodump --uri="$DATABASE_URI" --out="$BACKUP_DIR/db_$DATE"

# S3にアップロード
aws s3 sync "$BACKUP_DIR/db_$DATE" "s3://backup-bucket/db_$DATE"
```

### アプリケーションリカバリ

```bash
#!/bin/bash
# scripts/restore.sh

# 最新バックアップの復元
LATEST_BACKUP=$(aws s3 ls s3://backup-bucket/ | sort | tail -n 1 | awk '{print $4}')
aws s3 sync "s3://backup-bucket/$LATEST_BACKUP" "/tmp/restore"

# データベース復元
mongorestore --uri="$DATABASE_URI" "/tmp/restore"
```

## スケーリング

### 水平スケーリング

1. **CDN設定**
   - 静的ファイルのキャッシュ
   - グローバル配信

2. **ロードバランサー**
   - 複数インスタンスへの負荷分散
   - ヘルスチェック

### 垂直スケーリング

1. **リソース監視**

   ```typescript
   // Performance monitoring
   const observer = new PerformanceObserver((list) => {
     list.getEntries().forEach((entry) => {
       console.log(`${entry.name}: ${entry.duration}ms`);
     });
   });
   
   observer.observe({ entryTypes: ['navigation', 'resource'] });
   ```

## トラブルシューティング

### よくある問題と解決方法

#### 1. ビルドエラー

```bash
# 依存関係の問題
rm -rf node_modules package-lock.json
npm install

# TypeScriptエラー
npm run lint
npm run build -- --type-check
```

#### 2. デプロイエラー

```bash
# 環境変数の確認
vercel env ls

# ログの確認
vercel logs
```

#### 3. パフォーマンス問題

```bash
# バンドルサイズの分析
npm run build
npx @next/bundle-analyzer
```

## デプロイメントチェックリスト

### リリース前確認事項

- [ ] 全テストが通過
- [ ] セキュリティスキャン完了
- [ ] パフォーマンステスト実施
- [ ] バックアップ作成完了
- [ ] 環境変数設定確認
- [ ] SSL証明書の有効性確認
- [ ] CDN設定確認
- [ ] モニタリング設定完了

### リリース後確認事項

- [ ] アプリケーションの動作確認
- [ ] パフォーマンス指標の確認
- [ ] エラーログの監視
- [ ] ユーザーフィードバックの収集

このデプロイメントガイドにより、Antアプリケーションを安全かつ効率的に本番環境にデプロイできます。
