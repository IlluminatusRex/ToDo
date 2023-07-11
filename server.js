const express = require('express');
const socket = require('socket.io');
const path = require('path');

const app = express();

let tasks = [];

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running...');
});

const io = socket(server);

io.on('connection', (socket) => {
  console.log('New client! Its id – ' + socket.id);
  socket.emit('updateData', tasks);

  socket.on('addTask', (task) => {
    tasks.push(task);
    socket.broadcast.emit('addTask', task);
    console.log('Client ' + socket.id + ' added a new task with ID: ' + task.id);
  });

  socket.on('removeTask', (id) => {
    tasks = tasks.filter((task) => task.id !== id);
    socket.broadcast.emit('removeTask', id);
    console.log('Client ' + socket.id + ' removed a task with ID: ' + id);
  });

  socket.on('disconnect', () => {
    console.log('Oh, ' + socket.id + ' has left');
  });
});

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.use((req, res) => {
  res.status(404).send({ message: 'Not found...' });
});
