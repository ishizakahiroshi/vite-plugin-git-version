import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'

export interface GitVersionOptions {
  /**
   * define キーに埋め込むグローバル名。デフォルトは `__APP_VERSION__`。
   * false を渡すと define への注入を無効化する（getVersion() だけ使いたい場合）。
   */
  defineKey?: string | false
  /**
   * git describe の --match パターン。デフォルトは "v*"。
   */
  tagPrefix?: string
  /**
   * fallback 用に読む package.json の絶対パス。省略時は `<cwd>/package.json`。
   * 見つからない/読めない場合はさらに "0.0.0" にフォールバック。
   */
  packageJsonPath?: string
  /**
   * ビルドログに `[<name>] APP_VERSION = ...` を出すか。デフォルト true。
   */
  log?: boolean
  /**
   * ログ prefix。デフォルト "vite-plugin-git-version"。
   */
  logName?: string
  /**
   * 環境変数で無条件上書きするキー名。デフォルト "VERSION_OVERRIDE"。
   * 空文字を渡すと override を無効化する。
   */
  overrideEnv?: string
}

/**
 * git describe の生出力から semver ライクな version 文字列を作る。
 *
 * 例:
 * - "v0.2.1"                      -> "0.2.1"
 * - "v0.2.1-3-gabc1234"           -> "0.2.1+3-abc1234"
 * - "v0.2.1-3-gabc1234-dirty"     -> "0.2.1+3-abc1234-dirty"
 * - "abc1234" / "abc1234-dirty"   -> "0.0.0+abc1234[-dirty]"
 * - それ以外                       -> 生値をそのまま返す
 */
export function parseGitDescribe(raw: string): string {
  const m = raw.match(/^v(\d+\.\d+\.\d+)(?:-(\d+)-g([0-9a-f]+))?(-dirty)?$/)
  if (m) {
    const [, semver, ahead, sha, dirty] = m
    if (!ahead) return `${semver}${dirty ?? ''}`
    return `${semver}+${ahead}-${sha}${dirty ?? ''}`
  }
  if (/^[0-9a-f]{7,}(-dirty)?$/.test(raw)) return `0.0.0+${raw}`
  return raw
}

/**
 * 現在の作業ディレクトリの git 状態から version を解決する。
 * プラグインを使わず、他のツール（SBOM 生成など）から直接呼びたい場合に使う。
 */
export function resolveGitVersion(options: GitVersionOptions = {}): string {
  const overrideEnv = options.overrideEnv ?? 'VERSION_OVERRIDE'
  if (overrideEnv && process.env[overrideEnv]) {
    return process.env[overrideEnv] as string
  }
  const tagPrefix = options.tagPrefix ?? 'v*'
  try {
    const raw = execSync(
      `git describe --tags --always --dirty --match "${tagPrefix}"`,
      { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' },
    ).trim()
    return parseGitDescribe(raw)
  } catch {
    const pkgPath = options.packageJsonPath ?? `${process.cwd()}/package.json`
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version?: string }
      return `${pkg.version ?? '0.0.0'}+nogit`
    } catch {
      return '0.0.0+nogit'
    }
  }
}

/**
 * Vite プラグイン: git タグから解決した version を `define` に注入する。
 *
 * ```ts
 * import { gitVersion } from '@ishizakahiroshi/vite-plugin-git-version'
 * export default defineConfig({ plugins: [gitVersion()] })
 * ```
 *
 * デフォルトで `__APP_VERSION__` に埋め込む。TypeScript を使う場合は
 * `declare const __APP_VERSION__: string` を型定義側に追加すること。
 */
export function gitVersion(options: GitVersionOptions = {}): Plugin {
  const version = resolveGitVersion(options)
  const defineKey = options.defineKey ?? '__APP_VERSION__'
  const log = options.log ?? true
  const logName = options.logName ?? 'vite-plugin-git-version'
  if (log) {
    console.log(`[${logName}] APP_VERSION = ${version}`)
  }
  return {
    name: 'vite-plugin-git-version',
    config() {
      if (defineKey === false) return
      return {
        define: {
          [defineKey]: JSON.stringify(version),
        },
      }
    },
  }
}

export default gitVersion
