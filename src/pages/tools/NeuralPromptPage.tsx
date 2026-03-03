import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Brain, Copy, Sparkles, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface PromptTemplate {
  id: string
  name: string
  category: string
  template: string
  variables: string[]
}

const promptTemplates: PromptTemplate[] = [
  {
    id: 'code-review',
    name: 'Code Review',
    category: 'Development',
    template: `You are an expert code reviewer. Review the following code for:
1. Bugs and potential errors
2. Performance issues
3. Security vulnerabilities
4. Code style and best practices
5. Suggestions for improvement

Code:
\`\`\`
{language}
{code}
\`\`\`

Please provide specific, actionable feedback.`,
    variables: ['language', 'code']
  },
  {
    id: 'explain-concept',
    name: 'Explain Concept',
    category: 'Learning',
    template: `Explain the concept of "{topic}" to me as if I were a {level}.
- Start with a simple analogy
- Provide technical details
- Include examples
- Mention common use cases

Keep it concise but comprehensive.`,
    variables: ['topic', 'level']
  },
  {
    id: 'debug-help',
    name: 'Debug Help',
    category: 'Development',
    template: `I'm experiencing an issue with my {language} code. Here's the situation:

**Problem:**
{problem}

**Code:**
\`\`\`
{code}
\`\`\`

**Expected Behavior:**
{expected}

**Actual Behavior:**
{actual}

**Error Messages:**
{errors}

Help me identify the root cause and provide a fix.`,
    variables: ['language', 'problem', 'code', 'expected', 'actual', 'errors']
  },
  {
    id: 'refactor',
    name: 'Code Refactoring',
    category: 'Development',
    template: `Refactor the following code to improve:
1. Readability
2. Maintainability
3. Performance (if applicable)
4. Following {language} best practices

Original code:
\`\`\`
{code}
\`\`\`

Explain your changes and why they improve the code.`,
    variables: ['language', 'code']
  },
  {
    id: 'api-design',
    name: 'API Design',
    category: 'Development',
    template: `Design a RESTful API for: {description}

Requirements:
- {features}

Provide:
1. Endpoint definitions (methods, paths, parameters)
2. Request/response examples
3. Authentication approach
4. Error handling strategy
5. Rate limiting considerations`,
    variables: ['description', 'features']
  },
  {
    id: 'write-tests',
    name: 'Write Tests',
    category: 'Development',
    template: `Write comprehensive unit tests for the following {language} code using {framework}.

Code to test:
\`\`\`
{code}
\`\`\`

Include:
1. Happy path tests
2. Edge cases
3. Error conditions
4. Mock examples if needed

Make tests follow AAA pattern (Arrange, Act, Assert).`,
    variables: ['language', 'framework', 'code']
  },
  {
    id: 'documentation',
    name: 'Generate Documentation',
    category: 'Documentation',
    template: `Generate comprehensive documentation for the following {language} {code_type}:

\`\`\`
{code}
\`\`\`

Include:
1. Overview/Purpose
2. Function signature
3. Parameters with types
4. Return value
5. Usage examples
6. Edge cases and error handling
7. Dependencies`,
    variables: ['language', 'code_type', 'code']
  },
  {
    id: 'optimize',
    name: 'Performance Optimization',
    category: 'Development',
    template: `Analyze and optimize the following {language} code for performance:

\`\`\`
{code}
\`\`\`

Current performance: {current_perf}

Target performance: {target_perf}

Provide:
1. Performance bottlenecks
2. Specific optimizations
3. Optimized code with explanations
4. Time/space complexity analysis`,
    variables: ['language', 'code', 'current_perf', 'target_perf']
  },
]

export default function NeuralPromptPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [generatedPrompt, setGeneratedPrompt] = useState('')

  const generatePrompt = useCallback(() => {
    if (!selectedTemplate) return

    let prompt = selectedTemplate.template
    for (const variable of selectedTemplate.variables) {
      const placeholder = `{${variable}}`
      const value = variables[variable] || `[${variable}]`
      prompt = prompt.replace(new RegExp(placeholder, 'g'), value)
    }

    setGeneratedPrompt(prompt)
    toast.success('Prompt generated!')
  }, [selectedTemplate, variables])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedPrompt)
    toast.success('Copied to clipboard!')
  }, [generatedPrompt])

  const handleReset = useCallback(() => {
    setSelectedTemplate(null)
    setVariables({})
    setGeneratedPrompt('')
  }, [])

  const categories = Array.from(new Set(promptTemplates.map(t => t.category)))

  const updateVariable = useCallback((key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }))
  }, [])

  return (
    <ToolLayout
      title="Neural Prompt Engineer"
      description="AI token & template laboratory"
      icon={<Brain className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Template Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-omni-text/50 uppercase">Select Template</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <div key={category} className="w-full">
                <div className="text-xs text-omni-text/40 mb-2 mt-2">{category}</div>
                <div className="flex flex-wrap gap-2">
                  {promptTemplates.filter(t => t.category === category).map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'bg-omni-primary text-white'
                          : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
                      }`}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Variables */}
        {selectedTemplate && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-omni-text/50 uppercase">Fill Variables</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedTemplate.variables.map(variable => (
                <div key={variable}>
                  <input
                    type="text"
                    value={variables[variable] || ''}
                    onChange={(e) => updateVariable(variable, e.target.value)}
                    placeholder={variable}
                    className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        {selectedTemplate && (
          <button
            onClick={generatePrompt}
            className="w-full py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Generate Prompt
          </button>
        )}

        {/* Generated Prompt */}
        {generatedPrompt && (
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
            <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10 flex items-center justify-between">
              <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Generated Prompt</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="text-xs text-omni-text/40 hover:text-omni-text flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
                <button
                  onClick={() => setGeneratedPrompt('')}
                  className="text-xs text-omni-text/40 hover:text-omni-text flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={generatedPrompt}
              className="flex-1 w-full bg-transparent border-none text-sm text-omni-text/70 p-4 focus:outline-none resize-none min-h-0"
            />
          </div>
        )}

        {/* Tips */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <h3 className="text-xs font-bold text-omni-text/50 uppercase mb-3">Prompt Engineering Tips</h3>
          <ul className="text-xs text-omni-text/60 space-y-2">
            <li>• Be specific and detailed in your requests</li>
            <li>• Provide context and background information</li>
            <li>• Use examples to clarify expectations</li>
            <li>• Specify the desired output format</li>
            <li>• Set constraints (length, style, technical level)</li>
            <li>• Iterate and refine your prompts</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
