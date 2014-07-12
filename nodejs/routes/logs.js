var express = require('express');
var moment = require('moment');
var _ = require('underscore');
var mg = require('../util/mongoutil');

var config = require("../config.json");
var MongoClient = require('mongodb').MongoClient;

var db;
var collection;

MongoClient.connect(config.mongo.url, function(err, database) {
  
  if (err) {
    throw err;
  }
  
  db = database;
  console.log('Connecting to ' + config.mongo.url);
  
  collection = db.collection(config.mongo.collection);
  console.log('Got collection: ' + config.mongo.collection);
  
});

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  var queryObject = {};
  if (req.query.queryStr) {
    queryObject = JSON.parse(req.query.queryStr);
  }
  var pageNo = parseInt(req.param('pageNo') ? req.param('pageNo') : '1');
  var limit = parseInt(req.param('limit') ? req.param('limit') : '20');
  
  var condition = mg.parse(queryObject);
  collection.find(condition).count(function(err, count) {
    
    collection
      .find(condition)
      .skip((pageNo - 1) * limit)
      .limit(limit).sort( { datetime : -1 } )
      .toArray(function(err, results) {
          if (err) {
            throw err;
          }
          
          for(var i = 0; i < results.length; i++) {
            results[i].datetime = moment(results[i].datetime).format('YYYY-MM-DD HH:mm:ss');
          }
          
          var paginationList = {
              logs : results,
              pageNo : pageNo,
              limit : limit,
              count : count
          };
          res.json(paginationList);
    });
        
  });
  
});

var toDate = function(datestring) {
  return moment(datestring, 'YYYY-MM-DD').toDate();
};

var filterRegexCharacter = function(string) {
  _.each(['\\', '.', '(', ')', '[', ']', '^', '$', '+', '*'], function(c) {
     string = string.replace(new RegExp('\\' + c, 'g'), '\\' + c);
  });
  return string;
  
};

module.exports = router;
