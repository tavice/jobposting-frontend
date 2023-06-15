import React, { useState } from "react";
import axios from "axios";
import { Button, Typography, Paper } from "@mui/material";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import SendIcon from "@mui/icons-material/Send";

const OfferGPT = ({ baseUrl }) => {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const body = {
        prompt,
        temperature,
      };

      const response = await axios.post(`${baseUrl}/generator/chat/`, body, {
        withCredentials: true, // Include session information
      });

      if (response.status === 200) {
        const data = response.data;
        const { messages: formattedResponse } = data;

        setMessages((prevMessages) => {
          if (Array.isArray(prevMessages)) {
            return [
              ...prevMessages,
              ...formattedResponse.map((message) => ({
                role: message.role,
                content: message.content,
              })),
            ];
          }
          return [
            ...formattedResponse.map((message) => ({
              role: message.role,
              content: message.content,
            })),
          ];
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setPrompt(""); // Clear the prompt input field
    }
  };

  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleTemperatureChange = (event) => {
    setTemperature(parseFloat(event.target.value));
  };

  const handleClearChat = (event) => {
    setMessages([]);
    setPrompt("");
    setTemperature(0.1);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" style={{ margin: 40 }}>
        JobGPT your Assistant to create amazing job descriptions
      </Typography>

      <Paper className="chat-history" style={{ margin: 40, padding:40 }}>
        {messages.map((message, index) => (
          <Paper
            style={{ padding: 20 }}
            key={index}
            className="answer-discussion"
          >
            <Paper elevation={4} style={{ padding: 20 }}>
              <strong>{message.role}</strong>: {message.content}
            </Paper>
          </Paper>
        ))}
      </Paper>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", 
        padding: 20, 
        marginTop: 20,
        border: "4px solid white",
        borderRadius: 10,
       }}
      >
        <TextField
          required
          type="text"
          placeholder="Type anything here... give me a software developer job description!"
          autoFocus
          name="prompt"
          value={prompt}
          variant="outlined"
          multiline
          style={{ width: "100%", marginRight: 20 }}
          onChange={handlePromptChange}
        />
        <Button type="submit" style={{ width: "50%" }} endIcon={<SendIcon />}>
          {loading ? (
            <CircularProgress size={20} color="secondary" />
          ) : (
            "GENERATE"
          )}
        </Button>
        <div />
        <div>
          <label htmlFor="temperature" style={{ color: "black" }}>
            Temperature:
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="2"
            name="temperature"
            value={temperature}
            onChange={handleTemperatureChange}
            id="temperature"
          />
        </div>
      </form>
      <Button type="button" onClick={handleClearChat}>
        CLEAR CHAT
      </Button>
    </Container>
  );
};

export default OfferGPT;
