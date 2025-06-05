# テストガイド

このドキュメントでは、Antアプリケーションのテスト戦略、テストの実行方法、新しいテストの作成方法について説明します。

## 目次

- [テスト戦略](#テスト戦略)
- [テスト環境の構築](#テスト環境の構築)
- [テストの実行](#テストの実行)
- [テストの種類](#テストの種類)
- [テストの作成方法](#テストの作成方法)
- [カバレッジレポート](#カバレッジレポート)
- [CI/CDでのテスト](#cicdでのテスト)

## テスト戦略

Antでは以下のテスト戦略を採用しています：

### テストピラミッド

```txt
        ┌─────────────────┐
        │   E2E Tests     │  ← 少数の重要なユーザーフロー
        │   (Playwright)  │
        └─────────────────┘
       ┌─────────────────────┐
       │ Integration Tests   │  ← コンポーネント間の連携
       │    (Vitest)         │
       └─────────────────────┘
      ┌───────────────────────────┐
      │     Unit Tests            │  ← 関数・コンポーネントの個別テスト
      │ (Vitest + Testing Library)│
      └───────────────────────────┘
```

### テストの方針

1. **高速フィードバック**: ユニットテストで迅速な検証
2. **実用的なテスト**: 実際のユースケースに基づくテスト
3. **保守性重視**: テストコードの可読性と保守性
4. **自動化**: CI/CDパイプラインでの自動実行

## テスト環境の構築

### 前提条件

```bash
# Node.js 18以上が必要
node --version

# プロジェクトの依存関係をインストール
npm install
```

### テスト設定ファイル

#### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'styled-system/',
        'src/test/',
        '**/*.stories.tsx',
        '**/*.config.ts'
      ]
    }
  }
})
```

#### src/test/setup.ts

```typescript
import '@testing-library/jest-dom'
import { beforeEach, vi } from 'vitest'

// Web Crypto APIのモック
Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      generateKey: vi.fn(),
      // ... その他のメソッド
    }
  }
})

// Local Storageのモック
beforeEach(() => {
  localStorage.clear()
})
```

## テストの実行

### 基本的なテストコマンド

```bash
# 全テストの実行
npm test

# ウォッチモードでテスト実行
npm run test:watch

# カバレッジ付きでテスト実行
npm run test:coverage

# 特定のファイルのテスト実行
npm test -- src/components/Button/test.tsx

# 特定のテストパターンの実行
npm test -- --grep "TaskForm"
```

### 詳細オプション

```bash
# テストを並列実行（高速化）
npm test -- --reporter=verbose --threads

# 失敗したテストのみ再実行
npm test -- --changed

# テスト結果をファイルに出力
npm test -- --reporter=json --outputFile=test-results.json
```

## テストの種類

### 1. ユニットテスト

#### コンポーネントテスト

```typescript
// src/components/Button/test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('ボタンテキストが正しく表示される', () => {
    render(<Button>クリック</Button>)
    expect(screen.getByRole('button', { name: 'クリック' })).toBeInTheDocument()
  })

  it('クリック時にonClickが呼ばれる', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>クリック</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabled状態では反応しない', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick} disabled>クリック</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
```

#### サービステスト

```typescript
// src/services/task/test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TaskService } from './TaskService'
import type { Task } from '../../types/Task'

describe('TaskService', () => {
  let taskService: TaskService

  beforeEach(() => {
    localStorage.clear()
    taskService = new TaskService()
  })

  describe('createTask', () => {
    it('新しいタスクが作成される', async () => {
      const taskData = {
        title: 'テストタスク',
        description: 'テスト用のタスクです',
        priority: 'medium' as const
      }

      const task = await taskService.createTask(taskData)

      expect(task).toMatchObject({
        id: expect.any(String),
        title: 'テストタスク',
        description: 'テスト用のタスクです',
        priority: 'medium',
        completed: false,
        createdAt: expect.any(Date)
      })
    })

    it('必須フィールドが不足している場合はエラーが発生する', async () => {
      const invalidData = {
        description: 'タイトルがありません'
      }

      await expect(
        taskService.createTask(invalidData as any)
      ).rejects.toThrow('タイトルは必須です')
    })
  })

  describe('getTasks', () => {
    it('保存されたタスクが取得される', async () => {
      // タスクを作成
      const task1 = await taskService.createTask({
        title: 'タスク1',
        priority: 'high'
      })
      const task2 = await taskService.createTask({
        title: 'タスク2',
        priority: 'low'
      })

      // タスク一覧を取得
      const tasks = await taskService.getTasks()

      expect(tasks).toHaveLength(2)
      expect(tasks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ title: 'タスク1' }),
          expect.objectContaining({ title: 'タスク2' })
        ])
      )
    })
  })
})
```

#### ユーティリティ関数テスト

```typescript
// src/utils/crypto/test.ts
import { describe, it, expect } from 'vitest'
import { encryptObject, decryptObject, generateKey } from './crypto'

