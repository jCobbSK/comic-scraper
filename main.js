'use strict';

var downloadComicBookImages = require('./app/downloader').downloadComicBookImages;
var createBook = require('./app/pdf').createBook;
var gm = require('gm');

downloadComicBookImages('deadpool', '1', function(err, imgPaths){
  if (err) {
    console.log(err);
    return;
  }
  imgPaths = imgPaths.sort();
  createBook('./issues/deadpool', 'Deadpool#1', imgPaths);
  console.log(`Deadpool #1 DOWNLOADED!!!`);
});
