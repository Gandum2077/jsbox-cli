import { readdirSync, createWriteStream, readFileSync, existsSync, mkdirSync, statSync } from 'fs'
import * as stream from 'stream'
import * as util from 'util'
import { join, dirname } from 'path'
import * as archiver from 'archiver'
import * as _ from 'lodash'

const pipeline = util.promisify(stream.pipeline)

export function isPackageDir (dir: string) {
  const filesSet = new Set(readdirSync(dir))
  for (const f of ['assets', 'scripts', 'strings', 'config.json', 'main.js']) {
    if (!filesSet.has(f)) {
      return false
    }
  }
  return true
}

export function getPackageName (dir: string) {
  const config = JSON.parse(readFileSync(join(dir, 'config.json')).toString())
  return _.get(config, 'info.name')
}

export async function zipFolder (dir: string, path: string): Promise<string> {
  if (!existsSync(dirname(path))) {
    mkdirp(dirname(path))
  }

  const archive = archiver('zip')
  const s = createWriteStream(path)
  const dirs = ["assets", "strings"];
  const files = ["main.js", "config.json", "README.md"];

  for (const d of dirs) {
    archive.directory(join(dir, d), d)
  }
  archive.append(null, { name: 'scripts/' });

  for (const f of files) {
    archive.file(join(dir, f), { name: f })
  }

  await archive.finalize()
  await pipeline(archive, s)
  return path
}

export function mkdirp (path: string) {
  if (existsSync(path)) {
    return
  }
  const parentDir = dirname(path)
  if (!existsSync(parentDir)) {
    mkdirp(parentDir)
  }
  mkdirSync(path)
}

export async function tryCatch<T> (promise: any): Promise<[T, Error]> {
  try {
    const ret = await promise
    return [ret, null as Error]
  } catch (e) {
    return [null as T, e]
  }
}
