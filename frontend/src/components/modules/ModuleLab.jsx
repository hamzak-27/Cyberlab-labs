// src/components/modules/ModuleLab.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Play, Target, Clock } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'

export default function ModuleLab({ module, onComplete }) {
  const [completedSteps, setCompletedSteps] = useState([])
  const [isLabStarted, setIsLabStarted] = useState(false)

  const toggleStepComplete = (stepIndex) => {
    const newCompleted = completedSteps.includes(stepIndex)
      ? completedSteps.filter(i => i !== stepIndex)
      : [...completedSteps, stepIndex]
    
    setCompletedSteps(newCompleted)
    
    // Mark lab as complete if all steps are completed
    const allCompleted = newCompleted.length === module.lab.steps.length
    if (allCompleted !== module.completion.lab) {
      onComplete(allCompleted)
    }
  }

  const startLab = () => {
    // TODO: Replace with actual lab environment API
    console.log('Starting lab:', module.lab.title)
    setIsLabStarted(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Lab Header */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{module.lab.title}</h2>
            <p className="text-gray-400">{module.description}</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {module.lab.duration}
            </div>
          </div>
        </div>

        {!isLabStarted ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🔬</div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              Ready to Start the Lab?
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              This hands-on lab will help you practice the concepts you've learned in a real-world scenario.
            </p>
            <Button
              size="lg"
              icon={<Play className="w-5 h-5" />}
              onClick={startLab}
            >
              Start Lab Environment
            </Button>
          </div>
        ) : (
          <div className="text-green-400 text-center py-4 border border-green-400/20 rounded-lg bg-green-400/10">
            ✅ Lab environment is running
          </div>
        )}
      </Card>

      {/* Lab Objective */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
        <div className="flex items-start gap-3">
          <Target className="w-6 h-6 text-cyan-400 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Lab Objective</h3>
            <p className="text-gray-300">{module.lab.objective}</p>
          </div>
        </div>
      </Card>

      {/* Lab Steps */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
        <h3 className="text-xl font-semibold text-white mb-4">Lab Steps</h3>
        <div className="space-y-3">
          {module.lab.steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 bg-gray-700/30 rounded-lg"
            >
              <button
                onClick={() => toggleStepComplete(index)}
                className={`flex-shrink-0 mt-1 ${
                  completedSteps.includes(index)
                    ? 'text-green-400'
                    : 'text-gray-400 hover:text-green-400'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
              </button>
              
              <div className="flex-1">
                <div className="text-white mb-1">
                  <span className="font-semibold">Step {index + 1}:</span> {step}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Expected Outcome */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
        <h3 className="text-xl font-semibold text-white mb-4">Expected Outcome</h3>
        <p className="text-gray-300 leading-relaxed">{module.lab.expectedOutcome}</p>
      </Card>

      {/* Lab Actions */}
      <div className="flex gap-4">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => {
            // TODO: Implement lab reset functionality
            console.log('Reset lab')
          }}
        >
          Reset Lab
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            // TODO: Implement lab completion and submission
            console.log('Submit lab')
          }}
        >
          Submit Lab Work
        </Button>
      </div>
    </motion.div>
  )
}