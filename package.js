Package.describe({
  name: 'danimal:mapmover',
  summary: 'Handle dragging and scaling of an element.',
  version: '1.1.0',
  git: 'https://github.com/dan335/mapmover'
});

Package.onUse(function(api) {
  api.versionsFrom(['2.16', '3.0']);
  api.use([
    'reactive-var',
    'underscore'
  ])
  api.addFiles('mapmover.js', 'client');
  api.export('Mapmover', 'client')
});
