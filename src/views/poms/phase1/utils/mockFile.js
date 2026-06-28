const MAX_SIZE = 5 * 1024 * 1024;

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_SIZE) {
      reject(new Error('文件大小不能超过 5MB'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

export async function mockUploadBidFile(file) {
  const dataUrl = await readFileAsDataUrl(file);
  return {
    id: `bid-file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    size: file.size,
    type: file.type || '',
    dataUrl,
    uploadTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };
}

export function formatFileSize(size) {
  const num = Number(size) || 0;
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(2)} MB`;
}

export function previewBidFile(file) {
  if (!file?.dataUrl) return;
  window.open(file.dataUrl, '_blank');
}

export function downloadBidFile(file) {
  if (!file?.dataUrl) return;
  const link = document.createElement('a');
  link.href = file.dataUrl;
  link.download = file.name || '投标文件';
  link.click();
}
