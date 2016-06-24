html-entry-plugin
=================

Introduction
------------
**html-entry-plugin** is a webpack plugin that complete the following two tasks.

  1. move the html files from `src` directory to `dist` directory.
  2. replace the references in htmls with the new path of js and css files generated by webpack.

Motivation
----------

When develop using webpack, sometimes web entries are htmls. Webpack can not deal with the htmls well.

We can use other tools like gulp, or we can use some plugins to generate html files. But that is not what I want.

I think the ideal solution should be:

  1. Simply use a plugin rather than write gulp scripts every time I construct a project.
  2. The content of htmls can be whatever I need, and the plugin just need to put them to the right place.
  3. Replace the references in htmls with the new path of hashed js and css files.

Usage
-----
`npm install html-entry-plugin`

In `webpack.config.js`, use this plugin and set the path of the source code.

```javascript
plugin: [
  new HTMLEntryPlugin({
    src: 'path/to/src'
  }),
  ...
]
```

For the js and css files that are refered in html files, it only needs to write the reference between `[%` and `%]`.
The reference should be the entry name written in webpack config, and the ext name should be js or css.
```html
  <link rel="stylesheet" href="[% entry.name.css %]">
  <script src="[% entry.name.js %]"></script>
```


介绍
----

**html-entry-plugin**是一个webpack插件，主要完成以下两个工作：

  1. 将html文件从`src`拷贝到`dist`
  2. 根据webpack生成的js和css文件，替换html中对应的引用


为什么要开发这个插件
--------------------

在使用webpack开发时，有时我们的入口时html文件。webpack并不能很好地帮助我们处理这些html文件。

我们可以使用gulp来辅助，还有一些plugin可以生成html文件，但是这些都不是我想要的。

我理想中解决方法应该是：

  1. 不需要每次建工程都要写一段gulp，只需要简单引用plugin就好
  2. 能不受限制的写html文件，plugin只需要帮我将html文件移动到对应的位置
  3. 能够自动根据webpack生成的带hash的js和css，修改html中的引用

简单地理解为：一个能帮我“编译”html并输出到指定的目录中的plugin。


使用方法
--------

`npm install html-entry-plugin`

在webpack.config.js中，在plugin中添加该插件，并设置代码的路径

```javascript
plugin: [
  new HTMLEntryPlugin({
    src: 'path/to/src'
  }),
  ...
]
```

在html中，要引用生成的js或者css，只需要将引用的内容包裹在`[% %]`中，
引用的内容填写该html对应的entry名称，后缀名对应填写js或者css。
```html
  <link rel="stylesheet" href="[% entry.name.css %]">
  <script src="[% entry.name.js %]"></script>
```