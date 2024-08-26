import io from 'socket.io-client';

const socket = io('http://localhost:3001'); // Adjust the URL if necessary

socket.on('connect', () => {
  console.log('Connected to socket server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from socket server');
});

socket.on('receiveNotification', (data) => {
  console.log('Notification received:', data);
  showNotification(data.message);
});

function showNotification(message) {
  // Prikaz jednostavne obavijesti
  const notificationElement = document.createElement('div');
  notificationElement.innerText = message;
  notificationElement.style.position = 'fixed';
  notificationElement.style.bottom = '10px';
  notificationElement.style.right = '10px';
  notificationElement.style.backgroundColor = 'lightblue';
  notificationElement.style.padding = '10px';
  notificationElement.style.border = '1px solid #000';
  document.body.appendChild(notificationElement);

  // Uklonite obavijest nakon 5 sekundi
  setTimeout(() => {
    document.body.removeChild(notificationElement);
  }, 5000);
}

export default socket;