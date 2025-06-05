# トラブルシューティングガイド

このガイドでは、Antアプリケーションの開発・運用中によく発生する問題とその解決方法を説明します。

## 目次

- [開発環境の問題](#開発環境の問題)
- [ビルドエラー](#ビルドエラー)
- [テストの問題](#テストの問題)
- [暗号化・セキュリティ関連](#暗号化セキュリティ関連)
- [Tauriアプリの問題](#tauriアプリの問題)
- [パフォーマンスの問題](#パフォーマンスの問題)

## 開発環境の問題

### Node.jsのバージョンエラー

**問題**: `npm install`時にNode.jsのバージョンが古いというエラーが発生する

**解決方法**:

```bash
# Node.js 18以上をインストール
nvm install 18
nvm use 18

# または直接ダウンロード
# https://nodejs.org/
```

### 依存関係のインストールエラー

**問題**: パッケージのインストールに失敗する

**解決方法**:

```bash
# キャッシュをクリア
npm cache clean --force

# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### 開発サーバーが起動しない

**問題**: `npm run dev`でサーバーが起動しない

**症状と解決方法**:

1. **ポートが使用中**

   ```bash
   # 別のポートで起動
   npm run dev -- --port 3001
   ```

2. **Panda CSSの生成エラー**

   ```bash
   # Panda CSSの設定を再生成
   npm run prepare
   ```

3. **TypeScriptエラー**

   ```bash
   # 型定義ファイルを再生成
   rm -f tsconfig.tsbuildinfo
   npx tsc --noEmit
   ```

## ビルドエラー

### Next.jsビルドエラー

**問題**: `npm run build`でビルドが失敗する

**解決方法**:

1. **TypeScriptエラー**

   ```bash
   # 型チェックを実行
   npx tsc --noEmit
   
   # エラー箇所を修正後、再ビルド
   npm run build
   ```

2. **ESLint/Biomeエラー**

   ```bash
   # 自動修正を実行
   npm run format
   
   # 手動でエラーを確認
   npm run lint
   ```

3. **メモリ不足**

   ```bash
   # Node.jsのメモリ制限を増加
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

### Panda CSSの問題

**問題**: スタイルが正しく適用されない

**解決方法**:

```bash
# Panda CSSを再生成
npm run prepare

# styled-systemフォルダを削除して再生成
rm -rf styled-system
npm run prepare
```

## テストの問題

### テストが失敗する

**問題**: `npm test`でテストが失敗する

**解決方法**:

1. **環境変数の設定**

   ```bash
   # テスト用の環境変数を設定
   export NODE_ENV=test
   ```

2. **モックの問題**

   ```typescript
   // src/test/setup.ts でモックを確認
   // 必要に応じてモックを更新
   ```

3. **非同期テストのタイムアウト**

   ```typescript
   // テストファイルでタイムアウトを増加
   describe('async tests', () => {
     beforeEach(() => {
       vi.useRealTimers()
     })
   })
   ```

### カバレッジレポートが生成されない

**問題**: テストカバレッジが表示されない

**解決方法**:

```bash
# カバレッジフォルダを削除
rm -rf coverage

# カバレッジ付きでテスト実行
npm run test
```

## 暗号化・セキュリティ関連

### 暗号化エラー

**問題**: データの暗号化・復号化に失敗する

**解決方法**:

1. **暗号化キーの問題**

   ```typescript
   // ブラウザの開発者ツールでlocalStorageを確認
   localStorage.getItem('encryption_key')
   
   // キーを削除して再生成
   localStorage.removeItem('encryption_key')
   ```

2. **暗号化データの破損**

   ```typescript
   // 暗号化されたデータをクリア
   localStorage.clear()
   
   // アプリを再起動
   ```

### 認証トークンの問題

**問題**: ログイン状態が保持されない

**解決方法**:

```typescript
// ブラウザの開発者ツールで確認
localStorage.getItem('auth_token')

// トークンを手動で削除
localStorage.removeItem('auth_token')

// 再ログインを実行
```

## Tauriアプリの問題

### Tauriのインストールエラー

**問題**: `npm run tauri dev`でエラーが発生する

**解決方法**:

1. **Rustのインストール確認**

   ```bash
   # Rustがインストールされているか確認
   rustc --version
   
   # インストールされていない場合
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Tauriの依存関係**

   ```bash
   # Windows: Visual Studio Build Tools が必要
   # macOS: Xcode Command Line Tools が必要
   # Linux: 開発パッケージが必要
   ```

### デスクトップアプリのビルドエラー

**問題**: `npm run tauri build`が失敗する

**解決方法**:

1. **アイコンファイルの問題**

   ```bash
   # アイコンファイルが正しく配置されているか確認
   ls src-tauri/icons/
   ```

2. **Cargo設定の確認**

   ```bash
   # Cargoの設定を確認
   cd src-tauri
   cargo check
   ```

## パフォーマンスの問題

### アプリの動作が遅い

**問題**: アプリケーションの反応が遅い

**解決方法**:

1. **Next.js開発モード**

   ```bash
   # 本番モードでテスト
   npm run build
   npm run start
   ```

2. **大量のタスクデータ**

   ```typescript
   // ページネーションを実装
   // 仮想スクロールを検討
   // データの遅延読み込み
   ```

3. **暗号化処理の最適化**

   ```typescript
   // Web Workersの利用を検討
   // 暗号化処理の非同期化
   ```

### メモリリーク

**問題**: アプリ使用中にメモリ使用量が増加し続ける

**解決方法**:

1. **React開発者ツールでプロファイリング**

   ```bash
   # React DevTools Profilerでコンポーネントを分析
   ```

2. **イベントリスナーのクリーンアップ**

   ```typescript
   useEffect(() => {
     const handleEvent = () => {}
     window.addEventListener('event', handleEvent)
     
     return () => {
       window.removeEventListener('event', handleEvent)
     }
   }, [])
   ```

## よくあるエラーメッセージ

### `Module not found`

**原因**: 依存関係が正しくインストールされていない

**解決方法**:

```bash
npm install
# または
npm ci
```

### `TypeScript error: Cannot find module`

**原因**: 型定義ファイルが見つからない

**解決方法**:

```bash
# 型定義をインストール
npm install @types/node --save-dev

# または型定義ファイルを更新
rm tsconfig.tsbuildinfo
```

### `Panda CSS error: Cannot resolve config`

**原因**: Panda CSSの設定ファイルに問題がある

**解決方法**:

```bash
# 設定を再生成
rm -rf styled-system
npm run prepare
```

## ログとデバッグ

### 開発時のログ確認

1. **ブラウザの開発者ツール**
   - F12キーでConsoleタブを確認
   - Networkタブでリクエストを監視

2. **Next.jsのログ**

   ```bash
   # 詳細なログを出力
   DEBUG=* npm run dev
   ```

3. **Tauriのログ**

   ```bash
   # Tauriコンソールでログを確認
   npm run tauri dev
   ```

### 本番環境のログ

1. **エラーレポート**
   - ブラウザのエラーコンソール
   - ネットワークエラー
   - パフォーマンス問題

2. **ログ収集の設定**

   ```typescript
   // エラーハンドリングの実装
   window.addEventListener('error', (event) => {
     console.error('Global error:', event.error)
   })
   ```

---

**注意**: このガイドは定期的に更新されます。新しい問題や解決方法があれば、ドキュメントに追加してください。
