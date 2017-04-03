'use strict';

const process = require('process');
const request = require('request');

var parambyname = function(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

function isStringVariableSet(variable) {
  if (variable !== undefined) {
    if (variable !== null) {
      if (variable.toString().trim() !== '') {
        return true; // If its not null or empty
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}

module.exports.blockchaininforeceive = (event, context, callback) => {
  var response = {
    statusCode: 500,
    headers: {
      "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify({
      message: "No response provided"
    })
  };
  if (event.httpMethod == 'GET') {
    if (event.queryStringParameters !== undefined) {
      if (event.queryStringParameters['transaction_hash'] !== undefined && event.queryStringParameters['value'] !== undefined) {
        var transaction_hash = event.queryStringParameters['transaction_hash'];
        var satoshis_value = parseInt(event.queryStringParameters['value']);
        var btc_value = satoshis_value / 100000000;
        if (event.queryStringParameters['secret'] !== undefined) {
          if (event.queryStringParameters['secret'] == process.env.CALLBACKSECRET) {
            if (event.queryStringParameters['confirmations'] !== undefined) {
              if (parseInt(event.queryStringParameters['confirmations']) >= 3) {
                console.log("Confirmed and Processed: " + btc_value.toString() + " (" + satoshis_value.toString() + " satoshis) with transaction_hash " + transaction_hash.toString());
                response.statusCode = 200;
                response.body = "**ok**";
                callback(null, response);
              } else {
                console.log("Not confirmed / Processed: " + btc_value.toString() + " (" + satoshis_value.toString() + " satoshis) with transaction_hash " + transaction_hash.toString());
                response.statusCode = 200;
                response.body = "**pending**";
                callback(null, response);
              }
            } else {
              console.log("Not confirmed / Processed: " + btc_value.toString() + " (" + satoshis_value.toString() + " satoshis) with transaction_hash " + transaction_hash.toString());
              response.statusCode = 200;
              response.body = "**pending**";
              callback(null, response);
            }
          } else {
            console.log("NOT Processed: " + btc_value.toString() + " (" + satoshis_value.toString() + " satoshis) with transaction_hash " + transaction_hash.toString());
            response.statusCode = 401;
            response.body = "**invalid secret**";
            callback(null, response);
          }
        } else {
          console.log("NOT Processed: " + btc_value.toString() + " (" + satoshis_value.toString() + " satoshis) with transaction_hash " + transaction_hash.toString());
          response.statusCode = 401;
          response.body = "**invalid secret**";
          callback(null, response);
        }
      } else {
        response.statusCode = 400;
        response.body = "**invalid parameters**";
        callback(null, response);
      }
    } else {
      response.statusCode = 400;
      response.body = "**invalid parameters**";
      callback(null, response);
    }
  } else if (event.httpMethod == 'POST') {
    if (isStringVariableSet(event.body)) {
      console.log(event.body);
      if (event.body.indexOf('action') >= 0) {
        var action = parambyname("action", "http://localhost/?" + event.body);
        if (action == "create") {
          var invoice_id = "";
          if (event.body.indexOf('invoice_id') >= 0) {
            invoice_id = parambyname("invoice_id", "http://localhost/?" + event.body);
          }
          var callback_url = "https://du73d02moi.execute-api.us-east-1.amazonaws.com/dev/receive-coins?secret=" + process.env.CALLBACKSECRET;
          if (isStringVariableSet(invoice_id)) callback_url = callback_url + "&invoice_id=" + invoice_id;

          var query_string = "callback=" + encodeURIComponent(callback_url) + "&xpub=" + process.env.XPUBKEY + "&key=" + process.env.BLOCKCHAINAPIKEY;
          request({method: "GET", uri: "https://api.blockchain.info/v2/receive?" + query_string}, function(err, res, body) {
            if (!err) {
              var result;
              try {
                result = JSON.parse(body);
              } catch (e) {
                result = {};
              }
              if (isStringVariableSet(result.address)) {
                response.statusCode = 200;
                response.body = JSON.stringify(result);
                callback(null, response);
              } else {
                response.statusCode = 500;
                response.body = "Can't Generate Address";
                callback(null, response);
              }
            }
           });
        } else {
          response.statusCode = 400;
          response.body = "**invalid action**";
          callback(null, response);
        }
      } else {
        response.statusCode = 400;
        response.body = "**invalid parameters**";
        callback(null, response);
      }
    } else {
      response.statusCode = 400;
      response.body = "**invalid parameters**";
      callback(null, response);
    }
  } else {
    response.statusCode = 400;
    response.body = "**invalid parameters**";
    callback(null, response);
  }
}
