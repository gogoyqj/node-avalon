//https://github.com/nelsonic/learn-mocha

//console.wain("必须全局安装mocha https://github.com/nelsonic/learn-mocha")
var path = require("path")
var parse5 = require('parse5')
global.parser = new parse5.Parser()
global.serializer = new parse5.Serializer()
global.avalon = require('../avalon')
global.expect = require("./expect")
global.removeMSScan = function (html) {
    return html.replace(/ ms-scan-\d+="[^"]+"/g,"");
}
global.removeComment = function (html) {
    return html.replace(/<!--\w+\d+(:end)?-->/g, "")
}
global.heredoc = function (fn) {
    return fn.toString().replace(/^[^\/]+\/\*!?\s?/, '').replace(/\*\/[^\/]+$/, '')
}
//https://github.com/exolution/xCube/blob/master/XParser.js
var files = ["attr"]//["data","if", "text", "visible","repeat", "css","duplex"]
files.forEach(function (val) {
    var filePath = path.resolve(process.cwd(), val)
    require(filePath)
})
//describe

