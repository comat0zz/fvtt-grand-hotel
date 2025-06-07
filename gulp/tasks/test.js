'use strict';

const $ = require('gulp-load-plugins')();

module.exports = function(options) {

  return function() {
    return console.log(options.text)
  };
};