# LangChain Retrievers Overview 

1. **Retriever Types in LangChain:**  
- **Vectorstore Retriever:**  Simplest type, ideal for starters. 
- **ParentDocument Retriever:**  Indexes chunks, but retrieves entire documents. 
- **Multi Vector Retriever:**  Creates multiple vectors for nuanced indexing. 
- **Self Query Retriever:**  Employs LLM for metadata-focused queries. 
- **Contextual Compression Retriever:**  Extracts most relevant information. 
- **Time-Weighted Vectorstore Retriever:**  Considers document recency. 
- **Multi-Query Retriever:**  Splits complex queries into simpler ones.

### LangChain.js Implementation

Here's the detailed code breakdown for implementing a question-answering system using LangChain.js: 
1. **Installation:** 

```bash
npm install @langchain/openai hnswlib-node @langchain/community
``` 
2. **Importing Modules:** 

```javascript
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";
import { formatDocumentsAsString } from "langchain/util/document";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
``` 
3. **Reading and Splitting Text:** 

```javascript
const model = new ChatOpenAI({});
const text = fs.readFileSync("state_of_the_union.txt", "utf8");
const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
const docs = await textSplitter.createDocuments([text]);
``` 
4. **Creating Vector Store and Retriever:** 

```javascript
const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
const vectorStoreRetriever = vectorStore.asRetriever();
``` 
5. **Setting up QA Chain:** 

```javascript
const SYSTEM_TEMPLATE = `...`; // Template as provided
const messages = [
  SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
  HumanMessagePromptTemplate.fromTemplate("{question}"),
];
const prompt = ChatPromptTemplate.fromMessages(messages);

const chain = RunnableSequence.from([
  {
    context: vectorStoreRetriever.pipe(formatDocumentsAsString),
    question: new RunnablePassthrough(),
  },
  prompt,
  model,
  new StringOutputParser(),
]);
``` 
6. **Executing the Chain:** 

```javascript
const answer = await chain.invoke(
  "What did the president say about Justice Breyer?"
);
console.log({ answer });
```
### Custom Retriever Example

Implementing a custom retriever: 
1. **Custom Retriever Class:** 

```javascript
import {
  BaseRetriever,
  type BaseRetrieverInput,
} from "@langchain/core/retrievers";
import type { CallbackManagerForRetrieverRun } from "@langchain/core/callbacks/manager";
import type { Document } from "@langchain/core/documents";

export class CustomRetriever extends BaseRetriever {
  lc_namespace: string[];

  constructor(fields?: CustomRetrieverInput) {
    super(fields);
  }

  async _getRelevantDocuments(
    query: string,
    runManager?: CallbackManagerForRetrieverRun
  ): Promise<Document[]> {
    // Custom document retrieval logic
  }
}
``` 
2. **Using the Custom Retriever:** 

```javascript
const retriever = new CustomRetriever({});
const results = await retriever.getRelevantDocuments("query");
```
### Summary

This detailed code provides a practical guide for using LangChain.js to build a question-answering system. It demonstrates how to read and process documents, use vector stores and retrievers, and set up a runnable sequence for handling queries. The custom retriever example illustrates how you can extend LangChain's capabilities with your retrieval logic, showcasing the flexibility and extensibility of the LangChain framework.

# Understanding Contextual Compression in LangChain

**Concept:** 
- Contextual Compression addresses the challenge of handling large documents containing both relevant and irrelevant information for a specific query.
- It involves filtering and shortening documents so that only the most pertinent information is returned.
- This process can enhance the efficiency of subsequent language model (LLM) calls and improve response quality.

**Components Required:**  
1. **Base Retriever:**  The primary retriever that fetches the initial set of documents. 
2. **Document Compressor:**  A component that processes these documents to extract or filter relevant content.
### Implementing Contextual Compression
#### Example 1: Using LLMChainExtractor

**Code Breakdown:**  
1. **Setup and Dependencies:** 

```javascript
npm install @langchain/openai @langchain/community
import * as fs from "fs";
import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { ContextualCompressionRetriever } from "langchain/retrievers/contextual_compression";
import { LLMChainExtractor } from "langchain/retrievers/document_compressors/chain_extract";
``` 
2. **Initial Setup:** 

