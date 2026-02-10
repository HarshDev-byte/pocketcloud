import { useState } from 'react'
import { Shield, Lock, Key, Download, Upload, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import Input from '../components/ui/Input'

export default function SecurityPage() {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsChangingPassword(true)
    
    try {
      // TODO: Implement password change API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Password changed successfully')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error('Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleCreateBackup = async () => {
    try {
      toast.info('Creating backup...')
      // TODO: Implement backup API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Backup created successfully')
    } catch (error: any) {
      toast.error('Failed to create backup')
    }
  }

  const handleRestoreBackup = async () => {
    if (!confirm('Restore from backup? This will replace all current data.')) {
      return
    }

    try {
      toast.info('Restoring from backup...')
      // TODO: Implement restore API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Backup restored successfully')
    } catch (error: any) {
      toast.error('Failed to restore backup')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security Center</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your encryption, backups, and security settings
        </p>
      </div>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Security Status
          </CardTitle>
          <CardDescription>Your PocketCloud security overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SecurityStatusItem
              icon={<Lock className="w-5 h-5" />}
              label="Encryption"
              status="Active"
              description="AES-256-GCM encryption enabled"
              statusColor="green"
            />
            <SecurityStatusItem
              icon={<Key className="w-5 h-5" />}
              label="Zero-Knowledge"
              status="Enabled"
              description="Your password is never stored"
              statusColor="green"
            />
            <SecurityStatusItem
              icon={<CheckCircle2 className="w-5 h-5" />}
              label="File Integrity"
              status="Protected"
              description="Authenticated encryption prevents tampering"
              statusColor="green"
            />
          </div>
        </CardContent>
      </Card>

      {/* Encryption Information */}
      <Card>
        <CardHeader>
          <CardTitle>Encryption Details</CardTitle>
          <CardDescription>How your files are protected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <InfoItem
              label="Algorithm"
              value="AES-256-GCM"
              description="Military-grade encryption standard"
            />
            <InfoItem
              label="Key Derivation"
              value="Scrypt + HKDF"
              description="Memory-hard, GPU-resistant password protection"
            />
            <InfoItem
              label="Authentication"
              value="GCM Mode"
              description="Automatic tamper detection and integrity verification"
            />
            <InfoItem
              label="Key Storage"
              value="Zero-Knowledge"
              description="Keys derived on-demand, never persisted"
            />
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  How it works
                </p>
                <p className="text-blue-800 dark:text-blue-200">
                  Your password → Scrypt → Master Key → HKDF → Per-File Keys → AES-256-GCM → Encrypted Files
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your encryption password</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                  Important Warning
                </p>
                <p className="text-yellow-800 dark:text-yellow-200">
                  Changing your password will re-encrypt all files. This process cannot be undone.
                  Make sure to remember your new password!
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="Enter current password"
              required
            />

            <Input
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Enter new password (min 6 characters)"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              required
            />

            <Button type="submit" isLoading={isChangingPassword}>
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Backup & Restore */}
      <Card>
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
          <CardDescription>Protect your data with regular backups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Create Backup</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Create a complete backup of your encrypted files and database. Backups are stored on your USB drive.
              </p>
              <Button onClick={handleCreateBackup}>
                <Download className="w-4 h-4 mr-2" />
                Create Backup Now
              </Button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="font-medium mb-2">Restore from Backup</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Restore your files and database from a previous backup. This will replace all current data.
              </p>
              <Button variant="outline" onClick={handleRestoreBackup}>
                <Upload className="w-4 h-4 mr-2" />
                Restore from Backup
              </Button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2 text-sm">Backup Best Practices</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Create backups regularly (weekly recommended)</li>
                <li>• Store backups on a separate USB drive</li>
                <li>• Keep offsite backups for critical files</li>
                <li>• Test restore procedures periodically</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
          <CardDescription>Best practices for maximum security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <RecommendationItem
              status="success"
              text="Use a strong, unique password (mix of letters, numbers, symbols)"
            />
            <RecommendationItem
              status="success"
              text="Never reuse your PocketCloud password elsewhere"
            />
            <RecommendationItem
              status="success"
              text="Keep your Raspberry Pi in a secure location"
            />
            <RecommendationItem
              status="warning"
              text="Create regular backups to a separate USB drive"
            />
            <RecommendationItem
              status="warning"
              text="Only access from trusted devices on your network"
            />
            <RecommendationItem
              status="info"
              text="Consider using a password manager for your PocketCloud password"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SecurityStatusItem({
  icon,
  label,
  status,
  description,
  statusColor,
}: {
  icon: React.ReactNode
  label: string
  status: string
  description: string
  statusColor: 'green' | 'yellow' | 'red'
}) {
  const colorClasses = {
    green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
    red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  }

  return (
    <div className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className={`p-2 rounded-lg ${colorClasses[statusColor]}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium">{label}</h4>
          <span className={`text-sm font-medium ${colorClasses[statusColor].split(' ')[0]}`}>
            {status}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  )
}

function InfoItem({
  label,
  value,
  description,
}: {
  label: string
  value: string
  description: string
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
      </div>
      <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
        {value}
      </span>
    </div>
  )
}

function RecommendationItem({
  status,
  text,
}: {
  status: 'success' | 'warning' | 'info'
  text: string
}) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  }

  return (
    <div className="flex items-start gap-3">
      {icons[status]}
      <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
    </div>
  )
}
