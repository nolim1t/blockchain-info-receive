# Blockchain Info Receive Hook

## Synopsis

This is an AWS Lambda receive hook for blockchain.info's receive API.

There is two parts to it:

* Set up and Derive the receiving address (POST API) from your XPUB (You need to change "callback_url" to your AWS Lambda address)
* Receive the callback when payment is made

## Prerequisites

* You need a blockchain info API key

## Setup

* Copy serverless.yml.dist to serverless.yml
* Edit variables in serverless.yml
* do a sls deploy
* Change "callback_url" in handler.js (yeah yeah I'll change that to an environment variable)
* do another deploy
* You're all set and can generate bitcoin invoices
