import { Buffer } from 'buffer';

const defaultAvatar = 'path/to/default/avatar.jpg'; // Replace with your default avatar path

const renderAvatar = (avatar: any) => {
  console.log('Avatar is an object:', avatar);
  
  // Handle case where avatar is an object with data property
  if (avatar && typeof avatar === 'object' && avatar.data) {
    const base64Data = avatar.data;
    if (typeof base64Data === 'string') {
      // If it's already a complete data URL, return it
      if (base64Data.startsWith('data:')) {
        return base64Data;
      }
      // If it's a raw base64 string, add the data URL prefix
      return `data:image/jpeg;base64,${base64Data}`;
    }
  }

  // Handle MongoDB Buffer
  if (avatar && typeof avatar === 'object' && avatar.type === 'Buffer') {
    try {
      // Convert buffer to base64 in chunks to avoid stack overflow
      const chunkSize = 1024 * 1024; // 1MB chunks
      const data = avatar.data;
      let base64 = '';
      
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        base64 += Buffer.from(chunk).toString('base64');
      }
      
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Error converting buffer to base64:', error);
      return defaultAvatar;
    }
  }

  // Handle raw base64 string
  if (typeof avatar === 'string') {
    if (avatar.startsWith('data:')) {
      return avatar;
    }
    return `data:image/jpeg;base64,${avatar}`;
    return `${(import.meta as any).env.VITE_API_URL}/uploads/${avatar}`;

  // Handle filename
  if (typeof avatar === 'string' && !avatar.startsWith('data:') && !avatar.startsWith('/9j/') && !avatar.startsWith('iVBOR')) {
    return `${(import.meta as any).env.VITE_API_URL}/uploads/${avatar}`;
  }

  console.error('Unknown avatar format:', avatar);
  return defaultAvatar;
}}; 