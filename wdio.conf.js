/**
 * Root configuration entry point.
 * Re-exports the Android configuration for seamless backward compatibility.
 */
const { config } = require('./config/wdio.android.conf');

exports.config = config;