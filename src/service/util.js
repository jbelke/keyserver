/**
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2016 Mailvelope GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

const crypto = require('crypto');

/**
 * Checks for a valid string
 * @param  {} data     The input to be checked
 * @return {boolean}   If data is a string
 */
exports.isString = function(data) {
  return typeof data === 'string' || String.prototype.isPrototypeOf(data);
};

/**
 * Cast string to a boolean value
 * @param  {}  data    The input to be checked
 * @return {boolean}   If data is true
 */
exports.isTrue = function(data) {
  if (this.isString(data)) {
    return data === 'true';
  } else {
    return Boolean(data);
  }
};

/**
 * Checks for a valid long key id which is 16 hex chars long.
 * @param  {string} data   The key id
 * @return {boolean}       If the key id is valid
 */
exports.isKeyId = function(data) {
  if (!this.isString(data)) {
    return false;
  }
  return /^[a-fA-F0-9]{16}$/.test(data);
};

/**
 * Checks for a valid version 4 fingerprint which is 40 hex chars long.
 * @param  {string} data   The key id
 * @return {boolean}       If the fingerprint is valid
 */
exports.isFingerPrint = function(data) {
  if (!this.isString(data)) {
    return false;
  }
  return /^[a-fA-F0-9]{40}$/.test(data);
};

/**
 * Checks for a valid email address.
 * @param  {string} data   The email address
 * @return {boolean}       If the email address if valid
 */
exports.isEmail = function(data) {
  if (!this.isString(data)) {
    return false;
  }
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(data);
};

/**
 * Create an error with a custom status attribute e.g. for http codes.
 * @param  {number} status    The error's http status code
 * @param  {string} message   The error message
 * @return {Error}            The resulting error object
 */
exports.throw = function(status, message) {
  const err = new Error(message);
  err.status = status;
  err.expose = true; // display message to the client
  throw err;
};

/**
 * Generate a cryptographically secure random hex string. If no length is
 * provided a 32 char hex string will be generated by default.
 * @param  {number} bytes   (optional) The number of random bytes
 * @return {string}         The random bytes in hex (twice as long as bytes)
 */
exports.random = function(bytes) {
  bytes = bytes || 16;
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Check if the user is connecting over a plaintext http connection.
 * This can be used as an indicator to upgrade their connection to https.
 * @param  {Object} ctx   The koa request/repsonse context
 * @return {boolean}      If http is used
 */
exports.checkHTTP = function(ctx) {
  return !ctx.secure && ctx.get('X-Forwarded-Proto') === 'http';
};

/**
 * Check if the user is connecting over a https connection.
 * @param  {Object} ctx   The koa request/repsonse context
 * @return {boolean}      If https is used
 */
exports.checkHTTPS = function(ctx) {
  return ctx.secure || ctx.get('X-Forwarded-Proto') === 'https';
};

/**
 * Get the server's own origin host and protocol. Required for sending
 * verification links via email. If the PORT environmane variable
 * is set, we assume the protocol to be 'https', since the AWS loadbalancer
 * speaks 'https' externally but 'http' between the LB and the server.
 * @param  {Object} ctx   The koa request/repsonse context
 * @return {Object}       The server origin
 */
exports.origin = function(ctx) {
  return {
    protocol: this.checkHTTPS(ctx) ? 'https' : ctx.protocol,
    host: ctx.host
  };
};

/**
 * Helper to create urls pointing to this server
 * @param  {Object} origin     The server's origin
 * @param  {string} resource   (optional) The resource to point to
 * @return {string}            The complete url
 */
exports.url = function(origin, resource) {
  return `${origin.protocol}://${origin.host}${resource || ''}`;
};

/**
 * Helper to create a url for hkp clients to connect to this server via
 * the hkp protocol.
 * @param  {Object} ctx   The koa request/repsonse context
 * @return {string}       The complete url
 */
exports.hkpUrl = function(ctx) {
  return (this.checkHTTPS(ctx) ? 'hkps://' : 'hkp://') + ctx.host;
};
