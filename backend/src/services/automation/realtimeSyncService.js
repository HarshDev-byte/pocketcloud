const websocketService = require('./websocketService');
const notificationService = require('./notificationService');

class RealtimeSyncService {
  constructor() {
    this.uploadProgress = new Map(); // fileId -> progress data
  }

  /**
   * Broadcast file created event
   */
  async fileCreated(file, userId) {
    try {
      // Emit to all users who have access
      websocketService.broadcastToAll('file:created', {
        file: {
          id: file.id,
          filename: file.filename,
          size: file.size,
          mimeType: file.mimetype,
          uploadedBy: userId,
          uploadedAt: file.uploaded_at
        }
      });

      // Emit to folder watchers if in folder
      if (file.folder_id) {
        websocketService.emitToFolderWatchers(file.folder_id, 'folder:file-added', {
          folderId: file.folder_id,
          file: file
        });
      }
    } catch (error) {
      console.error('Error broadcasting file created:', error);
    }
  }

  /**
   * Broadcast file updated event
   */
  async fileUpdated(file, userId, changes) {
    try {
      websocketService.emitToFileWatchers(file.id, 'file:updated', {
        fileId: file.id,
        changes,
        updatedBy: userId,
        updatedAt: new Date().toISOString()
      });

      websocketService.broadcastToAll('file:changed', {
        fileId: file.id,
        filename: file.filename,
        updatedBy: userId
      });
    } catch (error) {
      console.error('Error broadcasting file updated:', error);
    }
  }

  /**
   * Broadcast file deleted event
   */
  async fileDeleted(fileId, filename, userId) {
    try {
      websocketService.emitToFileWatchers(fileId, 'file:deleted', {
        fileId,
        filename,
        deletedBy: userId,
        deletedAt: new Date().toISOString()
      });

      websocketService.broadcastToAll('file:removed', {
        fileId,
        filename,
        deletedBy: userId
      });
    } catch (error) {
      console.error('Error broadcasting file deleted:', error);
    }
  }

  /**
   * Broadcast file shared event
   */
  async fileShared(file, sharedWith, sharedBy) {
    try {
      // Notify the user it was shared with
      websocketService.emitToUser(sharedWith, 'file:shared', {
        file: {
          id: file.id,
          filename: file.filename,
          size: file.size,
          mimeType: file.mimetype
        },
        sharedBy,
        sharedAt: new Date().toISOString()
      });

      // Create notification
      await notificationService.notifyFileShared(
        sharedWith,
        file.filename,
        sharedBy
      );
    } catch (error) {
      console.error('Error broadcasting file shared:', error);
    }
  }

  /**
   * Track upload progress
   */
  updateUploadProgress(uploadId, userId, progress) {
    try {
      this.uploadProgress.set(uploadId, {
        userId,
        progress,
        updatedAt: Date.now()
      });

      // Emit progress to user
      websocketService.emitToUser(userId, 'upload:progress', {
        uploadId,
        progress
      });
    } catch (error) {
      console.error('Error updating upload progress:', error);
    }
  }

  /**
   * Upload complete
   */
  async uploadComplete(uploadId, userId, file) {
    try {
      // Remove from progress tracking
      this.uploadProgress.delete(uploadId);

      // Emit completion
      websocketService.emitToUser(userId, 'upload:complete', {
        uploadId,
        file: {
          id: file.id,
          filename: file.filename,
          size: file.size,
          mimeType: file.mimetype
        }
      });

      // Create notification
      await notificationService.notifyFileUploaded(userId, file.filename);

      // Broadcast file created
      await this.fileCreated(file, userId);
    } catch (error) {
      console.error('Error handling upload complete:', error);
    }
  }

  /**
   * Upload failed
   */
  uploadFailed(uploadId, userId, error) {
    try {
      this.uploadProgress.delete(uploadId);

      websocketService.emitToUser(userId, 'upload:failed', {
        uploadId,
        error: error.message
      });
    } catch (err) {
      console.error('Error handling upload failed:', err);
    }
  }

