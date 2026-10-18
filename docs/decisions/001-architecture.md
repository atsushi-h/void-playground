# 001: React / Void Pages / API / Service / Repository

Status: Accepted

## 目的

Todoの機能を使って、大きなアプリへ拡張する際の責務の分離、型の伝播、設定、テストを検証する。
同時更新制御、画面E2E、認証・認可は対象外。

## 判断

- ReactのSSRとナビゲーションはVoid Pages。初回取得は専用`.server.ts`のloaderで行う。React Server Componentsは使用しない。
- 更新用HTTP APIは`routes/api`に置き、クライアントは`void/client`を利用する。Pages actionsと更新経路を重複させない。
- loaderとAPIは同じServiceを呼ぶ。サーバー内部で自分のAPIへHTTP通信は行わない。
- ServiceはRepositoryのインターフェースを使い、compositionでD1実装を注入する。DIコンテナーは導入しない。
- DBの取得・挿入・更新・削除はRepositoryへ集約する。generic repositoryは作らない。
- 今回は業務モデルと公開DTOのフィールドが同一のため、同形のdomainモデルは追加しない。DB行からDTOへの変換は明示し、業務概念が増えた時点でdomainモデルを分ける。
- ZodでHTTP入力と画面入力を検証する。HTTP境界で検証済みの値をServiceへ渡す。
- 一覧はloader propsで管理し、成功後に再取得する。Reactのstateはフォーム、送信中、エラー、通知に使う。
- 絞り込みとページ番号はURLへ置く。DBで絞り込み・件数計算・ページングを行う。
- TailwindのViteプラグインとCSSテーマ変数を使い、共通のButton / TextField / FieldErrorを用意する。
- 既存Vite+のlintとformatterを継続。クライアントからサーバー実装へのimportを禁止し、TypeScript strictと未使用検査を有効にする。
- Bunの単体テストと、隔離したWorkers / D1へのHTTP結合テストをCIで実行する。

## トレードオフ

- 更新ごとに一覧loaderを再実行するため、追加の取得が発生する。まず整合性を優先し、楽観的UIは検証範囲に含めない。
- 同時編集は最終書き込みが優先される。楽観ロックや複数クエリのスナップショット整合性は保証しない。
- 認証なしのため全利用者でデータを共有する。
- 一覧の件数・未完了件数は個別に集計する。データ量が増えた際にはクエリ計測から索引や取得方法を見直す。
- 秘密情報を使わない構成のため、空のenvスキーマは追加しない。必要になった環境変数はVoidのenvスキーマで宣言する。
