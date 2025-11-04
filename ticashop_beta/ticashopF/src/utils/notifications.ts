type NotificationType = 'success' | 'error' | 'warning' | 'info';

export function showNotification(message: string, type: NotificationType = 'info') {
  const notification = document.createElement('div');
  
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };
  
  notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg notification z-50 ${colors[type]} text-white`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
