/* eslint-disable */
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateResponse(message: string): Promise<string> {
  try {
    // Check if the message is about species/animals
    const isSpeciesRelated = checkIfSpeciesRelated(message);
    
    if (!isSpeciesRelated) {
      return "I can only answer questions about species and animals. Please ask me about wildlife, conservation, habitats, diets, or any other animal-related topics!";
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that only answers questions about animals, species, habitats, diets, and conservation. Provide accurate, informative, and engaging responses about wildlife. If asked about non-animal topics, politely redirect to animal-related questions."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "I'm having trouble connecting to my knowledge base. Please try again later.";
  }
}

function checkIfSpeciesRelated(message: string): boolean {
  const speciesKeywords = [
    'animal', 'animals', 'species', 'wildlife', 'mammal', 'bird', 'fish', 'reptile', 'amphibian',
    'habitat', 'diet', 'conservation', 'endangered', 'extinct', 'ecosystem', 'biodiversity',
    'predator', 'prey', 'carnivore', 'herbivore', 'omnivore', 'migration', 'breeding',
    'lion', 'tiger', 'elephant', 'whale', 'dolphin', 'shark', 'eagle', 'penguin',
    'bear', 'wolf', 'deer', 'rabbit', 'squirrel', 'butterfly', 'bee', 'spider'
  ];
  
  const lowerMessage = message.toLowerCase();
  return speciesKeywords.some(keyword => lowerMessage.includes(keyword));
}
