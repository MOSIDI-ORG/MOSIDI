const messages = {};

// Automatically import all JSON files from the current folder
const modules = require.context('./', true, /\.json$/);

modules.keys().forEach((path) => {
  const locale = path.replace('./', '').replace('.json', '');
  messages[locale] = modules(path);
});

export default messages;