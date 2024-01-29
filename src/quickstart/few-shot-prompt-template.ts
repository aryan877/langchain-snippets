// Import necessary components from LangChain
import {
  ChatPromptTemplate,
  FewShotChatMessagePromptTemplate,
} from '@langchain/core/prompts';

// Define examples using the Example type
const examples = [
  { input: 'What is your name?', output: 'My name is John.' },
  { input: 'What is your age?', output: 'I am 25 years old.' },
];

// Create a ChatPromptTemplate
const examplePrompt = ChatPromptTemplate.fromTemplate(
  `Human: {input}\nAI: {output}`
);

// Initialize FewShotChatMessagePromptTemplate
const fewShotPrompt = new FewShotChatMessagePromptTemplate({
  examplePrompt,
  examples,
  inputVariables: [], // no input variables
});

// Define an async function to format the prompt
async function formatPrompt() {
  try {
    const formattedPrompt = await fewShotPrompt.format({});
    console.log(formattedPrompt);
  } catch (error) {
    console.error('Error formatting prompt:', error);
  }
}

// Call the function
formatPrompt();
// ouput:
// Human: What is your name?
// AI: My name is John.

// Human: What is your age?
// AI: I am 25 years old.
