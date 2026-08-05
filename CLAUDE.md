<!-- このファイルはプロジェクト固有ルールのみを書く。個人/グローバル AI ルール
（言語・確認スタイル・出力フォーマット等）は各 AI ツールのグローバル設定へ。
fresh public clone でも有効な内容に保つこと。 -->

# vite-plugin-git-version 開発ガイド

## プロジェクト概要

`git describe --tags --match "v*"` の結果をアプリのバージョンとして解決し、Vite の
ビルドへ `__APP_VERSION__` として注入する Vite プラグイン。npm では
`@ishizakahiroshi/vite-plugin-git-version` として公開している。

**manabi-map から切り出したもの。** 発端は「`v0.2.0` のタグを push したのに、アプリ内の
バージョン表示が `v0.1.5` のまま残っていた」というリリース事故。原因は、表示用の
バージョン文字列がタグとは別の場所に手で書かれていて、更新を忘れても誰も気づけない
構造だったこと。したがってこのプラグインの存在意義は**「タグを唯一の真実にする」**の
一点にある。

タグより先に進んでいるコミットでは `+N-sha` を自動で付ける。git が使えない環境
（tarball 展開・CI の shallow clone 等）では `package.json` の `version` にフォールバック
する。

## やらないこと（スコープ外）

- **git 以外のバージョンソース対応**（環境変数・独自ファイル等）。「タグが唯一の真実」
  という前提が崩れると、切り出した意味そのものが無くなる
- Vite 以外のバンドラ対応（webpack / rollup 単体 / esbuild）
- バージョン文字列の書式カスタマイズ機能。`+N-sha` の付け方を設定可能にすると、
  利用側ごとに解釈が割れて事故の温床になる
- タグの自動生成・自動 push。読むだけで、書かない

## 技術スタック

| レイヤ | 採用 |
|---|---|
| 言語 | TypeScript（`src/index.ts` の 1 ファイル） |
| ビルド | `tsc -p tsconfig.build.json` → `dist/` |
| テスト | `node --test tests/*.test.mjs`（Node 標準テストランナー・追加依存なし） |
| パッケージ管理 | pnpm |
| 対象 | Node >= 20 / Vite >= 5（peerDependency） |
| 配布 | npm（scoped・public） |
| ライセンス | MIT |

## ディレクトリ構成

- `src/index.ts` — プラグイン本体
- `tests/parse.test.mjs` — `git describe` 出力のパースを検証する
- `dist/` — ビルド成果物（公開対象。`files` フィールドで npm に含める）
- `scripts/` — secrets-scan と hook インストーラ
- `.githooks/` — layer 2 pre-commit
- `.github/workflows/` — layer 3 CI

## 主要コマンド

- ビルド: `pnpm build`
- 型チェック: `pnpm typecheck`
- テスト: `pnpm test`
- secrets-scan 手動実行: `node scripts/secrets-scan.mjs --staged --block`

## AI 作業共通ルール

ビルド・コミット禁止、secrets-scan 責務、plan/bugfix/pending md の作成ルール等の AI 作業共通ルールは、各利用者のグローバル AI 設定に従う（作者環境の例: `~/.claude/CLAUDE.md` および `~/.claude/guides/`）。

このリポジトリ固有:

- **`git describe` の出力パースを壊さない。** テストは実際の出力形式
  （`v1.2.3` / `v1.2.3-4-gabc1234`）を前提にしている。書式を変える変更は必ず
  `tests/parse.test.mjs` を先に更新してから入れる
- **git が使えない場合のフォールバックを外さない。** npm tarball から展開された
  利用者環境には `.git` が無い。ここが落ちると利用側のビルドごと止まる
- 依存を増やさない。テストは Node 標準ランナーで足りている

## secrets-scan（このリポジトリの配線）

書く瞬間の責務（固有名詞の一般化・fixture は合成データ等）は上記「AI 作業共通ルール」の参照先に従う。このリポジトリ固有の配線は以下:

- scanner: `scripts/secrets-scan.mjs`（手動実行: `node scripts/secrets-scan.mjs --staged --block`）
- layer 2: `.githooks/pre-commit`（`core.hooksPath = .githooks` で有効化済み。第三者 clone 時は `bash scripts/install-hooks.sh` または `pwsh scripts/install-hooks.ps1`）
- layer 3: `.github/workflows/secrets-scan.yml`
- env（full coverage に必要・未設定なら構造 regex のみで継続）: `KB_ROOT` / `FAMILY_ROOT`

**pnpm 系だが husky ではなく `.githooks` を使っている**（2026-08-05 の配線判断）。
理由は、この作業機に `node_modules` が無く、husky を入れても `pnpm install` するまで
フックが無効のままになるため。`.githooks` なら `core.hooksPath` の設定だけで即座に
効く。後から husky を導入する場合は `core.hooksPath` を奪い合うので、**両方を配置
しないこと**。

## 関連ドキュメント

| 項目 | パス |
|---|---|
| ユーザー向け README | `README.md` |
| 変更履歴 | `CHANGELOG.md` |
| Codex/他 AI 用入口 | `AGENTS.md` |
| 切り出し元（事故の当事者） | https://github.com/ishizakahiroshi/manabi-map |
