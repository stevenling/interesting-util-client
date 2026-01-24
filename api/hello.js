/**
 * Vercel Serverless Function 示例
 * 访问: /api/hello
 */
export default function handler(req, res) {
  // 设置 CORS 头，允许跨域请求
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 处理 GET 请求
  if (req.method === 'GET') {
    res.status(200).json({
      message: 'Hello from Vercel Serverless Function!',
      timestamp: new Date().toISOString(),
      method: req.method
    });
    return;
  }

  // 处理 POST 请求
  if (req.method === 'POST') {
    const body = req.body;
    res.status(200).json({
      message: 'Data received successfully',
      received: body,
      timestamp: new Date().toISOString()
    });
    return;
  }

  // 其他方法
  res.status(405).json({ error: 'Method not allowed' });
}
