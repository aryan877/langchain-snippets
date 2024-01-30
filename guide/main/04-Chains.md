# LangChain Chains: Comprehensive Guide
## Overview

Chains in LangChain represent sequences of calls to various components like Language Models (LLMs), tools, or data preprocessing steps. LangChain facilitates the creation and utilization of these chains through two primary methods: LangChain Call Execution Language (LCEL) and legacy Chain classes.
### LCEL Chains

LCEL is a versatile and powerful way to construct custom chains in LangChain. It allows chaining together different steps in a sequence, enabling complex workflows.
#### Why Use LCEL Chains? 
- **Customization** : Modify the internals of a chain by adjusting the LCEL. 
- **Native Support for Streaming, Async, and Batch** : LCEL chains inherently support these features. 
- **Observability** : Gain insight into each step of the chain.
### Legacy Chains

Legacy chains are standalone classes that do not utilize LCEL. While LangChain is transitioning towards LCEL for all chains, legacy chains are still supported and maintained.
## LCEL Chain Constructors

Here are some examples of LCEL chain constructors and their uses:
### createStuffDocumentsChain 
- **Use Case** : Formatting a list of documents into a prompt for an LLM. Best used when all documents fit within the LLM's context window. 
- **Function Calling** : Not required. 
- **Other Tools** : None.
### createOpenAIFnRunnable 
- **Use Case** : Optionally structuring an output response using OpenAI Function Calling. 
- **Function Calling** : Required. 
- **Other Tools** : None.
### createStructuredOutputRunnable 
- **Use Case** : Forcing an LLM to respond with a certain function. 
- **Function Calling** : Required. 
- **Other Tools** : None.
### createHistoryAwareRetriever 
- **Use Case** : Generating a search query from conversation history for a retriever. 
- **Function Calling** : Not required. 
- **Other Tools** : Retriever.
### createRetrievalChain 
- **Use Case** : Fetching documents based on a user inquiry and generating a response from an LLM. 
- **Function Calling** : Not required. 
- **Other Tools** : Retriever.
## Legacy Chains

Legacy chains are maintained for backward compatibility. Here are some examples:
### createOpenAPIChain 
- **Use Case** : Interacting with OpenAPI endpoints. 
- **Function Calling** : Not required. 
- **Other Tools** : OpenAPI Spec.
### ConversationalRetrievalQAChain 
- **Use Case** : Conversing with a document using a retriever and LLM. 
- **Function Calling** : Not required. 
- **Other Tools** : Retriever.
### StuffDocumentsChain 
- **Use Case** : Formatting a list of documents into a prompt for an LLM. 
- **Function Calling** : Not required. 
- **Other Tools** : None.
### MapReduceDocumentsChain 
- **Use Case** : Processing each document through an LLM and then reducing them. 
- **Function Calling** : Not required. 
- **Other Tools** : None.
### RefineDocumentsChain 
- **Use Case** : Collapsing documents by generating and refining an answer. 
- **Function Calling** : Not required. 
- **Other Tools** : None.
### ConstitutionalChain 
- **Use Case** : Ensuring a chain's answer follows provided principles. 
- **Function Calling** : Not required. 
- **Other Tools** : None.
### LLMChain 
- **Use Case** : Combining a prompt with an LLM and an output parser. 
- **Function Calling** : Not required. 
- **Other Tools** : None.
### GraphCypherQAChain 
- **Use Case** : Constructing Cypher queries from natural language. 
- **Function Calling** : Not required. 
- **Other Tools** : Cypher query graph.
## Examples of LangChain Chains
### Setting Up a Retrieval Chain

```javascript
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
// Other imports...

async function setupRetrievalChain() {
  const chatModel = new ChatOpenAI({ openAIApiKey: process.env.OPENAI_API_KEY });
  // Additional setup steps...
  return { retrievalChain, chatModel };
}

async function askWithRetrieval(question: string) {
  const { retrievalChain } = await setupRetrievalChain();
  const result = await retrievalChain.invoke({ input: question });
  console.log(`Retrieved answer: ${result.answer}`);
  return result.answer;
}

const question = 'What is LangSmith?';
askWithRetrieval(question).then((answer) => console.log('Final Answer:', answer));
```


### Creating a History-Aware Retrieval Chain

```javascript
// Import statements and setup...

async function setupHistoryAwareRetrievalChain(chatModel, vectorstore) {
  // Define a history-aware prompt and create a retriever chain...
  return await createRetrievalChain({
    combineDocsChain: historyAwareCombineDocsChain,
    retriever: historyAwareRetrieverChain,
  });
}

async function main() {
  // Load, split documents, create vectorstore...
  const chatModel = new ChatOpenAI({ openAIApiKey: process.env.OPENAI_API_KEY });
  const conversationalRetrievalChain = await setupHistoryAwareRetrievalChain(chatModel, vectorstore);

  // Using the conversational retrieval chain for follow-up questions...
}

main().then(() => console.log('Finished executing'));
```


## Conclusion

LangChain Chains are powerful tools that enable complex and customizable workflows by sequencing calls to LLMs, data preprocessing steps, and other tools. Whether using modern LCEL chains or maintaining compatibility with legacy chains, LangChain provides flexible and efficient methods to process and retrieve information. These chains are integral to achieving sophisticated and context-aware interactions in applications built with LangChain.

# Extensive Explanation of LangChain Chains with Example Code

