import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, TextField, IconButton, List, ListItem, ListItemAvatar, Avatar, Divider, Tooltip, useTheme } from '@mui/material';
import { Send as SendIcon, ExitToApp as ExitIcon } from '@mui/icons-material';

const Chat = ({ username, onSendMessage, onDisconnect, ws }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'MESSAGE_HISTORY':
          setMessages(data.messages || []);
          break;
          
        case 'NEW_MESSAGE':
          setMessages(prev => [...prev, {
            username: data.username,
            message: data.message,
            timestamp: new Date(data.timestamp)
          }]);
          break;
          
        case 'USER_JOINED':
          setUsers(prev => [...prev, data.username]);
          setMessages(prev => [...prev, {
            username: 'System',
            message: `${data.username} joined the chat`,
            timestamp: new Date(data.timestamp),
            isSystem: true
          }]);
          break;
          
        case 'USER_LEFT':
          setUsers(prev => prev.filter(user => user !== data.username));
          setMessages(prev => [...prev, {
            username: 'System',
            message: `${data.username} left the chat`,
            timestamp: new Date(data.timestamp),
            isSystem: true
          }]);
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    };

    ws.addEventListener('message', handleMessage);
    
    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [ws]);

  // auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    
    onSendMessage(trimmedMessage);
    setMessage('');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          p: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: 1
        }}
      >
        <Typography variant="h6">MERN Chat</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle2">
            {users.length + 1} {users.length === 0 ? 'user' : 'users'} online
          </Typography>
          <Tooltip title="Leave chat">
            <IconButton 
              color="inherit"
              onClick={onDisconnect}
              size="small"
            >
              <ExitIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          flexGrow: 1, 
          p: 2, 
          mb: 2, 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: 'text.secondary'
          }}>
            <Typography>No messages yet. Say hello!</Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%' }}>
            {messages.map((msg, index) => (
              <React.Fragment key={index}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    p: 1,
                    bgcolor: msg.isSystem ? 'action.hover' : 'transparent',
                    borderRadius: 1,
                    mb: 0.5
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32,
                          bgcolor: msg.isSystem 
                            ? 'text.secondary' 
                            : msg.username === username 
                              ? 'primary.main' 
                              : 'secondary.main'
                        }}
                      >
                        {msg.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: msg.username === username 
                              ? 'primary.main' 
                              : msg.isSystem 
                                ? 'text.secondary' 
                                : 'secondary.main'
                          }}
                        >
                          {msg.username} {msg.username === username && '(You)'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(msg.timestamp)}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {msg.message}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
                {index < messages.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Paper>

      <Paper 
        component="form" 
        onSubmit={handleSendMessage}
        sx={{ 
          p: '2px 4px', 
          display: 'flex', 
          alignItems: 'center',
          position: 'sticky',
          bottom: 0
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          multiline
          maxRows={4}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
            },
          }}
        />
        <IconButton 
          type="submit" 
          color="primary" 
          disabled={!message.trim()}
          sx={{ p: '10px' }}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default Chat;
