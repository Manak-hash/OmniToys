import { useState, useCallback, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Server, Copy, Plus, Trash2, Play } from 'lucide-react'
import { toast } from 'sonner'

interface MockEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  status: number
  response: string
  delay: number
}

export default function ApiMockPage() {
  const [endpoints, setEndpoints] = useState<MockEndpoint[]>([])
  const [currentEndpoint, setCurrentEndpoint] = useState<MockEndpoint>({
    id: '',
    method: 'GET',
    path: '',
    status: 200,
    response: '{\n  "message": "Success"\n}',
    delay: 0
  })
  const [activeTab, setActiveTab] = useState<'list' | 'test'>('list')

  const addEndpoint = useCallback(() => {
    if (!currentEndpoint.path) {
      toast.error('Please enter a path')
      return
    }

    const newEndpoint: MockEndpoint = {
      ...currentEndpoint,
      id: `${currentEndpoint.method}-${currentEndpoint.path}-${Date.now()}`
    }

    setEndpoints(prev => [...prev, newEndpoint])
    setCurrentEndpoint({
      id: '',
      method: 'GET',
      path: '',
      status: 200,
      response: '{\n  "message": "Success"\n}',
      delay: 0
    })
    toast.success('Endpoint added!')
  }, [currentEndpoint])

  const deleteEndpoint = useCallback((id: string) => {
    setEndpoints(prev => prev.filter(e => e.id !== id))
    toast.success('Endpoint deleted!')
  }, [])

  const loadEndpoint = useCallback((endpoint: MockEndpoint) => {
    setCurrentEndpoint(endpoint)
  }, [])

  const handleReset = useCallback(() => {
    setEndpoints([])
    setCurrentEndpoint({
      id: '',
      method: 'GET',
      path: '',
      status: 200,
      response: '{\n  "message": "Success"\n}',
      delay: 0
    })
  }, [])

  const testEndpoint = useCallback(async (endpoint: MockEndpoint) => {
    toast.info(`Simulating ${endpoint.method} ${endpoint.path}`)

    // Simulate delay
    if (endpoint.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, endpoint.delay))
    }

    try {
      const response = JSON.parse(endpoint.response)
      toast.success(`Response: ${endpoint.status} - ${JSON.stringify(response).substring(0, 50)}...`)
    } catch {
      toast.success(`Response: ${endpoint.status} - ${endpoint.response.substring(0, 50)}...`)
    }
  }, [])

  const generateMockCode = useCallback(() => {
    if (endpoints.length === 0) {
      toast.error('Add some endpoints first')
      return
    }

    const code = `// Service Worker Mock API
const mockEndpoints = {
${endpoints.map(e => `  '${e.method} ${e.path}': {
    status: ${e.status},
    response: ${e.response},
    delay: ${e.delay}
  }`).join(',\n')}
};

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const key = \`\${event.request.method} \${url.pathname}\`;

  if (mockEndpoints[key]) {
    const mock = mockEndpoints[key];

    event.respondWith((async () => {
      // Simulate delay
      if (mock.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, mock.delay));
      }

      return new Response(mock.response, {
        status: mock.status,
        headers: { 'Content-Type': 'application/json' }
      });
    })());
  }
});`

    navigator.clipboard.writeText(code)
    toast.success('Service Worker code copied!')
  }, [endpoints])

  const examples = useMemo(() => [
    {
      method: 'GET' as const,
      path: '/api/users',
      status: 200,
      response: JSON.stringify([
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ], null, 2),
      delay: 0
    },
    {
      method: 'POST' as const,
      path: '/api/users',
      status: 201,
      response: JSON.stringify({ id: 3, name: 'New User', email: 'new@example.com' }, null, 2),
      delay: 500
    },
  ], [])

  const loadExample = useCallback((index: number) => {
    const example = examples[index]
    setCurrentEndpoint({
      id: '',
      method: example.method,
      path: example.path,
      status: example.status,
      response: example.response,
      delay: example.delay
    })
  }, [examples])

  return (
    <ToolLayout
      title="API Mock Engine"
      description="Service worker based test server builder"
      icon={<Server className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
              activeTab === 'list'
                ? 'bg-omni-primary text-white'
                : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
            }`}
          >
            Endpoint Builder
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
              activeTab === 'test'
                ? 'bg-omni-primary text-white'
                : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
            }`}
          >
            Test Console
          </button>
        </div>

        {activeTab === 'list' && (
          <>
            {/* Endpoint Builder */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-omni-text/50 uppercase">Method</label>
                <select
                  value={currentEndpoint.method}
                  onChange={(e) => setCurrentEndpoint(prev => ({ ...prev, method: e.target.value as MockEndpoint['method'] }))}
                  className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-omni-text/50 uppercase">Path</label>
                <input
                  type="text"
                  value={currentEndpoint.path}
                  onChange={(e) => setCurrentEndpoint(prev => ({ ...prev, path: e.target.value }))}
                  placeholder="/api/users"
                  className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-omni-text/50 uppercase">Status</label>
                <select
                  value={currentEndpoint.status}
                  onChange={(e) => setCurrentEndpoint(prev => ({ ...prev, status: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
                >
                  <option value={200}>200 OK</option>
                  <option value={201}>201 Created</option>
                  <option value={204}>204 No Content</option>
                  <option value={400}>400 Bad Request</option>
                  <option value={401}>401 Unauthorized</option>
                  <option value={403}>403 Forbidden</option>
                  <option value={404}>404 Not Found</option>
                  <option value={500}>500 Server Error</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-omni-text/50 uppercase">Response Body (JSON)</label>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-omni-text/50">Delay: {currentEndpoint.delay}ms</label>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={currentEndpoint.delay}
                    onChange={(e) => setCurrentEndpoint(prev => ({ ...prev, delay: parseInt(e.target.value) }))}
                    className="w-24"
                  />
                </div>
              </div>
              <textarea
                value={currentEndpoint.response}
                onChange={(e) => setCurrentEndpoint(prev => ({ ...prev, response: e.target.value }))}
                placeholder='{ "message": "Success" }'
                className="w-full h-40 px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text font-mono focus:outline-none focus:border-omni-primary/30 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={addEndpoint}
                className="flex-1 py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Endpoint
              </button>
              <button
                onClick={generateMockCode}
                disabled={endpoints.length === 0}
                className="px-6 py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Copy className="w-4 h-4" /> Copy SW Code
              </button>
            </div>

            {/* Examples */}
            <div className="flex gap-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => loadExample(index)}
                  className="px-3 py-1 bg-omni-text/5 hover:bg-omni-text/10 rounded text-xs text-omni-text"
                >
                  {example.method} {example.path}
                </button>
              ))}
            </div>

            {/* Endpoints List */}
            {endpoints.length > 0 && (
              <div className="flex-1 overflow-auto">
                <h3 className="text-xs font-bold text-omni-text/50 uppercase mb-3">Configured Endpoints ({endpoints.length})</h3>
                <div className="space-y-2">
                  {endpoints.map((endpoint) => (
                    <div
                      key={endpoint.id}
                      className="p-3 bg-omni-bg/30 rounded-lg border border-omni-text/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          endpoint.method === 'GET' ? 'bg-green-500/20 text-green-500' :
                          endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-500' :
                          endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-500' :
                          endpoint.method === 'DELETE' ? 'bg-red-500/20 text-red-500' :
                          'bg-purple-500/20 text-purple-500'
                        }`}>
                          {endpoint.method}
                        </span>
                        <span className="text-sm font-mono text-omni-text">{endpoint.path}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          endpoint.status < 300 ? 'bg-green-500/20 text-green-500' :
                          endpoint.status < 400 ? 'bg-yellow-500/20 text-yellow-500' :
                          endpoint.status < 500 ? 'bg-orange-500/20 text-orange-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {endpoint.status}
                        </span>
                        {endpoint.delay > 0 && (
                          <span className="text-xs text-omni-text/40">({endpoint.delay}ms)</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadEndpoint(endpoint)}
                          className="p-2 hover:bg-omni-text/10 rounded transition-colors"
                          title="Load"
                        >
                          <Copy className="w-4 h-4 text-omni-text/50" />
                        </button>
                        <button
                          onClick={() => deleteEndpoint(endpoint.id)}
                          className="p-2 hover:bg-omni-text/10 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-omni-text/50" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'test' && (
          <>
            {/* Test Console */}
            {endpoints.length > 0 ? (
              <div className="flex-1 overflow-auto">
                <h3 className="text-xs font-bold text-omni-text/50 uppercase mb-3">Test Console</h3>
                <div className="space-y-2">
                  {endpoints.map((endpoint) => (
                    <div
                      key={endpoint.id}
                      className="p-4 bg-omni-bg/30 rounded-lg border border-omni-text/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            endpoint.method === 'GET' ? 'bg-green-500/20 text-green-500' :
                            endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-500' :
                            endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-500' :
                            endpoint.method === 'DELETE' ? 'bg-red-500/20 text-red-500' :
                            'bg-purple-500/20 text-purple-500'
                          }`}>
                            {endpoint.method}
                          </span>
                          <span className="text-sm font-mono text-omni-text">{endpoint.path}</span>
                        </div>
                        <button
                          onClick={() => testEndpoint(endpoint)}
                          className="px-3 py-1 bg-omni-primary hover:bg-omni-primary-hover text-white rounded text-xs font-bold uppercase flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" /> Test
                        </button>
                      </div>
                      <pre className="text-xs text-omni-text/70 font-mono overflow-auto max-h-32">
                        {endpoint.response}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-omni-text/40">
                <div className="text-center">
                  <Server className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Add some endpoints to test</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}
