#!/usr/bin/env node
const upload = require('./upload')
const { join } = require('path')
const { red, green, yellow } = require('colors')
const fs = require('fs')

require('yargs').command(
  '$0 <files...>',
  'upload one or multiple files',
  yargs => {
    yargs
      .positional('file', {
        describe: 'The file to upload',
        type: 'string'
      })
      .option('site', {
        alias: 's',
        describe: 'Site to upload',
        choices: ['bayfiles', 'anonfile', 'megaupload'],
        default: 'bayfiles'
      })
      .option('quiet', {
        alias: 'q',
        describe: 'If set, log messages won\'t appear',
        type: 'boolean'
      })
      .option('write-to-file', {
        alias: 'w',
        describe: 'Append the urls to a file'
      })
  },
  async ({ site, files, quiet, w: writeTo }) => {
    writeTo = writeTo && fs.createWriteStream(join(process.cwd(), writeTo), { flags: 'a' })

    for (const file of files) {
      try {
        if (!quiet) console.log(yellow(`Uploading ${file}...`))
        const result = await upload(site, join(process.cwd(), file))
        if (!quiet) {
          console.log(green(`File uploaded successfully: ${result.url.full}`))
        } else {
          console.log(result.url.full)
        }

        writeTo && writeTo.write(result.url.full + "\n")
      } catch (e) {
        console.error(red(`An error occurred when uploading the file: ${e.message}`))
      }
    }

    writeTo && writeTo.close()
  }
).argv
