import JSZip from 'jszip';
import { Order, StorageRetentionStats } from './admin-types';

/**
 * Retention Constants
 */
export const RETENTION_DAYS = 90;
export const WARNING_DAYS = 7; // H-7 peringatan (hari 83 - 90)

export interface RetentionStatus {
  hasProof: boolean;
  expiresAt: Date | null;
  daysRemaining: number;
  isExpiringSoon: boolean; // 1 to 7 days remaining (Hari 83–90)
  isExpired: boolean; // <= 0 days remaining (> 90 days)
  status: 'no_proof' | 'active' | 'expiring_soon' | 'expired';
}

/**
 * Calculates retention status and countdown for an order's payment proof.
 */
export function calculateProofRetention(order: Order): RetentionStatus {
  if (!order.payment_proof_path) {
    return {
      hasProof: false,
      expiresAt: null,
      daysRemaining: 0,
      isExpiringSoon: false,
      isExpired: false,
      status: 'no_proof',
    };
  }

  const createdTime = order.created_at ? new Date(order.created_at).getTime() : Date.now();
  const expiresTime = order.expires_at
    ? new Date(order.expires_at).getTime()
    : createdTime + RETENTION_DAYS * 24 * 60 * 60 * 1000;

  const nowTime = Date.now();
  const diffMs = expiresTime - nowTime;
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const isExpired = daysRemaining <= 0;
  const isExpiringSoon = !isExpired && daysRemaining <= WARNING_DAYS;

  let status: RetentionStatus['status'] = 'active';
  if (isExpired) status = 'expired';
  else if (isExpiringSoon) status = 'expiring_soon';

  return {
    hasProof: true,
    expiresAt: new Date(expiresTime),
    daysRemaining,
    isExpiringSoon,
    isExpired,
    status,
  };
}

/**
 * Computes storage retention statistics from a list of orders.
 */
export function analyzeRetentionOrders(orders: Order[]): StorageRetentionStats {
  const withProof = orders.filter((o) => Boolean(o.payment_proof_path));
  const expiringSoonOrders: Order[] = [];
  const expiredOrders: Order[] = [];
  let activeCount = 0;

  for (const o of withProof) {
    const ret = calculateProofRetention(o);
    if (ret.isExpired) {
      expiredOrders.push(o);
    } else if (ret.isExpiringSoon) {
      expiringSoonOrders.push(o);
    } else {
      activeCount++;
    }
  }

  return {
    totalWithProof: withProof.length,
    activeCount,
    expiringSoonCount: expiringSoonOrders.length,
    expiredCount: expiredOrders.length,
    expiringSoonOrders,
    expiredOrders,
    recentLogs: [],
  };
}

/**
 * Sanitizes a string so it is safe to use in file and ZIP archive names across Windows, Mac, and Linux.
 */
export function sanitizeFilename(name: string, fallback = 'bukti'): string {
  if (!name) return fallback;
  // Replace illegal filename characters: \ / : * ? " < > |
  let clean = name.replace(/[\\/:*?"<>|\x00-\x1F\x7F]/g, '');
  // Replace multiple spaces/underscores/hyphens with a single underscore
  clean = clean.replace(/[\s\-_]+/g, '_').trim();
  // Remove leading/trailing periods or underscores
  clean = clean.replace(/^[\._]+|[\._]+$/g, '');
  return clean || fallback;
}

/**
 * Generates and downloads a .ZIP archive containing payment proofs from the provided orders.
 */
export async function downloadPaymentProofsZip(
  orders: Order[],
  options?: {
    zipFilename?: string;
    onProgress?: (percent: number, currentItem: string) => void;
  }
): Promise<{ success: boolean; count: number; error?: string }> {
  const ordersWithProof = orders.filter((o) => Boolean(o.payment_proof_path));
  if (ordersWithProof.length === 0) {
    return { success: false, count: 0, error: 'Tidak ada foto bukti transfer untuk diunduh.' };
  }

  try {
    const zip = new JSZip();
    const folder = zip.folder('bukti_transfer') || zip;
    let processedCount = 0;

    for (let i = 0; i < ordersWithProof.length; i++) {
      const order = ordersWithProof[i];
      const proof = order.payment_proof_path!;
      const cleanUsername = sanitizeFilename(order.roblox_username || 'member');
      const cleanCode = sanitizeFilename(order.order_code || `BLX${order.id}`);

      let ext = 'webp';
      let fileData: Uint8Array | ArrayBuffer | null = null;

      if (options?.onProgress) {
        const percent = Math.round(((i + 1) / ordersWithProof.length) * 80);
        options.onProgress(percent, `Memproses #${cleanCode} (@${cleanUsername})...`);
      }

      if (proof.startsWith('data:image/')) {
        // Base64 Data URL
        const match = proof.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (match) {
          ext = match[1].toLowerCase();
          if (ext === 'jpeg') ext = 'jpg';
          const base64Data = match[2];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let b = 0; b < binaryString.length; b++) {
            bytes[b] = binaryString.charCodeAt(b);
          }
          fileData = bytes;
        }
      } else {
        // Remote or Local URL
        try {
          const res = await fetch(proof);
          if (res.ok) {
            const buf = await res.arrayBuffer();
            fileData = buf;
            const urlExtMatch = proof.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
            if (urlExtMatch) {
              ext = urlExtMatch[1].toLowerCase();
            }
          }
        } catch (fetchErr) {
          console.warn(`Failed to fetch image for order ${order.order_code}:`, fetchErr);
        }
      }

      if (fileData) {
        const dateStr = order.created_at ? order.created_at.slice(0, 10) : 'date';
        const fileName = `${cleanCode}_${cleanUsername}_${dateStr}_bukti.${ext}`;
        folder.file(fileName, fileData);
        processedCount++;
      }
    }

    if (processedCount === 0) {
      return { success: false, count: 0, error: 'Gagal memproses data gambar bukti transfer.' };
    }

    if (options?.onProgress) {
      options.onProgress(90, 'Mengompresi file ke ZIP...');
    }

    // Generate ZIP Blob
    const zipBlob = await zip.generateAsync(
      {
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      },
      (metadata) => {
        if (options?.onProgress) {
          const p = 80 + Math.round(metadata.percent * 0.2);
          options.onProgress(Math.min(99, p), 'Menyiapkan arsip ZIP...');
        }
      }
    );

    // Trigger download in browser
    const defaultName = `Bukti_Transfer_BloxyLucy_${new Date().toISOString().slice(0, 10)}.zip`;
    const finalZipName = sanitizeFilename(options?.zipFilename || defaultName).replace(/_+/g, '_');
    const safeZipName = finalZipName.endsWith('.zip') ? finalZipName : `${finalZipName}.zip`;

    const downloadUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = safeZipName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    if (options?.onProgress) {
      options.onProgress(100, 'Selesai diunduh!');
    }

    return { success: true, count: processedCount };
  } catch (err: any) {
    console.error('Error generating zip:', err);
    return { success: false, count: 0, error: err?.message || 'Gagal membuat file ZIP.' };
  }
}
