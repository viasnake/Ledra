# Self-host クイックスタート

このガイドは、第三者がローカルで Ledra の基本運用を再現するための最短手順です。

## 1. 前提ツール

- Git
- Node.js 20+
- pnpm 9+

## 2. プロジェクトを取得

```bash
git clone <your-fork-or-mirror-url> ledra
cd ledra
pnpm install
```

## 3. データリポジトリを用意

Ledra は「Git が唯一の正本」を前提にするため、データは必ず Git 管理します。

```bash
mkdir -p registry/entities/ipam/prefixes
cat > registry/entities/ipam/prefixes/example.json <<'JSON'
{
  "id": "prefix-10-0-0-0-24",
  "cidr": "10.0.0.0/24",
  "owner": "platform-team"
}
JSON

git init
git add registry
git commit -m "chore: bootstrap registry data"
```

## 4. validate / search / browse / serve を試す

```bash
pnpm --filter @ledra/validator run validate ./registry
pnpm --filter @ledra/search run build-index ./registry
pnpm --filter @ledra/cli run browse ./registry
pnpm --filter @ledra/api run serve ./registry
```

> コマンド名・オプションは各 package の実装に合わせて調整してください。CLI の使い方は `docs/cli-examples.md` に例をまとめています。

## 5. 運用の基本

1. データを Git で更新。
2. `validate` で整合性チェック。
3. `search` / `browse` 用の成果物を更新。
4. `serve`（静的配信または API）へ反映。