```javascript
const model = new OpenAI({ modelName: "gpt-3.5-turbo-instruct" });
const baseCompressor = LLMChainExtractor.fromLLM(model);
const text = fs.readFileSync("state_of_the_union.txt", "utf8");
const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
const docs = await textSplitter.createDocuments([text]);
const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
const retriever = new ContextualCompressionRetriever({
  baseCompressor,
  baseRetriever: vectorStore.asRetriever(),
});
``` 
3. **Retrieving and Compressing Documents:** 

```javascript
const retrievedDocs = await retriever.getRelevantDocuments(
  "What did the speaker say about Justice Breyer?"
);
console.log({ retrievedDocs });
```

# MultiVector Retriever in LangChain

The `MultiVectorRetriever` in LangChain is a powerful tool for querying documents where multiple vectors represent each document. This approach can enhance document retrieval precision by capturing various aspects of the documents.
### Methods to Create Multiple Vectors per Document 
1. **Smaller Chunks** 
- Documents are split into smaller chunks, and each chunk is embedded. 
- Example: `ParentDocumentRetriever`.
- Allows capturing semantic meanings closely while retaining maximum context. 
2. **Summary** 
- Create a summary for each document and embed it.
- This method often distills the essence of the document, leading to improved retrieval accuracy. 
3. **Hypothetical Questions** 
- Generate hypothetical questions that a document could answer and embed these questions.
- Provides a unique way to index and retrieve documents based on potential inquiries.
### Implementation Example: Smaller Chunks

```javascript
import { MultiVectorRetriever } from "langchain/retrievers/multi_vector";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
// Additional imports...

// Loading and splitting the document
const textLoader = new TextLoader("../examples/state_of_the_union.txt");
const parentDocuments = await textLoader.load();
const splitter = new RecursiveCharacterTextSplitter({ /* parameters */ });
const docs = await splitter.splitDocuments(parentDocuments);

// Embedding the chunks
const vectorstore = await FaissStore.fromDocuments(docs, new OpenAIEmbeddings());
const retriever = new MultiVectorRetriever({ vectorstore, /* other configs */ });

// Usage of the retriever
const retrieverResult = await retriever.getRelevantDocuments("query");
console.log(retrieverResult[0].pageContent.length);
```



**Output:** 

```arduino
9770 // length of the retrieved document content
```


### Implementation Example: Summary

```javascript
// Similar imports and initial steps as before

// Generating summaries for each document
const summaries = await chain.batch(docs, { maxConcurrency: 5 });
const summaryDocs = summaries.map((summary, i) => new Document({ pageContent: summary, /* metadata */ }));

// Embedding summaries
const vectorstore = await FaissStore.fromDocuments(summaryDocs, new OpenAIEmbeddings());

// Retrieval
const retrieverResult = await retriever.getRelevantDocuments("query");
console.log(retrieverResult[0].pageContent.length);
```



**Output:** 

```arduino
9770 // length of the retrieved document content
```


### Implementation Example: Hypothetical Questions

```javascript
// Similar imports and initial steps as before

// Generating hypothetical questions for each document
const hypotheticalQuestions = await chain.batch(docs, { maxConcurrency: 5 });
// Processing and embedding these questions

// Retrieval
const retrieverResult = await retriever.getRelevantDocuments("query");
console.log(retrieverResult[0].pageContent);
```



**Output:** 

```arduino
"What measures will be taken to crack down on corporations overcharging American businesses and consumers?"
```


### Summary

The `MultiVectorRetriever` in LangChain offers a flexible and efficient way to handle complex document retrieval scenarios. By using multiple vectors per document, each representing different facets or summaries of the content, it enables more nuanced and accurate retrieval of information.---

# MultiQuery Retriever in LangChain

The `MultiQueryRetriever` in LangChain addresses the challenge of variability in document retrieval accuracy due to changes in query wording or incomplete semantic capture by embeddings. It automates prompt tuning, generating multiple queries from different perspectives for each user input. This method enhances the retrieval process, potentially overcoming limitations of traditional distance-based retrieval methods.
### Working Principle 
1. **Automated Query Generation** : For a given user query, the `MultiQueryRetriever` uses a Language Model (LLM) to generate multiple related queries, each offering a different perspective. 
2. **Retrieval Across Queries** : It then retrieves relevant documents for each of these queries. 
3. **Unique Union of Results** : The final output is a unique union of all retrieved documents, providing a broader and potentially more relevant set of documents.
### Implementation Example

