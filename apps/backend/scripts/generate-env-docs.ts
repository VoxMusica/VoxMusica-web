import { writeFileSync } from 'node:fs'

import config from '#config'

type SchemaNode = {
  _cvtProperties?: Record<string, SchemaNode>
  default?: unknown
  doc?: string
  env?: string
  format?: unknown
}

const lines: string[] = [
  '# Auto-generated from the convict config schema.',
  '# Do not edit by hand — regenerate with: yarn workspace @voxmusica/backend generate-env-docs',
  '',
]

const walk = (node: SchemaNode, path: string[] = []) => {
  if (node.env) {
    let defaultValue = ''
    if (node.default !== undefined && node.default !== null) {
      if (typeof node.default === 'object') {
        defaultValue = JSON.stringify(node.default) ?? ''
      } else if (typeof node.default === 'string') {
        defaultValue = node.default
      } else if (typeof node.default === 'number' || typeof node.default === 'boolean') {
        defaultValue = node.default.toString()
      } else if (typeof node.default === 'bigint') {
        defaultValue = node.default.toString()
      }
    }

    if (node.doc) {
      lines.push(`# ${node.doc}`)
    }
    lines.push(`${node.env}=${defaultValue}`, '')
    return
  }

  if (node._cvtProperties) {
    for (const [key, child] of Object.entries(node._cvtProperties)) {
      walk(child, [...path, key])
    }
  }
}

const schema = config.getSchema() as SchemaNode
walk(schema)

writeFileSync('.env.example', lines.join('\n'))
console.log(`Wrote .env.example with documented environment variables`)
