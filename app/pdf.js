'use strict';

var pdf = require('pdfkit');
var fs = require('fs');
var mkdirp = require('mkdirp');

module.exports = {
  createBook
}

function createBook(destFolder, name, imagePaths) {

  let doc = new pdf({
    margin: 0,
    size: [495, 756]
  });

  mkdirp.sync(destFolder);

  doc.pipe(fs.createWriteStream(`${destFolder}/${name}.pdf`));

  imagePaths.forEach((path) => {
    doc.image(path,0,0,{width: 495});
    doc.addPage();
  });

  doc.end();

  // imagePaths.forEach((img) => {
  //   fs.unlinkSync(img);
  // });
}