  /**
   * Broadcast download started
   */
  downloadStarted(fileId, userId, filename) {
    try {
      websocketService.emitToUser(userId, 'download:started', {
        fileId,
        filename
      });
    } catch (error) {
      console.error('Error broadcasting download started:', error);
    }
  }

  /**
   * Broadcast download complete
   */
  downloadComplete(fileId, userId, filename) {
    try {
      websocketService.emitToUser(userId, 'download:complete', {
        fileId,
        filename
      });
    } catch (error) {
      console.error('Error broadcasting download complete:', error);
    }
  }

  /**
   * Broadcast folder created
   */
  async folderCreated(folder, userId) {
    try {
      websocketService.broadcastToAll('folder:created', {
        folder: {
          id: folder.id,
          name: folder.name,
          parentId: folder.parent_id,
          createdBy: userId
        }
      });

      if (folder.parent_id) {
        websocketService.emitToFolderWatchers(folder.parent_id, 'folder:subfolder-added', {
          parentId: folder.parent_id,
          folder
        });
      }
    } catch (error) {
      console.error('Error broadcasting folder created:', error);
    }
  }

  /**
   * Broadcast folder updated
   */
  async folderUpdated(folder, userId, changes) {
    try {
      websocketService.emitToFolderWatchers(folder.id, 'folder:updated', {
        folderId: folder.id,
        changes,
        updatedBy: userId
      });

      websocketService.broadcastToAll('folder:changed', {
        folderId: folder.id,
        name: folder.name,
        updatedBy: userId
      });
    } catch (error) {
      console.error('Error broadcasting folder updated:', error);
    }
  }

  /**
   * Broadcast folder deleted
   */
  async folderDeleted(folderId, folderName, userId) {
    try {
      websocketService.emitToFolderWatchers(folderId, 'folder:deleted', {
        folderId,
        folderName,
        deletedBy: userId
      });

      websocketService.broadcastToAll('folder:removed', {
        folderId,
        folderName,
        deletedBy: userId
      });
    } catch (error) {
      console.error('Error broadcasting folder deleted:', error);
    }
  }

  /**
   * Broadcast storage updated
   */
  async storageUpdated(userId, storageData) {
    try {
      websocketService.emitToUser(userId, 'storage:updated', storageData);

      // Check if storage is getting full
      const percentage = (storageData.used / storageData.total) * 100;
      if (percentage >= 90) {
        await notificationService.notifyStorageFull(userId, Math.round(percentage));
      }
    } catch (error) {
      console.error('Error broadcasting storage updated:', error);
    }
  }

  /**
   * Broadcast comment added
   */
  async commentAdded(comment, fileId, userId) {
    try {
      websocketService.emitToFileWatchers(fileId, 'comment:added', {
        fileId,
        comment: {
          id: comment.id,
          content: comment.content,
          userId,
          createdAt: comment.created_at
        }
      });

      // Check for mentions and notify
      if (comment.mentions) {
        const mentions = JSON.parse(comment.mentions);
        for (const mentionedUserId of mentions) {
          await notificationService.notifyCommentMention(
            mentionedUserId,
            comment.filename,
            userId
          );
        }
      }
    } catch (error) {
      console.error('Error broadcasting comment added:', error);
    }
  }

  /**
   * Get upload progress
   */
  getUploadProgress(uploadId) {
    return this.uploadProgress.get(uploadId);
  }

  /**
   * Get all uploads for user
   */
  getUserUploads(userId) {
    const uploads = [];
    for (const [uploadId, data] of this.uploadProgress.entries()) {
      if (data.userId === userId) {
        uploads.push({ uploadId, ...data });
      }
    }
    return uploads;
  }

  /**
   * Clean stale upload progress
   */
  cleanStaleProgress() {
    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [uploadId, data] of this.uploadProgress.entries()) {
      if (now - data.updatedAt > staleThreshold) {
        this.uploadProgress.delete(uploadId);
      }
    }
  }
}

module.exports = new RealtimeSyncService();
