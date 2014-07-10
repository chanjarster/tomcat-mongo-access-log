/**
 * Request access logs list view
 */
define(['javascripts/logView'], function(LogView) {
  
  return Backbone.View.extend({
    
    initialize : function(options) {
      
      this.eventBus = options.eventBus;
      this.$logs = this.$el.find('#logs tbody');
      this.logs = [];
      
      this.listenTo(this.eventBus, 'log:refereshList', function(logs) {
        this.logs = logs;
        this.render();
      }, this);
      
    },
    
    render : function() {
      
      this.$logs.empty();
      
      _.each(this.logs, function(log, index) {
        this.$logs.append(new LogView({ model : log }).render());
      }, this);
      
      this.eventBus.trigger('view:scrollToBtn');
    }
    
  });
});