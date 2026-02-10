import { useState, useEffect } from 'react'
import { Clock, Upload, Download, Trash2, Share2, Edit, Eye, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Button from './ui/Button'
import { Card, CardContent } from './ui/Card'

export interface ActivityItem {
  id: number
  action: 'upload' | 'download' | 'delete' | 'share' | 'edit' | 'view'
  filename: string
  timestamp: string
  details?: string
}

interface ActivityLogProps {
  isOpen: boolean
  onClose: () => void
}

export default function ActivityLog({ isOpen, onClose }: ActivityLogProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    if (isOpen) {
      loadActivities()
    }
  }, [isOpen])

  const loadActivities = async () => {
    setIsLoading(true)
    try {
      // TODO: API call to fetch activities
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock data
      const mockActivities: ActivityItem[] = [
        {
          id: 1,
          action: 'upload',
          filename: 'document.pdf',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          details: 'Uploaded successfully'
        },
        {
          id: 2,
          action: 'download',
          filename: 'image.jpg',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: 3,
          action: 'share',
          filename: 'report.docx',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          details: 'Shared with link'
        },
        {
          id: 4,
          action: 'delete',
          filename: 'old-file.txt',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
      ]
      
      setActivities(mockActivities)
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.action === filter)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Activity Log</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recent file operations
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

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'upload', 'download', 'share', 'delete'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No activities yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ activity }: { activity: ActivityItem }) {
  const getIcon = () => {
    switch (activity.action) {
      case 'upload': return <Upload className="w-4 h-4" />
      case 'download': return <Download className="w-4 h-4" />
      case 'delete': return <Trash2 className="w-4 h-4" />
      case 'share': return <Share2 className="w-4 h-4" />
      case 'edit': return <Edit className="w-4 h-4" />
      case 'view': return <Eye className="w-4 h-4" />
    }
  }

  const getColor = () => {
    switch (activity.action) {
      case 'upload': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'download': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'delete': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'share': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20'
      case 'edit': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
      case 'view': return 'text-gray-600 bg-gray-100 dark:bg-gray-800'
    }
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className={`p-2 rounded-lg ${getColor()}`}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">
          {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {activity.filename}
        </p>
        {activity.details && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {activity.details}
          </p>
        )}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
      </div>
    </div>
  )
}
