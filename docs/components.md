# コンポーネントガイド

このドキュメントでは、Antアプリケーションで使用されるUIコンポーネントについて説明します。

## 概要

Antでは、再利用可能なコンポーネントアーキテクチャを採用しています。すべてのコンポーネントは以下の原則に従って設計されています：

- **型安全性**: TypeScriptによる厳密な型定義
- **テスタビリティ**: 包括的なユニットテストの実装
- **アクセシビリティ**: WCAG 2.1 AAに準拠
- **レスポンシブデザイン**: モバイルファーストアプローチ

## コンポーネント一覧

### 基本コンポーネント

#### Button

汎用的なボタンコンポーネント

**ファイル**: `src/components/Button/`

**Props**:

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}
```

**使用例**:

```tsx
import Button from '@/components/Button';

// 基本的な使用
<Button onClick={handleClick}>
  クリック
</Button>

// バリアント指定
<Button variant="danger" onClick={handleDelete}>
  削除
</Button>

// サイズ指定
<Button size="small" variant="secondary">
  キャンセル
</Button>
```

#### TextField

テキスト入力フィールドコンポーネント

**ファイル**: `src/components/TextField/`

**Props**:

```typescript
interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'date';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}
```

**使用例**:

```tsx
import TextField from '@/components/TextField';

<TextField
  label="タイトル"
  value={title}
  onChange={setTitle}
  placeholder="タスクのタイトルを入力"
  required
/>
```

### フォームコンポーネント

#### Form

フォームの基本構造を提供するコンポーネント

**ファイル**: `src/components/Form/`

**使用例**:

```tsx
import Form from '@/components/Form';

<Form onSubmit={handleSubmit}>
  {/* フォームの内容 */}
</Form>
```

#### Label

ラベルコンポーネント

**ファイル**: `src/components/Label/`

**使用例**:

```tsx
import Label from '@/components/Label';

<Label htmlFor="title" required>
  タイトル
</Label>
```

### タスク関連コンポーネント

#### TaskForm

タスクの作成・編集フォームコンポーネント

**ファイル**: `src/components/TaskForm/`

**Props**:

```typescript
interface TaskFormProps {
  task?: TaskDataWithId | null;
  onSubmit: (task: TaskData) => Promise<void>;
  onCancel: () => void;
}
```

**機能**:

- タスクの新規作成
- 既存タスクの編集
- バリデーション
- 送信時のローディング状態

**使用例**:

```tsx
import TaskForm from '@/components/TaskForm';

<TaskForm
  task={editingTask}
  onSubmit={editingTask ? handleUpdate : handleCreate}
  onCancel={closeForm}
/>
```

#### TaskList

タスク一覧表示コンポーネント

**ファイル**: `src/components/TaskList/`

**Props**:

```typescript
interface TaskListProps {
  tasks: TaskDataWithId[];
  onEdit: (task: TaskDataWithId) => void;
  onDelete: (id: string) => void;
}
```

**機能**:

- タスクの一覧表示
- 優先度による色分け
- 期限の表示
- 編集・削除アクション

**使用例**:

```tsx
import TaskList from '@/components/TaskList';

<TaskList
  tasks={tasks}
  onEdit={openEditForm}
  onDelete={handleDelete}
/>
```

### ユーティリティコンポーネント

#### Text

テキスト表示用コンポーネント

**ファイル**: `src/components/Text/`

#### TextBox

複数行テキスト入力用コンポーネント

**ファイル**: `src/components/TextBox/`

#### ErrorMessage

エラーメッセージ表示用コンポーネント

**ファイル**: `src/components/ErrorMessage/`

## スタイリング

### Panda CSS

すべてのコンポーネントは Panda CSS を使用してスタイリングされています。

**設定ファイル**: `panda.config.ts`

**特徴**:

- CSS-in-JS
- 型安全なスタイル
- 最適化されたCSS出力
- レスポンシブデザイン対応

### スタイルファイルの構造

各コンポーネントには専用のスタイルファイルが存在します：

```txt
src/components/Button/
├── index.tsx      # コンポーネント本体
├── styles.ts      # Panda CSS スタイル定義
└── test.tsx       # テストファイル
```

**スタイル例**:

```typescript
// src/components/Button/styles.ts
import { css } from '../../../styled-system/css';

