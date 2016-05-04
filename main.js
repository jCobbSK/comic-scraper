'use strict';

var downloadAll = require('./app/downloader').downloadAllIssues;
var downloadIssue = require('./app/downloader').downloadComicIssue;

// downloadIssue('Deadpool', '4', () => {});

downloadAll('Deadpool', function(err){
  console.log(err);
});
