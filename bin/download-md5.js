#!/usr/bin/env node

var download = require('../index')

var from_url = process.argv[2]
var to_file = process.argv[3]
var md5 = process.argv[4]

if (!from_url || !to_file) {
  console.log('Usage: download-md5 <from_url> <to_file> [md5]')
  return
}

download(from_url, to_file, { md5: md5 }, function(err) {
  if (err) {
    console.error('Error downloading: %s  (%s)', from_url, err)
    process.exit(1)
  }
})
