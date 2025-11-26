const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('🔧 Setting up proxy for /api -> https://api.pujakaitem.com');
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.pujakaitem.com',
      changeOrigin: true,
      secure: true,
      logLevel: 'debug',
      // No pathRewrite needed - default behavior keeps the path
      onProxyReq: (proxyReq, req, res) => {
        console.log('🔄 [PROXY] Request:', req.method, req.url);
        console.log('🔄 [PROXY] Proxying to:', 'https://api.pujakaitem.com' + req.url);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('✅ [PROXY] Response:', proxyRes.statusCode, 'for', req.url);
      },
      onError: (err, req, res) => {
        console.error('❌ [PROXY] Error:', err.message);
        console.error('❌ [PROXY] Request URL:', req.url);
      },
    })
  );
  
  console.log('✅ Proxy configured successfully');
  console.log('📝 Example: /api/products -> https://api.pujakaitem.com/api/products');
};

