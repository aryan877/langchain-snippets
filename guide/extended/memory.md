# Implementing Memory in Conversations LangChain
## Introduction

Memory in conversational AI is crucial for referencing information from past interactions. LangChain provides utilities for adding memory to a system, which are essential for creating more dynamic and engaging conversational experiences.
### Key Concept: Memory

Memory allows an AI system to store and refer to information from previous interactions. It's a combination of reading and writing actions within a conversation chain.
## Memory in LangChain

LangChain's memory module is currently in beta and integrates with LCEL (LangChain Composable Execution Language) runnables, especially with the ChatMessageHistory functionality.
### Core Actions in Memory System 
1. **Reading:**  Before executing the core logic, the chain reads from its memory system to augment user inputs. 
2. **Writing:**  After executing the core logic, the chain writes the inputs and outputs to memory for future reference.
## Building Memory into a System

Memory implementation involves two core design decisions:
1. How state is stored.
2. How state is queried.
### Storing State: Chat Message Lists
- The foundation of any memory system is the history of chat interactions.
- LangChain offers integrations for storing these chat messages, ranging from in-memory lists to persistent databases.
### Querying State: Data Structures and Algorithms
- Memory querying can range from returning recent messages to extracting entities from stored messages.
- Each application may require different memory querying methods.
## Practical Implementation with BufferMemory
### Example: Using BufferMemory in Chains

BufferMemory is a basic form of memory that keeps a list of chat messages in a buffer.

```javascript
import { BufferMemory } from "langchain/memory";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const memory = new BufferMemory();

await memory.chatHistory.addMessage(new HumanMessage("Hi!"));
await memory.chatHistory.addMessage(new AIMessage("What's up?"));
```


## Key Concepts in Memory Usage 
### 1. Variables Returned from Memory:
-  Before entering the chain, various variables are read from memory. These variables must align with the chain's expectations. 

- You can see what these variables are by calling await memory.loadMemoryVariables({}). Note that the empty dictionary that we pass in is just a placeholder for real variables. If the memory type you are using is dependent upon the input variables, you may need to pass values here.

  ```javascript
  await memory.loadMemoryVariables({});

  // { history: "Human: Hi!\AI: What's up?" }
  ```

  In this case, you can see that loadMemoryVariables returns a single key, history. This means that your chain (and likely your prompt) should expect an input named history. You can generally control this variable through parameters on the memory class. For example, if you want the memory variables to be returned under the key chat_history you can do:

  ```javascript
  const memory2 = new BufferMemory({
    memoryKey: "chat_history",
  });

  await memory2.chatHistory.addMessage(new HumanMessage("Hi!"));
  await memory2.chatHistory.addMessage(new AIMessage("What's up?"));

  await memory2.loadMemoryVariables({});

  // { chat_history: "Human: Hi!\AI: What's up?" }
  ```

  The parameter name to control these keys may vary per memory type, but it's important to understand that (1) this is controllable, and (2) how to control it.

### 2. Memory as a String or List of Messages:
- Memory can return a concatenated string of chat messages or a list of `ChatMessages`. 

  ```javascript
  const messageMemory = new BufferMemory({
    returnMessages: true,
  });

  await messageMemory.chatHistory.addMessage(new HumanMessage("Hi!"));
  await messageMemory.chatHistory.addMessage(new AIMessage("What's up?"));

  await messageMemory.loadMemoryVariables({});

  /*
    {
      history: [
        HumanMessage {
          content: 'Hi!',
          additional_kwargs: {}
        },
        AIMessage {
          content: "What's up?",
          additional_kwargs: {}
        }
      ]
    }
  */
  ```
### 3. Keys Saved to Memory:
-  Often times chains take in or return multiple input/output keys. In these cases, how can we know which keys we want to save to the chat message history? This is generally controllable by `inputKey` and `outputKey` parameters on the memory types. These default to None - and if there is only one input/output key the class will default to just use that key. However, if there are multiple input/output keys then you MUST specify the name of which one to use.


## End-to-End Examples
### Using an LLM (Large Language Model)

```javascript
import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

const llm = new OpenAI({ temperature: 0 });

// Notice that a "chat_history" variable is present in the prompt template
const template = `You are a nice chatbot having a conversation with a human.

Previous conversation:
{chat_history}

New human question: {question}
Response:`;

const prompt = PromptTemplate.fromTemplate(template);

// Notice that we need to align the `memoryKey` with the variable in the prompt
const llmMemory = new BufferMemory({ memoryKey: "chat_history" });

const conversationChain = new LLMChain({
  llm,
  prompt,
  verbose: true,
  memory: llmMemory,
});

// Notice that we just pass in the `question` variable.
// `chat_history` gets populated by the memory class
await conversationChain.invoke({ question: "What is your name?" });
await conversationChain.invoke({ question: "What did I just ask you?" });
```


