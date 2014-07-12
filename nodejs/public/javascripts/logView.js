//Each Log presents as a tr
define(
    ['text!templates/logTemplate.html', 'text!templates/detailTemplate.html'], 
    function(logTemplate, detailTemplate) {
  
      return Backbone.View.extend({
        
        tagName : 'tr',
        
        rowTmpl : _.template(logTemplate),
        
        detailTmpl : _.template(detailTemplate),
        
        events : {
          'click a' : 'info'
        },
        
        initialize : function(options) {
          this.model = options.model;
        },
        
        render: function() {
          this.$el.html(this.rowTmpl( { d : this.model } ));
          return this.$el;
        },
        
        info : function(event) {
          $("#detailModal table").html(this.detailTmpl( { d : this.model }));
          $("#detailModal").modal();
          event.preventDefault();
        }
        
      });

});