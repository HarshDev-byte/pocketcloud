import { Link } from 'react-router-dom'
import { Cloud, Lock, HardDrive, Zap, Shield, Users } from 'lucide-react'
import Button from '../components/ui/Button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Cloud className="w-20 h-20 text-blue-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            PocketCloud
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-4">
            Your Personal Cloud. Your Rules. Your Data.
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
            Self-hosted, encrypted file storage with zero cloud dependencies
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon={<Lock className="w-8 h-8" />}
            title="Zero-Knowledge Security"
            description="AES-256-GCM encryption. Your password never leaves your device."
          />
          <FeatureCard
            icon={<HardDrive className="w-8 h-8" />}
            title="Complete Privacy"
            description="100% offline. No cloud dependencies. Your data stays on your hardware."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Effortless Experience"
            description="Automatic encryption. Cross-device access. Self-managing system."
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Production Ready"
            description="Battle-tested with automatic corruption detection and recovery."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Cross-Device Access"
            description="Access your files from phones, tablets, and laptops on your network."
          />
          <FeatureCard
            icon={<Cloud className="w-8 h-8" />}
            title="Self-Hosted"
            description="Run on your Raspberry Pi. No monthly fees. Complete ownership."
          />
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid md:grid-cols-4 gap-8 text-center">
          <StatCard number="256-bit" label="AES-GCM Encryption" />
          <StatCard number="100%" label="Offline Capable" />
          <StatCard number="0" label="Cloud Dependencies" />
          <StatCard number="∞" label="Storage Capacity" />
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to take control of your data?</h2>
          <p className="text-xl mb-8 opacity-90">
            Set up your personal cloud in minutes
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Create Your Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>PocketCloud v1.0.0 - Built with privacy and security in mind</p>
          <p className="mt-2 text-sm">MIT License - Open Source</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="text-blue-600 dark:text-blue-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{number}</div>
      <div className="text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  )
}
