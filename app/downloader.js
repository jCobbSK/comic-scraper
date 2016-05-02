'use strict';

var fs = require('fs');
var cheerio = require('cheerio');
var async = require('async');
var request = require('request');
var mkdirp = require('mkdirp');

module.exports = {
  downloadComicBookImages
}

function downloadComicBookImages(name, issueNumber, done) {
  request(`http://hellocomic.com/${name}/c${issueNumber}/p1`, (err, response) => {
    let $ = cheerio.load(response.body);
    let numberOfPages = $('#e1 option').length;
    let downloadedPages = 0;
    let imgDir = `./tmp/${name}_${issueNumber}`;
    mkdirp.sync(imgDir);
    let downloadImagesReqs = [];
    for (let i=0; i<numberOfPages; i++) {
      downloadImagesReqs.push(
        (next) => {
          downloadImages(`http://hellocomic.com/${name}/c${issueNumber}/p${i+1}`, imgDir, i, (html) => {
            let $ = cheerio.load(html);
            return [$('.coverIssue img').prop('src')];
          }, (err, response) => {
            console.log(`${name} #${issueNumber}: ${++downloadedPages}/${numberOfPages}`);
            next(err, response);
          });
        }
      );
    }

    async.parallel(downloadImagesReqs, (err, responses) => {
      if (err) {
        done(err);
        return;
      }

      let arrayOfImgPath = responses.reduce((prevVal, response) => {
        return prevVal.concat(response);
      }, []);
      done(null, arrayOfImgPath);
    });
  });
}

function downloadImages(url, imgDestPath, imgName, getImageUrlsFromPageFunction, finishCallback) {
  request.get(url, (err, response, body) => {
    if (err) {
      finishCallback(err);
      return;
    }
    if (response.statusCode === 200) {
      let imagePaths = getImageUrlsFromPageFunction(body);
      let imgDownloadReqs = [];
      imagePaths.forEach((imgPath, index) => {
        let parsed = imgPath.split('.');
        let ext = parsed[parsed.length - 1];
        imgDownloadReqs.push(
          (next) => {
            request.get({
              uri: imgPath,
              encoding: null
            }, (err, response) => {
              if (err) {
                next(err);
                return;
              }
              if (response.statusCode === 200) {
                let downloadImagePath = `${imgDestPath}/${imgName}_${index}.${ext}`;
                fs.writeFile(downloadImagePath, response.body, (err) => {
                  next(err, downloadImagePath);
                });
              } else {
                next(response.statusCode);
              }
            });
          }
        );
        async.parallel(imgDownloadReqs, (err, results) => {
          finishCallback(err, results);
        });
      });
    } else {
      finishCallback(response.statusCode);
    }
  });
}
