const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 👇 Add support for .bin files
config.resolver.assetExts.push('bin');

module.exports = config;
