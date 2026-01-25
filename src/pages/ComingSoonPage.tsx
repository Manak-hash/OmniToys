import { ToolLayout } from '@/components/tools/ToolLayout'
import { Construction } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function ComingSoonPage() {
  const location = useLocation()
  
  // Extract tool name from path (e.g. /tools/z-index -> Z-Index)
  const pathParts = location.pathname.split('/')
  const rawId = pathParts[pathParts.length - 1] || 'Unknown'
  const toolName = rawId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <ToolLayout
      title={toolName}
      description="This tool is currently under construction."
      icon={<Construction className="w-8 h-8" />}
    >
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
        <div className="w-24 h-24 bg-omni-bg/50 rounded-full flex items-center justify-center border border-omni-text/10">
            <Construction className="w-12 h-12 text-omni-primary/50" />
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-bold text-omni-text">Coming Soon</h2>
            <p className="text-omni-text/60 max-w-md mx-auto">
                We are currently building the <strong>{toolName}</strong> tool. 
                Check back later or explore our other available tools.
            </p>
        </div>
        <Link 
            to="/tools" 
            className="px-6 py-2 bg-omni-text/10 hover:bg-omni-text/20 text-omni-text rounded-lg transition-colors font-medium"
        >
            Explore Other Tools
        </Link>
      </div>
    </ToolLayout>
  )
}
