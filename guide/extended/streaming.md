# Streaming in LangChain Models

## Streaming with LLMs 
### 1. Functionality
Allows processing responses as they're generated, useful for real-time display or processing. 

### 2. .stream() Method
- **Method**: Returns a readable stream for iteration. 
- **Installation**:
  ```bash
  npm install @langchain/openai
  ```

 
- **Implementation** :

```javascript
import { OpenAI } from "@langchain/openai";
const model = new OpenAI({ maxTokens: 25 });
const stream = await model.stream("Tell me a joke.");
for await (const chunk of stream) {
  console.log(chunk);
}
```
### 3. Callback Handler 
- **Usage** : For models supporting streaming, handle new tokens with a callback. 
- **Example** :

```javascript
import { OpenAI } from "@langchain/openai";
const model = new OpenAI({ maxTokens: 25, streaming: true });
const response = await model.call("Tell me a joke.", { callbacks: [{ handleLLMNewToken(token: string) { console.log({ token }); }, }] });
console.log(response);
```
### 4. Notes
- For non-streaming models, the entire response is returned as a single chunk.
- Token usage info may not be supported for streaming.
## Streaming with Chat Models
### 1. Functionality

Similar to LLMs, allows for real-time response processing in chat applications.
### 2. .stream() Method 
- **Method** : Returns a readable stream that accepts chat messages or strings. 
- **Installation** :

```bash
npm install @langchain/openai
``` 
- **Example** :

```javascript
import { ChatOpenAI } from "@langchain/openai";
const chat = new ChatOpenAI({ maxTokens: 25 });
const stream = await chat.stream([["human", "Tell me a joke about bears."]]);
for await (const chunk of stream) {
  console.log(chunk);
}
```
### 3. StringOutputParser 
- **Use** : Extracts raw string values from each chunk in the stream. 
- **Example** :

```javascript
import { ChatOpenAI, StringOutputParser } from "@langchain/openai";
const parser = new StringOutputParser();
const model = new ChatOpenAI({ temperature: 0 });
const stream = await model.pipe(parser).stream("Hello there!");
for await (const chunk of stream) {
  console.log(chunk);
}
```
### 4. HttpResponseOutputParser 
- **Function** : Streams responses directly, suitable for HTTP responses. 
- **Implementation** :

```javascript
import { ChatOpenAI, HttpResponseOutputParser } from "@langchain/openai";
const handler = async () => {
  const parser = new HttpResponseOutputParser();
  const model = new ChatOpenAI({ temperature: 0 });
  const stream = await model.pipe(parser).stream("Hello there!");
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
await handler();
```
### 5. Callback Handler for Chat Models 
- **Usage** : Handles new tokens in a streaming chat model. 
- **Example** :

```javascript
import { ChatOpenAI, HumanMessage } from "@langchain/openai";
const chat = new ChatOpenAI({ maxTokens: 25, streaming: true });
const response = await chat.call([new HumanMessage("Tell me a joke.")], { callbacks: [{ handleLLMNewToken(token: string) { console.log({ token }); }, }] });
console.log(response);
```

These notes summarize the streaming capabilities in both LLMs and Chat Models within the LangChain framework, highlighting methods, implementations, and specific functionalities like the use of output parsers and callback handlers.