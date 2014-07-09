var express = require('express');
var moment = require('moment');
var _ = require('underscore');

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
  
  _.each(queryObject, function(value, key, queryObject) {
    
    // convert datetime to Date object
    if (key == 'datetime') {
      if (queryObject['datetime']['$gte']) {
        queryObject['datetime']['$gte'] = toDate(queryObject['datetime']['$gte']);
      }
      if (queryObject['datetime']['$lte']) {
        queryObject['datetime']['$lte'] = toDate(queryObject['datetime']['$lte']);
      }
      return;
    }
    
    if (key == 'statusCode') {
      if ('1XX' == queryObject['statusCode']) {
        queryObject['statusCode'] = {};
        queryObject['statusCode']['$gte'] = 100;
        queryObject['statusCode']['$lte'] = 199;
      }
      if ('2XX' == queryObject['statusCode']) {
        queryObject['statusCode'] = {};
        queryObject['statusCode']['$gte'] = 200;
        queryObject['statusCode']['$lte'] = 299;
      }
      if ('3XX' == queryObject['statusCode']) {
        queryObject['statusCode'] = {};
        queryObject['statusCode']['$gte'] = 300;
        queryObject['statusCode']['$lte'] = 399;
      }
      if ('4XX' == queryObject['statusCode']) {
        queryObject['statusCode'] = {};
        queryObject['statusCode']['$gte'] = 400;
        queryObject['statusCode']['$lte'] = 499;
      }
      if ('5XX' == queryObject['statusCode']) {
        queryObject['statusCode'] = {};
        queryObject['statusCode']['$gte'] = 500;
        queryObject['statusCode']['$lte'] = 599;
      }
      return;
    }
    
    // convert string to regex
    if (_.isString(value)) {
      queryObject[key] = new RegExp(filterRegexCharacter(value));
    }
    
  });
  
  console.log(queryObject);
  
  collection.find(queryObject).count(function(err, count) {
    
    collection.find(queryObject).skip((pageNo - 1) * limit).limit(limit).sort( { datetime : -1 } ).toArray(function(err, results) {
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
  _.each(['\\', '.', '(', ')', '[', ']', '^', '$'], function(c) {
     string = string.replace(new RegExp('\\' + c, 'g'), '\\' + c);
  });
  return string;
  
};

module.exports = router;
