'use strict';

var downloadComicBookImages = require('./app/downloader').downloadComicBookImages;
var createBook = require('./app/pdf').createBook;

downloadComicBookImages('deadpool', '1', function(err, imgPaths){
  if (err) {
    console.log(err);
    return;
  }
  imgPaths = imgPaths.sort((a,b) => {
    let aSplit = a.split('.')[0].split('_');
    let bSplit = a.split('.')[0].split('_');
    if (parseInt(a[0]) < parseInt(b[0])) {
      return -1;
    } else if (parseInt(a[0]) > parseInt(b[0])) {
      return 1;
    } else {
      return parseInt(a[1]) - parseInt(b[1]);
    }
  });
  createBook('./issues/deadpool', 'Deadpool#1', imgPaths);
  console.log(`Deadpool #1 DOWNLOADED!!!`);
});
