"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _pagesRouterV13Document = require("./pagesRouterV13Document");
Object.keys(_pagesRouterV13Document).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _pagesRouterV13Document[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _pagesRouterV13Document[key];
    }
  });
});
var _pagesRouterV13App = require("./pagesRouterV13App");
Object.keys(_pagesRouterV13App).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _pagesRouterV13App[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _pagesRouterV13App[key];
    }
  });
});