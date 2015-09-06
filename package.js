Package.describe({
  name: 'danimal:mapmover',
  summary: 'Handle dragging and scaling of an element.',
  version: '1.0.8',
  git: 'https://github.com/dan335/mapmover'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1');
  api.use('reactive-var')
  api.addFiles('mapmover.js');
  api.export('Mapmover', 'client')
});
