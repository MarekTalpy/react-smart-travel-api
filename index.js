import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import itineraryRoutes from './routes/itinerary.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/itinerary', itineraryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
