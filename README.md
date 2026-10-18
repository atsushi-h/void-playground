# Void Todo

React + Tailwind CSS + Void Pages / API + D1 のフルスタックTodoアプリ。
小さな機能で、機能単位の構成、層の境界、型付きAPI、マイグレーション、単体・結合テスト、CIを検証します。

## 必要環境と起動

Bun 1.4.2（CIと同じバージョンを推奨）。

```sh
bun install --frozen-lockfile
bun run db:migrate
bun run dev
```

表示されたURL（通常 http://localhost:5173）を開きます。外部DBや環境変数は不要です。
開発データはVoidが管理するローカルD1に保存されます。リロードや開発サーバーの再起動後も残ります。
認証はありません。同じ環境のTodoは全利用者で共有します。

## コマンド

```sh
bun run check             # 整形・lint・Voidの型生成・型チェック
bun run test              # 入力スキーマ・Serviceの単体テスト
bun run test:integration  # 隔離したVoid / D1でAPI・Repository・SSRを検証
bun run build             # Workers向けSSRとブラウザー用アセットをビルド
bun run verify            # check + 単体テスト + build
bun run db:generate       # スキーマ差分からマイグレーション生成
bun run db:migrate        # ローカルDBへ適用（既存データを保持）
```

結合テストは一時ディレクトリにプロジェクトを作り、別のWorkersランタイムと新しいD1を起動します。
開発中のDBやリモートDBには接続しません。実行にはローカルポートの待ち受けが必要です。
画面E2Eは含みません。フォーム操作は手動確認対象です。

## データフロー

- 初期表示・再取得: `pages/index.server.ts` loader → Service → Repository → D1 → props → React SSR / hydration
- 更新: React → `void/client` の型付きfetch → `routes/api/todos` → Service → Repository → D1
- 更新成功後: `router.refresh()` でloaderを再実行。Todo一覧はpropsを正本とし、一覧の複製stateは持ちません。
- 絞り込み・ページ番号: `?status=all|active|completed&page=1`。1ページ20件、新しいID順。最終ページを超えた番号は最終ページに丸めます。

## 構成と依存ルール

```text
src/pages/                    ルートUIとサーバーloader
src/routes/api/todos/         HTTP入力検証・レスポンス
src/features/todos/contracts/ 入出力の型とZodスキーマ（DB依存なし）
src/features/todos/components/ Todo用React UI
src/features/todos/client/    型付きAPIクライアント
src/features/todos/server/    Service・Repository契約・D1実装
src/components/ui/           共通UI
src/server/composition.ts     依存の組み立て
src/server/api-errors.ts      業務エラーからHTTPへの変換
src/db/                       Drizzleスキーマ・生成マイグレーション
```

ServiceはHTTPやDrizzleに依存せず、Repositoryインターフェースを引数で受け取ります。
DB操作はD1 Repositoryだけに置きます。DB行は明示的にDTOへ変換し、新しいDBカラムが自動で公開されないようにします。
UI・client・contractsからserverやDBへの実行時importはlintで禁止します。loader propsの`import type`は許可します。
同一Todoの最終更新が保存される方式で、同時更新制御はありません。
既存のpostsテーブル・API・マイグレーションは保持しています。

## API

| メソッド | URL              | 本文 / クエリ                                 | 成功                                               |
| -------- | ---------------- | --------------------------------------------- | -------------------------------------------------- |
| GET      | `/api/todos`     | `status`, `page`                              | 200: items / total / activeCount / page / pageSize |
| POST     | `/api/todos`     | `{ "title": "買い物" }`                       | 201: Todo DTO                                      |
| PATCH    | `/api/todos/:id` | `{ "title"?: string, "completed"?: boolean }` | 200: Todo DTO                                      |
| DELETE   | `/api/todos/:id` | なし                                          | 204: 本文なし                                      |

DTO: `id`, `title`, `completed`, `createdAt`, `updatedAt`。日時はUTCのISO文字列です。
タイトルはtrim後1〜200文字。同名Todoを許可します。IDは正の安全な整数。
作成・更新の未知のフィールド、空のPATCH、不正な型を拒否します。

- 400: Voidの検証エラー `{ error, issues }`
- 404: `{ error, code: "TODO_NOT_FOUND" }`
- 500: `{ error, code: "INTERNAL_ERROR" }`。詳細はサーバーログに記録し、レスポンスには含めません。
- 一覧APIとloaderは`Cache-Control: no-store`。SSR取得失敗は画面内の再試行UIで扱います。

## 手動確認

1. 追加 → タイトル編集 → 完了切り替え → 絞り込み → 削除を確認。
2. リロード後も保存済みの内容が復元されることを確認。
3. 空白だけのタイトル、保存中の二重操作、通信失敗時の入力保持を確認。
4. モバイル幅、Tab操作、Enter送信、編集キャンセルを確認。

## CI / マイグレーション

GitHub Actionsはロックファイル固定インストール、check、単体テスト、build、結合テストを実行します。
スキーマ変更時は `bun run db:generate` のSQLとmetaをレビューしてコミットし、`bun run db:migrate`でローカル検証します。
検証・本番のDBはローカルから分離してください。デプロイ先の設定・リモートマイグレーション・デプロイ自体は今回の実装範囲に含みません。
設計判断は `docs/decisions/001-architecture.md` を参照してください。
