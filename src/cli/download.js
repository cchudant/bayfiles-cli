#!/usr/bin/env node
const { infos, upload, download, BayfilesError } = require('..')
const { join } = require('path')
const { red, green, yellow } = require('colors')
const fs = require('fs')
const util = require('util')

const fsReadFile = util.promisify(fs.readFile)

require('yargs')
.command(
  '$0 <urls...>',
  'Download one or more files',
  yargs => yargs
    .positional('urls', {
      describe: 'The uploaded files to download or a file name where to find ',
      type: 'string'
    })
    .option('quiet', {
      alias: 'q',
      describe: "If set, log messages won't be shown",
      type: 'boolean'
    })
    .option('retry', {
      alias: 't',
      describe: 'Retry if an http error occurs',
      type: 'boolean'
    })
    .option('output', {
      alias: 'o',
      describe: 'Where to put the downloaded files'
    }),
  async ({ urls, quiet, retry, output }) => {
    if (urls.length === 1 && !urls[0].match(/^https?:\/\//))
      urls = (await fsReadFile(join(process.cwd(), urls[0])))
          .toString()
          .split('\n')

    output = output || process.cwd()

    !quiet && console.warn(yellow('Warning: the files will be overwritten'))

    while (urls.length) {
      const url = urls.shift()

      try {
        !quiet && console.log(yellow(`Getting infos for ${url}...`))

        const {
          metadata: {
            name,
            size: { readable: sz }
          }
        } = await infos(url)

        !quiet &&
          console.log(yellow(`Downloading ${url} as ${name} (${sz})...`))
        await download(url, join(output, name))
        !quiet && console.log(green(`File downloaded successfully: ${name}`))
      } catch (e) {
        if (e instanceof BayfilesError)
          console.error(
            red(
              `Website returned error for file ${url}: ${
                e.message
              } (error type ${e.type}, code ${e.code})`
            )
          )
        else
          console.error(
            red(`An error occurred when uploading ${url}: ${e.message}`)
          )

        if (retry) {
          console.log(yellow('Retrying...'))
          urls.unshift(url)
        }
      }
    }
  }
).argv
