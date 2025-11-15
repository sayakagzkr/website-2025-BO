# Backoffice Management System

モダンなバックオフィス管理システム - React + TypeScript + Node.js + Express

## 概要

このプロジェクトは、企業や組織のバックオフィス業務を効率化するための管理システムです。
ユーザー管理、コンテンツ管理、分析ダッシュボードなどの機能を提供します。

## 主な機能

### 🔐 認証・認可
- JWT認証
- ロールベースのアクセス制御（管理者・一般ユーザー）
- セキュアなパスワード管理

### 📊 ダッシュボード
- リアルタイム統計情報
- グラフとチャートによる可視化
- 人気コンテンツのトラッキング
- アクティビティログ

### 👥 ユーザー管理
- ユーザーの作成・編集・削除
- ロールとステータスの管理
- 詳細な検索・フィルタリング機能

### 📝 コンテンツ管理
- 記事やページの作成・編集
- ドラフト・公開・アーカイブのステータス管理
- カテゴリ分類
- 閲覧数トラッキング

### ⚙️ 設定
- パスワード変更
- アカウント情報管理

## 技術スタック

### フロントエンド
- **React 18** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - 高速ビルドツール
- **Tailwind CSS** - ユーティリティファーストCSS
- **React Router** - ルーティング
- **Axios** - HTTP通信
- **Recharts** - データ可視化
- **Lucide React** - アイコンライブラリ

### バックエンド
- **Node.js** - ランタイム
- **Express** - Webフレームワーク
- **SQLite (better-sqlite3)** - データベース
- **JWT (jsonwebtoken)** - 認証
- **bcryptjs** - パスワードハッシュ化
- **express-validator** - バリデーション

## セットアップ

### 必要な環境
- Node.js 18以上
- npm または yarn

### インストール

1. リポジトリのクローン（またはダウンロード）

2. 依存関係のインストール
```bash
npm run install:all
```

これにより、ルート、バックエンド、フロントエンドの全ての依存関係がインストールされます。

### 開発サーバーの起動

```bash
npm run dev
```

これにより、以下のサーバーが起動します：
- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:3001

または、個別に起動することもできます：

```bash
# バックエンドのみ
npm run dev:backend

# フロントエンドのみ
npm run dev:frontend
```

## デフォルトの認証情報

初回起動時に管理者アカウントが自動作成されます：

- **ユーザー名**: `admin`
- **パスワード**: `admin123`

⚠️ **セキュリティ**: 初回ログイン後、必ずパスワードを変更してください。

## プロジェクト構造

```
backoffice-system/
├── backend/              # バックエンドアプリケーション
│   ├── src/
│   │   ├── controllers/  # コントローラー
│   │   ├── models/       # データモデル
│   │   ├── routes/       # APIルート
│   │   │   ├── auth.js   # 認証API
│   │   │   ├── users.js  # ユーザー管理API
│   │   │   ├── content.js # コンテンツ管理API
│   │   │   └── analytics.js # 分析API
│   │   ├── middleware/   # ミドルウェア
│   │   │   └── auth.js   # 認証ミドルウェア
│   │   ├── utils/        # ユーティリティ
│   │   │   └── database.js # データベース設定
│   │   └── server.js     # エントリーポイント
│   ├── data/             # SQLiteデータベースファイル
│   ├── .env              # 環境変数
│   └── package.json
│
├── frontend/             # フロントエンドアプリケーション
│   ├── src/
│   │   ├── components/   # 共通コンポーネント
│   │   │   └── Layout.tsx # レイアウトコンポーネント
│   │   ├── pages/        # ページコンポーネント
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Users.tsx
│   │   │   ├── Content.tsx
│   │   │   ├── ContentEdit.tsx
│   │   │   └── Settings.tsx
│   │   ├── services/     # API通信
│   │   │   └── api.ts
│   │   ├── hooks/        # カスタムフック
│   │   │   └── useAuth.tsx
│   │   ├── types/        # TypeScript型定義
│   │   │   └── index.ts
│   │   ├── App.tsx       # アプリケーションルート
│   │   ├── main.tsx      # エントリーポイント
│   │   └── index.css     # グローバルスタイル
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── package.json          # ルートパッケージ
└── README.md
```

## API エンドポイント

### 認証
- `POST /api/auth/login` - ログイン
- `GET /api/auth/me` - 現在のユーザー情報取得
- `POST /api/auth/change-password` - パスワード変更

### ユーザー管理
- `GET /api/users` - ユーザー一覧取得
- `GET /api/users/:id` - ユーザー詳細取得
- `POST /api/users` - ユーザー作成（管理者のみ）
- `PUT /api/users/:id` - ユーザー更新
- `DELETE /api/users/:id` - ユーザー削除（管理者のみ）

### コンテンツ管理
- `GET /api/content` - コンテンツ一覧取得
- `GET /api/content/:id` - コンテンツ詳細取得
- `POST /api/content` - コンテンツ作成
- `PUT /api/content/:id` - コンテンツ更新
- `DELETE /api/content/:id` - コンテンツ削除

### 分析
- `GET /api/analytics/dashboard` - ダッシュボード統計
- `GET /api/analytics/activity` - アクティビティログ
- `POST /api/analytics/activity` - アクティビティ記録

## データベース

SQLiteを使用しています。データベースファイルは `backend/data/database.db` に保存されます。

### テーブル構造

**users**
- id, username, email, password, full_name, role, status, created_at, updated_at

**content**
- id, title, slug, content, status, category, author_id, views, created_at, updated_at, published_at

**activity_logs**
- id, user_id, action, resource_type, resource_id, ip_address, user_agent, created_at

## 環境変数

`backend/.env` ファイルで以下の環境変数を設定できます：

```env
PORT=3001
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

⚠️ **セキュリティ**: 本番環境では必ず `JWT_SECRET` を強力なランダム文字列に変更してください。

## セキュリティ

- パスワードは bcryptjs でハッシュ化
- JWT トークンによる認証
- ロールベースのアクセス制御
- CORS 設定
- SQLインジェクション対策（prepared statements使用）

## カスタマイズ

### カラーテーマの変更

`frontend/tailwind.config.js` でプライマリカラーを変更できます：

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // カラーコードをカスタマイズ
      }
    }
  }
}
```

### 機能の追加

1. バックエンド: `backend/src/routes/` に新しいルートファイルを追加
2. フロントエンド: `frontend/src/pages/` に新しいページを追加
3. APIサービス: `frontend/src/services/api.ts` にAPI関数を追加

## トラブルシューティング

### ポートが既に使用されている

別のアプリケーションがポート3001または5173を使用している場合：

- バックエンド: `backend/.env` の `PORT` を変更
- フロントエンド: `frontend/vite.config.ts` の `server.port` を変更

### データベースエラー

データベースをリセットする場合：

```bash
rm backend/data/database.db
# サーバーを再起動すると新しいデータベースが作成されます
```

## ライセンス

MIT License

## サポート

問題が発生した場合は、GitHubのIssuesセクションで報告してください。

---

**開発者向けノート**: このシステムは開発・学習目的で作成されています。本番環境で使用する場合は、セキュリティ監査を実施し、適切なセキュリティ対策を追加してください。
