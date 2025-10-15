import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Container,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useConversation } from '../contexts/ConversationContext';
import MessageList from './MessageList';
import MetadataSidebar from './MetadataSidebar';

export interface ChatInterfaceRef {
  handleNewChat: () => void;
}

const ChatInterface = forwardRef<ChatInterfaceRef>((props, ref) => {
  const [input, setInput] = useState('');
  const [currentMetadata, setCurrentMetadata] = useState<Record<string, string> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { state, sendMessage, createNewConversation } = useConversation();
  const { messages, isLoading, error, currentConversationId } = state;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    setInput('');

    try {
      await sendMessage(messageText);
      
      // Update current metadata for the sidebar if available
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.metadata && Object.keys(lastMessage.metadata).length > 0) {
        setCurrentMetadata(lastMessage.metadata);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = async () => {
    await createNewConversation();
    setCurrentMetadata(null);
  };

  useImperativeHandle(ref, () => ({
    handleNewChat,
  }));

  const exampleQuestions = [
    "I am building apartment building with 5 flats in Linz. How many square meters of playground do I have to plan?",
    "What are the building height requirements in Austrian law?",
    "What waste management regulations apply in Upper Austria?",
    "What are the room height requirements for residential buildings?",
  ];

  return (
    <Box sx={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'row',
      bgcolor: '#343541',
      position: 'relative',
    }}>
      {/* Main Chat Area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
      }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid #4d4d4f',
        bgcolor: '#343541',
        zIndex: 1,
      }}>
        <Typography variant="h6" sx={{ color: '#ffffff', textAlign: 'center' }}>
          Normo Legal Assistant
        </Typography>
        <Typography variant="body2" sx={{ color: '#b4b4b4', textAlign: 'center', mt: 0.5 }}>
          {currentConversationId 
            ? 'Continuing conversation - ask follow-up questions' 
            : 'Ask about building codes, regulations, and architectural requirements'
          }
        </Typography>
        {currentConversationId && (
          <Typography variant="caption" sx={{ color: '#10a37f', textAlign: 'center', display: 'block', mt: 0.5 }}>
            Conversation ID: {currentConversationId.substring(0, 8)}...
          </Typography>
        )}
      </Box>

      {/* Messages Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {messages.length === 0 ? (
          <Container maxWidth="md" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}>
            <Typography variant="h4" sx={{ color: '#ffffff', textAlign: 'center', mb: 3, fontWeight: 600 }}>
              Welcome to Normo Legal Assistant
            </Typography>
            <Typography variant="body1" sx={{ color: '#b4b4b4', textAlign: 'center', mb: 4, lineHeight: 1.6 }}>
              Your AI-powered assistant for Austrian building regulations. Ask questions about playground requirements, 
              building heights, construction standards, and more. Get exact calculations with legal citations.
            </Typography>
            
            <Typography variant="h6" sx={{ color: '#10a37f', mb: 2, textAlign: 'center' }}>
              Try these examples:
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
              {exampleQuestions.map((question, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    bgcolor: '#444654',
                    border: '1px solid #565869',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#4d4d5f',
                      borderColor: '#10a37f',
                    },
                  }}
                  onClick={() => setInput(question)}
                >
                  <Typography variant="body2" sx={{ color: '#ffffff' }}>
                    "{question}"
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Container>
        ) : (
          <MessageList messages={messages} />
        )}
        
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={20} sx={{ color: '#10a37f' }} />
            <Typography variant="body2" sx={{ color: '#b4b4b4', ml: 1 }}>
              Analyzing Austrian legal documents...
            </Typography>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Error Display */}
      {error && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error" sx={{ bgcolor: '#4d1f1f', color: '#ffffff' }}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Input Area */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid #4d4d4f',
        bgcolor: '#343541',
      }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about Austrian building regulations, playground requirements, building codes..."
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#40414f',
                  color: '#ffffff',
                  '& fieldset': {
                    borderColor: '#565869',
                  },
                  '&:hover fieldset': {
                    borderColor: '#10a37f',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#10a37f',
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: '#8e8ea0',
                  opacity: 1,
                },
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              sx={{
                bgcolor: input.trim() ? '#10a37f' : '#565869',
                color: '#ffffff',
                '&:hover': {
                  bgcolor: input.trim() ? '#0d8c6c' : '#565869',
                },
                '&.Mui-disabled': {
                  bgcolor: '#565869',
                  color: '#8e8ea0',
                },
                mb: 0.5,
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
          <Typography variant="caption" sx={{ color: '#8e8ea0', display: 'block', textAlign: 'center', mt: 1 }}>
            Press Enter to send, Shift + Enter for new line
          </Typography>
        </Container>
      </Box>
      </Box>

      {/* Metadata Sidebar */}
      <MetadataSidebar 
        metadata={currentMetadata} 
        isVisible={!!currentMetadata && Object.keys(currentMetadata).length > 0} 
      />
    </Box>
  );
});

ChatInterface.displayName = 'ChatInterface';

export default ChatInterface;
