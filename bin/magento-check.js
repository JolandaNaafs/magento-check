#!/usr/bin/env node
const { detectPlatform } = require('../lib/detector');
const chalk = require('chalk');

const url = process.argv[2];
if (!url) {
  console.error('Usage: magento-check <URL>');
  process.exit(1);
}

detectPlatform(url).then((platform) => {
  console.log(chalk.green(`🔍 Platform detected: ${platform}`));
});