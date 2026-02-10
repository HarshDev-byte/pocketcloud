import { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  Download, 
  Trash2, 
  Search, 
  Grid3x3, 
  List,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  CheckCircle2,
  Loader2,
  Share2,
  Clock,
  Tag
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { fileService, FileItem } from '../services/fileService'
import FileShareModal from '../components/FileShareModal'
import ActivityLog from '../components/ActivityLog'
import FileTagModal from '../components/FileTagModal'
import FileVersionModal from '../components/FileVersionModal'

type ViewMode = 'grid' | 'list'
type SortBy = 'name' | 'date' | 'size'

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, number>>(new Map())
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set())
  const [shareFile, setShareFile] = useState<FileItem | null>(null)
  const [showActivityLog, setShowActivityLog] = useState(false)
  const [tagFile, setTagFile] = useState<FileItem | null>(null)
  const [versionFile, setVersionFile] = useState<FileItem | null>(null)

  useEffect(() => {
    loadFiles()
  }, [])

  useEffect(() => {
    filterAndSortFiles()
  }, [files, searchQuery, sortBy])

  const loadFiles = async () => {
    try {
      const data = await fileService.getFiles()
      setFiles(data)
    } catch (error: any) {
      toast.error('Failed to load files')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortFiles = () => {
    let result = [...files]

    // Filter by search query
    if (searchQuery) {
      result = result.filter(file =>
        file.filename.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort files
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.filename.localeCompare(b.filename)
        case 'date':
          return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
        case 'size':
          return b.size - a.size
        default:
          return 0
      }
    })

    setFilteredFiles(result)
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const fileId = `${file.name}-${Date.now()}`
      
      try {
        // Add to uploading files
        setUploadingFiles(prev => new Map(prev).set(fileId, 0))

        // Upload file
        await fileService.uploadFile(file, (progress) => {
          setUploadingFiles(prev => new Map(prev).set(fileId, progress))
        })

        // Remove from uploading files
        setUploadingFiles(prev => {
          const next = new Map(prev)
          next.delete(fileId)
          return next
        })

        toast.success(`${file.name} uploaded successfully`)
        
        // Reload files
        await loadFiles()
      } catch (error: any) {
        setUploadingFiles(prev => {
          const next = new Map(prev)
          next.delete(fileId)
          return next
        })
        
        const message = error.response?.data?.error || `Failed to upload ${file.name}`
        toast.error(message)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  })

  const handleDownload = async (file: FileItem) => {
    try {
      await fileService.downloadFile(file.id, file.filename)
      toast.success(`Downloading ${file.filename}`)
    } catch (error: any) {
      toast.error('Failed to download file')
    }
  }

  const handleDelete = async (file: FileItem) => {
    if (!confirm(`Are you sure you want to delete "${file.filename}"?`)) {
      return
    }

    try {
      await fileService.deleteFile(file.id)
      toast.success(`${file.filename} deleted`)
      await loadFiles()
    } catch (error: any) {
      toast.error('Failed to delete file')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return
    
    if (!confirm(`Delete ${selectedFiles.size} selected file(s)?`)) {
      return
    }

    try {
      for (const fileId of selectedFiles) {
        await fileService.deleteFile(fileId)
      }
      toast.success(`${selectedFiles.size} file(s) deleted`)
      setSelectedFiles(new Set())
      await loadFiles()
    } catch (error: any) {
      toast.error('Failed to delete files')
    }
  }

  const toggleFileSelection = (fileId: number) => {
    setSelectedFiles(prev => {
      const next = new Set(prev)
      if (next.has(fileId)) {
        next.delete(fileId)
      } else {
        next.add(fileId)
      }
      return next
    })
  }

  const selectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)))
    }
  }

  const handleShare = (file: FileItem) => {
    setShareFile(file)
  }

  const handleBulkDownload = async () => {
    if (selectedFiles.size === 0) return
    
    try {
      for (const fileId of selectedFiles) {
        const file = files.find(f => f.id === fileId)
        if (file) {
          await fileService.downloadFile(file.id, file.filename)
        }
      }
      toast.success(`Downloading ${selectedFiles.size} file(s)`)
    } catch (error: any) {
      toast.error('Failed to download files')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Files</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your encrypted files
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-lg font-medium text-blue-600">Drop files here...</p>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Drag & drop files here
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  or click to browse
                </p>
                <Button>Select Files</Button>
              </>
            )}
          </div>

          {/* Upload Progress */}
          {uploadingFiles.size > 0 && (
            <div className="mt-4 space-y-2">
              {Array.from(uploadingFiles.entries()).map(([fileId, progress]) => (
                <div key={fileId} className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">
                        {fileId.split('-')[0]}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>

          {/* View Mode */}
          <div className="flex border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 border-l border-gray-300 dark:border-gray-700 ${
                viewMode === 'list'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Activity Log Button */}
          <Button variant="outline" size="sm" onClick={() => setShowActivityLog(true)}>
            <Clock className="w-4 h-4" />
          </Button>

          {/* Bulk Actions */}
          {selectedFiles.size > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleBulkDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download ({selectedFiles.size})
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedFiles.size})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Files Count */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div>
          {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
        {filteredFiles.length > 0 && (
          <button
            onClick={selectAll}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {selectedFiles.size === filteredFiles.length ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No files found' : 'No files yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Upload your first file to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={() => {
                const input = document.querySelector('input[type="file"]') as HTMLInputElement | null
                input?.click()
              }}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              isSelected={selectedFiles.has(file.id)}
              onToggleSelect={() => toggleFileSelection(file.id)}
              onDownload={() => handleDownload(file)}
              onDelete={() => handleDelete(file)}
              onShare={() => handleShare(file)}
              onTag={() => setTagFile(file)}
              onVersion={() => setVersionFile(file)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredFiles.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  isSelected={selectedFiles.has(file.id)}
                  onToggleSelect={() => toggleFileSelection(file.id)}
                  onDownload={() => handleDownload(file)}
                  onDelete={() => handleDelete(file)}
                  onShare={() => handleShare(file)}
                  onTag={() => setTagFile(file)}
                  onVersion={() => setVersionFile(file)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {shareFile && (
        <FileShareModal
          file={shareFile}
          isOpen={!!shareFile}
          onClose={() => setShareFile(null)}
        />
      )}

      <ActivityLog
        isOpen={showActivityLog}
        onClose={() => setShowActivityLog(false)}
      />

      <FileTagModal
        file={tagFile}
        isOpen={!!tagFile}
        onClose={() => setTagFile(null)}
        onTagsUpdated={loadFiles}
      />

      <FileVersionModal
        file={versionFile}
        isOpen={!!versionFile}
        onClose={() => setVersionFile(null)}
      />
    </div>
  )
}

// File Card Component (Grid View)
function FileCard({
  file,
  isSelected,
  onToggleSelect,
  onDownload,
  onDelete,
  onShare,
  onTag,
  onVersion,
}: {
  file: FileItem
  isSelected: boolean
  onToggleSelect: () => void
  onDownload: () => void
  onDelete: () => void
  onShare: () => void
  onTag: () => void
  onVersion: () => void
}) {
  const Icon = getFileIcon(file.mimetype)

  return (
    <Card className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="p-4">
        {/* Selection Checkbox */}
        <div className="absolute top-2 left-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* File Icon */}
        <div className="flex justify-center mb-3 mt-2">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Icon className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* File Info */}
        <div className="text-center mb-3">
          <p className="font-medium text-sm truncate" title={file.filename}>
            {file.filename}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {file.formattedSize}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {formatDistanceToNow(new Date(file.uploaded_at), { addSuffix: true })}
          </p>
        </div>

        {/* Encryption Badge */}
        {file.encrypted && (
          <div className="flex items-center justify-center gap-1 text-xs text-green-600 dark:text-green-400 mb-3">
            <CheckCircle2 className="w-3 h-3" />
            <span>Encrypted</span>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
          >
            <Share2 className="w-3 h-3 mr-1" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onTag}
          >
            <Tag className="w-3 h-3 mr-1" />
            Tags
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onVersion}
          >
            <Clock className="w-3 h-3 mr-1" />
            History
          </Button>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          className="w-full mt-2"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </Button>
      </CardContent>
    </Card>
  )
}

// File Row Component (List View)
function FileRow({
  file,
  isSelected,
  onToggleSelect,
  onDownload,
  onDelete,
  onShare,
  onTag,
  onVersion,
}: {
  file: FileItem
  isSelected: boolean
  onToggleSelect: () => void
  onDownload: () => void
  onDelete: () => void
  onShare: () => void
  onTag: () => void
  onVersion: () => void
}) {
  const Icon = getFileIcon(file.mimetype)

  return (
    <div className={`flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggleSelect}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />

      {/* Icon */}
      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{file.filename}</p>
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
          <span>{file.formattedSize}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(file.uploaded_at), { addSuffix: true })}</span>
          {file.encrypted && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-3 h-3" />
                Encrypted
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={onDownload} title="Download">
          <Download className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onShare} title="Share">
          <Share2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onTag} title="Tags">
          <Tag className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onVersion} title="Version History">
          <Clock className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} title="Delete">
          <Trash2 className="w-4 h-4 text-red-600" />
        </Button>
      </div>
    </div>
  )
}

// Helper function to get file icon
function getFileIcon(mimetype: string) {
  if (mimetype.startsWith('image/')) return FileImage
  if (mimetype.startsWith('video/')) return FileVideo
  if (mimetype.includes('pdf') || mimetype.includes('document')) return FileText
  if (mimetype.includes('zip') || mimetype.includes('archive')) return FileArchive
  return File
}
