# Guide on LangChain Prompt Templates with Code Examples

LangChain simplifies creating prompts for language models. This guide provides code examples and explanations to help students effectively use prompt templates.
### Understanding Prompt Templates 
1. **Definition & Components** :
- A prompt template is a structured method to create prompts, including instructions, examples, and a specific question for the model.
### Creating Prompt Templates 
1. **Basic Creation** : 
- **No Input Variables** :

```javascript
// Importing the PromptTemplate class
import { PromptTemplate } from "@langchain/core/prompts";

// Creating a prompt template with static text
const noInputPrompt = new PromptTemplate({
  template: "Tell me a joke."
});

// Format and log the prompt
const formattedNoInputPrompt = await noInputPrompt.format();
console.log(formattedNoInputPrompt); // "Tell me a joke."
``` 
- **With Input Variables** :

```javascript
// Creating a prompt template with a dynamic input variable
const oneInputPrompt = new PromptTemplate({
  inputVariables: ["adjective"],
  template: "Tell me a {adjective} joke."
});

// Format the prompt with an actual value for the variable
const formattedOneInputPrompt = await oneInputPrompt.format({
  adjective: "funny"
});
console.log(formattedOneInputPrompt); // "Tell me a funny joke."
``` 
2. **Automatic Inference of Input Variables** : 
- LangChain can automatically infer input variables from the template.

```javascript
// Automatically infer input variables
const template = "Tell me a {adjective} joke about {content}.";
const promptTemplate = PromptTemplate.fromTemplate(template);
console.log(promptTemplate.inputVariables); // ['adjective', 'content']

// Format the prompt template with actual values
const formattedPromptTemplate = await promptTemplate.format({
  adjective: "funny",
  content: "chickens"
});
console.log(formattedPromptTemplate); // "Tell me a funny joke about chickens."
```
### Chat Prompt Templates 
1. **Role-Based Templates** : 
- Chat models use messages associated with roles (AI, human, system).

```javascript
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate
} from "@langchain/core/prompts";

// Create a system message template
const systemTemplate = "You are a helpful assistant that translates {input_language} to {output_language}.";
const systemMessagePrompt = SystemMessagePromptTemplate.fromTemplate(systemTemplate);

// Create a human message template
const humanTemplate = "{text}";
const humanMessagePrompt = HumanMessagePromptTemplate.fromTemplate(humanTemplate);

// Combine them into a chat prompt template
const chatPrompt = ChatPromptTemplate.fromMessages([systemMessagePrompt, humanMessagePrompt]);

// Format the chat messages with actual values
const formattedChatPrompt = await chatPrompt.formatMessages({
  input_language: "English",
  output_language: "French",
  text: "I love programming."
});

console.log(formattedChatPrompt);
// Output: Array of SystemMessage and HumanMessage with formatted content
```
### Conclusion

LangChain's prompt templates are versatile tools for crafting effective prompts for language models. Students can utilize these templates for various applications through code examples and practical exercises.
## LangChain Few Shot Prompting: A Guide with Code Examples

Few shot prompting is a technique for guiding Large Language Models (LLMs) to generate responses in a desired format. This guide explores few shot prompting within the context of LangChain.
### Introduction to Few Shot Prompting

Few shot prompting involves presenting a series of examples to the LLM, instructing it on how to respond to similar prompts. It's useful for: 
- **Standardizing responses** : Ensuring consistency in format and style. 
- **Rephrasing queries** : Transforming specific questions into more general ones. 
- **Dynamic content generation** : Incorporating variables like current date or time into responses.
### Implementing Few Shot Prompting in LangChain

LangChain offers a structured approach to few shot prompting with various templates and functions.
#### Basic Few Shot Prompting
##### Example: Standard Format Responses

```javascript
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

formatPrompt();
// output: 
// Human: What is your name?
// AI: My name is John.

// Human: What is your age?
// AI: I am 25 years old.
```


##### Rephrasing Questions
###### Example: Generalizing Queries

```javascript
const examples = [
  {
    input: "Could The Police perform lawful arrests?",
    output: "What can The Police members do?"
  },
  {
    input: "Where was Jan Sindel born?",
    output: "What is Jan Sindel's personal history?"
  }
];

// Rest of the setup follows the previous example
```


##### Few Shotting With Functions
###### Example: Incorporating Dynamic Content

```javascript
// Function to get current date
const getCurrentDate = () => {
  return new Date().toISOString();
};

// Create a prompt with a dynamic date
const prompt = new FewShotChatMessagePromptTemplate({
  template: "Tell me a {adjective} joke about the day {date}",
  inputVariables: ["adjective", "date"]
});

// Partial the prompt with a function
const partialPrompt = await prompt.partial({ date: getCurrentDate });

// Format the prompt
const formattedPrompt = await partialPrompt.format({ adjective: "funny" });
console.log(formattedPrompt);
```


##### Chat Few Shot vs. Non-Chat Few Shot

LangChain supports both chat and non-chat models, with slight differences in their outputs.
###### Chat Few Shot
- Produces a list of chat messages. 
- Example output: `Human: Question\nAI: Answer`
###### Non-Chat Few Shot
- Produces a string output. 
- Example output: `Question\nAnswer`
###### Example Comparison

```javascript
// Import necessary components
import {
  FewShotPromptTemplate,
  FewShotChatMessagePromptTemplate,
} from "langchain/prompts";

// Define examples (same as previous)
// ...

// Templates for chat and non-chat
const examplePromptTemplate = PromptTemplate.fromTemplate(`Human: {input}\nAI: {output}`);
const exampleChatPromptTemplate = ChatPromptTemplate.fromTemplate(`Human: {input}\nAI: {output}`);

// Initialize templates
const chatFewShotPrompt = new FewShotChatMessagePromptTemplate({
  examplePrompt: exampleChatPromptTemplate,
  examples
});

const fewShotPrompt = new FewShotPromptTemplate({
  examplePrompt: examplePromptTemplate,
  examples
});

// Format and display
console.log("Chat Few Shot: ", await chatFewShotPrompt.formatMessages({}));
/**
Chat Few Shot:  [
  HumanMessage {
    lc_namespace: [ 'langchain', 'schema' ],
    content: 'Human: Could the members of The Police perform lawful arrests?\n' +
      'AI: what can the members of The Police do?',
    additional_kwargs: {}
  },
  HumanMessage {
    lc_namespace: [ 'langchain', 'schema' ],
    content: "Human: Jan Sindel's was born in what country?\n" +
      "AI: what is Jan Sindel's personal history?",
    additional_kwargs: {}
  }
]
 */
console.log("Few Shot: ", await fewShotPrompt.formatPromptValue({}));
/**
Few Shot:

Human: Could the members of The Police perform lawful arrests?
AI: what can the members of The Police do?

Human: Jan Sindel's was born in what country?
AI: what is Jan Sindel's personal history?
 */
```



`FewShotChatMessagePromptTemplate` takes a list of `ChatPromptTemplate` for examples, outputting a list of BaseMessage instances. In contrast, `FewShotPromptTemplate` uses a `PromptTemplate` for examples, producing a string output.
