import React, { useState, useEffect, useRef } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import Chat from './components/Chat';
import UsernameDialog from './components/UsernameDialog';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [username, setUsername] = useState('');
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const handleConnect = (username) => {
    // Connect to WebSocket server
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5001';
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('Connected to WebSocket server');
      setUsername(username);
      setConnected(true);
      
      // send username to the server
      ws.current.send(JSON.stringify({
        type: 'SET_USERNAME',
        username
      }));
    };

    ws.current.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const handleDisconnect = () => {
    if (ws.current) {
      ws.current.close();
      setConnected(false);
    }
  };

  const handleSendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'SEND_MESSAGE',
        message
      }));
    } else {
      console.error('WebSocket is not connected');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="md" sx={{ py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {!connected ? (
            <UsernameDialog onConnect={handleConnect} />
          ) : (
            <Chat 
              username={username}
              onSendMessage={handleSendMessage}
              onDisconnect={handleDisconnect}
              ws={ws.current}
            />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
