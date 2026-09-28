/**
 * Example Test File
 *
 * This demonstrates how to write tests for your handlers.
 * You can use this as a template for testing your implemented endpoints.
 *
 * To run tests:
 *   pnpm test           - Run once
 *   pnpm test:watch     - Run in watch mode
 *   pnpm test:ui        - Run with interactive UI
 */

import { beforeEach, describe, expect, it } from "vitest";
import { createItemHandler, getItemHandler, storage, updateItemHandler } from "../handlers";

describe("Handlers", () => {
  describe("createItemHandler", () => {
    it("should create an item successfully", async () => {
      const itemData = {
        subject: "AP Biology",
        itemType: "multiple-choice",
        difficulty: 3,
        content: {
          question: "What is photosynthesis?",
          options: ["A", "B", "C", "D"],
          correctAnswer: "A",
          explanation: "Photosynthesis is the process...",
        },
        metadata: {
          author: "test-author",
          status: "draft",
          tags: ["biology", "photosynthesis"],
        },
        securityLevel: "standard",
      };

      const result = await createItemHandler(itemData);

      expect(result.statusCode).toBe(201);
      expect(result.body).toHaveProperty("id");
      if ("subject" in result.body) {
        expect(result.body.subject).toBe("AP Biology");
      }
      if ("metadata" in result.body) {
        expect(result.body.metadata).toHaveProperty("author", "test-author");
      }
    });

    it("should return an error for an invalid item", async () => {
      const itemData = {
        subject: "AP Biology",
        itemType: "multiple-choice",
        content: {
          question: "What is photosynthesis?",
          options: ["A", "B", "C", "D"],
          correctAnswer: "A",
          explanation: "Photosynthesis is the process...",
        },
        metadata: {
          author: "test-author",
          status: "draft",
          tags: ["biology", "photosynthesis"],
        },
        securityLevel: "standard",
      };

      const result = await createItemHandler(itemData);

      expect(result.statusCode).toBe(400);
      expect(result.body).toHaveProperty('error');
      if ('error' in result.body) {
        expect(result.body.error).toBe('Incoming item structure invalid');
      }
    });
  });

  describe("getItemHandler", () => {
    it("should return 404 for non-existent item", async () => {
      const result = await getItemHandler("non-existent-id");

      expect(result.statusCode).toBe(404);
      expect(result.body).toHaveProperty("error");
      if ("error" in result.body) {
        expect(result.body.error).toBe("Item not found");
      }
    });

    it("should retrieve an existing item", async () => {
      // First create an item
      const itemData = {
        subject: "AP Calculus",
        itemType: "free-response",
        difficulty: 4,
        content: {
          question: "Calculate the derivative...",
          correctAnswer: "42",
          explanation: "Using the chain rule...",
        },
        metadata: {
          author: "test-author",
          status: "approved",
          tags: ["calculus", "derivatives"],
        },
        securityLevel: "standard",
      };

      const createResult = await createItemHandler(itemData);
      expect(createResult.body).toHaveProperty("id");
      if (!("id" in createResult.body)) {
        throw new Error("Item creation failed");
      }
      const itemId = createResult.body.id;

      // Then retrieve it
      const getResult = await getItemHandler(itemId);

      expect(getResult.statusCode).toBe(200);
      expect(getResult.body).toHaveProperty("id", itemId);
      if ("subject" in getResult.body) {
        expect(getResult.body.subject).toBe("AP Calculus");
      }
    });

    it("should return an error for an invalid existing item", async () => {
      // First create an item
      const itemData = {
        subject: "AP Calculus",
        difficulty: 4,
        content: {
          question: "Calculate the derivative...",
          correctAnswer: "42",
          explanation: "Using the chain rule...",
        },
        metadata: {
          author: "test-author",
          status: "approved",
          tags: ["calculus", "derivatives"],
        },
        securityLevel: "standard",
      };

      // create directly in storage to bypass createItemHandler's validation
      // @ts-expect-error we're knowingly passing in an invalid type here
      const createResult = await storage.createItem(itemData)

      const itemId = createResult.id;

      // Then retrieve it
      const getResult = await getItemHandler(itemId);

      expect(getResult.statusCode).toBe(500);
      expect(getResult.body).toHaveProperty('error', 'Internal server error');
    });
  });

  describe('updateItemHandler', () => {
    it('should update an item', async () => {
      // create an item
      const itemData = {
        subject: "AP Calculus",
        itemType: "free-response",
        difficulty: 4,
        content: {
          question: "Calculate the derivative...",
          correctAnswer: "42",
          explanation: "Using the chain rule...",
        },
        metadata: {
          author: "test-author",
          status: "approved",
          tags: ["calculus", "derivatives"],
        },
        securityLevel: "standard",
      };

      const item = await storage.createItem(itemData)

      const itemUpdate = {
        subject: 'AP Spelling',
      }

      const response = await updateItemHandler(item.id, itemUpdate)

      expect(response.statusCode).toBe(200)
      if ('subject' in response.body) {
        expect(response.body.subject).toBe('AP Spelling')
      }
      const storedItem = await storage.getItem(item.id)
      expect(storedItem?.subject).toBe('AP Spelling')
    })

    it('should return an error if an invalid property is being updated', async () => {
      const itemUpdate = {
        myCoolNewProperty: 'AP Spelling',
      }

      const response = await updateItemHandler('testId', itemUpdate)

      expect(response.statusCode).toEqual(400)
      if ('error' in response.body) {
        expect(response.body.error).toBe('Invalid update data')
      }
    })
  })
});
