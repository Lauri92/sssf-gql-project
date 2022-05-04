import {v4 as uuidv4} from 'uuid';

export const handleSocket = async (io) => {

  io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    const room = socket.handshake.query.groupId;

    if (room !== undefined) {

      socket.join(room);

      socket.on('disconnect', () => {
        console.log('a user disconnected', socket.id);
      });

      socket.on('chat message', (username, msg, userProfileImageUrl) => {
        console.log('username:', username);
        console.log('message:', msg);
        console.log('userProfileImageUrl: ', userProfileImageUrl);
        const messageId = uuidv4();
        io.to(room).
            emit('chat message',
                {username, msg, userProfileImageUrl, messageId});
      });

    }
  });
};