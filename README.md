# Ledra

Ledra は **Git-native registry engine** です。レジストリのデータは Git リポジトリで管理され、`validate / search / browse / serve` のワークフローを前提に運用します。

## 重要な前提

- **Git が唯一の正本**: すべてのレコード変更は Git commit / history に集約します。
- **Self-host OSS**: SaaS 前提ではなく、任意の環境で自己ホストできる OSS として設計します。
- **IPAM は一例**: IPAM は代表的なユースケースの 1 つであり、同じモデルで他ドメインにも適用可能です。
- **Static-first 配信**: まず静的成果物として配信し、必要時のみ API を追加します。

## ドキュメント

- [Self-host クイックスタート](docs/self-host-quickstart.md)
- [CLI 利用例](docs/cli-examples.md)
- [データリポジトリ推奨構成](docs/data-repository-structure.md)
- [Read-only 原則と static-first 配信モデル](docs/read-only-and-delivery-model.md)
- [再現可能なデプロイ手順（Cloudflare / Docker）](docs/deployment-reproducible.md)
