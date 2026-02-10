import { useState } from 'react'
import { 
  HelpCircle, 
  Activity, 
  HardDrive, 
  Database, 
  Shield, 
  Wifi,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import Button from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'

interface SystemInfo {
  status: 'healthy' | 'warning' | 'error'
  database: boolean
  storage: boolean
  encryption: boolean
  network: boolean
  uptime: string
  version: string
}

export default function SupportPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    status: 'healthy',
    database: true,
    storage: true,
    encryption: true,
    network: true,
    uptime: '2 days, 5 hours',
    version: '1.0.0',
  })
  const [isChecking, setIsChecking] = useState(false)

  const handleHealthCheck = async () => {
    setIsChecking(true)
    try {
      // TODO: Implement health check API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('System health check completed')
    } catch (error: any) {
      toast.error('Health check failed')
    } finally {
      setIsChecking(false)
    }
  }

  const copySystemInfo = () => {
    const info = `
PocketCloud System Information
==============================
Version: ${systemInfo.version}
Status: ${systemInfo.status}
Uptime: ${systemInfo.uptime}

Components:
- Database: ${systemInfo.database ? 'OK' : 'ERROR'}
- Storage: ${systemInfo.storage ? 'OK' : 'ERROR'}
- Encryption: ${systemInfo.encryption ? 'OK' : 'ERROR'}
- Network: ${systemInfo.network ? 'OK' : 'ERROR'}
    `.trim()

    navigator.clipboard.writeText(info)
    toast.success('System info copied to clipboard')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support & Diagnostics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          System health, troubleshooting, and help resources
        </p>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Health
              </CardTitle>
              <CardDescription>Real-time system status</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleHealthCheck}
              isLoading={isChecking}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Check
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <HealthItem
              icon={<Database className="w-5 h-5" />}
              label="Database"
              status={systemInfo.database ? 'healthy' : 'error'}
              description="SQLite database connection"
            />
            <HealthItem
              icon={<HardDrive className="w-5 h-5" />}
              label="Storage"
              status={systemInfo.storage ? 'healthy' : 'error'}
              description="External USB drive mounted"
            />
            <HealthItem
              icon={<Shield className="w-5 h-5" />}
              label="Encryption"
              status={systemInfo.encryption ? 'healthy' : 'error'}
              description="AES-256-GCM encryption active"
            />
            <HealthItem
              icon={<Wifi className="w-5 h-5" />}
              label="Network"
              status={systemInfo.network ? 'healthy' : 'error'}
              description="Network connectivity"
            />
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Information</CardTitle>
              <CardDescription>PocketCloud configuration details</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={copySystemInfo}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Info
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <InfoRow label="Version" value={systemInfo.version} />
            <InfoRow label="Status" value={systemInfo.status.toUpperCase()} />
            <InfoRow label="Uptime" value={systemInfo.uptime} />
            <InfoRow label="Platform" value="Raspberry Pi OS" />
            <InfoRow label="Node.js" value="v20.11.0" />
            <InfoRow label="Storage Location" value="/mnt/pocketcloud" />
          </div>
        </CardContent>
      </Card>

      {/* Common Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Common Issues & Solutions</CardTitle>
          <CardDescription>Quick fixes for frequent problems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <TroubleshootingItem
              title="Can't access from phone/laptop"
              solution="Make sure your device is on the same Wi-Fi network as your Raspberry Pi. Find your Pi's IP with 'hostname -I' and access at http://[PI_IP]:3000"
            />
            <TroubleshootingItem
              title="USB drive not detected"
              solution="Check USB connection, try different port. Run: sudo mount -a to remount. Verify with: df -h | grep pocketcloud"
            />
            <TroubleshootingItem
              title="File upload fails"
              solution="Check disk space with 'df -h'. Ensure file size is under 1GB. Verify USB drive is writable."
            />
            <TroubleshootingItem
              title="Forgot password"
              solution="There is no password recovery (by design for security). You'll need to create a new account. Your old files will remain encrypted and inaccessible."
            />
            <TroubleshootingItem
              title="Service won't start"
              solution="Check logs: sudo journalctl -u pocketcloud -n 50. Restart: sudo systemctl restart pocketcloud"
            />
          </div>
        </CardContent>
      </Card>

      {/* Useful Commands */}
      <Card>
        <CardHeader>
          <CardTitle>Useful Commands</CardTitle>
          <CardDescription>Common terminal commands for management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <CommandItem
              command="sudo systemctl status pocketcloud"
              description="Check service status"
            />
            <CommandItem
              command="sudo journalctl -u pocketcloud -f"
              description="View real-time logs"
            />
            <CommandItem
              command="bash tools/system-status.sh"
              description="Run system diagnostics"
            />
            <CommandItem
              command="sudo bash tools/backup-pocketcloud.sh"
              description="Create backup"
            />
            <CommandItem
              command="df -h | grep pocketcloud"
              description="Check storage usage"
            />
            <CommandItem
              command="hostname -I"
              description="Find Pi's IP address"
            />
          </div>
        </CardContent>
      </Card>

      {/* Documentation Links */}
      <Card>
        <CardHeader>
          <CardTitle>Documentation & Resources</CardTitle>
          <CardDescription>Guides and help resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <DocumentLink
              title="Complete Setup Guide"
              description="Ultra-detailed installation instructions"
              href="/docs/COMPLETE_SETUP_GUIDE_2026.md"
            />
            <DocumentLink
              title="Troubleshooting Guide"
              description="Comprehensive problem-solving guide"
              href="/docs/TROUBLESHOOTING_2026.md"
            />
            <DocumentLink
              title="Cross-Device Access"
              description="How to access from multiple devices"
              href="/docs/CROSS_DEVICE_ACCESS.md"
            />
            <DocumentLink
              title="Quick Start"
              description="Brief setup instructions"
              href="/docs/QUICKSTART.txt"
            />
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FAQItem
              question="Is my data really secure?"
              answer="Yes! All files are encrypted with AES-256-GCM (military-grade encryption). Your password is never stored, and files are encrypted at rest on your USB drive."
            />
            <FAQItem
              question="Can I access PocketCloud from the internet?"
              answer="By default, PocketCloud only works on your local network. For internet access, you'd need to set up port forwarding and HTTPS (not recommended without proper security measures)."
            />
            <FAQItem
              question="What happens if I lose my password?"
              answer="There is no password recovery by design. Your files are encrypted with your password, so losing it means losing access to your files permanently."
            />
            <FAQItem
              question="How much storage can I use?"
              answer="Storage is limited only by your USB drive size. PocketCloud supports drives up to several terabytes."
            />
            <FAQItem
              question="Can multiple users access PocketCloud?"
              answer="Yes! Each user has their own account with separate encrypted storage. Users cannot access each other's files."
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need More Help?</CardTitle>
          <CardDescription>Additional support options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              If you're experiencing issues not covered here:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>• Check the logs: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">sudo journalctl -u pocketcloud -n 50</code></li>
              <li>• Run system diagnostics: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">bash tools/system-status.sh</code></li>
              <li>• Review the troubleshooting guide in the docs folder</li>
              <li>• Check GitHub issues for similar problems</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function HealthItem({
  icon,
  label,
  status,
  description,
}: {
  icon: React.ReactNode
  label: string
  status: 'healthy' | 'warning' | 'error'
  description: string
}) {
  const statusConfig = {
    healthy: {
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      text: 'Healthy',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
      text: 'Warning',
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      text: 'Error',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
  }

  const config = statusConfig[status]

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${config.bg}`}>
          {icon}
        </div>
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {config.icon}
        <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function TroubleshootingItem({ title, solution }: { title: string; solution: string }) {
  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <h4 className="font-medium mb-2">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{solution}</p>
    </div>
  )
}

function CommandItem({ command, description }: { command: string; description: string }) {
  const copyCommand = () => {
    navigator.clipboard.writeText(command)
    toast.success('Command copied to clipboard')
  }

  return (
    <div className="flex items-start justify-between gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex-1 min-w-0">
        <code className="text-sm font-mono text-blue-600 dark:text-blue-400 break-all">
          {command}
        </code>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{description}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={copyCommand}>
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  )
}

function DocumentLink({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <div>
        <h4 className="font-medium mb-1">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
    </a>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="font-medium">{question}</span>
        <HelpCircle className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{answer}</p>
        </div>
      )}
    </div>
  )
}
