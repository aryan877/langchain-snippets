# LangChain Expression Language (LCEL)

LangChain Expression Language, or LCEL, is a declarative way to easily compose chains together. It's designed to provide full support for sync, async, and streaming functionalities within these chains.

## Interface

The foundational interface that is common to all LCEL objects.

# LangChain Expression Language (LCEL)

LangChain Expression Language (LCEL) is a powerful, declarative language designed to streamline the process of composing and executing chains in a variety of contexts. LCEL supports synchronous, asynchronous, and streaming functionalities, making it an adaptable choice for various projects.

## Why Use LCEL

The use of LCEL offers numerous advantages:

1. **Simplicity**: It provides an intuitive and declarative approach to chain composition, which is easy to understand and implement.
2. **Versatility**: LCEL supports synchronous, asynchronous, and streaming functionalities, catering to a wide range of use cases.
3. **Efficiency**: By facilitating the easy composition of chains, LCEL optimizes the development process, saving time and resources.

## LCEL Interface Overview

LCEL features a standardized interface, known as the "Runnable" protocol, which most components implement. This interface includes several methods that simplify the definition and invocation of custom chains. Key methods include:

- `stream`: Streams back chunks of the response.
- `invoke`: Calls the chain on an input.
- `batch`: Calls the chain on a list of inputs.
- `streamLog`: Streams back intermediate steps in addition to the final response.

You can combine runnables (and runnable-like objects such as functions and objects whose values are all functions) into sequences in two ways:

1. Call the `.pipe` instance method, which takes another runnable-like as an argument.
2. Use the `RunnableSequence.from([])` static method with an array of runnable-likes, which will run in sequence when invoked.

### Code Examples

#### Stream Example

```javascript
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';

const model = new ChatOpenAI({});
const promptTemplate = PromptTemplate.fromTemplate(
  'Tell me a joke about {topic}'
);
const chain = promptTemplate.pipe(model);
const stream = await chain.stream({ topic: 'bears' });

for await (const chunk of stream) {
  console.log(chunk?.content);
}
```

#### Invoke Example

```javascript
import { RunnableSequence } from '@langchain/core/runnables';

const chain = RunnableSequence.from([promptTemplate, model]);
const result = await chain.invoke({ topic: 'bears' });
console.log(result);
```

#### Batch Example

```javascript
const result = await chain.batch([{ topic: 'bears' }, { topic: 'cats' }]);
console.log(result);
```

### Input and Output Types

Different components within LCEL accept and produce varying types of inputs and outputs. For example:

`Prompt`: Accepts an object to generate prompts.
`Retriever`: Takes a single string, typically a query.
`LLM, ChatModel`: Accepts strings, lists of chat messages, or PromptValues.
`Tool`: Input can be a string or an object, depending on the tool's function.
`OutputParser`: Takes the output from an LLM or ChatModel for further processing.
The output types also vary, ranging from strings to structured data formats, depending on the component and its purpose.

#### Stream Log

The `.streamLog()` method is available in all runnables, allowing for the streaming of all or part of the intermediate steps of a chain. This feature is particularly useful for showing progress, utilizing intermediate results, or debugging.

For example, the following code demonstrates streaming intermediate documents from a retrieval chain:

```javascript
import { applyPatch } from '@langchain/core/utils/json_patch';

// Initialization and chain setup
// ...

const stream = await chain.streamLog('What is the powerhouse of the cell?');
let aggregate = {};

for await (const chunk of stream) {
  aggregate = applyPatch(aggregate, chunk.ops).newDocument;
  console.log();
}
console.log('aggregate', aggregate);
```
