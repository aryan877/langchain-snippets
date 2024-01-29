# Guide to Working with Language Models

## Introduction
This guide provides an overview of working with language models, focusing on Large Language Models (LLMs) and ChatModels. It will explain how to use PromptTemplates for formatting inputs and Output Parsers for handling outputs.

## Models
There are two main types of models discussed in this guide:   
- **LLMs (Large Language Models)**: These are pure text completion models, like OpenAI's GPT-3, that take a string prompt and return a string completion.
- **Chat Models**: Tuned specifically for conversations, these models, including GPT-4 and Anthropic's Claude-2, use chat messages as input/output instead of simple string completions.

### OpenAI
To use the OpenAI model, you first need to install the LangChain OpenAI integration package.

#### Installation
Choose your package manager and run the corresponding command:
- **npm**: `npm install @langchain/openai`
- **Yarn**: `yarn add @langchain/openai`
- **pnpm**: `pnpm add @langchain/openai`

#### Setting Up
- Obtain an API key by creating an account [here](https://openai.com/account/api-keys).
- Set the API key as an environment variable: `export OPENAI_API_KEY="Your_API_Key"`
- Initialize the models:
  ```javascript
  import { OpenAI, ChatOpenAI } from "@langchain/openai";

  const llm = new OpenAI({ modelName: "gpt-3.5-turbo-instruct" });
  const chatModel = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });
  ```
For more details, see the markdown on [models](../linked/models.md).

### Local

For local models, please refer to the relevant documentation in your chosen model's repository.

## Prompt Templates

PromptTemplates format user input into a structured prompt for the model. The advantages of using these over raw string formatting are several. You can "partial" out variables - e.g. you can format only some of the variables at a time. You can compose them together, easily combining different templates into a single prompt.

### Creating a Prompt

Here's a basic example of creating a prompt template:

```javascript
import { PromptTemplate } from "@langchain/core/prompts";

const prompt = PromptTemplate.fromTemplate("What is a good name for a company that makes {product}?");
await prompt.format({ product: "colorful socks" });
// What is a good name for a company that makes colorful socks?
```

### ChatPromptTemplates

For a list of messages, use ChatPromptTemplates:

```javascript
import { ChatPromptTemplate } from "@langchain/core/prompts";

const template = "You are a helpful assistant that translates {input_language} to {output_language}.";
const humanTemplate = "{text}";

const chatPrompt = ChatPromptTemplate.fromMessages([
  ["system", template],
  ["human", humanTemplate],
]);

await chatPrompt.formatMessages({
  input_language: "English",
  output_language: "French",
  text: "I love programming.",
});
```

For more details, see the markdown on [prompts](../linked/prompts.md).

## Output Parsers

Output Parsers convert language model outputs into usable formats.

### Few Examples of Types of Output Parsers

- **Text to Structured Information**: Convert text output to structured data like JSON.
- **ChatMessage to String**: Extracts string content from a ChatMessage.
- **Additional Information Processing**: Handles extra information returned from model invocations.

For more details, see the markdown on [output parsers](../linked/output-parsers.md).

Example:

```javascript
import { CommaSeparatedListOutputParser } from "langchain/output_parsers";

const parser = new CommaSeparatedListOutputParser();
await parser.invoke("hi, bye");
// ['hi', 'bye']
```

## Composing with LCEL

Note that we are using the `.pipe()` method to join these components together. This `.pipe()` method is powered by the LangChain Expression Language (LCEL) and relies on the universal Runnable interface that all of these objects implement. LangChain Expression Language (LCEL) allows chaining inputs, prompt templates, models, and output parsers. Read more in the markdown for [LCEL](../linked/LCEL.md).

### Example Chain

```javascript
const chain = chatPrompt.pipe(chatModel).pipe(parser);
await chain.invoke({ text: "colors" });
```