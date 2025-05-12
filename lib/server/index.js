// This file contains all server-only modules and won't be bundled for the client
// It uses a runtime check to prevent client-side usage

if (typeof window !== 'undefined') {
  throw new Error('Server-only module imported on the client');
}

// Export the server-only crawler implementation
export { crawlGoogle, crawlBaidu } from '../../pages/api/server/crawler'; 