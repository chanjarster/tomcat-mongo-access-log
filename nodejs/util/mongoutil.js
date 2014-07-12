var _ = require('underscore');
var moment = require('moment');

/**
 * transform http request params to mongodb find condition
 * 
 * each param should follow this form:
 *   
 *    paramName{type}[op]=value
 * 
 * type:  int, float, date, str, re(gexp)
 * op: 
 *    eq  ->  =
 *    gte ->  >=
 *    lte ->  <=
 *    gt  ->  >
 *    lt  ->  <
 *    
 * examples:
 * 
 *    { url{str}[regex] : 'google' }             => { url : /google/ }
 *    { finishOn{date}[gte] : '2014-07-09' }     => { finishOn : { $gte : Date(2014-07-09) } }
 *    { statusCode{int}[gte,lte] : '200,299' }   => { statusCode : { $gte: 200, $lte: 299 } }
 *    { elapsedSeconds{float}[gte] : '0.398' }   => { elapsedSeconds : { $gte: 0.389 } }
 *    {                                             {
 *      endOn{date}[gte] : '2014-07-09',              endOn : {
 *      endOn{date}[lte] : '2014-07-10'          =>     $gte : Date(2014-07-09), $lte : Date(2014-07-10) 
 *    }                                               }
 *                                                  }
 */
var parse = function(params) {

  var paramNameParser = /^(.*){(.*)}\[(.*)\]$/;

  var condition = {};
  
  console.log(params);
  
  _.each(params, function(value, key) {
    
    var matches = paramNameParser.exec(key);
    
    var name = matches[1],
        type = matches[2],
          op = matches[3]
    ;
    
    // merge condition
    condition = mergeObject(
      parseRaw({
        'name' : name,
        'type' : type,
        'op'   : op,
       'value' : value
      }), 
      condition
    );
    
    
  });
  
  console.log(condition);
  return condition;
  
};

var parseRaw = function(raw) {
  var name = raw.name,
      type = raw.type,
        op = raw.op,
     value = raw.value
  ;
  
  if(_.isUndefined(name) || _.isUndefined(type) || _.isUndefined(op) || _.isUndefined(value)) {
    return {};
  }
  
  var condition = {};
  
  if(op.indexOf(',') != -1) {
    var ops = op.split(',');
    var values = value.split(',');
    _.each(ops, function(o, i) {
      
      condition = mergeObject(parseRaw({
        'name' : name,
        'type' : type,
          'op' : o,
       'value' : values[i]
      }), condition);
      
    });
    
    return condition;
  }
  
  switch(op) {
  case 'lte':
  case 'gte':
  case 'lt':
  case 'gt':
    if(!condition[name]) {
      condition[name] = {};
    }
  }
  switch(op) {
  case 'eq' :
    condition[name] = convert(type, value);
    break;
  case 'lte' :
    condition[name]['$lte'] = convert(type, value);
    break;
  case 'gte' :
    condition[name]['$gte'] = convert(type, value);
    break;
  case 'lt' :
    condition[name]['$lt'] = convert(type, value);
    break;
  case 'gt' :
    condition[name]['$gt'] = convert(type, value);
    break;
  };
  
  return condition;
};


var convert = function(type, value) {
  switch (type) {
  case 'date':
    return moment(value, 'YYYY-MM-DD').toDate();
  case 'int':
    return parseInt(value);
  case 'float':
    return parseFloat(value);
  case 're':
  case 'regex':
  case 'regexp':
    return new RegExp(value);
  default:
    return value;
  }
};

var mergeObject = function(a, b) {
  var o = {};
  _.each(a, function(av, ak) {
    o[ak] = av;
  });

  _.each(b, function(bv, bk) {
    if (_.isUndefined(o[bk])) {
      o[bk] = bv;
      return;
    }

    if (_.isObject(o[bk]) && _.isObject(bv)) {
      o[bk] = mergeObject(o[bk], bv);
      return;
    }
    
    o[bk] = bv;
  });

  return o;
};

exports.parse = parse;
