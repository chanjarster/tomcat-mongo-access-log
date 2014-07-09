require(
    ['text!templates/logTemplate.html', 'text!templates/detailTemplate.html'], 
    function(logTemplateRaw, detailTemplateRaw) {
  
      $(function() {
      
        /*
         * UI component
         */
        
        // datepicker
        $('#datetime\\.start').datepicker({
          format : 'yyyy-mm-dd'
        });
        $('#datetime\\.end').datepicker({
          format : 'yyyy-mm-dd'
        });
        
        // query form toggle button
        $('#btn-toggle-query-form').click(function() {
          var $that = $(this);
          $('#area-search').slideToggle(null, function() {
            if ($(this).is(':hidden')) {
              $that.html('Open');
            } else {
              $that.html('Close');
            }
          });
        });
        
        var eventBus = _.extend(Backbone.Events);
        
        var $searchForm = $('form');
        $('#btn-do-query').click(function() {
          
          var params = {};
          
          // build query condition
          var paramArr = $searchForm.serialize().split('&');
          for (var i = 0; i < paramArr.length; i++) {
            var keyValue = paramArr[i].split('=');
            var key = decodeURIComponent(keyValue[0]);
            var value = decodeURIComponent(keyValue[1]);
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
          
          eventBus.trigger('log:search', params);
        });
        
        $('#btn-chart').click(function() {
          eventBus.trigger('log:report', params);
        });
        
        var logTemplate =  _.template(logTemplateRaw);
        
        var detailTemplate = _.template(detailTemplateRaw);
        
        var LogView = Backbone.View.extend({
          
          tagName : 'tr',
          
          template :  logTemplate,
          
          events : {
            'click td' : 'info'
          },
          
          initialize : function(options) {
            this.model = options.model;
          },
          
          render: function() {
            this.$el.html(this.template( { d : this.model } ));
            return this.$el;
          },
          
          info : function() {
            $("#detailModal table").html(detailTemplate( { d : this.model }));
            $("#detailModal").modal();
          }
          
        });
        
        
        var ListView = Backbone.View.extend({
          
          events : {
            'click .pagination a' : 'flapPage'
          },
          
          initialize : function(options) {
          
            this.eventBus = options.eventBus;
            this.params = {};
            
            
            this.$pagination = this.$el.find('.pagination');
            this.$logs = this.$el.find('#logs tbody');
            
            this.$pagination.hide();
            
            this.paginationTmpl = options.paginationTmpl;
            
            // current pageNo & limit
            this.pageNo = 1;
            this.limit = 20;
            
            this.listenTo(this.eventBus, 'log:search', function(params) {
              this.params = params;
              this.pageNo = 1;
              this.limit = 20;
              this.query();
            }, this);
          },
          
          query : function() {
            
            var that = this;
            
            $.get('/logs', { 
              queryStr : JSON.stringify(this.params),
              pageNo : this.pageNo,
              limit : this.limit
            }, function(result) {
                  // success
                  // refresh log result
                  that.$logs.empty();
                  
                  _.each(result.logs, function(log, index) {
                    that.$logs.append(new LogView({ model : log }).render());
                  });
                  
                  // refresh pagination area
                  that.pageNo = result.pageNo;
                  that.limit = result.limit;
                  var maxPageNo = Math.ceil(result.count / result.limit);
                  
                  that.$pagination.empty();
                  
                  // <<
                  if (that.pageNo == 1) {
                    that.$pagination.append('<li class="disabled"><a href="#">&laquo;</a></li>');
                  } else {
                    that.$pagination.append('<li><a href="#">&laquo;</a></li>');
                  }
                  
                  // left-4, pageNo, right-4
                  var s = that.pageNo - 3;
                  s = s < 1 ? 1 : s;
                  var e = that.pageNo + 4;
                  e = e > maxPageNo ? maxPageNo : e;
                  if (e - s < 8) {
                    e = s + (8 - 1);
                    e = e > maxPageNo ? maxPageNo : e;
                    if ( e - s < 8) {
                      s = e - (8 - 1);
                      s = s < 1 ? 1 : s;
                    }
                  }
                  
                  for (var i = s; i <= e; i++) {
                    if (i == that.pageNo) {
                      that.$pagination.append('<li class="active"><a href="#">' + i +  '</a>');
                    } else {
                      that.$pagination.append('<li><a href="#">' + i +  '</a>');
                    }
                  }
                  
                  // >>
                  if (that.pageNo == maxPageNo) {
                    that.$pagination.append('<li class="disabled"><a href="#">&raquo;</a></li>');
                  } else {
                    that.$pagination.append('<li><a href="#">&raquo;</a></li>');
                  }
                  that.$pagination.show();
                  
                }, 
                'json'
             );
          },
          
          flapPage : function(event) {
            var $a = $(event.target);
            if ($a.parent('li').is('.disabled')) {
              event.preventDefault();
              return;
            }
            var pageNo = $a.html();
            
            if (/\d+/g.test(pageNo)) {
              this.pageNo = parseInt(pageNo);
            } else if ('«' == pageNo) {
              // prev page 
              this.pageNo--;
            } else if ('»' == pageNo) {
              // next page
              this.pageNo++;
            }
            this.query();
            event.preventDefault();
          }
          
        });
        
        new ListView({
          el : $("#area-result")[0],
          eventBus : eventBus
        });
        
      });

});