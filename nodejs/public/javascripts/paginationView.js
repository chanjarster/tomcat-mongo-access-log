/*
 * Pagination area view
 */
define([], function() {
  
  return Backbone.View.extend({
    
    events : {
      'click a' : 'jump'
    },
    
    initialize : function(options) {
      
      this.eventBus = options.eventBus;
      this.q = {
          params : {},
          pageNo : 1,
          limit : 20,
          count : 0
      };
      this.$pagination = this.$el.find('.pagination');
      
      this.listenTo(this.eventBus, 'log:search', function(queryOption) {
        
        this.q.params = queryOption.params || this.q.params;
        this.q.pageNo = queryOption.pageNo || this.q.pageNo;
        this.q.limit = queryOption.limit || this.q.limit;
        
        this.query();
        
      }, this);
      
    },
    
    query : function() {
      
      var that = this;
      var q = this.q;
      
      $.get('/logs', {
        
        queryStr : JSON.stringify(q.params),
        pageNo : q.pageNo,
        limit : q.limit
        
      }, function(result) {
        
        that.eventBus.trigger('log:refereshList', result.logs);
        
        q.pageNo = result.pageNo;
        q.limit = result.limit;
        q.count = result.count;
        
        that.render();
        
      }, 'json');
      
    },
    
    jump : function(event) {
      
      var $a = $(event.target);
      
      if ($a.parent('li').is('.disabled')) {
        event.preventDefault();
        return;
      }
      var pageNo = $a.html();
      
      if ($a.is('.pg-prev')) {
        this.q.pageNo--;
      } else if ($a.is('.pg-next')) {
        this.q.pageNo++;
      } else {
        this.q.pageNo = parseInt(pageNo);
      }
      
      this.query();
      event.preventDefault();
    },
    
    render : function() {
      
      var pageNo = this.q.pageNo,
          limit = this.q.limit,
          count = this.q.count,
          maxPageCount = Math.ceil(count / limit)
      ;

      
      this.$pagination.empty();
      
      if ( count == 0) {
        return;
      }
      
      // <<
      if (pageNo == 1) {
        this.$pagination.append('<li class="disabled"><a href="#" class="pg-prev">&laquo;</a></li>');
      } else {
        this.$pagination.append('<li><a href="#" class="pg-prev">&laquo;</a></li>');
      }
      
      // left-4, pageNo, right-4
      var s = pageNo - 3;
      s = s < 1 ? 1 : s;
      var e = pageNo + 4;
      e = e > maxPageCount ? maxPageCount : e;
      if (e - s < 8) {
        e = s + (8 - 1);
        e = e > maxPageCount ? maxPageCount : e;
        if ( e - s < 8) {
          s = e - (8 - 1);
          s = s < 1 ? 1 : s;
        }
      }
      
      for (var i = s; i <= e; i++) {
        if (i == pageNo) {
          this.$pagination.append('<li class="active"><a href="#">' + i +  '</a>');
        } else {
          this.$pagination.append('<li><a href="#">' + i +  '</a>');
        }
      }
      
      // >>
      if (pageNo == maxPageCount) {
        this.$pagination.append('<li class="disabled"><a href="#" class="pg-next">&raquo;</a></li>');
      } else {
        this.$pagination.append('<li><a href="#" class="pg-next">&raquo;</a></li>');
      }
    }
    
  });
});