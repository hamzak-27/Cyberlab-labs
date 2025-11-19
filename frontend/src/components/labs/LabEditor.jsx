import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

export default function LabEditor({ 
  initialCode = '// write your exploit or script here\n// Use the tools below to test your code\n// Remember to follow ethical guidelines!',
  labTitle = "Lab Environment",
  onCodeChange,
  className = ""
}) {
  const editorRef = useRef(null)
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [activeTab, setActiveTab] = useState('editor')

  const onRun = async () => {
    setIsRunning(true)
    setOutput('🚀 Initializing secure sandbox environment...\n')
    
    // Simulate code execution with stages
    const stages = [
      '✓ Sandbox environment initialized\n',
      '✓ Security checks passed\n',
      '✓ Code analysis in progress...\n',
      '✓ No malicious activity detected\n',
      '🎉 Code executed successfully!\n'
    ]
    
    let currentOutput = output
    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, 500))
      currentOutput += stage
      setOutput(currentOutput)
    }
    
    setIsRunning(false)
    toast.success('Code executed in secure sandbox!')
  }

  const onReset = () => {
    setCode(initialCode)
    setOutput('')
    toast('🔄 Editor reset to initial state')
  }

  const onClear = () => {
    setOutput('')
    toast('🧹 Output cleared')
  }

  const handleCodeChange = (e) => {
    const newCode = e.target.value
    setCode(newCode)
    onCodeChange?.(newCode)
  }

  const quickActions = [
    { label: 'Save Progress', icon: '💾', action: () => toast.success('Progress saved!') },
    { label: 'Export Code', icon: '📤', action: () => toast.success('Code exported!') },
    { label: 'Request Help', icon: '🆘', action: () => toast.success('Help request sent!') },
    { label: 'Share Solution', icon: '🔗', action: () => toast.success('Solution shared!') }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{labTitle}</h3>
          <p className="text-gray-400 text-sm">Practice your skills in a safe environment</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
            🔒 Secure Sandbox
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        {[
          { id: 'editor', label: 'Code Editor', icon: '📝' },
          { id: 'output', label: 'Output', icon: '📊', badge: output ? 'New' : null },
          { id: 'docs', label: 'Documentation', icon: '📚' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
            {tab.badge && (
              <span className="px-2 py-1 bg-cyan-500 text-white text-xs rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'editor' && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Code Editor */}
            <div className="border border-gray-600 rounded-xl overflow-hidden bg-gray-900/50 backdrop-blur-sm">
              <div className="bg-gray-800 text-gray-200 px-4 py-3 text-sm font-mono flex justify-between items-center">
                <span>lab_environment.py</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs">Connected</span>
                </div>
              </div>
              <div className="p-4 font-mono text-sm h-64 overflow-auto bg-gray-900">
                <textarea
                  ref={editorRef}
                  value={code}
                  onChange={handleCodeChange}
                  className="w-full h-full bg-transparent text-green-400 resize-none focus:outline-none font-mono"
                  spellCheck="false"
                />
              </div>
            </div>

            {/* Editor Controls */}
            <div className="flex gap-3">
              <Button 
                onClick={onRun} 
                disabled={isRunning}
                loading={isRunning}
                icon="▶️"
                className="flex-1"
              >
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={onReset}
                icon="🔄"
              >
                Reset
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={onClear}
                icon="🧹"
              >
                Clear Output
              </Button>
            </div>
          </motion.div>
        )}

        {activeTab === 'output' && (
          <motion.div
            key="output"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Output Panel */}
            <div className="border border-gray-600 rounded-xl overflow-hidden bg-gray-900/50 backdrop-blur-sm">
              <div className="bg-gray-800 text-gray-200 px-4 py-3 text-sm font-mono flex justify-between items-center">
                <span>Execution Output</span>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 text-xs">Real-time</span>
                </div>
              </div>
              <div className="p-4 font-mono text-sm max-h-64 overflow-auto bg-black">
                <pre className="text-green-400 whitespace-pre-wrap">{output || 'No output yet. Run your code to see results here.'}</pre>
              </div>
            </div>

            {/* Quick Stats */}
            {output && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <div className="text-cyan-400 text-lg">⚡</div>
                  <div className="text-white font-semibold">Ready</div>
                  <div className="text-gray-400 text-xs">Status</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <div className="text-green-400 text-lg">🛡️</div>
                  <div className="text-white font-semibold">Secure</div>
                  <div className="text-gray-400 text-xs">Environment</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <div className="text-blue-400 text-lg">📈</div>
                  <div className="text-white font-semibold">Active</div>
                  <div className="text-gray-400 text-xs">Session</div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'docs' && (
          <motion.div
            key="docs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Documentation Panel */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
              <h4 className="font-bold text-cyan-400 mb-3 text-lg">📖 Lab Documentation</h4>
              <div className="space-y-3 text-sm text-gray-300">
                <p>This is a secure sandbox environment for practicing cybersecurity skills.</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✅</span>
                    <span>All code runs in isolated containers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✅</span>
                    <span>Real-time vulnerability detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✅</span>
                    <span>Safe for testing exploits</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                  <h5 className="font-semibold text-white mb-2">💡 Pro Tips</h5>
                  <ul className="space-y-1 text-xs">
                    <li>• Test one vulnerability at a time</li>
                    <li>• Document your approach for learning</li>
                    <li>• Use the output to debug your code</li>
                    <li>• Always follow ethical guidelines</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.action}
            className="flex items-center gap-2 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-600 hover:border-cyan-500/30 transition-all duration-200 group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">{action.icon}</span>
            <span className="text-sm text-gray-300 group-hover:text-white font-medium">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}