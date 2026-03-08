# データリポジトリ推奨構成

Ledra では、以下のような **`registry/entities/...`** を基点にした構成を推奨します。

```text
registry/
  entities/
    ipam/
      prefixes/
        prefix-10-0-0-0-24.json
      allocations/
        alloc-app1.json
    assets/
      servers/
        server-001.json
      networks/
        network-core.json
  relations/
    server-network/
      server-001__network-core.json
  policies/
    naming.json
    validation.json
```

## 設計指針

- `entities/`: ドメインごとの主データ。
- `relations/`: エンティティ間の関連データ。
- `policies/`: ルール・制約・命名規則。

## 運用指針

- 1 レコード 1 ファイル（差分レビューしやすくする）。
- ID はファイル名と一致させる。
- schema バージョンを明示して移行を追跡可能にする。

