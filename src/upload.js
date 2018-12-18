const fs = require('fs')
const util = require('util')
const fetch = require('node-fetch')
const FormData = require('form-data')

const exists = util.promisify(fs.exists)
const stat = util.promisify(fs.stat)

/**
 * @type {{[string]: [string]}}
 */
const apiUrls = {
  bayfiles: 'https://bayfiles.com/api/upload',
  anonfile: 'https://anonfile.com/api/upload',
  megaupload: 'https://megaupload.nz/api/upload',
  forumfiles: 'https://forumfiles.com/api/upload'
}

/**
 * Upload a file. The file is opened if argument `file` is a string.
 * 
 * @param {string} api the api url 
 * @param {ReadStream | string} file the file to send, may be a string (file name) or a read stream
 * @param {?number} fileLength the file length, useless when the file isn't opened yet 
 * @returns {Promise<string>} the upload url
 */
async function upload(api, file, fileLength) {
  let opened
  try {
    if (!api || !api.match(/^https?:\/\//)) {
      if (!apiUrls[api]) throw new Error('Api url is not valid.')

      api = apiUrls[api]
    }

    if (!file || typeof file === 'string') {
      const fstat = await exists(file) && await stat(file)
      if (!fstat.isFile())
        throw new Error('File does not exist or is not a file.')

      file = fs.createReadStream(file)
      fileLength = fileLength || fstat.size
      opened = true
    }

    if (!fileLength) throw new Error('File is empty.')

    const form = new FormData()
    form.append('file', file, { knownLength: fileLength })

    let res
    try {
      res = await fetch(api, {
        method: 'POST',
        body: form
      })
    } catch (e) {
      e.httpError = true
      throw e
    }

    if (!res.ok && res.status !== 400)
      throw new Error(
        `Upload not ok: status ${res.status}, content: ${await res.text()}.`
      )

    const json = await res.json()
    if (!json.status)
      throw new BayfileError(json.error.message, json.error.type, json.error.code)

    return json.data.file
  } finally {
    opened && file.close() 
  }
}

class BayfileError extends Error {
  constructor(message, type, code) {
    super(message)

    this.message = message
    this.type = type
    this.code = code
  }
}

module.exports = upload
module.exports.apiUrls = apiUrls
module.exports.BayfileError = BayfileError
