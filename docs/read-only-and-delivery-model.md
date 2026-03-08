# Read-only 原則と static-first 配信モデル

## Read-only 原則

Ledra の公開面（API / UI / 検索インデックス）は read-only を基本とします。

- 外部クライアントからの書き込みは受け付けない。
- 変更は Pull Request ベースで Git に対して行う。
- 監査ログは Git history に一本化する。

## Static-first 配信モデル

配信は静的成果物を優先し、必要時にのみ動的 API を追加します。

1. `validate` でデータを検証。
2. `search` で静的インデックスを生成。
3. `browse` 用の静的ページ/JSON を生成。
4. CDN / オブジェクトストレージに配置。
5. 要件がある場合のみ `serve` を read-only API として併用。

## メリット

- シンプルな運用（障害点が少ない）。
- キャッシュしやすく高速。
- セキュリティ境界が明確（書き込み経路を Git に限定）。

