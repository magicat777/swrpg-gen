const weaviate = require('weaviate-ts-client');

console.log('Available methods:', Object.keys(weaviate.default));

const client = weaviate.default.client({
  scheme: 'http',
  host: 'localhost:8080',
});

console.log('Client created:', !!client);
console.log('Client methods:', Object.keys(client));

// Try misc.metaGetter instead
client.misc.metaGetter().do()
  .then(result => {
    console.log('Meta result:', result);
  })
  .catch(error => {
    console.error('Meta error:', error);
    
    // Fallback: try to get schema
    client.schema.getter().do()
      .then(schema => {
        console.log('Schema result:', schema);
      })
      .catch(err => {
        console.error('Schema error:', err);
      });
  });