import { useState } from 'react'
import { X, Link as LinkIcon, Copy, Clock, Eye, Check } from 'lucide-react'
import { toast } from 'sonner'
import Button from './ui/Button'
import Input from './ui/Input'
import { FileItem } from '../services/fileService'

interface FileShareModalProps {
  file: FileItem
  isOpen: boolean
  onClose: () => void
}

export default function FileShareModal({ file, isOpen, onClose }: FileShareModalProps) {
  const [shareLink, setShareLink] = useState('')
  const [expiresIn, setExpiresIn] = useState('24') // hours
  const [maxDownloads, setMaxDownloads] = useState('10')
  const [requirePassword, setRequirePassword] = useState(false)
  const [password, setPassword] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  if (!isOpen) return null

  const generateShareLink = async () => {
    setIsGenerating(true)
    try {
      // TODO: API call to generate share link
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockLink = `${window.location.origin}/share/${Math.random().toString(36).substr(2, 9)}`
      setShareLink(mockLink)
      toast.success('Share link generated!')
    } catch (error) {
      toast.error('Failed to generate share link')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink)
    toast.success('Link copied to clipboard!')
  }

  const revokeLink = async () => {
    if (!confirm('Revoke this share link? It will no longer work.')) return
    
    try {
      // TODO: API call to revoke link
      await new Promise(resolve => setTimeout(resolve, 500))
      setShareLink('')
      toast.success('Share link revoked')
    } catch (error) {
      toast.error('Failed to revoke link')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <LinkIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Share File</h2>
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
          {!shareLink ? (
            <>
              {/* Share Options */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Link Expires In
                  </label>
                  <select
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="1">1 hour</option>
                    <option value="6">6 hours</option>
                    <option value="24">24 hours</option>
                    <option value="168">7 days</option>
                    <option value="720">30 days</option>
                    <option value="0">Never</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Eye className="w-4 h-4 inline mr-1" />
                    Max Downloads
                  </label>
                  <select
                    value={maxDownloads}
                    onChange={(e) => setMaxDownloads(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="1">1 download</option>
                    <option value="5">5 downloads</option>
                    <option value="10">10 downloads</option>
                    <option value="50">50 downloads</option>
                    <option value="0">Unlimited</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium">Password Protection</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Require password to access
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requirePassword}
                      onChange={(e) => setRequirePassword(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {requirePassword && (
                  <Input
                    type="text"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                )}
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateShareLink}
                isLoading={isGenerating}
                className="w-full"
                size="lg"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Generate Share Link
              </Button>
            </>
          ) : (
            <>
              {/* Generated Link */}
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <p className="font-medium text-green-900 dark:text-green-100">
                      Share link created!
                    </p>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Anyone with this link can download the file
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Share Link</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 bg-gray-50 dark:bg-gray-800"
                    />
                    <Button onClick={copyLink}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Link Details */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Expires</span>
                    <span className="font-medium">
                      {expiresIn === '0' ? 'Never' : `In ${expiresIn} hours`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Max Downloads</span>
                    <span className="font-medium">
                      {maxDownloads === '0' ? 'Unlimited' : maxDownloads}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Password</span>
                    <span className="font-medium">
                      {requirePassword ? 'Required' : 'Not required'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={revokeLink} className="flex-1">
                    Revoke Link
                  </Button>
                  <Button onClick={onClose} className="flex-1">
                    Done
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
