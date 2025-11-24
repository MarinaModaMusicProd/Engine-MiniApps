import express from 'express';
import { Server } from 'socket.io';
import { QuantumComposer } from './core/QuantumComposer';
import { VoiceSynthesizer } from './core/VoiceSynthesizer';
import { FederatedLearner } from './core/FederatedLearner';

const app = express();
const port = process.env.PORT || 3001;

// Initialize AI components
const quantumComposer = new QuantumComposer();
const voiceSynthesizer = new VoiceSynthesizer();
const federatedLearner = new FederatedLearner();

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Composition endpoint
app.post('/api/music/compose', async (req, res) => {
  try {
    const { style, duration, complexity, emotionalTone, quantumDepth } = req.body;

    const composition = await quantumComposer.composeQuantumTrack({
      style: style || 'electronic',
      duration: duration || 180, // 3 minutes
      complexity: complexity || 0.7,
      emotionalTone: emotionalTone || 'mysterious',
      quantumDepth: quantumDepth || 0.5
    });

    res.json({
      success: true,
      composition: composition,
      metadata: {
        style,
        duration,
        complexity,
        emotionalTone,
        quantumDepth,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Composition error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate composition'
    });
  }
});

// Voice synthesis endpoint
app.post('/api/voice/synthesize', async (req, res) => {
  try {
    const { text, style, language, emotionalState, pitch, speed } = req.body;

    const audioBuffer = await voiceSynthesizer.synthesize({
      text: text || 'Hello, this is Marina Moda AI',
      style: style || 'marina-signature',
      language: language || 'en',
      emotionalState: emotionalState || 'passionate',
      pitch: pitch || 1.0,
      speed: speed || 1.0
    });

    res.json({
      success: true,
      audio: audioBuffer.toString('base64'), // Base64 encoded audio
      metadata: {
        text,
        style,
        language,
        emotionalState,
        pitch,
        speed,
        synthesizedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Voice synthesis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to synthesize voice'
    });
  }
});

// Federated learning endpoint
app.post('/api/train/federated', async (req, res) => {
  try {
    const { modelType, privacyLevel, participantCount, aggregationMethod } = req.body;

    const update = await federatedLearner.trainFederated({
      modelType: modelType || 'composition',
      privacyLevel: privacyLevel || 'high',
      participantCount: participantCount || 10,
      aggregationMethod: aggregationMethod || 'fedavg'
    });

    res.json({
      success: true,
      update: update,
      metadata: {
        modelType,
        privacyLevel,
        participantCount,
        aggregationMethod,
        trainedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Federated training error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform federated training'
    });
  }
});

const server = app.listen(port, () => {
  console.log(`🚀 MarinaModa Music AI Server running on port ${port}`);
  console.log(`🌐 Health check: http://localhost:${port}/health`);
});

// WebSocket server for real-time generation
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('start-composition', async (params) => {
    try {
      const composition = await quantumComposer.composeQuantumTrack(params);
      socket.emit('composition-complete', {
        success: true,
        composition,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      socket.emit('composition-error', {
        success: false,
        error: error.message
      });
    }
  });

  socket.on('start-voice-synthesis', async (params) => {
    try {
      const audioBuffer = await voiceSynthesizer.synthesize(params);
      socket.emit('voice-synthesis-complete', {
        success: true,
        audio: audioBuffer.toString('base64'),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      socket.emit('voice-synthesis-error', {
        success: false,
        error: error.message
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

export default app;