```javascript
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { CohereEmbeddings } from "@langchain/cohere";
import { MultiQueryRetriever } from "langchain/retrievers/multi_query";
import { ChatAnthropic } from "@langchain/anthropic";

// Creating a vector store with sample data
const vectorstore = await MemoryVectorStore.fromTexts(/* sample texts */, new CohereEmbeddings());

// Configuring the LLM model and the MultiQueryRetriever
const model = new ChatAnthropic({});
const retriever = MultiQueryRetriever.fromLLM({
  llm: model,
  retriever: vectorstore.asRetriever(),
  verbose: true,
});

// Making a query and retrieving documents
const query = "What are mitochondria made of?";
const retrievedDocs = await retriever.getRelevantDocuments(query);
console.log(retrievedDocs);
```



**Output Explanation:**  
- The `MultiQueryRetriever` generates queries like "What are the components of mitochondria?" and retrieves relevant documents.
- The output is a mix of documents relevant to the concept of mitochondria and some potentially related concepts.
### Customization with Custom Prompts and Output Parsers

You can customize the types of queries generated by supplying a custom prompt and use a custom output parser to parse the results into a list of queries.
#### Custom Output Parser

```javascript
class LineListOutputParser extends BaseOutputParser<LineList> {
  // Implementation of parsing logic
  // ...
}
```


#### Using a Custom Prompt

```javascript
const prompt: PromptTemplate = await pull("jacob/multi-vector-retriever-german");
// Other configurations remain the same
```



**Usage:** 
- This setup allows for more tailored query generation, possibly in different languages or contexts.
- It provides control over the type of questions generated, making the retrieval process more aligned with specific use cases.
### Theory and Practical Example
#### Theory 
- **Enhanced Retrieval** : By generating multiple queries, the `MultiQueryRetriever` effectively broadens the search horizon, making it more likely to retrieve a diverse set of relevant documents. 
- **Overcoming Semantic Limitations** : This approach mitigates issues where a single query may not fully capture the user's intent or where the embeddings may fail to represent the semantic nuances of the query.
#### Example

Suppose a user asks, "What are mitochondria made of?". Traditional retrieval might focus narrowly on this exact phrasing. In contrast, the `MultiQueryRetriever` might generate additional queries like "What substances comprise the mitochondria organelle?" or "What is the molecular composition of mitochondria?". This approach can surface documents that address different aspects of mitochondria, providing a more comprehensive answer.
### Summary

The `MultiQueryRetriever` offers a more nuanced and comprehensive document retrieval method by automating the generation of multiple queries from different perspectives. This method is particularly useful in scenarios where traditional embeddings might fail to capture the full semantic scope of a query. Through customization options, it can be finely tuned to specific retrieval needs, enhancing both the breadth and relevance of the search results.

# Parent Document Retriever in LangChain

The `ParentDocumentRetriever` in LangChain is designed to balance the need for accurate embeddings of document content and the retention of sufficient context. It achieves this by splitting documents into smaller chunks for embedding, but retrieves larger parent documents or chunks during the actual retrieval process.
### Balancing Document Size and Context 
1. **Small Chunks for Embedding** : Smaller chunks ensure that embeddings accurately reflect their meaning. If a document is too long, the embeddings might lose specificity. 
2. **Retrieving Larger Context** : Retrieving parent documents or larger chunks ensures that the context of each small chunk is retained, providing a more comprehensive understanding of the retrieved content.
### Implementation Example

```javascript
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
// Additional imports...

const vectorstore = new MemoryVectorStore(new OpenAIEmbeddings());
const docstore = new InMemoryStore();
const retriever = new ParentDocumentRetriever({
  vectorstore,
  docstore,
  // Configuration for splitting documents
  parentSplitter: new RecursiveCharacterTextSplitter({ chunkSize: 500 }),
  childSplitter: new RecursiveCharacterTextSplitter({ chunkSize: 50 }),
  childK: 20,
  parentK: 5,
});

// Loading and adding documents
const textLoader = new TextLoader("../examples/state_of_the_union.txt");
const parentDocuments = await textLoader.load();
await retriever.addDocuments(parentDocuments);

// Retrieving documents
const retrievedDocs = await retriever.getRelevantDocuments("justice breyer");
console.log(retrievedDocs);
```



