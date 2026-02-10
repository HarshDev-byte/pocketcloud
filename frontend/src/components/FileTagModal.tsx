import { useState, useEffect } from 'react'
import { X, Tag, Plus, Check } from 'lucide-react'
import { toast } from 'sonner'
import Button from './ui/Button'
import Input from './ui/Input'
import { FileItem } from '../services/fileService'

interface FileTagModalProps {
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
  onTagsUpdated?: () => void
}

const PREDEFINED_TAGS = [
  'Work',
  'Personal',
  'Important',
  'Archive',
  'Project',
  'Document',
  'Image',
  'Video',
  'Backup',
  'Shared'
]

export default function FileTagModal({ file, isOpen, onClose, onTagsUpdated }: FileTagModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (file && isOpen) {
      // TODO: Load existing tags from API
      setSelectedTags([])
    }
  }, [file, isOpen])

  if (!isOpen || !file) return null

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const addCustomTag = () => {
    const tag = customTag.trim()
    if (!tag) return
    
    if (selectedTags.includes(tag)) {
      toast.error('Tag already added')
      return
    }

    setSelectedTags(prev => [...prev, tag])
    setCustomTag('')
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: API call to save tags
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast.success('Tags updated successfully')
      onTagsUpdated?.()
      onClose()
    } catch (error) {
      toast.error('Failed to update tags')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Tag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Manage Tags</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                {file.filename}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Selected Tags</label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Predefined Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Quick Tags</label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Tag */}
          <div>
            <label className="block text-sm font-medium mb-2">Add Custom Tag</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                placeholder="Enter custom tag..."
                className="flex-1"
              />
              <Button onClick={addCustomTag} disabled={!customTag.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={isSaving} className="flex-1">
            Save Tags
          </Button>
        </div>
      </div>
    </div>
  )
}