describe('crypto utilities', () => {
  describe('encryptObject and decryptObject', () => {
    it('オブジェクトの暗号化と復号化が正しく動作する', async () => {
      const key = await generateKey('test-password')
      const originalData = {
        title: 'テストタスク',
        priority: 'high',
        metadata: { tags: ['work', 'urgent'] }
      }

      // 暗号化
      const encrypted = await encryptObject(originalData, key)
      expect(encrypted).not.toEqual(originalData)
      expect(typeof encrypted).toBe('string')

      // 復号化
      const decrypted = await decryptObject(encrypted, key)
      expect(decrypted).toEqual(originalData)
    })

    it('間違ったキーでは復号化できない', async () => {
      const correctKey = await generateKey('correct-password')
      const wrongKey = await generateKey('wrong-password')
      const data = { message: 'secret' }

      const encrypted = await encryptObject(data, correctKey)

      await expect(
        decryptObject(encrypted, wrongKey)
      ).rejects.toThrow()
    })
  })
})
```

### 2. 統合テスト

#### ページレベルテスト

```typescript
// src/app/tasks/page.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import TasksPage from './page'

describe('TasksPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('タスクの作成から表示までの流れが正しく動作する', async () => {
    const user = userEvent.setup()
    render(<TasksPage />)

    // 新しいタスクを作成
    const titleInput = screen.getByLabelText('タスクタイトル')
    const submitButton = screen.getByRole('button', { name: '作成' })

    await user.type(titleInput, '新しいタスク')
    await user.click(submitButton)

    // タスクが一覧に表示されることを確認
    expect(screen.getByText('新しいタスク')).toBeInTheDocument()
  })

  it('タスクの完了状態を切り替えできる', async () => {
    const user = userEvent.setup()
    render(<TasksPage />)

    // タスクを作成
    await user.type(screen.getByLabelText('タスクタイトル'), 'テストタスク')
    await user.click(screen.getByRole('button', { name: '作成' }))

    // 完了チェックボックスをクリック
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    // 完了状態になることを確認
    expect(checkbox).toBeChecked()
  })
})
```

### 3. E2Eテスト

#### Playwrightでのテスト

```typescript
// tests/e2e/task-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('タスク管理機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('ユーザーがタスクを作成して管理できる', async ({ page }) => {
    // タスク作成
    await page.fill('[data-testid="task-title"]', '重要なタスク')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.click('[data-testid="create-task"]')

    // タスクが表示されることを確認
    await expect(page.locator('[data-testid="task-item"]')).toContainText('重要なタスク')

    // タスクを完了にする
    await page.click('[data-testid="task-checkbox"]')
    await expect(page.locator('[data-testid="task-item"]')).toHaveClass(/completed/)

    // タスクを削除
    await page.click('[data-testid="delete-task"]')
    await expect(page.locator('[data-testid="task-item"]')).not.toBeVisible()
  })

  test('暗号化されたデータの永続化', async ({ page, context }) => {
    // タスクを作成
    await page.fill('[data-testid="task-title"]', '暗号化テスト')
    await page.click('[data-testid="create-task"]')

    // ページをリロード
    await page.reload()

    // タスクが復元されることを確認
    await expect(page.locator('[data-testid="task-item"]')).toContainText('暗号化テスト')
  })
})
```

## テストの作成方法

### 1. 新しいコンポーネントのテスト

#### ファイル構成

```txt
src/components/NewComponent/
├── NewComponent.tsx
├── test.tsx          ← テストファイル
├── stories.tsx       ← Storybookストーリー
└── index.ts
```

#### テストテンプレート

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { NewComponent } from './NewComponent'

describe('NewComponent', () => {
  it('正しくレンダリングされる', () => {
    render(<NewComponent />)
    // テストロジック
  })

  it('プロパティが正しく処理される', () => {
    // テストロジック
  })

  it('ユーザーインタラクションが正しく動作する', () => {
    // テストロジック
  })
})
```

### 2. モックの使用

#### APIモック

```typescript
// src/services/api/test.ts
import { vi } from 'vitest'

// fetch APIのモック
global.fetch = vi.fn()

const mockFetch = (data: any) => {
  (fetch as any).mockResolvedValueOnce({
    ok: true,
    json: async () => data
  })
}

describe('API Service', () => {
  it('データを正しく取得する', async () => {
    mockFetch({ id: 1, title: 'テスト' })
    
    const result = await apiService.getData()
    expect(result).toEqual({ id: 1, title: 'テスト' })
  })
})
```

