# bayfiles-cli
A cli for [bayfiles.com](https://bayfiles.com/), [anonfile.com](https://anonfile.com/) and [megaupload.nz](https://megaupload.nz/) file uploading.

# Installation
`npm i -g bayfiles-cli`

# Usage
```
$ bayfiles
bayfiles <files...>

Upload one or multiple files

Positionals:
  files  The files to upload                                            [string]

Options:
  --help               Show help                                       [boolean]
  --version            Show version number                             [boolean]
  --site, -s           Site to upload
           [choices: "bayfiles", "anonfile", "megaupload"] [default: "bayfiles"]
  --quiet, -q          If set, log messages won't appear               [boolean]
  --write-to-file, -w  Append the urls to a file
  --delete-file        Delete the file after upload                    [boolean]
  --retry, -t          Retry if an http error occurs                   [boolean]
  --recursive, -r      Step in directories                             [boolean]

Not enough non-option arguments: got 0, need at least 1
```
