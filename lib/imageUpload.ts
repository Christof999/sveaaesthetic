// Convert file to base64 string (Server-side)
export async function convertImageToBase64(file: File): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to convert image');
  }
}

// Alternative: Upload zu Firebase Storage (benötigt Upgrade)
export async function uploadImageToStorage(file: File, appointmentId: string): Promise<string> {
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: (() => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('appointmentId', appointmentId);
        return formData;
      })(),
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error uploading to storage:', error);
    throw error;
  }
}

export async function deleteImage(imageUrl: string): Promise<void> {
  // Not implemented for base64 images
  // For Firebase Storage, you would need a Cloud Function
}
