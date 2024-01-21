import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// Initialize the ChatOpenAI model with an API key from environment variables
const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Create a prompt template to format the input for the LLM
const chatPrompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a world class technical documentation writer.'],
  ['user', '{input}'],
]);

// Initialize an output parser to transform LLM responses into a more readable format
const outputParser = new StringOutputParser();

// Chain the prompt, model, and output parser together for streamlined processing
const llmChain = chatPrompt.pipe(chatModel).pipe(outputParser);

// Define an asynchronous function to ask a question and receive a response
async function askQuestion(question: string) {
  try {
    // Invoke the chained components with the input question
    const response = await llmChain.invoke({ input: question });
    return response; // Return the response received from the LLM
  } catch (error) {
    console.error('Error during API call:', error);
    return null; // Handle errors gracefully
  }
}

// Example usage of the askQuestion function
const question = 'Who is Will Smith?';
askQuestion(question).then((response) => console.log('Response:', response));
