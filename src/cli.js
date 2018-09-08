#!/usr/bin/env node
const upload = require('./upload')
const { join } = require('path')

require('yargs').command(
  '$0 <files...>',
  'upload one or multiple files',
  yargs => {
    yargs
      .positional('file', {
        describe: 'the file to upload',
        type: 'string'
      })
      .option('site', {
        alias: 's',
        describe: 'site to upload',
        choices: ['bayfiles', 'anonfile', 'megaupload'],
        default: 'bayfiles'
      })
  },
  async ({ site, files }) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      try {
        const result = await upload(site, join(process.cwd(), file))
        console.log(`${result.url.full}`)
      } catch (e) {
        console.error(`${e.message}`)
      }
    }
  }
).argv
