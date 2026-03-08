# CLI 利用例

ここでは、`validate / search / browse / serve` の最小実行例を示します。

## validate

```bash
pnpm --filter @ledra/validator run validate ./registry
```

- JSON Schema / 参照整合性 / 命名規則などのチェックを実行。
- CI では必須ジョブとして実行し、失敗時は merge しない運用を推奨。

## search

```bash
pnpm --filter @ledra/search run build-index ./registry --out ./dist/search-index
```

- 静的に配布可能な検索インデックスを生成。
- static-first 配信では、この成果物を CDN へ配置。

## browse

```bash
pnpm --filter @ledra/cli run browse ./registry --entity ipam/prefixes
```

- 人間向け閲覧に最適化した一覧・詳細表示を提供。

## serve

```bash
pnpm --filter @ledra/api run serve ./registry --port 8080
```

- API を read-only で公開。
- 書き込みは API 経由ではなく Git ワークフローで行う。

