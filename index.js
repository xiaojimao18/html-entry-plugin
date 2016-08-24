var fs = require('fs')
var _ = require('lodash')
var path = require('path')

var options = {
  src: '',    // 需要迁移到dist的源代码路径
  ext: 'html' // 需要迁移的文件的后缀名，例如可以设为 "entry.html"
}

function HTMLEntryPlugin(_options) {
  options = _.extend(options, _options)

  if (!options.src) {
    throwError('Please input the src path in options.')
    return
  }

  if (options.ext[0] !== '.') {
    options.ext = ['.', options.ext].join('')
  }
}

/*
 * @desc webpack plugin入口
 */
HTMLEntryPlugin.prototype.apply = function(compiler) {
  compiler.plugin("emit", function(compilation, callback) {
    try {
      var dirPath = path.resolve(options.src)
      var extName = escapePattern(options.ext)
      var pattern = new RegExp(extName + '$')

      listFiles(dirPath).forEach(function(filePath) {
        var match = filePath.match(pattern)

        if (match) {
          var originContent = fs.readFileSync(path.join(dirPath, filePath)).toString()
          var hashedContent = hashReplace(compilation, originContent)

          compilation.assets[filePath] = {
            source: function() { return hashedContent },
            size:   function() { return hashedContent.length }
          }
          compilation.fileDependencies.push(filePath)
        }
      })
    } catch(err) {
      console.error(err.stack)
    }

    callback()
  })
}

/*
 * @desc    获得路径下的所有文件的相对路径（相对于输入的路径）
 * @params  srcDir 需要获得文件列表的目录
 * @return  输入路径下的所有文件路径（相对于输入路径）
 */
function listFiles(dirPath) {
  var files = []

  function currentDir(src, relativePath) {
    fs.readdirSync( path.join(src, relativePath) ).forEach(function(name) {
      var newRelativePath = path.join(relativePath, name)

      if (fs.statSync(path.join(src, newRelativePath)).isFile()) {
        files.push(newRelativePath)
      } else {
        currentDir(src, newRelativePath)
      }
    })
  }

  currentDir(dirPath, '')
  return files
}

/*
 * @desc    对文本内容进行正则替换
 * @params  compilation   webpack的compilation对象
 * @params  content       需要替换的文本内容
 * @return  替换后的文本内容
 */
function hashReplace(compilation, content) {
  var pattern = /\[%\s*(.*?)\s*%\]/g

  while ((match = pattern.exec(content)) !== null) {
    var success = false
    var entryExt = path.extname(match[1])
    var entryName = match[1].split('.').slice(0, -1).join('.')  // 去掉后缀名

    compilation.chunks.forEach(function(chunk) {
      if (chunk.name && chunk.name.replace('\\', '\/') === entryName.replace('\\', '\/')) {
        chunk.files.forEach(function(file) {
          if (path.extname(file) === entryExt) {
            var distFile = path.join(compilation.outputOptions.publicPath, file).replace('\\', '\/')
            content = content.replace(match[0], distFile)
            success = true
          }
        })
      }
    })

    if (!success) {
      throwError('The referenced file was not found: ' + match[1])
    }
  }

  return content
}

/*
 * @desc    对字符串进行正则转义，使得正则不会将字符当作特殊的字符
 * @params  src 需要转义的字符串
 * @return  转以后的字符串
 */
function escapePattern(str) {
  if (typeof str !== 'string') {
    throwError('Please input the correct string: ' + str)
    return
  }

  var chars = ['\\', '.', '(', ')', '[', ']', '{', '}', '*', '?', '+', '^', '$']

  chars.forEach(function(char) {
    str = str.replace(char, '\\' + char)
  })

  return str
}

function throwError(str) {
  try {
    throw new Error(str)
  } catch(err) {
    console.error(err.stack)
  }
}

module.exports = HTMLEntryPlugin
