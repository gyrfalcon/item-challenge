/**
 * Example Handler
 *
 * This demonstrates how to create a handler for the API.
 * You can use this as a template for implementing the required endpoints.
 */

import * as z from 'zod';
import { validateExamItem, validateCreateItemRequest, validateUpdateItemRequest } from '../lib/validation.js';
import { createStorage } from '../storage/index.js';

// Exporting this for use in unit tests;
// ideally I would mock createStorage for
// the tests but I ran into an issue using
// vitest's mock and decided not to spend
// exercise time on chasing it down.
export const storage = createStorage();

export const getItemHandler = async (id: string) => {
  try {
    const item = await storage.getItem(id);

    if (!item) {
      return {
        statusCode: 404,
        body: { error: 'Item not found' },
      };
    }

    return {
      statusCode: 200,
      body: validateExamItem(item),
    };
  } catch (error) {
    console.error(`Error getting item: ${id}`, error);
    return {
      statusCode: 500,
      body: { error: 'Internal server error' },
    };
  }
}

export const createItemHandler = async (data: any) => {
  try {
    const newItem = validateCreateItemRequest(data)
    const item = await storage.createItem(newItem);

    return {
      statusCode: 201,
      body: item,
    };
  } catch (error) {
    console.error('Error creating item', { data, error });
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        body: {
          error: 'Incoming item structure invalid',
          detail: z.treeifyError(error)
        },
      }
    }

    return {
      statusCode: 500,
      body: { error: 'Internal server error' },
    };
  }
}

export const updateItemHandler = async (id: string, data: any) => {
  try {
    const updateRequest = validateUpdateItemRequest(data)

    const updatedItem = await storage.updateItem(id, updateRequest)

    if (!updatedItem) {
      return {
        statusCode: 404,
        body: { error: 'Item not found' },
      };
    }

    return {
      statusCode: 200,
      body: updatedItem,
    }
  } catch (error) {
    console.error(`Error while handling an item update for item ${id}`, error)
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        body: {
          error: 'Invalid update data',
          detail: z.treeifyError(error),
        }
      }
    }

    return {
      statusCode: 500,
      body: { error: 'Internal server error' },
    }
  }
}

export const getAuditTrailHandler = async (id: string) => {
  try {
    const auditLog = await storage.getAuditTrail(id)

    return {
      statusCode: 200,
      body: auditLog,
    }
  } catch (error) {
    console.error(`Error while getting the audit trail for item ${id}`, error)
    return {
      statusCode: 500,
      body: { error: 'Internal server error' },
    }
  }
}

// TODO: Implement other handlers:
// - listItemsHandler
// - createVersionHandler
