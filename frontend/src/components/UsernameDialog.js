import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';

const UsernameDialog = ({ onConnect }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleConnect = () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('Please enter a username');
      return;
    }
    if (trimmedUsername.length > 20) {
      setError('Username must be 20 characters or less');
      return;
    }
    onConnect(trimmedUsername);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConnect();
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        maxWidth: 500, 
        mx: 'auto',
        mt: 8,
        textAlign: 'center'
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Chat Application
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Enter your username to join the chat
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          autoFocus
          margin="dense"
          id="username"
          label="Username"
          type="text"
          fullWidth
          variant="outlined"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (error) setError('');
          }}
          onKeyPress={handleKeyPress}
          error={!!error}
          helperText={error}
          inputProps={{
            maxLength: 20
          }}
        />
      </Box>
      
      <Button 
        onClick={handleConnect}
        variant="contained"
        color="primary"
        size="large"
        fullWidth
      >
        Join Chat
      </Button>
    </Paper>
  );
};

export default UsernameDialog;
