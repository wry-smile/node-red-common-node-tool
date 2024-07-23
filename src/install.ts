import { createWriteStream, existsSync, mkdirSync, readFileSync, renameSync, rmSync, unlinkSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { get } from 'node:https'
import { execSync } from 'node:child_process'
import { error, log } from 'node:console'
import process from 'node:process'
import { extract } from 'tar'
import ora, { } from 'ora'
import type { InstallNodesItemType } from './nodes.ts'
import { installNodes } from './nodes.ts'
import { OUT_PUT_DIR_PATH } from './enum.ts'

const TaoBaoRegistry = 'https://registry.npmmirror.com'
export const RawOrigin = 'https://registry.npmjs.org'

function createInstallHref(node: InstallNodesItemType) {
  const { packageName, version } = node
  return `${RawOrigin}/${packageName}/-/${packageName}-${version}.tgz`
}

function loadJson(filePath: string) {
  try {
    const absolutePath = resolve(filePath)
    const jsonData = readFileSync(absolutePath, 'utf-8')
    return JSON.parse(jsonData)
  }
  catch (err) {
    console.error('Failed to load JSON:', err)
    return null
  }
}

function setup() {
  if (!existsSync(OUT_PUT_DIR_PATH)) {
    mkdirSync(OUT_PUT_DIR_PATH)
  }
}

async function filterNeedInstallNodes() {
  const nodes: InstallNodesItemType[] = []

  for (const node of installNodes) {
    const { packageName, version } = node
    if (existsSync(join(OUT_PUT_DIR_PATH, packageName))) {
      const nodePackageJsonFile = join(OUT_PUT_DIR_PATH, packageName, 'package.json')
      if (!existsSync(nodePackageJsonFile)) {
        rmSync(join(OUT_PUT_DIR_PATH, packageName), { recursive: true, force: true })
        nodes.push(node)
        continue
      }

      const packageFile = loadJson(nodePackageJsonFile)
      if (packageFile?.version !== version) {
        nodes.push(node)
        rmSync(join(OUT_PUT_DIR_PATH, packageName), { recursive: true, force: true })
        continue
      }
      else {
        continue
      }
    }

    nodes.push(node)
  }

  return nodes
}

async function installItem(node: InstallNodesItemType): Promise<boolean> {
  const { packageName } = node
  const installHref = createInstallHref(node)

  const packageZipName = `${packageName}.tgz`
  const filePath = join(OUT_PUT_DIR_PATH, packageZipName)
  const spinner = ora(`Loadding install ${packageName}.`).start()
  return new Promise((resolve, reject) => {
    get(installHref, (response) => {
      const file = createWriteStream(filePath)
      response.pipe(file)

      file.on('finish', async () => {
        file.close()
        spinner.text = `Loadding decompression ${packageName}.`
        await extract({
          file: join(OUT_PUT_DIR_PATH, packageZipName),
          C: join(OUT_PUT_DIR_PATH),
        })

        renameSync(join(OUT_PUT_DIR_PATH, 'package'), join(OUT_PUT_DIR_PATH, packageName))
        unlinkSync(filePath)
        spinner.succeed()
        resolve(true)
      })
    }).on('error', (err) => {
      if (existsSync(filePath))
        unlinkSync(filePath)
      spinner.fail(`${packageName} Error downloadding: ${err.message}`)
      reject(err)
    })
  })
}

async function installFromNpm(nodes: InstallNodesItemType[]) {
  for (const node of nodes) {
    await installItem(node)
  }
}

async function runner(cmd: string, workingDir: string, prompt: string) {
  const spinner = ora().start(prompt)
  try {
    execSync(cmd, { cwd: workingDir })
    spinner.succeed(prompt)
  }
  catch (err) {
    spinner.fail(prompt)
    log('')
    error((err as string).toString())
    log('')
    log('Aborting')
    process.exit(1)
  }
}

async function installItemNodeNodeModules(node: InstallNodesItemType) {
  const { packageName } = node
  rmSync(join(OUT_PUT_DIR_PATH, packageName, 'node_modules'), { recursive: true, force: true })
  await runner(
    `npm install --omit=dev --registry=${TaoBaoRegistry}`,
    resolve(OUT_PUT_DIR_PATH, packageName),
    `Install ${packageName} node_modules.`,
  )
}

async function installNodesNodeModules(nodes: InstallNodesItemType[]) {
  for (const node of nodes) {
    await installItemNodeNodeModules(node)
  }
}

async function install() {
  setup()
  const nodes = await filterNeedInstallNodes()
  await installFromNpm(nodes)
  await installNodesNodeModules(nodes)
}

export { install }
