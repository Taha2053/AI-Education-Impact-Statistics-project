import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Paper, Avatar, CircularProgress, useTheme, Fade } from '@mui/material';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Assistance() {
    const theme = useTheme();
    // Destructure the specific, pre-aggregated data slices instead of the whole 'data' object
    const { 
        loading: dataLoading, 
        error: dataError, 
        countrySummaries, 
        globalCorrelations, 
        metadata 
    } = useData();
    
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
        if (!input.trim() || dataLoading || dataError) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setError(null);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            // Removed console.log for production readiness, but keep error check
            if (!apiKey) {
                throw new Error("API Key is missing. Please ensure it is set in your .env file and restart the server.");
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

            // --- OPTIMIZED CONTEXT PREPARATION ---
            // Create a small, focused context object for the AI
            const focusedContext = {
                metadata: metadata,
                global_correlations: globalCorrelations,
                country_summaries: countrySummaries
            };
            
            // Stringify only the necessary, pre-aggregated data
            const dataContext = JSON.stringify(focusedContext, null, 2); 

            const prompt = `
                You are an AI assistant for a student performance analysis dashboard.
                Your goal is to answer questions about the statistics, trends, and insights within the data.
                
                Here is the JSON data representing the aggregated statistics. This data is the ONLY source of truth for your answers:
                
                ${dataContext}

                User Question: ${userMessage.text}

                ---
                INSTRUCTIONS:
                1. Provide a helpful, concise, and accurate answer based **only** on the provided JSON data.
                2. Use Markdown formatting (like **bolding** and bullet points) to make the output clear and readable.
                3. When reporting quantitative values (like GPA, correlation scores, or hours), round them to **2 decimal places** for better readability.
                4. If the question is not related to the provided study data, politely explain that you can only answer questions about the student performance statistics.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, { role: 'model', text: text }]);
        } catch (err) {
            console.error("Gemini API Error:", err);
            setError(err.message || "Something went wrong. Please try again.");
            setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error. Please check your API key or try again later. The underlying error was: " + (err.message || "Unknown error.") }]);
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

    // If initial data loading failed or is in progress, show feedback
    if (dataLoading) {
        return (
            <Box sx={{ height: '50vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
                <CircularProgress color="primary" />
                <Typography variant="h6">Loading Data ({dataLoading.toFixed(0)}%)</Typography>
            </Box>
        );
    }

    if (dataError) {
        return (
            <Box sx={{ height: '50vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2, color: 'error.main' }}>
                <AlertCircle size={48} />
                <Typography variant="h6">Data Load Error</Typography>
                <Typography variant="body1">{dataError}</Typography>
            </Box>
        );
    }


    return (
        <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, rgba(0,0,0,0) 100%)`,
                    border: '1px solid',
                    borderColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }}
            >
                <Box sx={{
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: 'rgba(0, 240, 255, 0.1)',
                    boxShadow: `0 0 15px ${theme.palette.primary.main}40`,
                    color: theme.palette.primary.main,
                    border: `1px solid ${theme.palette.primary.main}40`
                }}>
                    <Sparkles size={24} />
                </Box>
                <Box>
                    <Typography variant="h5" fontWeight="800" gutterBottom sx={{
                        background: `linear-gradient(90deg, #fff, ${theme.palette.primary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        AI Data Assistant
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Ask questions about the dataset and get instant insights.
                    </Typography>
                </Box>
            </Paper>

            {/* Chat Area */}
            <Paper
                elevation={0}
                sx={{
                    flexGrow: 1,
                    p: 3,
                    borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    bgcolor: 'rgba(255,255,255,0.02)',
                    backdropFilter: 'blur(10px)'
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
                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px' }
                }}>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
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
                                    bgcolor: msg.role === 'user' ? 'transparent' : 'rgba(0,0,0,0.5)',
                                    border: `1px solid ${msg.role === 'user' ? theme.palette.secondary.main : theme.palette.primary.main}`,
                                    width: 40,
                                    height: 40,
                                    // FIX APPLIED HERE: Reverted typo to correct theme access
                                    boxShadow: `0 0 10px ${msg.role === 'user' ? theme.palette.secondary.main : theme.palette.primary.main}40`
                                }}
                            >
                                {msg.role === 'user' ? <User size={20} color={theme.palette.secondary.main} /> : <Bot size={20} color={theme.palette.primary.main} />}
                            </Avatar>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    position: 'relative',
                                    bgcolor: msg.role === 'user' ? 'rgba(189, 0, 255, 0.1)' : 'rgba(0,0,0,0.4)',
                                    color: 'text.primary',
                                    border: '1px solid',
                                    borderColor: msg.role === 'user' ? `${theme.palette.secondary.main}40` : 'rgba(255,255,255,0.1)',
                                    borderTopRightRadius: msg.role === 'user' ? 4 : 24,
                                    borderTopLeftRadius: msg.role === 'user' ? 24 : 4,
                                    boxShadow: msg.role === 'user' ? `0 4px 20px ${theme.palette.secondary.main}20` : 'none'
                                }}
                            >
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                    {msg.text}
                                </Typography>
                            </Paper>
                        </motion.div>
                    ))}
                    {loading && (
                        <Fade in={loading}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', ml: 1 }}>
                                <CircularProgress size={20} sx={{ color: theme.palette.primary.main }} />
                                <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>Processing Query...</Typography>
                            </Box>
                        </Fade>
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
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Ask about the data..."
                        variant="outlined"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading || dataLoading || dataError}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                bgcolor: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                transition: 'all 0.3s',
                                '& fieldset': { border: 'none' },
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
                                '&.Mui-focused': {
                                    bgcolor: 'rgba(0,0,0,0.6)',
                                    boxShadow: `0 0 0 2px ${theme.palette.primary.main}40`
                                }
                            }
                        }}
                    />
                    <IconButton
                        color="primary"
                        onClick={handleSend}
                        disabled={loading || !input.trim() || dataLoading || dataError}
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            color: 'white',
                            boxShadow: `0 0 20px ${theme.palette.primary.main}40`,
                            '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: `0 0 30px ${theme.palette.primary.main}60`,
                            },
                            '&.Mui-disabled': {
                                background: 'rgba(255,255,255,0.05)',
                                color: 'rgba(255,255,255,0.3)',
                                boxShadow: 'none'
                            },
                            transition: 'all 0.3s'
                        }}
                    >
                        <Send size={24} />
                    </IconButton>
                </Box>
            </Paper>
        </Box>
    );
}