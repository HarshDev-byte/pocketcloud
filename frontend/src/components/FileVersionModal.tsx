import { useState, useEffect } from 'react'
import { X, Clock, Download, RotateCcw, Trash2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import Button from './ui/Button'
import { FileItem } from '../services/fileService'

interface FileVersion {
  id: number
  version: number
  size: number
  formattedSize: string
  timestamp: string
  isCurrent: boolean
  comment?: string
}

interface FileVersionModalProps {
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
}

export default function FileVersionModal({ file, isOpen, onClose }: FileVersionModalProps) {
  const [versions, setVersions] = useState<FileVersion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (file && isOpen) {
      loadVersions()
    }
  }, [file, isOpen])

  const loadVersions = async () => {
    setIsLoading(true)
    try {
      // TODO: API call to fetch versions
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock data
      const mockVersions: FileVersion[] = [
        {
          id: 1,
          version: 3,
          size: 1024000,
          formattedSize: '1.0 MB',
          timestamp: new Date().toISOString(),
          isCurrent: true,
          comment: 'Latest version'
        },
        {
          id: 2,
          version: 2,
          size: 950000,
          formattedSize: '950 KB',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          isCurrent: false,
          comment: 'Updated content'
        },
        {
          id: 3,
          version: 1,
          size: 800000,
          formattedSize: '800 KB',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          isCurrent: false,
          comment: 'Initial version'
        },
      ]
      
      setVersions(mockVersions)
    } catch (error) {
      console.error('Failed to load versions:', error)
      toast.error('Failed to load file versions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadVersion = async (version: FileVersion) => {
    try {
      // TODO: API call to download specific version
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success(`Downloading version ${version.version}`)
    } catch (error) {
      toast.error('Failed to download version')
    }
  }

  const handleRestoreVersion = async (version: FileVersion) => {
    if (!confirm(`Restore to version ${version.version}? This will create a new version.`)) {
      return
    }

    try {
      // TODO: API call to restore version
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success(`Restored to version ${version.version}`)
      await loadVersions()
    } catch (error) {
      toast.error('Failed to restore version')
    }
  }

  const handleDeleteVersion = async (version: FileVersion) => {
    if (version.isCurrent) {
      toast.error('Cannot delete current version')
      return
    }

    if (!confirm(`Delete version ${version.version}? This cannot be undone.`)) {
      return
    }

    try {
      // TODO: API call to delete version
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success(`Version ${version.version} deleted`)
      await loadVersions()
    } catch (error) {
      toast.error('Failed to delete version')
    }
  }

  if (!isOpen || !file) return null

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
              <h2 className="text-lg font-semibold">Version History</h2>
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

        {/* Info Banner */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium">Version Control</p>
              <p className="text-blue-800 dark:text-blue-200 mt-1">
                PocketCloud automatically saves versions when you upload a file with the same name.
                You can restore or download any previous version.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No version history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <VersionItem
                  key={version.id}
                  version={version}
                  onDownload={() => handleDownloadVersion(version)}
                  onRestore={() => handleRestoreVersion(version)}
                  onDelete={() => handleDeleteVersion(version)}
                />
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

function VersionItem({
  version,
  onDownload,
  onRestore,
  onDelete,
}: {
  version: FileVersion
  onDownload: () => void
  onRestore: () => void
  onDelete: () => void
}) {
  return (
    <div className={`p-4 rounded-lg border transition-colors ${
      version.isCurrent
        ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm">
              Version {version.version}
            </h3>
            {version.isCurrent && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                Current
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {version.formattedSize} • {formatDistanceToNow(new Date(version.timestamp), { addSuffix: true })}
          </p>
          {version.comment && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {version.comment}
            </p>
          )}
        </div>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownload}
            title="Download this version"
          >
            <Download className="w-4 h-4" />
          </Button>
          {!version.isCurrent && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRestore}
                title="Restore this version"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                title="Delete this version"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
