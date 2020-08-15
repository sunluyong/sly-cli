const chalk = require('chalk');
const vfs = require('vinyl-fs');
const through = require('through2');
const Handlebars = require('handlebars');

function tpl(data) {
  return through.obj(function (file, encoding, callback) {
    console.log(`复制文件 ${chalk.grey(file.path)}`);
    if (file.contents) {
      const content = file.contents.toString(encoding);
      const template = Handlebars.compile(content);
      file.contents = Buffer.from(template(data), encoding);
    }
    this.push(file);
    callback();
  });
}

function copy(source, dest, data) {
  const worker = vfs.src(source)
    .pipe(tpl(data))
    .pipe(vfs.dest(dest));

  return new Promise(resolve => {
    worker.on('finish', () => {
      resolve();
    });
  });
}

module.exports = copy;
