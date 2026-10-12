import api from '../services/api';

/**
 * Sends a behavioral interaction event to the backend for AI recommendation learning.
 * Fails silently to ensure user experience is never interrupted by telemetry.
 */
export const trackInteraction = async (action, productId = null, metadata = {}) => {
  const token = localStorage.getItem('intellicart_token');
  if (!token) return; // Only persist authenticated interaction vectors

  try {
    await api.post('/interactions', {
      action,
      productId,
      metadata,
    });
  } catch (error) {
    // Silent telemetry catch
  }
};
