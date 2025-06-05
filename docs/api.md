# API仕様

このドキュメントでは、Antアプリケーションで使用されるAPIの仕様について説明します。

## ベースURL

```txt
https://{HOST}/auth
```

ホスト名は環境変数 `NEXT_PUBLIC_API_HOST` で設定されます。

## 認証

すべてのAPIエンドポイントは、Bearerトークンによる認証が必要です。

```http
Authorization: Bearer {access_token}
```

## データの暗号化

セキュリティを強化するため、すべてのタスクデータはクライアントサイドで暗号化され、サーバーには暗号化されたデータのみが送信されます。

### 暗号化フロー

1. クライアントでタスクデータをJSONシリアライズ
2. ユーザー固有のキーでAES暗号化
3. 暗号化されたデータをAPIに送信
4. サーバーは暗号化されたデータをそのまま保存

## エンドポイント

### タスク管理

#### タスク一覧取得

```http
GET /auth/tasks
```

**レスポンス:**

```json
[
  {
    "_id": "string",
    "username": "string",
    "encryptedData": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

**復号化後のデータ構造:**

```typescript
interface TaskData {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
}
```

#### タスク作成

```http
POST /auth/tasks
```

**リクエストボディ:**

```json
{
  "encryptedData": "string"
}
```

**レスポンス:**

```http
Status: 201 Created
```

#### タスク更新

```http
PUT /auth/tasks/{id}
```

**パラメータ:**

- `id`: タスクID (string)

**リクエストボディ:**

```json
{
  "encryptedData": "string"
}
```

**レスポンス:**

```http
Status: 200 OK
```

#### タスク削除

```http
DELETE /auth/tasks/{id}
```

**パラメータ:**

- `id`: タスクID (string)

**レスポンス:**

```http
Status: 200 OK
```

## エラーハンドリング

### エラーレスポンス形式

APIエラーは以下の形式で返されます：

```json
{
  "error": "string",
  "message": "string",
  "statusCode": number
}
```

### ステータスコード

| コード | 説明 |
|--------|------|
| 200 | 成功 |
| 201 | 作成成功 |
| 400 | 不正なリクエスト |
| 401 | 認証エラー |
| 403 | 権限なし |
| 404 | リソースが見つからない |
| 500 | サーバーエラー |

## クライアントサイドのAPI実装

### サービス層

APIとの通信は `src/services/` ディレクトリで管理されています。

#### Task Service

```typescript
// src/services/task/index.ts

export async function fetchTasks(): Promise<TaskApiResult<TaskDataWithId[]>>
export async function createTask(task: TaskData): Promise<TaskApiResult<TaskData>>
export async function updateTask(id: string, task: TaskData): Promise<TaskApiResult<TaskData>>
export async function deleteTask(id: string): Promise<TaskApiResult>
```

#### 型定義

```typescript
// src/services/task/types.ts

export interface TaskData {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
}

export interface TaskDataWithId extends TaskData {
  _id: string;
}

export type TaskApiResult<T = undefined> = TaskApiSuccess<T> | TaskApiError;

interface TaskApiSuccess<T = undefined> {
  success: true;
  data: T;
  status: number;
}

interface TaskApiError {
  success: false;
  message: string;
  status?: number;
}
```

### 暗号化サービス

```typescript
// src/utils/crypto/index.ts

export async function encryptObject<T>(obj: T, key: string): Promise<string>
export async function decryptObject<T>(encryptedData: string, key: string): Promise<T>
```

### 認証サービス

```typescript
// src/services/token/index.ts

export function getAccessToken(): string
export function setAccessToken(token: string): void
export function removeAccessToken(): void
```

## 使用例

### タスクの作成

```typescript
import { createTask } from '@/services/task';

const newTask = {
  title: "新しいタスク",
  description: "タスクの説明",
  dueDate: "2024-12-31",
  priority: "high" as const
};

const result = await createTask(newTask);

if (result.success) {
  console.log('タスクが作成されました');
} else {
  console.error('エラー:', result.message);
}
```

### タスクの取得と表示

```typescript
import { fetchTasks } from '@/services/task';

const result = await fetchTasks();

if (result.success) {
  const tasks = result.data; // TaskDataWithId[]
  tasks.forEach(task => {
    console.log(`${task.title}: ${task.description}`);
  });
} else {
  console.error('エラー:', result.message);
}
```

## セキュリティ考慮事項

### 1. トークン管理

- アクセストークンはローカルストレージに保存
- トークンの有効期限切れを適切にハンドリング
- ログアウト時にトークンを削除

### 2. データ暗号化

- AES暗号化を使用してデータを保護
- ユーザー固有の暗号化キーを使用
- 暗号化キーはクライアントサイドでのみ管理

### 3. HTTPS通信

- すべてのAPI通信はHTTPS経由で実行
- 中間者攻撃を防止

## API テスト

### テストファイル

```typescript
// src/services/task/test.ts
// APIサービスの包括的なテストが含まれています
```

### モックの使用

テスト時は `vi.mock()` を使用してAPIをモック化：

```typescript
vi.mock('@/services/task', () => ({
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));
```

## バージョニング

現在のAPIバージョン: `v1`

将来的にAPIの仕様が変更される場合は、適切なバージョニング戦略を実装します。

## 制限事項

### レート制限

- APIには適切なレート制限が適用されています
- 詳細な制限については、サーバー側の設定を確認してください

### データサイズ制限

- タスクデータは暗号化されるため、実際のデータサイズよりも大きくなります
- 大きなファイルの添付は現在サポートされていません

## 今後の拡張予定

- [ ] ファイル添付機能
- [ ] タスクの共有機能
- [ ] リアルタイム同期
- [ ] GraphQL対応
