import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseGitDescribe } from '../dist/index.js'

test('clean tag', () => {
  assert.equal(parseGitDescribe('v0.2.1'), '0.2.1')
})

test('ahead of tag', () => {
  assert.equal(parseGitDescribe('v0.2.1-3-gabc1234'), '0.2.1+3-abc1234')
})

test('ahead of tag + dirty', () => {
  assert.equal(parseGitDescribe('v0.2.1-3-gabc1234-dirty'), '0.2.1+3-abc1234-dirty')
})

test('no tag, bare sha', () => {
  assert.equal(parseGitDescribe('abc1234'), '0.0.0+abc1234')
})

test('no tag, dirty sha', () => {
  assert.equal(parseGitDescribe('abc1234-dirty'), '0.0.0+abc1234-dirty')
})

test('unrecognized falls through', () => {
  assert.equal(parseGitDescribe('weird-input'), 'weird-input')
})
