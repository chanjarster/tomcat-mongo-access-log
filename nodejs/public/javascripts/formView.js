define([], function() {
  
  return Backbone.View.extend({
    
    events : {
      'click #btn-toggle-form' : 'toogleQueryForm',
      'click #btn-do-query' : 'query'
    },
    
    initialize : function(options) {
      
      this.eventBus = options.eventBus;
      
      this.$conditions = this.$el.find('#conditions');
      this.$toggleBtn = this.$el.find('#btn-toggle-form');
      this.$form = this.$el.find('form');
      
      // datepicker
      $('#datetime\\.start').datepicker({ format : 'yyyy-mm-dd' });
      $('#datetime\\.end').datepicker({ format : 'yyyy-mm-dd' });
      
    },
    
    toogleQueryForm : function(event) {
      var that = this;
      var $toggleBtn = this.$toggleBtn;
      
      this.$conditions.slideToggle(null, function() {
        if ($(this).is(':hidden')) {
          $toggleBtn.html('Open');
          that.eventBus.trigger('view:scrollToBtn');
        } else {
          $toggleBtn.html('Close');
        }
        
      });
    
    },
    
    query : function() {
      
      var params = {};
      
      // build query condition
      var paramArr = this.$form.serialize().split('&');
      for (var i = 0; i < paramArr.length; i++) {
        var keyValue = paramArr[i].split('=');
        var key = decodeURIComponent(keyValue[0]);
        var value = decodeURIComponent(keyValue[1].replace(/\+/g,'%20')).trim();
        if (!value) {
          continue;
        }
        
        // convert param to suitable type
        var int = /\.int$/g;
        var float = /\.float$/g;
        
        if (int.test(key)) {
          key = key.replace(int, '');
          value = parseInt(value);
        } else if (float.test(key)) {
          key = key.replace(float, '');
          value = parseFloat(value);
        }
        
        // subcondition [start, end]
        var subCondition = null;
        if (key.indexOf('.start') != -1) {
          key = key.replace('.start', '');
          subCondition = '$gte';
        } else if (key.indexOf('.end') != -1) {
          key = key.replace('.end', '');
          subCondition = '$lte';
        }
        
        // build params
        if (subCondition) {
          if (!params[key]) {
            params[key] = {};
          }
          params[key][subCondition] = value;
        } else {
          params[key] = value;
        }
        
      }
      
      // build post params query condition
      _.each($("#params\\.key").tagsinput('items'), function(item, value) {
        var keyValue = item.split('=');
        var key = keyValue[0].replace(/\./, '$');
        var value = keyValue[1];
        if (!value) {
          return;
        }
        if (!params['params.' + key]) {
          params['params.' + key] = value;
        } else {
          if(!_.isArray(params['params.' + key])) {
            var oldVal = params['params.' + key];
            params['params.' + key] = [];
            params['params.' + key].push(oldVal);
          }
          params['params.' + key].push(value);
        }
      });
      
      this.eventBus.trigger('log:search', { params : params } );
      
    }
    
  });
  
});