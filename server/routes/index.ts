import { schema } from '@osd/config-schema';
import { IRouter } from '../../../../src/core/server';

export function defineRoutes(router: IRouter) {
  router.get(
    {
      path: '/api/transform_vis/example',
      validate: false,
    },
    async (context, request, response) => {
      return response.ok({
        body: {
          time: new Date().toISOString(),
        },
      });
    }
  );
  router.get(
    {
      path: '/api/transform_vis/cluster/_health',
      validate: false,
    },
    async (context, request, response) => {
      const data = await context.core.opensearch.legacy.client.callAsCurrentUser('cluster.health');
      return response.ok({
        body: {
          time: Object.keys(data.status),
        },
      });
    }
  );
  router.get(
    {
      path: '/api/transform_vis/cat/indices',
      validate: false,
    },
    async (context, request, response) => {
      const data = await context.core.opensearch.legacy.client.callAsCurrentUser('cat.indices');
      return response.ok({
        body: {
          data,
          time: new Date().toISOString(),
        },
      });
    }
  );

  // Create a mapping for a selected index
  router.post(
    {
      path: '/api/transform_vis/{index}/_search',
      validate: {
        body: schema.any(),
        params: schema.any(),
      },
    },
    async (context, request, response) => {
      try {
        const data = await await context.core.opensearch.legacy.client.callAsCurrentUser('search', {
          index: request.params.index,
          body: request.body.body,
        });
        return response.ok({
          body: {
            data,
            time: new Date().toISOString(),
          },
        });
      } catch (error) {
        return response.ok({
          body: {
            message: error,
          },
        });
      }
    }
  );

  router.post(
    {
      path: '/api/transform_vis/create/indice/{index}',
      validate: {
        params: schema.any(),
      },
    },
    async (context, request, response) => {
      try {
        const data = await context.core.opensearch.legacy.client.callAsCurrentUser(
          'indices.create',
          { index: request.params.index }
        );
        return response.ok({
          body: {
            data,
            time: new Date().toISOString(),
          },
        });
      } catch (error) {
        return response.ok({
          body: {
            message: error,
          },
        });
      }
    }
  );

  // Create a mapping for a selected index
  router.post(
    {
      path: '/api/transform_vis/{index}/_mapping',
      validate: {
        body: schema.any(),
        params: schema.any(),
      },
    },
    async (context, request, response) => {
      try {
        const data = await context.core.opensearch.legacy.client.callAsCurrentUser(
          'indices.putMapping',
          {
            index: request.params.index,
            body: {
              properties: request.body.body,
            },
          }
        );
        return response.ok({
          body: {
            data,
            time: new Date().toISOString(),
          },
        });
      } catch (error) {
        return response.ok({
          body: {
            message: 'error',
          },
        });
      }
    }
  );

  // Create a mapping for a selected index
  router.post(
    {
      path: '/api/transform_vis/{index}/_bulk',
      validate: {
        body: schema.any(),
        params: schema.any(),
        query: schema.any(),
      },
    },
    async (context, request, response) => {
      try {
        const pipeline = request.query.pipeline || false;
        const data = await await context.core.opensearch.legacy.client.callAsCurrentUser('bulk', {
          ...(pipeline && { pipeline }),
          body: request.body,
        });
        return response.ok({
          body: {
            data,
            time: new Date().toISOString(),
          },
        });
      } catch (error) {
        return response.ok({
          body: {
            message: error,
          },
        });
      }
    }
  );

  // checking index
  router.post(
    {
      path: '/api/transform_vis/{index}/_exists',
      validate: {
        params: schema.any(),
      },
    },
    async (context, request, response) => {
      try {
        const data = await context.core.opensearch.legacy.client.callAsCurrentUser('indices.get', {
          index: request.params.index,
        });
        return response.ok({
          body: {
            data,
            time: new Date().toISOString(),
          },
        });
      } catch (error) {
        return response.ok({
          body: {
            message: error,
          },
        });
      }
    }
  );
}