**Output Explanation:** 
- The retrieved documents are the larger parent chunks from the State of the Union text that relate to "Justice Breyer". 
- Each `Document` object contains a chunk of the text along with metadata like source and location within the original text.
### Customization with Score Threshold

To ensure that retrieved documents meet a certain relevancy threshold, you can incorporate a `ScoreThresholdRetriever`. This allows setting a minimum similarity score for the retrieved documents.
#### Score Threshold Implementation

```javascript
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";
// Other imports remain the same

const childDocumentRetriever = ScoreThresholdRetriever.fromVectorStore(vectorstore, {
  minSimilarityScore: 0.01,
  maxK: 1,
});

const retriever = new ParentDocumentRetriever({
  vectorstore,
  docstore,
  childDocumentRetriever,
  // Splitter configurations
  parentSplitter: new RecursiveCharacterTextSplitter({ chunkSize: 500 }),
  childSplitter: new RecursiveCharacterTextSplitter({ chunkSize: 50 }),
});

// Rest of the code remains the same
```

**Usage:** 
- This configuration is beneficial when you want to ensure a certain level of relevance in the retrieved documents.
- It can be particularly useful in applications where precision is more critical than recall.
### Theory and Practical Example
#### Theory 
- **Optimal Chunk Size** : Smaller chunks improve the accuracy of embeddings, but larger chunks provide necessary context. `ParentDocumentRetriever` strikes a balance between these two needs. 
- **Context Preservation** : By retrieving the parent document, it ensures that the retrieved information is not taken out of context, enhancing the quality and usability of the information.
#### Example

In a large document like the State of the Union address, querying for a specific topic like "Justice Breyer" might yield several small, relevant chunks. However, these small chunks might lack context. The `ParentDocumentRetriever` would instead return larger sections of the speech where Justice Breyer is mentioned, providing a more comprehensive understanding of how he is referenced in the document.
### Summary

The `ParentDocumentRetriever` in LangChain is a sophisticated tool for document retrieval that offers a balanced approach between embedding accuracy and context preservation. It's particularly useful in scenarios where documents are lengthy and rich in content but require precise retrieval based on specific queries. The ability to set score thresholds further enhances its utility in applications where precision is paramount.

# Vector Store-Backed Retriever in LangChain

The vector store-backed retriever in LangChain is a mechanism that uses a vector store for document retrieval, acting as a bridge between vector stores and the Retriever interface. This setup leverages the search capabilities of vector stores, such as similarity search and Maximal Marginal Relevance (MMR), to efficiently query texts.
### Basic Setup

To create a vector store-backed retriever, you first construct a vector store and then use it to initialize the retriever. Here's a basic example:

```javascript
const vectorStore = ...; // Initialize your vector store here
const retriever = vectorStore.asRetriever();
```


### End-to-End Example

Let's go through a more comprehensive example:

```javascript
import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";

// Reading and splitting the document
const text = fs.readFileSync("state_of_the_union.txt", "utf8");
const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
const docs = await textSplitter.createDocuments([text]);

// Creating a vector store from documents
const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

// Wrapping the vector store in a retriever
const vectorStoreRetriever = vectorStore.asRetriever();

// Retrieving relevant documents
const retrievedDocs = vectorStoreRetriever.getRelevantDocuments(
  "what did he say about ketanji brown jackson"
);
```
**Configuration for Retrieval:**

You can specify additional parameters such as the maximum number of documents to retrieve and filters based on metadata.

```javascript
// Configuring the retriever with a maximum document count and metadata filter
const retriever = vectorStore.asRetriever(2, { metadataField: "value" });

// Retrieving documents with the configured parameters
const retrievedDocs = retriever.getRelevantDocuments(
  "what did he say about ketanji brown jackson"
);
```

### Summary 
- **Efficient Retrieval** : Vector store-backed retrievers allow efficient querying of texts by leveraging the capabilities of vector stores. 
- **Flexible Configuration** : You can customize the retrieval process with parameters like the number of documents to retrieve and metadata-based filtering. 
- **Integration with LLMs** : The retriever can be easily integrated with Language Models (LLMs) for answering complex queries.
### Practical Implications
- In scenarios like processing large documents (e.g., State of the Union address), this approach allows for breaking down the document into manageable chunks and retrieving the most relevant sections based on a query.
- It is particularly useful in applications where you need to quickly sift through large volumes of text to find specific information, such as legal document analysis, content recommendation systems, or automated research tools.