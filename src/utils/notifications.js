/**
 * Notification Helper for Browser & iOS PWA Standalone Mode
 */

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return { granted: false, error: 'Notifications are not supported on this browser.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return { granted: true };
    } else {
      return { granted: false, error: 'Notification permission was denied.' };
    }
  } catch (err) {
    return { granted: false, error: err.message };
  }
};

export const scheduleLocalDailyCheckIn = (timeStr, messageTitle = '🐾 Tamed Daily Check-in', messageBody = 'Don\'t forget to log your day!') => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  // Clear existing check-in timer if any
  if (window.__dailyCheckInTimer) {
    clearTimeout(window.__dailyCheckInTimer);
  }

  const [targetHours, targetMinutes] = (timeStr || '21:00').split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(targetHours, targetMinutes, 0, 0);

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  const delay = target.getTime() - now.getTime();

  window.__dailyCheckInTimer = setTimeout(() => {
    new Notification(messageTitle, {
      body: messageBody,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200]
    });
    // Schedule for next day
    scheduleLocalDailyCheckIn(timeStr, messageTitle, messageBody);
  }, delay);
};
