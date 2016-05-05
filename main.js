'use strict';

var downloadAll = require('./app/downloader').downloadAllIssues;
var downloadIssue = require('./app/downloader').downloadComicIssue;

downloadAll('Deadpool', function(err){
  console.log(err);
});
