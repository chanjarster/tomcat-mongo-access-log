define(
    [
      'domReady', 'javascripts/formView', 'javascripts/logListView', 'javascripts/paginationView'
    ],
    
    function(domReady, FormView, LogListView, PaginationView) {
      
      return Backbone.View.extend({
       
        initialize : function() {
      
          /**
           * Form View, Log List View, Each Log View
           */
          var eventBus = _.extend(Backbone.Events);
          
          new FormView({
            el : $('#searchForm'),
            eventBus : eventBus
          });
          
          new PaginationView({
            el : $('#pagination'),
            eventBus : eventBus
          });
          
          new LogListView({
            el : $("#logList"),
            eventBus : eventBus
          });
          
        }
      
      });
   
});