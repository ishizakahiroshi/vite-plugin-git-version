# @ishizakahiroshi/vite-plugin-git-version

Resolve app version from `git describe --tags --match "v*"` and inject it into your Vite build as `__APP_VERSION__`.

Extracted from [manabi-map](https://github.com/ishizakahiroshi/manabi-map) after a release incident where a stale in-app version string (`v0.1.5`) survived a `v0.2.0` tag push. Uses the git tag as the single source of truth, with automatic `+N-sha` suffixing for commits ahead of the tag and a package.json fallback when git is unavailable.

## Install

```sh
pnpm add -D @ishizakahiroshi/vite-plugin-git-version
```

## Use

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { gitVersion } from '@ishizakahiroshi/vite-plugin-git-version'

export default defineConfig({
  plugins: [gitVersion()],
})
```

```ts
// src/vite-env.d.ts
declare const __APP_VERSION__: string
```

```tsx
// somewhere in your app
<footer>v{__APP_VERSION__}</footer>
```

## Version resolution

Given `git describe --tags --always --dirty --match "v*"`:

| git state                      | raw output                       | resolved         |
|--------------------------------|----------------------------------|------------------|
| HEAD is tagged                 | `v0.2.1`                         | `0.2.1`          |
| HEAD ahead of tag              | `v0.2.1-3-gabc1234`              | `0.2.1+3-abc1234`|
| HEAD ahead + working tree dirty| `v0.2.1-3-gabc1234-dirty`        | `0.2.1+3-abc1234-dirty` |
| No tag exists yet              | `abc1234`                        | `0.0.0+abc1234`  |
| git unavailable                | (fallback)                       | `<pkg.version>+nogit` |

Set `VERSION_OVERRIDE=1.2.3` in the environment to force an exact string (useful for emergency releases).

## Shallow clones (Cloudflare Pages / Vercel etc.)

CI providers often use shallow clones, which strip tags. Fetch them before build:

```json
// package.json
{
  "scripts": {
    "build": "pnpm fetch:tags && vite build",
    "fetch:tags": "git fetch --tags --depth=1 || true"
  }
}
```

## Options

```ts
gitVersion({
  defineKey: '__APP_VERSION__', // or false to skip define injection
  tagPrefix: 'v*',
  packageJsonPath: undefined,   // absolute path; defaults to <cwd>/package.json
  log: true,
  logName: 'vite-plugin-git-version',
  overrideEnv: 'VERSION_OVERRIDE',
})
```

You can also skip the plugin and call `resolveGitVersion()` directly (e.g. for SBOM generation):

```ts
import { resolveGitVersion } from '@ishizakahiroshi/vite-plugin-git-version'
const v = resolveGitVersion()
```

## License

MIT © Hiroshi Ishizaka (ishizakahiroshi)
