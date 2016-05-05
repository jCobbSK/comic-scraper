'use strict';

var downloadAll = require('./app/downloader').downloadAllIssues;
var downloadIssue = require('./app/downloader').downloadComicIssue;

downloadAll('Deadpool', function(err){
  console.log(err);
});


// downloadIssue('Deadpool', '7', (err) => {
//   console.log(err);
// });