#### 外部依存関係のモック

```typescript
// __mocks__/crypto.ts
export const crypto = {
  subtle: {
    encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(16)),
    decrypt: vi.fn().mockResolvedValue(new ArrayBuffer(16)),
    generateKey: vi.fn().mockResolvedValue({})
  }
}
```

### 3. テストデータの管理

#### ファクトリー関数

```typescript
// src/test/factories.ts
import type { Task } from '../types/Task'

export const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'test-id',
  title: 'テストタスク',
  description: 'テスト用のタスクです',
  priority: 'medium',
  completed: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides
})

export const createUser = (overrides = {}) => ({
  id: 'user-id',
  email: 'test@example.com',
  ...overrides
})
```

## カバレッジレポート

### カバレッジの実行

```bash
# カバレッジレポートを生成
npm run test:coverage

# カバレッジレポートをブラウザで表示
open coverage/index.html
```

### カバレッジ目標

| 種類 | 目標 | 現在 |
|------|------|------|
| Line Coverage | 90%+ | 85% |
| Function Coverage | 95%+ | 92% |
| Branch Coverage | 85%+ | 78% |
| Statement Coverage | 90%+ | 87% |

### カバレッジ除外設定

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      exclude: [
        'node_modules/',
        'styled-system/',
        'src/test/',
        '**/*.stories.tsx',
        '**/*.config.ts',
        '**/types/**'
      ]
    }
  }
})
```

## CI/CDでのテスト

### GitHub Actionsの設定

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test:coverage
        
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### 品質ゲート

テストが以下の条件を満たす場合のみマージ可能：

1. **すべてのテストが成功**
2. **カバレッジが低下しない**
3. **リントエラーがない**
4. **型チェックが成功**

## テストのベストプラクティス

### 1. テストの命名

```typescript
// Good: 動作と期待結果を明確に記述
it('無効なメールアドレスでエラーメッセージが表示される', () => {})

// Bad: 実装詳細に依存した命名
it('validateEmail関数がfalseを返す', () => {})
```

### 2. テストの構造

```typescript
describe('TaskForm', () => {
  // Arrange（準備）
  const mockProps = {
    onSubmit: vi.fn(),
    initialValues: createTask()
  }

  it('バリデーションエラーで送信が阻止される', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<TaskForm {...mockProps} />)
    
    // Act（実行）
    await user.click(screen.getByRole('button', { name: '送信' }))
    
    // Assert（検証）
    expect(mockProps.onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('タイトルは必須です')).toBeInTheDocument()
  })
})
```

### 3. 非同期テストの処理

```typescript
// Good: 適切な非同期処理
it('APIから取得したデータが表示される', async () => {
  render(<TaskList />)
  
  // データの読み込み完了を待機
  await waitFor(() => {
    expect(screen.getByText('タスク1')).toBeInTheDocument()
  })
})

// Good: ユーザーイベントの適切な処理
it('フォーム送信が正しく動作する', async () => {
  const user = userEvent.setup()
  render(<TaskForm />)
  
  await user.type(screen.getByLabelText('タイトル'), 'テストタスク')
  await user.click(screen.getByRole('button', { name: '送信' }))
  
  await waitFor(() => {
    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'テストタスク'
    })
  })
})
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. テストが不安定（フレーキー）

**原因**: 非同期処理の待機不足

**解決方法**:

```typescript
// Bad
it('データが表示される', () => {
  render(<Component />)
  expect(screen.getByText('データ')).toBeInTheDocument() // 失敗する可能性
})

// Good
it('データが表示される', async () => {
  render(<Component />)
  await waitFor(() => {
    expect(screen.getByText('データ')).toBeInTheDocument()
  })
})
```

#### 2. モックが機能しない

**原因**: モックの適用タイミングが不適切

**解決方法**:

```typescript
// テストファイルの最上位でモック
vi.mock('../services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

describe('Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
})
```

#### 3. カバレッジが正しく計測されない

**原因**: ファイルの除外設定またはインポートの問題

**解決方法**:

```typescript
// vitest.config.tsで適切な除外設定
coverage: {
  exclude: [
    'node_modules/**',
    'dist/**',
    '**/*.config.*',
    '**/*.test.*'
  ]
}
```

---

継続的にテストを改善し、アプリケーションの品質と信頼性を保ちましょう。新しいテストケースや改善提案があれば、チームと共有してください。
