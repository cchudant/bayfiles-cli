const fs = require('fs')
const util = require('util')
const fetch = require('node-fetch')
const FormData = require('form-data')
const { JSDOM } = require('jsdom')

const exists = util.promisify(fs.exists)
const stat = util.promisify(fs.stat)

/**
 * An object that maps website names to api urls.
 */
const apiUrls = {
  bayfiles: 'https://bayfiles.com/api/upload',
  anonfile: 'https://anonfile.com/api/upload',
  megaupload: 'https://megaupload.nz/api/upload',
  forumfiles: 'https://forumfiles.com/api/upload'
}

/**
 * Upload a file. The file is opened if argument `file` is a string.
 * @param {string} api the api url
 * @param {(ReadStream|string)} file the file to send, may be a string (file name) or a read stream
 * @param {?number} fileLength the file length, useless when the file isn't opened yet
 * @returns {Promise<BayfilesFile>} the upload infos
 * @throws {(BayfileError|Error)}
 */
async function upload(api, file, fileLength) {
  let opened
  try {
    if (!api || !api.match(/^https?:\/\//)) {
      if (!apiUrls[api]) throw new Error('api url is not valid.')

      api = apiUrls[api]
    }

    if (!file || typeof file === 'string') {
      const fstat = (await exists(file)) && (await stat(file))
      if (!fstat.isFile())
        throw new Error('file does not exist or is not a file.')

      file = fs.createReadStream(file)
      fileLength = fileLength || fstat.size
      opened = true
    }

    if (!fileLength) throw new Error('file is empty.')

    const form = new FormData()
    form.append('file', file, { knownLength: fileLength })

    let res = await fetch(api, {
      method: 'POST',
      body: form
    })

    if (!res.ok && res.status !== 400)
      throw new Error(
        `upload not ok: status ${res.status}, content: ${await res.text()}.`
      )

    const { status, error, data } = await res.json()
    if (!status) throw new BayfilesError(error.message, error.type, error.code)

    return data.file
  } finally {
    opened && file.close()
  }
}

/**
 * Download a file. The file is opened if argument `file` is a string.
 * @param {string} url the file url
 * @param {(ReadStream|string)} file the file to download, may be a string (file name) or a write stream
 * @returns {Promise<void>}
 * @throws {Error}
 */
async function download(url, file) {
  let open
  try {
    if (!file || typeof file === 'string') {
      file = fs.createWriteStream(file)
      open = true
    }

    const res = await fetch(url)

    if (!res.ok && res.status !== 400)
      throw new Error(`download not ok: status ${res.status}.`)

    const text = await res.text()

    const dom = new JSDOM(text)
    const aElem = dom.window.document.querySelector('#download-url')
    const dlUrl = aElem && aElem.href
    if (!dlUrl) throw new Error('download url could not be resolved.')

    const { body } = await fetch(dlUrl)

    body.pipe(file)
    await new Promise(res => file.once('finish', res))
  } finally {
    open && file.close()
  }
}

/**
 * Get file infos.
 * @param {string} url the file url
 * @returns {Promise<BayfilesFile>} the file infos
 * @throws {(BayfileError|Error)}
 */
async function infos(url) {
  const regres = /^(https?:\/\/[^/]+)\/([^/]+)/.exec(url)
  if (!regres) throw new Error(`cannot find API url for "${url}".`)

  const [, website, id] = regres

  let res = await fetch(`${website}/api/v2/file/${id}/info`)

  if (!res.ok && res.status !== 400)
    throw new Error(
      `infos request not ok: status ${
        res.status
      }, content: ${await res.text()}.`
    )

  const { status, error, data } = await res.json()
  if (!status) throw new BayfilesError(error.message, error.type, error.code)

  return data.file
}

/**
 * @typedef {object} BayfilesFile
 * @property {BayfilesFileUrl} url
 * @property {BayfilesFileMetadata} metadata
 */
/**
 * @typedef {object} BayfilesFileUrl
 * @property {string} full
 * @property {string} short
 */
/**
 * @typedef {object} BayfilesFileMetadata
 * @property {string} id
 * @property {string} name
 * @property {{ bytes: number, readable: string }} size
 * @property {?string} uploaded only present when returned by {@link infos}
 */

/**
 * Thrown by {@link upload} when the website returns an error.
 */
class BayfilesError extends Error {
  /**
   * @param {string} message the error message
   * @param {string} type the error type
   * @param {number} code the error code
   */
  constructor(message, type, code) {
    super(message)
    this.message = message
    this.type = type
    this.code = code
  }
}

module.exports.apiUrls = apiUrls
module.exports.infos = infos
module.exports.upload = upload
module.exports.download = download
module.exports.BayfilesError = BayfilesError
