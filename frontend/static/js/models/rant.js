App.Rant = DS.Model.extend({
  title: DS.attr('string'),
  content: DS.attr('string'),
  type: DS.attr('string'),
  created_at: DS.attr('date')
});
