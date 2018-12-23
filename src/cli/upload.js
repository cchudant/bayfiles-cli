#!/usr/bin/env node
const { apiUrls, upload, BayfilesError } = require('..')
const { join } = require('path')
const { red, green, yellow } = require('colors')
const fs = require('fs')
const util = require('util')

const websites = Object.keys(apiUrls)

const fsRemove = util.promisify(fs.unlink)
const fsStat = util.promisify(fs.stat)
const fsReaddir = util.promisify(fs.readdir)

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
        describe: 'Website to upload',
        choices: websites,
        default: websites[0]
      })
      .option('quiet', {
        alias: 'q',
        describe: "If set, log messages won't be shown",
        type: 'boolean'
      })
      .option('write-to-file', {
        alias: 'w',
        describe: 'Append the urls to a file'
      })
      .option('delete-files', {
        describe: 'Delete files after upload',
        type: 'boolean'
      })
      .option('retry', {
        alias: 't',
        describe: 'Retry if an http error occurs',
        type: 'boolean'
      })
      .option('recursive', {
        alias: 'r',
        describe: 'Step in directories',
        type: 'boolean'
      })
  },
  async ({
    site,
    files,
    quiet,
    w: writeTo,
    'delete-files': deleteFiles,
    recursive,
    retry
  }) => {
    writeTo =
      writeTo &&
      fs.createWriteStream(join(process.cwd(), writeTo), { flags: 'a' })

    !quiet &&
      deleteFiles &&
      console.warn(yellow('Warning: the files will be deleted once uploaded'))

    while (files.length) {
      const file = files.shift()

      // Step in directories
      if ((await fsStat(file)).isDirectory()) {
        if (!recursive) console.error(red(`File ${file} is a directory`))
        else files.push(...(await fsReaddir(file)).map(f => join(file, f)))

        continue
      }

      try {
        !quiet && console.log(yellow(`Uploading ${file}...`))

        const result = await upload(site, join(process.cwd(), file))
        if (!quiet)
          console.log(green(`File uploaded successfully: ${result.url.full}`))
        else console.log(result.url.full)

        writeTo && writeTo.write(result.url.full + '\n')

        if (deleteFiles) await fsRemove(join(process.cwd(), file))
      } catch (e) {
        if (e instanceof BayfileError)
          console.error(
            red(
              `Website returned error for file ${file}: ${
                e.message
              } (error type ${e.type}, code ${e.code})`
            )
          )
        else
          console.error(
            red(`An error occurred when uploading ${file}: ${e.message}`)
          )

        if (retry) {
          !quiet && console.log(yellow('Retrying...'))
          files.unshift(file)
        }
      }
    }

    writeTo && writeTo.close()
  }
).argv

process.on('unhandledRejection', console.error)
