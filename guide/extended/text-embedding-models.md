# Using Text Embedding Models with LangChain

This document provides a comprehensive guide to using text embedding models in LangChain. The Embeddings class in LangChain interfaces with various text embedding models (like OpenAI, Cohere, Hugging Face, etc.), offering a standardized approach to handle different providers.
## Introduction to Text Embeddings

Text embeddings are vector representations of textual data. This vector-based approach is crucial for tasks like semantic search, where we identify pieces of text that are semantically similar in the vector space.
## Basic Usage of Embeddings Class

LangChain's base `Embeddings` class provides two primary methods: 
1. `embedDocuments` - for embedding multiple texts. 
2. `embedQuery` - for embedding a single text.

This distinction is because some providers have different methods for embedding documents and queries.
## Example: Using OpenAI Embeddings

Below is a step-by-step example of how to use OpenAI embeddings in LangChain.
### Installation

First, install the necessary packages using npm:

```bash
npm install @langchain/openai
```


### Code Example

```javascript
import { OpenAIEmbeddings } from "@langchain/openai";
import * as fs from "fs";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

/* Initialize OpenAI Embeddings */
const embeddings = new OpenAIEmbeddings();

/* Read and Split Text */
const text = fs.readFileSync("state_of_the_union.txt", "utf8");
const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
const docs = await textSplitter.createDocuments([text]);

/* Embed a Query */
const queryEmbedding = await embeddings.embedQuery("Hello world");
console.log(queryEmbedding);

/* Embed Documents */
const documentEmbeddings = await embeddings.embedDocuments(["Hello world", "Bye bye"]);
console.log(documentEmbeddings);
```


### Handling API Errors

LangChain handles API errors by default, retrying up to 6 times with an exponential backoff. You can modify this behavior by passing a `maxRetries` option.

```javascript
const model = new OpenAIEmbeddings({ maxRetries: 10 });
```


### Configuration for Retrieval

You can configure the retriever with parameters like the maximum number of documents to retrieve or use filters based on metadata:

```javascript
const retriever = vectorStore.asRetriever(2, { metadataField: "value" });

const retrievedDocs = retriever.getRelevantDocuments("what did he say about ketanji brown jackson");
```


## Summary

The `Embeddings` class in LangChain provides a unified way to interact with various text embedding models. By converting text into vector representations, it facilitates tasks like semantic search, making it an essential tool in modern text processing and analysis workflows. This guide demonstrates the ease of integrating and using OpenAI's embedding models within the LangChain framework.
