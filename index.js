var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var recursive = require('recursive-readdir-sync');

function HTMLEntryPlugin(options) {
  this.options = _.extend({
    src: '',
    ext: 'html'
  }, options);
}

HTMLEntryPlugin.prototype.apply = function(compiler) {
  var _this = this;

  compiler.plugin("emit", function(compilation, callback) {
    var dirPath = path.resolve(_this.options.src);
    var dirName = escapePattern(path.parse(dirPath).name);
    var extName = escapePattern(_this.options.ext);

    var fileList = recursive(dirPath);
    fileList.forEach(function(filePath) {
      var pattern  = new RegExp(dirName + '[\\\\|\\\/](.+\\.' + extName + ')$');
      var match = filePath.match(pattern);

      if (match) {
        var originContent = fs.readFileSync(filePath).toString();
        var hashedContent = hashReplace(compilation, originContent);

        compilation.assets[match[1]] = {
          source: function() {
            return hashedContent;
          },
          size: function() {
            return hashedContent.length;
          }
        };
        compilation.fileDependencies.push(filePath);
      }
    });

    callback();
  });
};

function hashReplace(compilation, content) {
  var pattern = /\[%\s*(.*?)\s*%\]/g;

  while ((match = pattern.exec(content)) !== null) {
    var success = false;
    var entryFile = path.parse(match[1]);
    var entryName = entryFile.dir === '' ? 
                    entryFile.name : 
                    entryFile.dir + '\/' + entryFile.name;
    compilation.chunks.forEach(function(chunk) {
      if (chunk.name.replace('\\', '\/') === entryName.replace('\\', '\/')) {
        chunk.files.forEach(function(file) {
          if (path.extname(file) === entryFile.ext) {
            var distFile = compilation.outputOptions.publicPath + file;
            content = content.replace(match[0], distFile.replace('\\', '\/'));
            success = true;
          }
        });
      }
    });

    if (!success) {
      throw new Error('The referenced file was not found: ' + match[1]);
    }
  }

  return content;
}

function escapePattern(str) {
  var chars = ['\\', '.', '(', ')', '[', ']', '{', '}', '*', '?', '+', '^', '$'];

  chars.forEach(function(char) {
    str = str.replace(char, '\\' + char);
  });

  return str;
}

module.exports = HTMLEntryPlugin;