---
cover:
  path: portfolio/overview-2026-09-28.jpg
  alt: {ja: "vite-plugin-git-version の紹介動画", en: "vite-plugin-git-version overview video"}
video:
  provider: youtube
  id: "PPrOPysHhxg"
  durationSeconds: 20
schemaVersion: 1
color: "#7160b9"
initials: "gv"
cat: {"ja":"Vite プラグイン","en":"Vite plugin"}
tagline: {"ja":"アプリの版番号を、Git タグから。","en":"Your app version, straight from Git tags."}
short: {"ja":"Git タグから版番号を解決し、Vite のビルドへ __APP_VERSION__ として渡すプラグイン。タグ後の差分や Git がない環境にも対応。","en":"Resolves the version from Git tags and injects __APP_VERSION__ into Vite builds, including commits after a tag and a fallback when Git is unavailable."}
tech: ["JavaScript","Vite","Node.js"]
store: null
live: null
guide: null
featured: false
---
## ja

画面の版番号とリリースのタグが食い違わないよう、Git タグを版番号の起点にする Vite プラグインです。タグ後のコミットには差分数と SHA を付け、Git が利用できない場合は package.json の版番号へフォールバックします。

## en

A Vite plugin that keeps the displayed app version aligned with Git release tags. Commits after a tag include the commit count and SHA; when Git is unavailable, the version falls back to package.json.
