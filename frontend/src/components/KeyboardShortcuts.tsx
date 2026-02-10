import { useEffect, useState } from 'react'
import { Keyboard, X } from 'lucide-react'
import Button from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'

interface Shortcut {
  keys: string[]
  description: string
  action: () => void
}

interface KeyboardShortcutsProps {
  shortcuts: Shortcut[]
}

export default function KeyboardShortcuts({ shortcuts }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts modal with ?
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setIsOpen(true)
        return
      }

      // Check for registered shortcuts
      shortcuts.forEach((shortcut) => {
        const keys = shortcut.keys
        const ctrl = keys.includes('ctrl') || keys.includes('cmd')
        const shift = keys.includes('shift')
        const alt = keys.includes('alt')
        const key = keys[keys.length - 1].toLowerCase()

        const ctrlPressed = e.ctrlKey || e.metaKey
        const shiftPressed = e.shiftKey
        const altPressed = e.altKey
        const keyPressed = e.key.toLowerCase()

        if (
          (!ctrl || ctrlPressed) &&
          (!shift || shiftPressed) &&
          (!alt || altPressed) &&
          key === keyPressed
        ) {
          e.preventDefault()
          shortcut.action()
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        title="Keyboard Shortcuts (?)"
      >
        <Keyboard className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </CardTitle>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {shortcut.description}
                </span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, i) => (
                    <kbd
                      key={i}
                      className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 <strong>Tip:</strong> Press <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded">?</kbd> anytime to view this list
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
