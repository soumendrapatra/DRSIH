import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const data = require('./data.json');

export async function handler() {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      success: true,
      data: data.slots || [],
    }),
  };
}
