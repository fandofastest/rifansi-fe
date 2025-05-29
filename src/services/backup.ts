import { graphQLClient } from '@/lib/graphql';

export interface Backup {
  backupPath: string;
  timestamp: string;
  collections: string[];
  downloadUrl: string;
}

export interface BackupHistoryResponse {
  success: boolean;
  message: string;
  backupPath: string;
  timestamp: string;
  collections: string[];
  downloadUrl: string;
}

export interface CreateBackupResponse {
  success: boolean;
  message: string;
  backupPath: string;
  timestamp: string;
  collections: string[];
  downloadUrl: string;
}

export interface RestoreBackupResponse {
  success: boolean;
  message: string;
  restoredCollections: string[];
  timestamp: string;
}

export const CREATE_BACKUP = `
  mutation CreateBackup($description: String) {
    createBackup(description: $description) {
      success
      message
      backupPath
      timestamp
      collections
      downloadUrl
    }
  }
`;

export const GET_BACKUP_HISTORY = `
  query GetBackupHistory {
    getBackupHistory {
      success
      message
      backupPath
      timestamp
      collections
      downloadUrl
    }
  }
`;

export const GET_LATEST_BACKUP = `
  query GetLatestBackup {
    getLatestBackup {
      success
      message
      backupPath
      timestamp
      collections
      downloadUrl
    }
  }
`;

export const RESTORE_FROM_BACKUP = `
  mutation RestoreFromBackup($backupPath: String!) {
    restoreFromBackup(backupPath: $backupPath) {
      success
      message
      restoredCollections
      timestamp
    }
  }
`;

export const DELETE_BACKUP = `
  mutation DeleteBackup($backupPath: String!) {
    deleteBackup(backupPath: $backupPath)
  }
`;

export const createBackup = async (
  description: string | undefined,
  token: string
): Promise<CreateBackupResponse> => {
  const response = await graphQLClient.request<{ createBackup: CreateBackupResponse }>(
    CREATE_BACKUP,
    { description },
    { Authorization: `Bearer ${token}` }
  );
  return response.createBackup;
};

export const getBackupHistory = async (token: string): Promise<BackupHistoryResponse[]> => {
  const response = await graphQLClient.request<{ getBackupHistory: BackupHistoryResponse[] }>(
    GET_BACKUP_HISTORY,
    {},
    { Authorization: `Bearer ${token}` }
  );
  return response.getBackupHistory;
};

export const getLatestBackup = async (token: string): Promise<BackupHistoryResponse> => {
  const response = await graphQLClient.request<{ getLatestBackup: BackupHistoryResponse }>(
    GET_LATEST_BACKUP,
    {},
    { Authorization: `Bearer ${token}` }
  );
  return response.getLatestBackup;
};

export const restoreFromBackup = async (
  backupPath: string,
  token: string
): Promise<RestoreBackupResponse> => {
  const response = await graphQLClient.request<{ restoreFromBackup: RestoreBackupResponse }>(
    RESTORE_FROM_BACKUP,
    { backupPath },
    { Authorization: `Bearer ${token}` }
  );
  return response.restoreFromBackup;
};

export const deleteBackup = async (
  backupPath: string,
  token: string
): Promise<boolean> => {
  const response = await graphQLClient.request<{ deleteBackup: boolean }>(
    DELETE_BACKUP,
    { backupPath },
    { Authorization: `Bearer ${token}` }
  );
  return response.deleteBackup;
}; 