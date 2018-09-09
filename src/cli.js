#!/usr/bin/env node
const upload = require('./upload')
const { join } = require('path')
const { red, green, yellow } = require('colors')
const fs = require('fs')
const util = require('util')

const fsRemove = util.promisify(fs.unlink)

require('yargs').command(
  '$0 <files...>',
  'Upload one or multiple files',
  yargs => {
    yargs
      .positional('files', {
        describe: 'The files to upload',
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
      .option('delete-file', {
        describe: 'Delete the file after upload',
        type: 'boolean'
      })
  },
  async ({ site, files, quiet, w: writeTo, 'delete-file': deleteFile }) => {
    writeTo = writeTo && fs.createWriteStream(join(process.cwd(), writeTo), { flags: 'a' })

    !quiet && deleteFile && console.log(yellow('Warning: the files will be deleted once uploaded'))

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

        if (deleteFile)
          await fsRemove(join(process.cwd(), file))

      } catch (e) {
        console.error(red(`An error occurred when uploading the file: ${e.message}`))
      }
    }

    writeTo && writeTo.close()
  }
).argv
