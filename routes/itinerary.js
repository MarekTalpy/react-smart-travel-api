import express from 'express';
import openai from '../services/openai.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { city, days } = req.body;

  if (!city || !Number.isInteger(days) || days <= 0) {
    return res.status(400).json({
      error: "Invalid input. 'city' must be a string and 'days' must be a positive integer.",
    });
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

export default router;
