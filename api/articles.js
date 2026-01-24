/**
 * 文章相关 API
 * 访问: /api/articles
 * 
 * 这是一个示例 API，展示如何在 Vercel 上使用 Node.js 后端
 * 你可以根据需要扩展功能，比如：
 * - 用户收藏文章
 * - 文章评论
 * - 阅读进度记录
 */

export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET: 获取文章列表或单个文章
  if (req.method === 'GET') {
    const { id } = req.query;

    if (id) {
      // 返回单个文章信息
      res.status(200).json({
        success: true,
        data: {
          id,
          message: '这是单个文章的数据，你可以从数据库或其他数据源获取'
        }
      });
    } else {
      // 返回文章列表
      res.status(200).json({
        success: true,
        data: {
          message: '这是文章列表数据，你可以从数据库获取',
          count: 0
        }
      });
    }
    return;
  }

  // POST: 创建或更新文章数据（比如收藏、评论等）
  if (req.method === 'POST') {
    const body = req.body;
    
    // 这里可以处理数据，比如保存到数据库
    // 示例：保存用户收藏
    res.status(200).json({
      success: true,
      message: '数据保存成功',
      data: body
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
