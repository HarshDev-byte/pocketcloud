import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Files, HardDrive, Shield, TrendingUp, Upload, Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { fileService, DashboardData } from '../services/fileService'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const dashboardData = await fileService.getDashboard()
      setData(dashboardData)
    } catch (error: any) {
      toast.error('Failed to load dashboard')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Failed to load dashboard</p>
        <Button onClick={loadDashboard} className="mt-4">Retry</Button>
      </div>
    )
  }

  const storagePercentage = data.storageInfo.percentUsed || 0
  const storageColor = storagePercentage > 90 ? 'bg-red-500' : storagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here's an overview of your encrypted cloud storage.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Files className="w-6 h-6" />}
          title="Total Files"
          value={data.totalFiles.toString()}
          description="Encrypted files"
          color="blue"
        />
        <StatCard
          icon={<HardDrive className="w-6 h-6" />}
          title="Storage Used"
          value={`${data.storageInfo.usedGB} GB`}
          description={`of ${data.storageInfo.totalGB} GB`}
          color="purple"
        />
        <StatCard
          icon={<Shield className="w-6 h-6" />}
          title="Encrypted"
          value={`${data.securityStatus.encryptedFileCount}`}
          description="Files protected"
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Storage Free"
          value={`${data.storageInfo.freeGB} GB`}
          description="Available space"
          color="orange"
        />
      </div>

      {/* Storage Status */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Status</CardTitle>
          <CardDescription>
            {data.storageInfo.available ? data.storageInfo.message : 'Storage unavailable'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Used</span>
                <span className="font-medium">{storagePercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`${storageColor} h-3 rounded-full transition-all duration-300`}
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Total</p>
                <p className="font-medium text-lg">{data.storageInfo.totalGB} GB</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Used</p>
                <p className="font-medium text-lg">{data.storageInfo.usedGB} GB</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Free</p>
                <p className="font-medium text-lg">{data.storageInfo.freeGB} GB</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Files */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Files</CardTitle>
              <CardDescription>Your latest uploads</CardDescription>
            </div>
            <Link to="/files">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {data.recentFiles.length === 0 ? (
            <div className="text-center py-8">
              <Files className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No files yet</p>
              <Link to="/files">
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First File
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Files className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{file.filename}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {file.formattedSize} • {formatDistanceToNow(new Date(file.uploaded_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileService.downloadFile(file.id, file.filename)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/files">
              <Button className="w-full justify-start" variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </Link>
            <Link to="/security">
              <Button className="w-full justify-start" variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Security Center
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Encryption</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Algorithm</span>
                <span className="text-sm font-medium">AES-256-GCM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Encrypted Files</span>
                <span className="text-sm font-medium">{data.securityStatus.encryptedFileCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, description, color }: {
  icon: React.ReactNode
  title: string
  value: string
  description: string
  color: 'blue' | 'purple' | 'green' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{description}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
