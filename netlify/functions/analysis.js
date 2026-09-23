import { analyses } from './data.js';

export async function handler(event) {
  let id = event.queryStringParameters?.id;
  if (!id && event.path) {
    const parts = event.path.split('/');
    id = parts[parts.length - 1];
  }

  const analysis = analyses?.[id];

  if (!analysis) {
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: `No analysis found for id '${id}'`,
      }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      success: true,
      data: analysis,
    }),
  };
}
