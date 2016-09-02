// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START app]
// [START import_libraries]
var google = require('googleapis');
var async = require('async');
var fs = require('fs');
var categoryMap = require('./categoryMap').categoryMap;
console.log(categoryMap, "categoryMap")

// Get a reference to the speech service
var speech = google.speech('v1beta1').speech;
// [END import_libraries]

// [START authenticating]
function getAuthClient (callback) {
  // Acquire credentials
  google.auth.getApplicationDefault(function (err, authClient) {
    if (err) {
      return callback(err);
    }

    // The createScopedRequired method returns true when running on GAE or a
    // local developer machine. In that case, the desired scopes must be passed
    // in manually. When the code is  running in GCE or a Managed VM, the scopes
    // are pulled from the GCE metadata server.
    // See https://cloud.google.com/compute/docs/authentication for more
    // information.
    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      // Scopes can be specified either as an array or as a single,
      // space-delimited string.
      authClient = authClient.createScoped([
        'https://www.googleapis.com/auth/cloud-platform'
      ]);
    }

    return callback(null, authClient);
  });
}
// [END authenticating]

// [START construct_request]
function prepareRequest (inputFile, callback) {
  //fs.readFile(inputFile, function (err, audioFile) {
    // if (err) {
    //   return callback(err);
    // }
    console.log('Got audio file!');
    //var encoded = new Buffer(audioFile).toString('base64');
    var payload = {
      config: {
        //encoding: 'LINEAR16',
        encoding: 'FLAC',
        sampleRate: 16000,
        language_code: "hi-IN"
      },
      audio: {
        //content: encoded,
        //uri:"gs://humanparse/latest_100.flac",
        uri: inputFile
      }
    };
    return callback(null, payload);
  //});
}
// [END construct_request]

function main (inputFile, callback) {
  var requestPayload;
console.log(inputFile, "inputFile")
  async.waterfall([
    function (cb) {
      prepareRequest(inputFile, cb);
    },
    function (payload, cb) {
      requestPayload = payload;
      getAuthClient(cb);
    },
    // [START send_request]
    function sendRequest (authClient, cb) {
      console.log('Analyzing speech...');
      speech.syncrecognize({
        auth: authClient,
        resource: requestPayload
      }, function (err, result) {
        if (err) {
          return cb(err);
        }
        console.log('result:', JSON.stringify(result, null, 2));
        // var tr = result.results[0].alternatives[0].transcript;
        // for(var i=0, length=tr.length;i<length; i++){
        //   console.log(tr.charCodeAt(i));
        // }
        cb(null, result);
      });
    }
    // [END send_request]
  ], callback);
}

// [START run_application]
if (module === require.main) {
    console.log(process.argv)
  if (process.argv.length < 3) {
    console.log('Usage: node recognize <inputFile>');
    process.exit();
  }
  var inputFile = process.argv[2];
  //main(inputFile, console.log);
  main(inputFile, substrMatch)
}
// [END run_application]
// [END app]

function substrMatch(error, result) {
    console.log("___________________________")
    console.log(error)
    console.log(result)
    
    var transcript = result.results[0].alternatives[0].transcript;
    
    // var sampleArray = ["हेलो", "हाउ", "आर", "यू"];
    // for (var i = 0, length = sampleArray.length; i < length; i++) {
    //     if (transcript.indexOf(sampleArray[i]) > -1) {
    //         console.log("contains", sampleArray[i])
    //     }
    // }
    var categories = Object.keys(categoryMap),
        matches = [];
    for(var i=0, length=categories.length; i<length; i++){
        if(checkCategory(transcript, categoryMap[categories[i]])){
            matches.push(categories[i]);
            continue;
        }
    }
    console.log(matches, matches)
}

function checkCategory(sample, keywordArray) {
    for(var i=0, length=keywordArray.length;i<length;i++){
        if(sample.indexOf(keywordArray[i])>-1){
            return true;
        }
    }
    return false;
}



exports.main = main;
