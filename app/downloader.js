'use strict';

var fs = require('fs');
var cheerio = require('cheerio');
var async = require('async');
var request = require('request');
var mkdirp = require('mkdirp');
var gm = require('gm');
var createBook = require('./pdf').createBook;
var Progress = require('progress');
var winston = require('winston');

module.exports = {
  downloadAllIssues: downloadAllIssues,
  downloadComicIssue: downloadComicIssue
}

function downloadAllIssues(comicName, done) {
  request(`http://hellocomic.com/${comicName.toLowerCase()}/c1/p1`, (err, response) => {
    if (err) {
      err['downloadAllIssues'] = `${comicName}`;
      done(err);
      return;
    }
    let $ = cheerio.load(response.body);
    let numberOfIssues = $('#e2 option').length;

    let downloadReqs = [];

    for (let i=0; i<numberOfIssues; i++) {
      downloadReqs.push(
        next => downloadComicIssue(comicName, (i + 1)+'', next)
      );
    }

    async.waterfall(downloadReqs, done);
  });
}

function downloadComicIssue(comicName, issueNumber, done) {
  downloadComicBookImages(comicName, issueNumber, function(err, imgPaths) {
    if (err) {
      err['downloadComicBookImages'] = `${comicName}#${issueNumber}`;
      done(err);
      return;
    }

    imgPaths = imgPaths.sort((a,b) => {
      let aSplit = a.split('/').pop().split('.')[0].split('_');
      let bSplit = b.split('/').pop().split('.')[0].split('_');
      if (parseInt(aSplit[0]) < parseInt(bSplit[0])) {
        return -1;
      } else if (parseInt(aSplit[0]) > parseInt(bSplit[0])) {
        return 1;
      } else {
        return parseInt(aSplit[1]) - parseInt(bSplit[1]);
      }
    });

    createBook(`./issues/${comicName}`, `${comicName}#${issueNumber}`, imgPaths);
    console.log(`${comicName}#${issueNumber}.pdf created!`);
    done(null);
  })
}

function downloadComicBookImages(name, issueNumber, done) {
  request(`http://hellocomic.com/${name.toLowerCase()}/c${issueNumber}/p1`, (err, response) => {
    if (err) {
      err['downloadComicBookImages'] = `${name}#${issueNumber}`;
      done(err);
      return;
    }
    let $ = cheerio.load(response.body);
    let numberOfPages = $('#e1 option').length;
    let imgDir = `./tmp/${name}_${issueNumber}`;
    let progress = new Progress(`${name}#${issueNumber} [:bar] :percent :elapsed`, {
      total: numberOfPages
    });
    mkdirp.sync(imgDir);
    let downloadImagesReqs = [];
    for (let i=0; i<numberOfPages; i++) {
      let link = `http://hellocomic.com/${name.toLowerCase()}/c${issueNumber}/p${i+1}`;
      downloadImagesReqs.push(
        (next) => {
          downloadImages(link, imgDir, i, (html) => {
            let $ = cheerio.load(html);
            return [$('.coverIssue img').prop('src')];
          }, (err, response) => {
            if (err) {
              err['downloadImages'] = `${name}#${issueNumber}p${i+1}`;
            }
            progress.tick();
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
      err['downloadImage'] = `${imgName}`;
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
                err['Img download req'] = `${imgPath}`;
                next(err);
                return;
              }
              if (response.statusCode === 200) {
                let downloadImagePath = `${imgDestPath}/${imgName}_${index}.${ext}`;
                fs.writeFile(downloadImagePath, response.body, (err) => {
                  if (err) {
                    next(err);
                    return;
                  }
                  gm(downloadImagePath)
                    .resize(984, 1512)
                    .write(downloadImagePath+'min', (err) => {
                      fs.unlinkSync(downloadImagePath);
                      next(err, downloadImagePath+'min');
                    });
                });
              } else {
                next(response.statusCode);
              }
            });
          }
        );
        async.waterfall(imgDownloadReqs, (err, results) => {
          finishCallback(err, results);
        });
      });
    } else {
      finishCallback(response.statusCode);
    }
  });
}
