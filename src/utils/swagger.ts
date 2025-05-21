import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Similar Products API',
    version: '1.0.0',
    description: 'API para obtener productos similares a un producto dado',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: '/',
      description: 'Server',
    },
  ],
  paths: {
    '/product/{productId}/similar': {
      get: {
        summary: 'Obtiene productos similares a un producto dado',
        description:
          'Retorna una lista de productos similares al producto especificado por su ID. Esta ruta está sujeta a rate limiting (50 solicitudes cada 5 minutos por IP).',
        tags: ['Products'],
        parameters: [
          {
            in: 'path',
            name: 'productId',
            schema: {
              type: 'string',
            },
            required: true,
            description: 'ID del producto para encontrar similares',
          },
        ],
        responses: {
          '200': {
            description: 'Lista de productos similares',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        description: 'ID del producto',
                      },
                      name: {
                        type: 'string',
                        description: 'Nombre del producto',
                      },
                      price: {
                        type: 'number',
                        description: 'Precio del producto',
                      },
                      availability: {
                        type: 'boolean',
                        description: 'Disponibilidad del producto',
                      },
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Producto no encontrado',
          },
          '429': {
            description: 'Demasiadas solicitudes. Por favor, intente más tarde.',
          },
          '500': {
            description: 'Error del servidor',
          },
        },
      },
    },
    '/health': {
      get: {
        summary: 'Verificación de salud de la API',
        description: 'Endpoint para verificar que la API está funcionando correctamente',
        tags: ['System'],
        responses: {
          '200': {
            description: 'API funcionando correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'success',
                    },
                    message: {
                      type: 'string',
                      example: 'API is running',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export function setupSwagger(app: Application): void {
  // Ruta para la documentación de Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Ruta para obtener el JSON de Swagger
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('Swagger UI setup complete with manual specification. Available at /api-docs');
}
