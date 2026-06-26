const jwt = require('jsonwebtoken');

const socketService = {
  io: null,

  init(server, options = {}) {
    const allowedOrigins = options.allowedOrigins || [];
    const { Server } = require('socket.io');

    // DO-1: mirror the REST CORS allowlist instead of a wildcard on this authed
    // channel. No-origin (native clients) is allowed; localhost only outside prod.
    this.io = new Server(server, {
      cors: {
        origin(origin, callback) {
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) return callback(null, true);
          if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
            return callback(null, true);
          }
          return callback(new Error(`Socket CORS blocked for origin: ${origin}`));
        },
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Unauthorized'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = Number(decoded.id);
        if (!socket.userId) {
          return next(new Error('Unauthorized'));
        }
        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });

    this.io.on('connection', (socket) => {
      if (socket.userId) {
        socket.join(`user_${socket.userId}`);
      }

      socket.on('join', (userId) => {
        const roomId = Number(userId);
        if (roomId && roomId === socket.userId) {
          socket.join(`user_${roomId}`);
        }
      });

      socket.on('disconnect', () => {});
    });

    return this.io;
  },

  emitToUser(userId, event, payload) {
    if (!this.io || !userId) return;
    this.io.to(`user_${Number(userId)}`).emit(event, payload);
  },

  emitTaskUpdated(taskId) {
    if (!this.io) return;
    const payload = { taskId: taskId != null ? Number(taskId) : null };
    this.io.emit('taskUpdated', payload);
  },

  notifyTaskAssigned(userId, task) {
    this.emitToUser(userId, 'task_assigned', {
      message: `You have been assigned a new task: "${task.title}"`,
      task,
    });
  },

  notifyStatusChanged(userId, task) {
    this.emitToUser(userId, 'status_changed', {
      message: `Task "${task.title}" status changed to ${task.status}`,
      task,
    });
  },

  notifyComment(userId, taskTitle, commenterName) {
    this.emitToUser(userId, 'new_comment', {
      message: `${commenterName} commented on "${taskTitle}"`,
    });
  },

  notifyDeadline(userId, task) {
    this.emitToUser(userId, 'deadline_approaching', {
      message: `Task "${task.title}" is due soon!`,
      task,
    });
  },
};

module.exports = socketService;
