# download-md5

`download-md5` is a simple utility to download files via HTTP, and optionally check their MD5 as it goes.
It will download to a temporary file "next to" the final file, with an extension of `.download`.  Once the file is completely downloaded, with no errors, then it will move the temporary file into place.

You can also call `download-md5` from the command line, by installing it globally.

```
var download = require('download-md5')

var url = 'https://pbs.twimg.com/profile_images/616542814319415296/McCTpH_E.jpg'
download(url, 'results/grumpy_cat.jpg', { md5: null }, function(err) {
  if (err)
    console.log(err)
  else
    console.log("Done")
})
```


# Command line usage

Installation via `npm`:

     npm install download-md5 -g

## Usage:

     download-md5 <from_url> <to_file> [md5]




download(from_url, to_file, [opts])
-----------------------------------

`from_url` is the URL to download from.  It may be http or https, and may contain basic auth.

`to_file` is the output filename.  The directory will be created using `mkdirp` if it does not exist.

`opts` is optional, and can have:
  * md5 - check the MD5 against a known MD5, and only consider the download successful if it matches
  * finalize - defaults to true.  If set to false, then the output file will remain with the `.download` suffix.
    Call `download.finalizeDownload(to_file, cb)` to finish the job.


License
-------
ISC
