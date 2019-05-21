'use strict';

/*
 * This file is for running in-process tests and playing around with the API. For convenience it retrieves data
 * from a `.env.json` file in the same directory to populate the Zoho SDK. This file should NEVER be uploaded to github,
 * so you will need to find your own way to create and populate this file
 */
const packageJson = require('../package.json');
const path = require('path');

const configData = require('./.env.json');

const zoho = require(path.join(__dirname, '..', packageJson.main));

(async () => {
  await zoho.initialize(configData);

  const input ={};
  input.module = 'Leads';

  const params = {};
  params.page = 0;
  params.per_page = 5;
  input.params = params;

  const postResult = await zoho.API.MODULES.get(input);
  console.log(postResult.body);
})();
