'use strict';

// [START all]
// [START setup]
// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication
var Storage = require('@google-cloud/storage');

// Instantiate a storage client
var storage = Storage();
// [END setup]
var path = require('path');

/**
 * Upload a file to a bucket.
 *
 * @param {object} options Configuration options.
 * @param {string} options.bucket The name of the bucket.
 * @param {string} options.srcFile The name of the file.
 * @param {function} cb The callback function.
 */
function uploadFile (options, callback) {
  var bucket = storage.bucket(options.bucket);

  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/storage/latest/storage/bucket
  bucket.upload(options.srcFile, function (err, file) {
    if (err) {
      return callback(err);
    }

    console.log('Uploaded gs://%s/%s', options.bucket, options.srcFile);
    return callback(null, file);
  });
}

uploadFile({
 bucket: 'vishal-audio-files',
 srcFile: path.join(__dirname, 'test.txt')
}, () => {});
