import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DevbuPlaytime API',
      version: '1.0.0',
      description: 'API REST para la plataforma educativa gamificada DevbuPlaytime',
      contact: { name: 'DEVBU93', email: 'rubenrodriguez.f.93@gmail.com' }
    },
    servers: [
      { url: process.env.API_URL || 'http://localhost:3001', description: 'Development' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
