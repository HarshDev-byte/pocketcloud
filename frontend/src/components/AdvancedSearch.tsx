import { useState } from 'react'
import { Search, Filter, X, Calendar } from 'lucide-react'
import Button from './ui/Button'
import Input from './ui/Input'

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  onReset: () => void
}

export interface SearchFilters {
  query: string
  fileType: string
  dateFrom: string
  dateTo: string
  minSize: number
  maxSize: number
}

export default function AdvancedSearch({ onSearch, onReset }: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    fileType: 'all',
    dateFrom: '',
    dateTo: '',
    minSize: 0,
    maxSize: 0,
  })

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleReset = () => {
    setFilters({
      query: '',
      fileType: 'all',
      dateFrom: '',
      dateTo: '',
      minSize: 0,
      maxSize: 0,
    })
    onReset()
  }

  return (
    <div className="space-y-4">
      {/* Basic Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search files..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          {isExpanded ? 'Hide' : 'Filters'}
        </Button>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Type */}
            <div>
              <label className="block text-sm font-medium mb-2">File Type</label>
              <select
                value={filters.fileType}
                onChange={(e) => setFilters({ ...filters, fileType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
                <option value="archive">Archives</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date Range
              </label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  placeholder="From"
                />
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  placeholder="To"
                />
              </div>
            </div>

            {/* Size Range */}
            <div>
              <label className="block text-sm font-medium mb-2">Min Size (MB)</label>
              <Input
                type="number"
                value={filters.minSize || ''}
                onChange={(e) => setFilters({ ...filters, minSize: Number(e.target.value) })}
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Size (MB)</label>
              <Input
                type="number"
                value={filters.maxSize || ''}
                onChange={(e) => setFilters({ ...filters, maxSize: Number(e.target.value) })}
                placeholder="Unlimited"
                min="0"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              <X className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
