import * as z from 'zod'
import { CreateItemRequest, ExamItem, UpdateItemRequest } from '../types/item'

const ContentParser = z.object({
    question: z.string(),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string(),
    explanation: z.string(),
  }).strict()

const MetadataParser = z.object({
    author: z.string(),
    created: z.number(),
    lastModified: z.number(),
    version: z.number(),
    status: z.string(), // from comments in item.ts this could be an enum
    tags: z.array(z.string()),
  }).strict()

const ExamItemParser = z.object({
  id: z.string(),
  subject: z.string(),
  itemType: z.string(), // from comments in item.ts this could be an enum
  difficulty: z.number(),
  content: ContentParser,
  metadata: MetadataParser,
  securityLevel: z.string(), // from comments in item.ts this could be an enum
}).strict()

const CreateItemRequestParser = z.object({
  subject: z.string(),
  itemType: z.string(), // from comments in item.ts this could be an enum
  difficulty: z.number(),
  content: ContentParser,
  metadata: MetadataParser.omit({ created: true, lastModified: true, version: true }),
  securityLevel: z.string(), // from comments in item.ts this could be an enum
}).strict()

const UpdateItemRequestParser = z.object({
  subject: z.string(),
  itemType: z.string(), // from comments in item.ts this could be an enum
  difficulty: z.number(),
  content: ContentParser.partial(),
  metadata: MetadataParser.partial(),
  securityLevel: z.string(), // from comments in item.ts this could be an enum
}).strict().partial()

export const validateExamItem = (data: any): ExamItem => {
  return ExamItemParser.parse(data)
}

export const validateCreateItemRequest = (data: any): CreateItemRequest => {
  return CreateItemRequestParser.parse(data)
}

export const validateUpdateItemRequest = (data: any): UpdateItemRequest => {
  return UpdateItemRequestParser.parse(data)
}

