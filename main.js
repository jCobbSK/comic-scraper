'use strict';

var downloadComicBookImages = require('./app/downloader').downloadComicBookImages;
var createBook = require('./app/pdf').createBook;

downloadComicBookImages('deadpool', '1', function(imgPaths){
  imgPaths = imgPaths.sort();
  createBook('./issues/deadpool', 'Deadpool#1', imgPaths);
  console.log(`Deadpool #1 DOWNLOADED!!!`);
});
