# アーキテクチャガイド

このドキュメントでは、Antアプリケーションのアーキテクチャ、設計思想、技術的な決定事項について詳しく説明します。

## 目次

- [システム概要](#システム概要)
- [アーキテクチャパターン](#アーキテクチャパターン)
- [技術スタックの選択理由](#技術スタックの選択理由)
- [データフロー](#データフロー)
- [セキュリティアーキテクチャ](#セキュリティアーキテクチャ)
- [パフォーマンス設計](#パフォーマンス設計)
- [スケーラビリティ](#スケーラビリティ)

## システム概要

Antは、セキュリティを重視したタスク管理アプリケーションで、以下の特徴を持ちます：

- **クライアントサイド暗号化**: すべてのデータがローカルで暗号化される
- **クロスプラットフォーム**: Web版とデスクトップ版を提供
- **モダンアーキテクチャ**: React/Next.jsとTauriによるハイブリッド構成

### システム構成図

```txt
┌─────────────────────────────────────────────────────────────┐
│                    Ant アプリケーション                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐              ┌─────────────────┐        │
│  │   Web App       │              │  Desktop App    │        │
│  │   (Next.js)     │              │   (Tauri)       │        │
│  └─────────────────┘              └─────────────────┘        │
│           │                                │                 │
│           └────────────┬───────────────────┘                 │
│                        │                                     │
│  ┌─────────────────────▼─────────────────────┐              │
│  │            Frontend Core                  │              │
│  │  ┌─────────────┐  ┌─────────────────────┐ │              │
│  │  │ Components  │  │     Services        │ │              │
│  │  │             │  │ ┌─────┐ ┌─────────┐ │ │              │
│  │  │ - TaskForm  │  │ │Task │ │ Crypto  │ │ │              │
│  │  │ - TaskList  │  │ │API  │ │ Service │ │ │              │
│  │  │ - Button    │  │ └─────┘ └─────────┘ │ │              │
│  │  │ - TextField │  │ ┌─────┐ ┌─────────┐ │ │              │
│  │  └─────────────┘  │ │User │ │ Token   │ │ │              │
│  │                   │ │API  │ │ Service │ │ │              │
│  │                   │ └─────┘ └─────────┘ │ │              │
│  │                   └─────────────────────┘ │              │
│  └─────────────────────────────────────────┘              │
│                        │                                     │
│  ┌─────────────────────▼─────────────────────┐              │
│  │         Local Storage Layer               │              │
│  │  ┌─────────────┐  ┌─────────────────────┐ │              │
│  │  │ Encrypted   │  │   Authentication    │ │              │
│  │  │ Task Data   │  │     Tokens          │ │              │
│  │  └─────────────┘  └─────────────────────┘ │              │
│  └─────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## アーキテクチャパターン

### 1. レイヤードアーキテクチャ

アプリケーションは以下の層に分かれています：

```txt
┌─────────────────────────┐
│   Presentation Layer    │  ← React Components, Pages
├─────────────────────────┤
│   Business Logic Layer  │  ← Services, Hooks
├─────────────────────────┤
│   Data Access Layer     │  ← API Clients, Storage
├─────────────────────────┤
│   Infrastructure Layer  │  ← Crypto, Utilities
└─────────────────────────┘
```

#### Presentation Layer (プレゼンテーション層)

- **責務**: ユーザーインターフェースの表示とユーザー操作の処理
- **構成要素**:
  - React Components (`src/components/`)
  - Pages (`src/app/`)
  - Styling (Panda CSS)

#### Business Logic Layer (ビジネスロジック層)

- **責務**: アプリケーションのビジネスルールと処理フロー
- **構成要素**:
  - Custom Hooks (`src/app/page.hooks.ts`)
  - Service Layer (`src/services/`)
  - State Management

#### Data Access Layer (データアクセス層)

- **責務**: データの永続化と取得
- **構成要素**:
  - API Services (`src/services/`)
  - Local Storage管理
  - データ変換処理

#### Infrastructure Layer (インフラストラクチャ層)

- **責務**: 技術的な基盤機能
- **構成要素**:
  - 暗号化ユーティリティ (`src/utils/crypto/`)
  - ハッシュ関数 (`src/utils/hash/`)
  - 設定管理

### 2. コンポーネント設計

#### Atomic Design原則

```txt
Atoms (原子)
├── Button
├── TextField
├── Text
└── Label

Molecules (分子)
├── TaskForm
├── ErrorMessage
└── TextBox

Organisms (有機体)
├── TaskList
└── Form

Templates (テンプレート)
└── Page Layouts

Pages (ページ)
├── Home
├── Login
├── Register
└── Tasks
```

#### コンポーネントの責務分離

1. **Presentation Components**: UIの表示のみ
2. **Container Components**: データとロジックの管理
3. **Service Components**: ビジネスロジックの実行

## 技術スタックの選択理由

### フロントエンド

#### Next.js 15

**選択理由**:

- **App Router**: モダンなルーティングシステム
- **TypeScript統合**: 型安全性の確保
- **パフォーマンス最適化**: 自動的な最適化機能
- **SEO対応**: サーバーサイドレンダリング対応

#### React 19

**選択理由**:

- **Concurrent Features**: パフォーマンス向上
- **Modern Hooks**: より効率的な状態管理
- **エコシステム**: 豊富なライブラリとツール

#### Panda CSS

**選択理由**:

- **Type-safe styling**: 型安全なスタイリング
- **Zero-runtime**: ビルド時に最適化
- **Utility-first**: 保守性の高いCSS
- **カスタマイゼーション**: 柔軟なデザインシステム

### デスクトップアプリ

#### Tauri

**選択理由**:

- **軽量**: Electronより小さなバイナリサイズ
- **セキュリティ**: Rustによる安全性
- **パフォーマンス**: ネイティブ性能
- **Web技術の活用**: 既存のフロントエンドコードの再利用

### 開発ツール

#### TypeScript

**選択理由**:

- **型安全性**: ランタイムエラーの削減
- **開発効率**: IDEサポートの向上
- **リファクタリング**: 安全なコード変更
- **チーム開発**: コードの可読性向上

#### Vitest

**選択理由**:

- **高速**: Viteベースの高速テスト実行
- **ESM対応**: モダンなJavaScript対応
- **TypeScript統合**: 型チェック付きテスト
- **カバレッジ**: 内蔵カバレッジレポート

## データフロー

### 1. タスク管理のデータフロー

```txt
User Action → Component → Service → Encryption → Local Storage
     ↓                                              ↑
UI Update ← State Update ← Decryption ← Data Retrieval
```

#### 詳細なフロー

1. **タスク作成**:

   ```typescript
   // 1. ユーザー入力
   TaskForm → handleSubmit()
   
   // 2. バリデーション
   Zod Schema → validation
   
   // 3. ビジネスロジック
   Task Service → createTask()
   
   // 4. 暗号化
   Crypto Service → encryptObject()
   
   // 5. 永続化
   Local Storage → setItem()
   
   // 6. 状態更新
   React State → setState()
   ```

2. **タスク取得**:

   ```typescript
   // 1. データ取得
   Local Storage → getItem()
   
   // 2. 復号化
   Crypto Service → decryptObject()
   
   // 3. データ変換
   Task Service → parseTask()
   
   // 4. 状態更新
   React State → setState()
   
   // 5. UI更新
   TaskList → render()
   ```

### 2. 認証のデータフロー

```txt
Login Form → Credentials → Hash → Token → Local Storage
    ↓                                         ↑
Protected Route ← Token Validation ← Token Retrieval
```

## セキュリティアーキテクチャ

### 1. 暗号化レイヤー

```txt
┌─────────────────────────────────────────┐
│           Application Layer             │
├─────────────────────────────────────────┤
│          Encryption Service             │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │   AES-GCM   │  │   Key Derivation│   │
│  │ Encryption  │  │     (PBKDF2)    │   │
│  └─────────────┘  └─────────────────┘   │
├─────────────────────────────────────────┤
│           Storage Layer                 │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │  Encrypted  │  │   Encrypted     │   │
│  │ Task Data   │  │  User Data      │   │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
```

#### 暗号化実装

1. **キー導出**:

   ```typescript
   // PBKDF2を使用したキー導出
   const derivedKey = await crypto.subtle.deriveBits({
     name: 'PBKDF2',
     salt: new TextEncoder().encode(userPassword),
     iterations: 100000,
     hash: 'SHA-256'
   }, masterKey, 256)
   ```

2. **データ暗号化**:

   ```typescript
   // AES-GCMによる暗号化
   const encrypted = await crypto.subtle.encrypt({
     name: 'AES-GCM',
     iv: randomIV
   }, cryptoKey, data)
   ```

### 2. セキュリティ境界

```txt
┌─────────────────────────────────────────────────────────┐
│                Browser Security Context                 │
│  ┌─────────────────────────────────────────────────────┐│
│  │              Same-Origin Policy                     ││
│  │  ┌─────────────────────────────────────────────────┐││
│  │  │            Content Security Policy              │││
│  │  │  ┌─────────────────────────────────────────────┐│││
│  │  │  │        Application Security Layer          ││││
│  │  │  │                                            ││││
│  │  │  │  - Client-side Encryption                  ││││
│  │  │  │  - Token-based Authentication              ││││
│  │  │  │  - Input Validation                        ││││
│  │  │  │  - XSS Protection                          ││││
│  │  │  │                                            ││││
│  │  │  └─────────────────────────────────────────────┘│││
│  │  └─────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

## パフォーマンス設計

### 1. レンダリング最適化

#### React最適化

```typescript
// メモ化によるレンダリング最適化
const TaskList = memo(({ tasks }: TaskListProps) => {
  // タスクの変更時のみ再レンダリング
})

// カスタムフックでの状態最適化
const useTaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  
  // 必要な時のみ状態更新
  const addTask = useCallback((task: Task) => {
    setTasks(prev => [...prev, task])
  }, [])
}
```

#### レイジーローディング

```typescript
// コンポーネントの遅延読み込み
const TaskForm = lazy(() => import('./TaskForm'))

// ルートレベルでの遅延読み込み
const TasksPage = lazy(() => import('./tasks/page'))
```

### 2. データ処理最適化

#### 暗号化の最適化

```typescript
// Web Workersによる暗号化処理の非同期化
const encryptInWorker = (data: unknown) => {
  return new Promise((resolve) => {
    const worker = new Worker('./crypto-worker.js')
    worker.postMessage(data)
    worker.onmessage = (e) => resolve(e.data)
  })
}
```

#### キャッシュ戦略

```typescript
// メモリキャッシュ
const taskCache = new Map<string, Task>()

// ローカルストレージキャッシュ
const getCachedTask = (id: string) => {
  const cached = localStorage.getItem(`task_${id}`)
  return cached ? JSON.parse(cached) : null
}
```

## スケーラビリティ

### 1. コードベースのスケーラビリティ

#### モジュラー設計

```txt
src/
├── components/          # 再利用可能なコンポーネント
│   ├── ui/             # 基本UIコンポーネント
│   ├── forms/          # フォーム関連コンポーネント
│   └── layouts/        # レイアウトコンポーネント
├── services/           # ビジネスロジック
│   ├── api/           # API通信
│   ├── storage/       # データ永続化
│   └── crypto/        # 暗号化処理
├── hooks/             # カスタムフック
├── utils/             # ユーティリティ関数
└── types/             # TypeScript型定義
```

#### 依存性注入

```typescript
// サービスの依存性注入
interface TaskService {
  create(task: Task): Promise<void>
  list(): Promise<Task[]>
}

const useTaskService = (): TaskService => {
  // 環境に応じてサービス実装を切り替え
  return process.env.NODE_ENV === 'test' 
    ? new MockTaskService()
    : new LocalTaskService()
}
```

### 2. データのスケーラビリティ

#### 仮想化

```typescript
// 大量データの仮想スクロール
const VirtualTaskList = ({ tasks }: { tasks: Task[] }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 })
  
  // 可視範囲のタスクのみレンダリング
  const visibleTasks = tasks.slice(visibleRange.start, visibleRange.end)
}
```

#### ページネーション

```typescript
// タスクのページ分割
const usePaginatedTasks = (pageSize = 20) => {
  const [currentPage, setCurrentPage] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  
  const paginatedTasks = tasks.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  )
}
```

## 技術的制約と考慮事項

### 1. ブラウザ互換性

#### 対応ブラウザ

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

#### 必要なAPI

- Web Crypto API (暗号化)
- Local Storage (データ永続化)
- ES2020+ (モダンJavaScript)

### 2. パフォーマンス制約

#### メモリ使用量

- 大量タスク時のメモリ使用量監視
- ガベージコレクション最適化
- メモリリーク防止

#### 暗号化処理

- CPU集約的な処理のスケジューリング
- UIブロッキングの回避
- プログレス表示の実装

## 将来の拡張性

### 1. 新機能の追加

#### プラグインアーキテクチャ

```typescript
// プラグインインターフェース
interface AntPlugin {
  name: string
  version: string
  install(app: AntApp): void
  uninstall(): void
}

// プラグイン管理
class PluginManager {
  private plugins: Map<string, AntPlugin> = new Map()
  
  install(plugin: AntPlugin) {
    this.plugins.set(plugin.name, plugin)
    plugin.install(this.app)
  }
}
```

#### 機能フラグ

```typescript
// 機能の段階的リリース
const useFeatureFlag = (feature: string) => {
  const flags = useContext(FeatureFlagContext)
  return flags[feature] ?? false
}
```

### 2. 技術的進化への対応

#### モジュール境界の明確化

- 各レイヤーの独立性確保
- インターフェースベースの設計
- 依存関係の最小化

#### テスト可能性

- ユニットテストの容易性
- 統合テストの自動化
- E2Eテストの保守性

---

このアーキテクチャは、セキュリティ、パフォーマンス、保守性、拡張性のバランスを取りながら、現代的なWebアプリケーション開発のベストプラクティスに従って設計されています。
