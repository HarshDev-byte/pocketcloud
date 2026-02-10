import { X, Download, Trash2, Share2, Info } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Button from './ui/Button'
import { FileItem } from '../services/fileService'
import { formatBytes } from '../lib/utils'

interface FilePreviewModalProps {
  file: FileItem
  isOpen: boolean
  onClose: () => void
  onDownload: () => void
  onDelete: () => void
  onShare?: () => void
}

export default function FilePreviewModal({
  file,
  isOpen,
  onClose,
  onDownload,
  onDelete,
  onShare,
}: FilePreviewModalProps) {
  if (!isOpen) return null

  const isImage = file.mimetype.startsWith('image/')
  const isVideo = file.mimetype.startsWith('video/')
  const isPDF = file.mimetype.includes('pdf')
  const isText = file.mimetype.startsWith('text/')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-lg font-semibold truncate">{file.filename}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatBytes(file.size)} • {formatDistanceToNow(new Date(file.uploaded_at), { addSuffix: true })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-800">
          {isImage && (
            <div className="flex items-center justify-center h-full">
              <img
                src={`/api/files/preview/${file.id}`}
                alt={file.filename}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
          )}

          {isVideo && (
            <div className="flex items-center justify-center h-full">
              <video
                controls
                className="max-w-full max-h-full rounded-lg shadow-lg"
                src={`/api/files/preview/${file.id}`}
              >
                Your browser does not support video playback.
              </video>
            </div>
          )}

          {isPDF && (
            <div className="h-full">
              <iframe
                src={`/api/files/preview/${file.id}`}
                className="w-full h-full rounded-lg shadow-lg"
                title={file.filename}
              />
            </div>
          )}

          {isText && (
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {/* Text content would be loaded here */}
                Loading preview...
              </pre>
            </div>
          )}

          {!isImage && !isVideo && !isPDF && !isText && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Info className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Preview not available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This file type cannot be previewed in the browser
              </p>
              <Button onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download to View
              </Button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            {file.encrypted && (
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded">
                🔒 Encrypted
              </span>
            )}
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {file.mimetype}
            </span>
          </div>
          <div className="flex gap-2">
            {onShare && (
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
