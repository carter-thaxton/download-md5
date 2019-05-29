
var request = require('request')
var through = require('through')
var mkdirp = require('mkdirp')
var crypto = require('crypto')
var path = require('path')
var fs = require('fs')

function downloadFile(from_url, to_filename, args, cb) {
  // args is optional, and is passed along to request
  if (typeof(args) === 'function') {
    cb = args
    args = {}
  }
  var finalize = (typeof(args.finalize) === 'undefined') ? true : args.finalize  // default to true
  var expect_md5 = args.md5 || null  // default to null

  var temp_filename = to_filename + '.download'
  var temp_file = null
  var dir = path.dirname(temp_filename)

  function done(err) {
    if (temp_file) {
      temp_file.end()
      temp_file = null
    }

    if (err) {
      deleteFile(temp_filename, function(unlink_err) {
        if (unlink_err) {
          unlink_err.cause = err
          err = unlink_err
        }
        cb(err)
      })
    } else {
      cb()
    }
  }

  mkdirp(dir, function(err) {
    if (err) return done(err)
    var opts = Object.assign({ url: from_url }, args)  // pass all args to request
    var req = request(opts)
    .once('error', done)
    .once('response', function(response) {
      if (response.statusCode === 200) {
        temp_file = fs.createWriteStream(temp_filename)
        var calc_md5 = crypto.createHash('md5', { encoding: 'hex' })

        req.pipe(through(function(data) {
          calc_md5.write(data)
          temp_file.write(data)
        },
        function() {
          temp_file.once('close', function() {
            temp_file = null
            calc_md5.end()
            var actual_md5 = calc_md5.read()
            if (expect_md5 && expect_md5 !== actual_md5) {
              return done(new Error('Mismatched MD5 - Expected: ' + expect_md5 + ' Got: ' + actual_md5))
            } else if (finalize)
              finalizeDownload(to_filename, done)
            else {
              return done()
            }
          })
          temp_file.end()
        })).once('error', done)
      } else {
        return done(new Error('Unexpected status code in response: ' + response.statusCode + ' from: ' + from_url))
      }
    })
  })
}

function finalizeDownload(to_filename, cb) {
  var temp_filename = to_filename + '.download'
  fs.rename(temp_filename, to_filename, function(err) {
    if (err) {
      fs.exists(to_filename, function(exists) {
        if (exists && err.code === 'ENOENT')
          cb()
        else
          cb(err)
      })
    } else {
      cb()
    }
  })
}

function deleteFile(file, cb) {
  fs.unlink(file, function(err) {
    if (err && err.code !== 'ENOENT') {
      return cb(err)
    }
    cb()
  })
}

downloadFile.downloadFile = downloadFile
downloadFile.finalizeDownload = finalizeDownload
downloadFile.deleteFile = deleteFile

module.exports = downloadFile
