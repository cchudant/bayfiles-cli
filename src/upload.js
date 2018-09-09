const fs = require('fs')
const util = require('util')
const fetch = require('node-fetch')
const FormData = require('form-data')

const exists = util.promisify(fs.exists)
const stat = util.promisify(fs.stat)

const apiUrls = {
  bayfiles: 'https://bayfiles.com/api/upload',
  anonfile: 'https://anonfile.com/api/upload',
  megaupload: 'https://megaupload.nz/api/upload'
}

async function upload(api, file) {
  let opened
  try {
    if (!api || !api.match(/^https?:\/\//)) {
      if (!apiUrls[api]) throw new Error('Api url is not valid.')

      api = apiUrls[api]
    }

    if (!file || typeof file === 'string') {
      if (!(await exists(file)) || !(await stat(file)).isFile())
        throw new Error('File does not exist or is not a file.')

      file = fs.createReadStream(file)
      opened = true
    }

    const form = new FormData()
    form.append('file', file)

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
