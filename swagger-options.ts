const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Documentation',
      version: '1.0.0',
      description: 'API documentation for Beer Tap Dispenser API',
    },
  },
  apis: ['./src/routes.ts'], // Point to your route files.
};

module.exports = options;

const specs = swaggerJsdoc(options);

module.exports = specs;
