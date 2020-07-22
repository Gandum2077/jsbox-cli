import * as program from 'commander'
import * as net from 'net'
import * as path from 'path'
import { showHost, watch, saveHost, build, upload } from './actions'
import * as log from './log'

program
  .command('host')
  .description('Show your current host IP')
  .action(() => {
    showHost()
  })

program
  .command('set <hostIP>')
  .description('Set your host IP')
  .action((hostIP: string) => {
    if (!net.isIP(hostIP)) {
      log.error(`${hostIP} is not a valid IP`)
      process.exit(1)
    }

    saveHost(hostIP)
  })

program
  .command('watch [item]')
  .description('Watching change in a directory or file')
  .action((item: string) => {
    const pwd = process.cwd()
    if (!item) {
      item = '.'
    }
    item = path.resolve(pwd, item)

    watch(item)
  })

program
  .command('build [dir]')
  .option('-o, --output <output>', 'Specify the output directory')
  .description('Build box package')
  .action(async (dir: string, cmd) => {
    const pwd = process.cwd()
    dir = dir || '.'
    dir = path.resolve(pwd, dir)

    await build(dir, cmd.output)
  })

program
  .command('upload [dir]')
  .option('-f, --file <file>', 'Specify the file to be uploaded')
  .description('upload box package')
  .action(async (dir: string, cmd) => {
    const pwd = process.cwd()
    dir = dir || '.'
    if (cmd.file) {
      const f = path.resolve(pwd, cmd.file)
      await upload(dir, f)
    } else {
      await upload(dir)
    }
    
  })
program.parse(process.argv)
