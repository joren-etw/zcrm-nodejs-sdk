'use strict';
/*
 * This is a simple test script that checks for errors that only occur in long-running processes, like a server. This
 * process will never exit normally and must be manually closed
 */

const packageJson = require('../package.json');
const fs = require('fs');
const path = require('path');

const configData = require('./.env.json');

const zoho = require(path.join(__dirname, '..', packageJson.main));
const logLocation = process.env.ZCRM_TEST_LONG_LOG_DIR || __dirname;

/**
 * Takes a string and adds zeros to the front of it until it has the correct length
 *
 * @param {string} str The string to add zeros to
 * @param {number} numLength The number of digits that should be in the number
 *
 * @return {string} The altered string
 */
const addPrecedingZeros = (str, numLength = 2) => {
  str = str.toString();
  while (str.length < numLength) {
    str = '0' + str;
  }

  return str;
};

/**
 * Generates a timestamp in the form `[hh:mm:ss.mmmm]`
 *
 * @return {string} The timestamp
 */
const generateTimestamp = () => {
  const date = new Date();
  const hours = addPrecedingZeros(date.getUTCHours());
  const minutes = addPrecedingZeros(date.getUTCMinutes());
  const seconds = addPrecedingZeros(date.getUTCSeconds());
  const milliseconds = addPrecedingZeros(date.getUTCMilliseconds(), 3);
  return `[${hours}:${minutes}:${seconds}.${milliseconds}]`;
};

const generateDateString = () => {
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = addPrecedingZeros(date.getUTCMonth() + 1);
  const day = addPrecedingZeros(date.getUTCDate());
  return `${year}-${month}-${day}`;
};

const writeToLog = async (value) => {
  const logPath = path.join(logLocation, `${generateDateString()}-log.log`);

  value = `${generateTimestamp()} ${value}\n`;
  fs.appendFileSync(logPath, value);
};

const writeToErr = async (error) => {
  const errPath = path.join(logLocation, `${generateDateString()}-error.log`);

  error = `${generateTimestamp()} ${error}\n`;
  fs.appendFileSync(errPath, error);
};

/**
 * Performs an extremely simple zoho crm request to verify connectivity
 */
const simpleRequest = async () => {
  const input ={
    module: 'leads',
    params: {
      page: 0,
      per_page: 1
    }
  };

  return zoho.API.MODULES.get(input);
};

(async () => {
  await zoho.initialize(configData);

  try {
    fs.mkdirSync(logLocation, {recursive: true});
  } catch (e) {
    // It's fine if the directory already exists
    if (e.code !== 'EEXIST') throw e;
  }

  try {
    const res = await simpleRequest();
    await writeToLog(res.body);
  } catch (e) {
    await writeToErr(e.message);
  }

  setInterval(async () => {
    try {
      const res = await simpleRequest();
      await writeToLog(res.body);
    } catch (e) {
      await writeToErr(e.message);
    }
  }, 1000 * 60 * 60); // Try every hour
})();
