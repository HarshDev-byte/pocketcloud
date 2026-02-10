import api from './api'

export interface FileItem {
  id: number
  filename: string
  size: number
  formattedSize: string
  mimetype: string
  uploaded_at: string
  encrypted: boolean
}

export interface StorageInfo {
  available: boolean
  totalGB: string
  usedGB: string
  freeGB: string
  percentUsed: number
  state: 'healthy' | 'almost-full' | 'full' | 'unavailable'
  message: string
}

export interface DashboardData {
  files: FileItem[]
  recentFiles: FileItem[]
  storageInfo: StorageInfo
  totalFiles: number
  securityStatus: {
    encryptionEnabled: boolean
    encryptedFileCount: number
    totalFileCount: number
  }
}

export const fileService = {
  async getDashboard(): Promise<DashboardData> {
    const response = await api.get('/files/dashboard')
    return response.data
  },

  async getFiles(): Promise<FileItem[]> {
    const response = await api.get('/files')
    return response.data
  },

  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)

    await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  },

  async downloadFile(fileId: number, filename: string): Promise<void> {
    const response = await api.get(`/files/download/${fileId}`, {
      responseType: 'blob',
    })

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  async deleteFile(fileId: number): Promise<void> {
    await api.delete(`/files/${fileId}`)
  },

  // File Sharing
  async generateShareLink(fileId: number, options: {
    expiresIn: number
    maxDownloads: number
    password?: string
  }): Promise<{ shareLink: string }> {
    const response = await api.post(`/files/${fileId}/share`, options)
    return response.data
  },

  async revokeShareLink(shareId: string): Promise<void> {
    await api.delete(`/files/share/${shareId}`)
  },

  // File Tagging
  async getFileTags(fileId: number): Promise<string[]> {
    const response = await api.get(`/files/${fileId}/tags`)
    return response.data
  },

  async updateFileTags(fileId: number, tags: string[]): Promise<void> {
    await api.put(`/files/${fileId}/tags`, { tags })
  },

  // File Versioning
  async getFileVersions(fileId: number): Promise<any[]> {
    const response = await api.get(`/files/${fileId}/versions`)
    return response.data
  },

  async downloadFileVersion(fileId: number, versionId: number, filename: string): Promise<void> {
    const response = await api.get(`/files/${fileId}/versions/${versionId}`, {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  async restoreFileVersion(fileId: number, versionId: number): Promise<void> {
    await api.post(`/files/${fileId}/versions/${versionId}/restore`)
  },

  async deleteFileVersion(fileId: number, versionId: number): Promise<void> {
    await api.delete(`/files/${fileId}/versions/${versionId}`)
  },

  // Activity Log
  async getActivityLog(filters?: {
    action?: string
    limit?: number
  }): Promise<any[]> {
    const response = await api.get('/files/activity', { params: filters })
    return response.data
  },
}
