# bayfiles-cli
A cli for [bayfiles.com](https://bayfiles.com/), [anonfile.com](https://anonfile.com/), [megaupload.nz](https://megaupload.nz/) and [forumfiles.com](https://forumfiles.com/api/upload) file uploading and downloading.

# Installation
`npm i -g bayfiles-cli`

# Usage (upload)
```
$ bayfilesupload
bayfilesupload <files...>

Upload one or multiple files

Positionals:
  files  The files to upload                                            [string]

Options:
  --help               Show help                                       [boolean]
  --version            Show version number                             [boolean]
  --site, -s           Website to upload
         [choices: "bayfiles", "anonfile", "megaupload", "forumfiles"] [default:
                                                                     "bayfiles"]
  --quiet, -q          If set, log messages won't be shown             [boolean]
  --write-to-file, -w  Append the urls to a file
  --delete-files       Delete files after upload                       [boolean]
  --retry, -t          Retry if an http error occurs                   [boolean]
  --recursive, -r      Step in directories                             [boolean]

Not enough non-option arguments: got 0, need at least 1
```

# Usage (download)
```
$ bayfilesdownload
bayfilesdownload <urls...>

Download one or multiple files

Positionals:
  urls  The uploaded files to download                                  [string]

Options:
  --help                Show help                                      [boolean]
  --version             Show version number                            [boolean]
  --quiet, -q           If set, log messages won't be shown            [boolean]
  --read-from-file, -r  Read the urls from a file
  --retry, -t           Retry if an http error occurs                  [boolean]
  --output, -o          Where to put the downloaded files

Not enough non-option arguments: got 0, need at least 1
```