const styles = {
  button: css({
    padding: '0.75rem 1rem',
    borderRadius: '0.375rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    
    '&:hover': {
      transform: 'translateY(-1px)',
    },
    
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  }),
  
  primary: css({
    backgroundColor: '#3b82f6',
    color: 'white',
    
    '&:hover': {
      backgroundColor: '#2563eb',
    },
  }),
  
  secondary: css({
    backgroundColor: '#f3f4f6',
    color: '#374151',
    
    '&:hover': {
      backgroundColor: '#e5e7eb',
    },
  }),
};

export default styles;
```

## テスト

### テスト戦略

すべてのコンポーネントには包括的なテストが実装されています：

- **ユニットテスト**: 個別コンポーネントの動作確認
- **統合テスト**: コンポーネント間の連携確認
- **スナップショットテスト**: UIの回帰テスト

### テストファイルの構造

```typescript
// src/components/Button/test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import Button from './index';

describe('Buttonコンポーネント', () => {
  test('基本的なレンダリング', () => {
    render(<Button>テストボタン</Button>);
    expect(screen.getByText('テストボタン')).toBeInTheDocument();
  });

  test('クリックイベントが正常に動作する', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>クリック</Button>);
    
    fireEvent.click(screen.getByText('クリック'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('disabled状態では クリックできない', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>無効</Button>);
    
    fireEvent.click(screen.getByText('無効'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### テストの実行

```bash
# 全テストの実行
npm run test

# カバレッジ付きテスト
npm run test -- --coverage

# 特定のコンポーネントのテスト
npm run test Button
```

## Storybook

コンポーネントの開発とドキュメンテーションには Storybook を使用しています。

### Storybookの起動

```bash
npm run storybook
```

### ストーリーの例

```typescript
// src/components/Button/Button.stories.ts
import type { Meta, StoryObj } from '@storybook/react';
import Button from './index';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'プライマリボタン',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'セカンダリボタン',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: '無効なボタン',
  },
};
```

## アクセシビリティ

### 実装されているアクセシビリティ機能

- **キーボードナビゲーション**: Tab、Enter、Escapeキーの適切な処理
- **スクリーンリーダー対応**: aria-label、aria-describedby等の適切な使用
- **カラーコントラスト**: WCAG 2.1 AAに準拠したコントラスト比
- **フォーカス管理**: 視覚的なフォーカスインジケーター

### アクセシビリティテスト

```bash
# axe-core によるアクセシビリティテスト
npm run test -- --coverage
```

## パフォーマンス最適化

### 実装されている最適化

- **React.memo**: 不要な再レンダリングの防止
- **useCallback**: 関数の再生成を防止
- **useMemo**: 重い計算のメモ化
- **遅延ローディング**: 必要に応じたコンポーネントの読み込み

### コード例

```typescript
import React, { memo, useCallback } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const Button = memo(({ children, onClick }: ButtonProps) => {
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <button onClick={handleClick}>
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
```

## 新しいコンポーネントの作成

### 1. ディレクトリ構造の作成

```txt
src/components/NewComponent/
├── index.tsx      # メインコンポーネント
├── styles.ts      # スタイル定義
├── test.tsx       # テストファイル
└── README.md      # コンポーネントドキュメント
```

### 2. TypeScript型定義

```typescript
interface NewComponentProps {
  // プロパティを定義
}
```

### 3. テストの実装

```typescript
describe('NewComponentコンポーネント', () => {
  // テストケースを実装
});
```

### 4. Storybookストーリーの作成

```typescript
// NewComponent.stories.ts
// ストーリーを定義
```

## ベストプラクティス

### 1. コンポーネント設計

- 単一責任原則に従う
- プロパティは最小限に保つ
- 再利用性を考慮した設計

### 2. 型安全性

- すべてのプロパティに適切な型を定義
- デフォルト値の明示
- 必須/オプショナルの適切な設定

### 3. パフォーマンス

- 不要な状態更新を避ける
- 適切なメモ化の使用
- 重い処理の最適化

### 4. テスト

- ユーザーの操作をシミュレート
- エラーケースのテスト
- アクセシビリティのテスト

この包括的なコンポーネントガイドにより、開発者は効率的で保守性の高いUIコンポーネントを作成・管理できます。
