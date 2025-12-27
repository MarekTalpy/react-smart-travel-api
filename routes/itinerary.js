import express from 'express';

import openai from '../services/openai.js';
import Itinerary from '../models/Itinerary.js';
import { checkCityExists } from '../services/geocoding.js';

const router = express.Router();

// GENERATE a "preview" using AI (openai model)
router.post('/preview', async (req, res) => {
  const { city, days } = req.body;

  if (!city || !Number.isInteger(days) || days <= 0) {
    return res.status(400).json({
      error: "Invalid input. 'city' must be a string and 'days' must be a positive integer.",
    });
  }

  const cityExists = await checkCityExists(city);
  if (!cityExists) {
    return res.status(400).json({ error: `City "${city}" does not exist.` });
  }

  try {
    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: 'You are a professional travel planner.' }],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `Create a ${days}-day travel itinerary for ${city} in strict JSON format.`,
            },
          ],
        },
      ],
      text: {
        format: {
          name: 'travel_itinerary', // required
          type: 'json_schema', // required
          schema: {
            // <-- THIS MUST BE 'schema', not 'json_schema'
            type: 'object',
            additionalProperties: false,
            properties: {
              city: { type: 'string' },
              days: {
                type: 'array',
                minItems: days,
                maxItems: days,
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    day: { type: 'integer', minimum: 1 },
                    title: { type: 'string' },
                    activities: {
                      type: 'array',
                      minItems: 2,
                      items: { type: 'string' },
                    },
                  },
                  required: ['day', 'title', 'activities'],
                },
              },
            },
            required: ['city', 'days'],
          },
        },
      },
      temperature: 0.7,
    });

    const itinerary = JSON.parse(response.output_text);

    res.status(200).json(itinerary);
  } catch (error) {
    console.error('OpenAI itinerary generation failed:', error);
    res.status(500).json({ error: 'Failed to generate itinerary' });
  }
});

// SAVE a "preview" for the AI generated Itinerary
router.post('/save', async (req, res) => {
  try {
    const { city, days } = req.body;

    if (!city || !Array.isArray(days)) {
      return res.status(400).json({ error: 'Invalid itinerary data' });
    }

    const itinerary = await Itinerary.create({
      city,
      days,
    });

    res.status(201).json(itinerary);
  } catch (err) {
    console.error('Save itinerary error:', err);
    res.status(500).json({ error: 'Failed to save itinerary' });
  }
});

// GET all saved itineraries
router.get('/', async (req, res) => {
  try {
    const itineraries = await Itinerary.find().sort({ createdAt: -1 });

    res.status(200).json(itineraries);
  } catch (err) {
    console.error('Get itineraries error:', err);
    res.status(500).json({ error: 'Failed to fetch itineraries' });
  }
});

// GET itinerary by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    res.status(200).json(itinerary);
  } catch (err) {
    console.error('Get itinerary by ID error:', err);
    res.status(400).json({ error: 'Invalid itinerary ID' });
  }
});

// DELETE itinerary by ID
router.delete('/:id', async (req, res) => {
  try {
    const itinerary = await Itinerary.findByIdAndDelete(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    res.status(200).json({ message: 'Itinerary deleted successfully' });
  } catch (err) {
    console.error('Delete itinerary error:', err);
    res.status(400).json({ error: 'Invalid itinerary ID' });
  }
});

export default router;
