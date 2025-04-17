export default function GuidePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">SFIN - SuperFinancial MCP服务器</h1>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">项目概述</h2>
            <p className="mb-4">
              SFIN是一个基于Model Context Protocol (MCP)的服务器，提供金融市场数据查询功能。
              通过SFIN，您可以轻松获取股票、指数的市场数据和估值数据，以及宏观经济指标数据。
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">核心功能</h2>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">搜索股票代码和指数代码</li>
              <li className="mb-2">搜索宏观指标</li>
              <li className="mb-2">查询股票和指数的历史行情数据</li>
              <li className="mb-2">查询股票和指数的历史估值数据</li>
              <li className="mb-2">查询宏观指标的历史数据</li>
              <li className="mb-2">支持多个交易代码和多个指标的批量查询</li>
              <li className="mb-2">通过SSE和可流式HTTP提供响应</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">如何使用</h2>
            <p className="mb-4">
              要使用SFIN服务，您需要获取API令牌。请点击上方的"申请令牌"按钮，填写申请表单。
              我们将通过邮件向您发送API令牌和使用说明。
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">配置示例</h2>
            <p className="mb-4">在Claude Desktop配置文件中添加以下配置：</p>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto mb-6">
{`{
  "mcpServers": {
    "sfin": {
      "command": "curl",
      "args": [
        "-N",
        "--header",
        "X-API-Token: YOUR_TOKEN_HERE",
        "https://sfin-mcp-server-production.up.railway.app/sse"
      ]
    }
  }
}`}
            </pre>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">技术实现</h2>
            <p className="mb-4">
              SFIN使用TypeScript开发，基于Node.js运行时环境。服务器使用@modelcontextprotocol/sdk实现MCP协议，
              使用mysql2连接MySQL数据库，通过Express提供Web服务，并使用Supabase进行认证和日志记录。
              服务器部署在Railway平台上，前端网站部署在Vercel上。
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            © 2025 SFIN. 保留所有权利。
          </p>
        </div>
      </div>
    </div>
  );
}