### Using a Chat Model

```javascript
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const chatModel = new ChatOpenAI({ temperature: 0 });

const chatPrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a nice chatbot having a conversation with a human."],
  // The variable name here is what must align with memory
  new MessagesPlaceholder("chat_history"),
  ["human", "{question}"],
]);

// Notice that we set `returnMessages: true` to return raw chat messages that are inserted
// into the MessagesPlaceholder.
// Additionally, note that `"chat_history"` aligns with the MessagesPlaceholder name.
const chatPromptMemory = new BufferMemory({
  memoryKey: "chat_history",
  returnMessages: true,
});

const chatConversationChain = new LLMChain({
  llm: chatModel,
  prompt: chatPrompt,
  verbose: true,
  memory: chatPromptMemory,
});

// Notice that we just pass in the `question` variables - `chat_history` gets populated by memory
await chatConversationChain.invoke({ question: "What is your name?" });
await chatConversationChain.invoke({ question: "What did I just ask you?" });
```


# LangChain Memory Utilities - Notes
## Overview 
- **ChatMessageHistory Class:**  Central to most memory modules in LangChain. 
- **Purpose:**  Provides methods for saving and retrieving chat messages (`HumanMessage`, `AIMessage`, etc.). 
- **Usage Context:**  Ideal when managing memory outside of a chain.
## Basic Example: In-Memory ChatMessageHistory
### Importing Necessary Classes

```javascript
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
```


### Creating Chat Message History and Adding Messages

```javascript
const history = new ChatMessageHistory();

await history.addMessage(new HumanMessage("hi"));
await history.addMessage(new AIMessage("what is up?"));
```


### Retrieving and Displaying Messages

```javascript
console.log(await history.getMessages());
// Expected Output: Array of HumanMessage and AIMessage objects
```

## Key Point 
- **Storage Type:**  Messages are stored in memory, not externally. This is suitable for non-persistent, session-based interactions. 
- **For Persistent Storage:**  Refer to the Integrations section for external database and tool integrations.


# Common Memory Types in LangChain 
### Conversation Buffer Memory

**Description:** 
- Stores messages and formats them into a prompt input variable.
- Useful for straightforward memory applications in conversational AI.

**Code Example:** 

```javascript
import { OpenAI } from "@langchain/openai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";

const model = new OpenAI({});
const memory = new BufferMemory();
const chain = new ConversationChain({ llm: model, memory: memory });

const res1 = await chain.call({ input: "Hi! I'm Jim." });
console.log({ res1 });

// Output: {response: " Hi Jim! It's nice to meet you. My name is AI. What would you like to talk about?"}

const res2 = await chain.call({ input: "What's my name?" });
console.log({ res2 });

// Output: {response: ' You said your name is Jim. Is there anything else you would like to talk about?'}
```

---
### Conversation Buffer Window Memory

**Description:** 
- Keeps a list of interactions over time, using only the last 'K' interactions.
- Ideal for maintaining a sliding window of the most recent interactions.

**Code Example:** 

```javascript
import { OpenAI } from "@langchain/openai";
import { BufferWindowMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";

const model = new OpenAI({});
const memory = new BufferWindowMemory({ k: 1 });
const chain = new ConversationChain({ llm: model, memory: memory });

const res1 = await chain.call({ input: "Hi! I'm Jim." });
console.log({ res1 });

// Output: {response: " Hi Jim! It's nice to meet you. My name is AI. What would you like to talk about?"}

const res2 = await chain.call({ input: "What's my name?" });
console.log({ res2 });

// Output: {response: ' You said your name is Jim. Is there anything else you would like to talk about?'}
```

---
### Conversation Summary Memory

**Description:** 
- Creates summaries of conversations over time, condensing information.
- Best for longer conversations where keeping a verbatim history is impractical.

**Code Example:** 

```javascript
import { OpenAI } from "@langchain/openai";
import { ConversationSummaryMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

const memory = new ConversationSummaryMemory({
  memoryKey: "chat_history",
  llm: new OpenAI({ modelName: "gpt-3.5-turbo", temperature: 0 }),
});

const model = new OpenAI({ temperature: 0.9 });
const prompt = PromptTemplate.fromTemplate(`... (rest of the prompt) ...`);
const chain = new LLMChain({ llm: model, prompt, memory });

const res1 = await chain.call({ input: "Hi! I'm Jim." });
console.log({ res1, memory: await memory.loadMemoryVariables({}) });
// Outputs summary and response

const res2 = await chain.call({ input: "What's my name?" });
console.log({ res2, memory: await memory.loadMemoryVariables({}) });
// Outputs updated summary and response
```