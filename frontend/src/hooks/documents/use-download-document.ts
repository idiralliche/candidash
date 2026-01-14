import { useState } from 'react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { AXIOS_INSTANCE } from '@/lib/api-client';
import { Document } from '@/api/model';

export function useDownloadDocument() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadDocument = async (document: Document) => {
    // Case 1: External Link
    if (document.is_external) {
      window.open(document.path, '_blank');
      return;
    }

    // Case 2: Local File (Protected Download)
    try {
      setIsDownloading(true);

      const response = await AXIOS_INSTANCE.get(
        `/api/v1/documents/${document.id}/download`,
        {
          responseType: 'blob',
        }
      );

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;

      link.target = '_blank';

      const format = document.format.toLowerCase();
      const isViewable = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'txt'].includes(format);

      if (!isViewable) {
        link.removeAttribute('target');
        link.setAttribute('download', `${document.name}.${format}`);
      }

      window.document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        window.document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (err) {
      const error = err as AxiosError;

      console.error('Download error', error);

      let message = "Impossible de récupérer le fichier.";
      if (error.response?.status === 404) {
        message = "Fichier introuvable sur le serveur.";
      } else if (error.response?.status === 403 || error.response?.status === 401) {
        message = "Accès non autorisé.";
      }

      toast.error(message);
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadDocument, isDownloading };
}
