/*global require: false, module: false, complete: false */

var fs      = require("fs"),
    path    = require("path"),
    spawn   = require("child_process").spawn,
    Promise = require("bluebird"),
    _       = require("underscore");


module.exports = function(moduleName, taskName) {


  task(taskName || "export-artifacts", function() {
    if (!fs.existsSync("./lib-node")) {
      fs.mkdirSync("./lib-node");
    }

    if (!fs.existsSync("./lib-web")) {
      fs.mkdirSync("./lib-web");
    }

    Promise.attempt(function() {
      return Promise.all(_.map(["common", "node"], function(pkg) {
        return new Promise(function(resolve, reject) {
          var rsync = spawn("rsync", ["-avL", path.join("src", pkg, moduleName), "lib-node/"], {stdio: 'inherit'});
          rsync.on("close", function() {
            resolve();
          });
          rsync.on("error", function(err) {
            reject(err);
          });
        });
      }));
    })
      .then(function() {
        return Promise.all(_.map(["common", "web"], function(pkg) {
          return new Promise(function(resolve, reject) {
            var rsync = spawn("rsync", ["-avL", path.join("src", pkg, moduleName), "lib-web/"], {stdio: 'inherit'});
            rsync.on("close", function() {
              resolve();
            });
            rsync.on("error", function(err) {
              reject(err);
            });
          });
        }));
      })
      .then(function() {
        complete();
      });
  }, {async: true});

};