The provided code showcases a comprehensive implementation of LangChain Chains, encompassing document loading, processing, retrieval chains setup, and interaction handling. Let's walk through the code step-by-step to understand its functionality and components.
## Initial Setup and Imports

```javascript
import 'dotenv/config'; // Importing dotenv for environment variables
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio'; // For loading web documents
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'; // For splitting large documents
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai'; // For embeddings and chat functionality
import { MemoryVectorStore } from 'langchain/vectorstores/memory'; // In-memory vector store
import { createStuffDocumentsChain, createRetrievalChain } from 'langchain/chains'; // Chains for document handling
import { ChatPromptTemplate } from '@langchain/core/prompts'; // For creating chat prompt templates
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever'; // For creating history-aware retrieval
import { HumanMessage, AIMessage } from '@langchain/core/messages'; // For handling messages
import { MessagesPlaceholder } from '@langchain/core/prompts'; // Placeholder in prompts
import { Document } from '@langchain/core/documents'; // Document class
```


## Document Loading

The `CheerioWebBaseLoader` is used to load documents from a specified URL. This step involves fetching and parsing HTML content.

```javascript
async function loadDocuments() {
  const loader = new CheerioWebBaseLoader('https://docs.smith.langchain.com/overview');
  return await loader.load();
}
```


## Document Splitting

Documents are split into smaller parts using `RecursiveCharacterTextSplitter`. This approach is crucial for handling large text data by breaking it down into manageable segments.

```javascript
async function splitDocuments(docs) {
  const splitter = new RecursiveCharacterTextSplitter();
  return await splitter.splitDocuments(docs);
}
```


## Vectorstore Creation

An in-memory vector store is created using `MemoryVectorStore`, which stores the embeddings of the split documents. `OpenAIEmbeddings` is used for converting text data into embeddings.

```javascript
async function createVectorStore(splitDocs) {
  const embeddings = new OpenAIEmbeddings();
  return await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
}
```


## Regular Retrieval Chain Setup

A regular retrieval chain is established using `createStuffDocumentsChain` and `createRetrievalChain`. This chain is designed to handle straightforward queries where historical context is not required.

```javascript
async function setupRegularRetrievalChain(chatModel, vectorstore) {
  const prompt = ChatPromptTemplate.fromTemplate(`Answer the question based on context: <context>{context}</context> Question: {input}`);
  //Chain to format a list of documents into a prompt for an LLM. Best used when all documents fit within the LLM's context window.
  const documentChain = await createStuffDocumentsChain({ llm: chatModel, prompt });
  // Chain to fetch documents based on a user inquiry and generating a response from an LLM. 
  return await createRetrievalChain({ combineDocsChain: documentChain, retriever: vectorstore.asRetriever() });
}
```


## History-Aware Retrieval Chain Setup

For more complex interactions, a history-aware retrieval chain is configured. It takes into account the entire conversation history to generate contextually relevant responses.

```javascript
async function setupHistoryAwareRetrievalChain(chatModel, vectorstore) {
  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    new MessagesPlaceholder('chat_history'),
    ['user', '{input}'],
    ['user', 'Generate a search query based on the conversation.']
  ]);
  // Chain to generate a search query from conversation history for a retriever. 
  const historyAwareRetrieverChain = await createHistoryAwareRetriever({ llm: chatModel, retriever: vectorstore.asRetriever(), rephrasePrompt: historyAwarePrompt });
  const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
    ['system', "Answer user's questions based on context: {context}"],
    new MessagesPlaceholder('chat_history'),
    ['user', '{input}']
  ]);
    //Chain to format a list of documents into a prompt for an LLM. Best used when all documents fit within the LLM's context window.
  const historyAwareCombineDocsChain = await createStuffDocumentsChain({ llm: chatModel, prompt: historyAwareRetrievalPrompt });
  // Chain to fetch documents based on a user inquiry and generating a response from an LLM. 
  return await createRetrievalChain({ combineDocsChain: historyAwareCombineDocsChain, retriever: historyAwareRetrieverChain });
}
```


## Main Function and Execution

The main function initializes the ChatOpenAI model, sets up the document processing pipeline, and demonstrates the usage of both regular and history-aware retrieval chains.

```javascript
async function main() {
  const chatModel = new ChatOpenAI({ openAIApiKey: process.env.OPENAI_API_KEY });
  const docs = await loadDocuments();
  const splitDocs = await splitDocuments(docs);
  const vectorstore = await createVectorStore(splitDocs);
  const retrievalChain = await setupRegularRetrievalChain(chatModel, vectorstore);
  const conversationalRetrievalChain = await setupHistoryAwareRetrievalChain(chatModel, vectorstore);

  // Example usage of the chains with an initial question and a follow-up
  const question = 'What is LangSmith?';
  const initialResult = await retrievalChain.invoke({ input: question });
  console.log(`Initial answer: ${initialResult.answer}`);
  const chatHistory = [new HumanMessage(question), new AIMessage(initialResult.answer)];
  const followUpQuestion = 'How does it help in testing?';
  const followUpResult = await conversationalRetrievalChain.invoke({ chat_history: chatHistory, input: followUpQuestion });
  console.log(`Follow-up answer: ${followUpResult.answer}`);
}

main().then(() => console.log('Finished executing'));
```



In summary, this code thoroughly demonstrates the power and flexibility of LangChain Chains, highlighting their ability to handle diverse information retrieval tasks in a contextually aware manne