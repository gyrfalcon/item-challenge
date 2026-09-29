/**
 * Local Development Server
 *
 * A simple HTTP server for testing your handlers locally.
 * Run with: pnpm dev
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { getItemHandler, createItemHandler, updateItemHandler, getAuditTrailHandler } from './handlers';

const PORT = process.env.PORT || 3000;
const ITEM_PATH_PATTERN = /^\/api\/items\/([A-Za-z0-9-]+)$/
const AUDIT_PATH_PATTERN = /^\/api\/items\/([A-Za-z0-9-]+)\/audit$/

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const { method, url } = req;

  // Parse request body
  let body = '';
  req.on('data', chunk => body += chunk);
  await new Promise(resolve => req.on('end', resolve));

  const parsedBody = body ? JSON.parse(body) : null;

  console.log(`${method} ${url}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    let result;
    let id

    // Example routes - implement your own routing logic
    if (method === 'POST' && url === '/api/items') {
      result = await createItemHandler(parsedBody);
    } else if (ITEM_PATH_PATTERN.test(url!)) {
      const matcher = url?.match(ITEM_PATH_PATTERN)
      const id = matcher?.[1]
      if (method === 'GET') {
        result = await getItemHandler(id!)
      } else if (method === 'PUT') {
        result =  await updateItemHandler(id!, parsedBody)
      } else {
        result = {
          statusCode: 400,
          body: { error: `Unsupported operation ${method} on path ${url}` },
        }
      }
    } else if (AUDIT_PATH_PATTERN.test(url!)) {
      const matcher = url?.match(AUDIT_PATH_PATTERN)
      const id = matcher?.[1]
      result = await getAuditTrailHandler(id!)
    } else {
      result = {
        statusCode: 404,
        body: { error: 'Route not found' },
      };
    }

    res.writeHead(result.statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.body));
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`\nExample endpoints:`);
  console.log(`  POST   http://localhost:${PORT}/api/items`);
  console.log(`  GET    http://localhost:${PORT}/api/items/:id`);
  console.log(`\nPress Ctrl+C to stop\n`);
});
