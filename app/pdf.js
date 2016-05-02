'use strict';

var pdf = require('pdfkit');
var fs = require('fs');

module.exports = {
  createBook
}

function createBook(destFolder, name, imagePaths) {

  let doc = new pdf({
    margin: 0,
    size: [495, 756]
  });

  doc.pipe(fs.createWriteStream(`${destFolder}/${name}.pdf`));

  imagePaths.forEach((path) => {
    doc.image(path,0,0,{width: 495});
    doc.addPage();
  });

  doc.end();
}
