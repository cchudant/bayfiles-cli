# bayfiles-cli
A cli for [bayfiles.com](https://bayfiles.com/), [anonfile.com](https://anonfile.com/) and [megaupload.nz](https://megaupload.nz/) file uploading.

# Installation
`npm i -g bayfiles-cli`

# Usage
```
$ bayfiles
bayfiles <files...>

upload one or multiple files

Positionals:
  file  the file to upload                                              [string]

Options:
  --help       Show help                                               [boolean]
  --version    Show version number                                     [boolean]
  --site, -s   site to upload
           [choices: "bayfiles", "anonfile", "megaupload"] [default: "bayfiles"]
  --quiet, -q  If this option is set to false, log messages won't appear
                                                                [default: false]

Not enough non-option arguments: got 0, need at least 1
```
