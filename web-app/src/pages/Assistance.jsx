import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Paper, Avatar, CircularProgress, useTheme } from '@mui/material';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';


export default function Assistance() {
    const theme = useTheme();
    const { data } = useData();
    const [messages, setMessages] = useState([
        {
            role: 'model',
            text: "Hello! I'm your AI study assistant. I have access to the student performance data. Ask me anything about the statistics, trends, or insights!"
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setError(null);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            console.log("Gemini API Key loaded:", apiKey ? "Yes (starts with " + apiKey.substring(0, 4) + ")" : "No");
            if (!apiKey) {
                throw new Error("Gemini API Key is missing. Please ensure VITE_GEMINI_API_KEY is set in your .env file and restart the server.");
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

            // Prepare context from data
            const dataContext = JSON.stringify(data).substring(0, 30000); // Limit context size if needed
            const prompt = `
                You are an AI assistant for a student performance analysis dashboard.
                Here is the JSON data representing the statistics:
                ${dataContext}

                User Question: ${userMessage.text}

                Please provide a helpful, concise, and accurate answer based on the data provided.
                Format your response nicely. If the question is not related to the data, politely explain that you can only answer questions about the study data.
                never use emojis
                never use text formatting
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, { role: 'model', text: text }]);
        } catch (err) {
            console.error("Gemini API Error:", err);
            setError(err.message || "Something went wrong. Please try again.");
            setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error. Please check your API key or try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}
            >
                <Box sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    color: 'primary.main'
                }}>
                    <Sparkles size={24} />
                </Box>
                <Box>
                    <Typography variant="h5" fontWeight="700" gutterBottom>
                        AI Data Assistant
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Ask questions about the dataset and get instant insights powered by Gemini.
                    </Typography>
                </Box>
            </Paper>

            {/* Chat Area */}
            <Paper
                elevation={0}
                sx={{
                    flexGrow: 1,
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    bgcolor: 'background.paper'
                }}
            >
                <Box sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    pr: 1,
                    mb: 2,
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.divider, borderRadius: '3px' }
                }}>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                display: 'flex',
                                gap: 12,
                                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                            }}
                        >
                            <Avatar
                                sx={{
                                    bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main',
                                    width: 36,
                                    height: 36
                                }}
                            >
                                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </Avatar>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: msg.role === 'user' ? 'primary.main' : 'action.hover',
                                    color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                                    borderTopRightRadius: msg.role === 'user' ? 4 : 16,
                                    borderTopLeftRadius: msg.role === 'user' ? 16 : 4,
                                }}
                            >
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {msg.text}
                                </Typography>
                            </Paper>
                        </motion.div>
                    ))}
                    {loading && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', ml: 1 }}>
                            <CircularProgress size={20} />
                            <Typography variant="body2" color="text.secondary">Thinking...</Typography>
                        </Box>
                    )}
                    {error && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', ml: 1, color: 'error.main' }}>
                            <AlertCircle size={20} />
                            <Typography variant="body2">{error}</Typography>
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Box>

                {/* Input Area */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        placeholder="Ask about the data (e.g., 'What is the correlation between study hours and score?')"
                        variant="outlined"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                bgcolor: 'background.default'
                            }
                        }}
                    />
                    <IconButton
                        color="primary"
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 3,
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                            },
                            '&.Mui-disabled': {
                                bgcolor: 'action.disabledBackground',
                                color: 'action.disabled'
                            }
                        }}
                    >
                        <Send size={24} />
                    </IconButton>
                </Box>
            </Paper>
        </Box>
    );
}
