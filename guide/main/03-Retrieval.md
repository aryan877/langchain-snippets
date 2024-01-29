# Retrieval Augmented Generation

- Below are detailed notes on Retrieval Augmented Generation (RAG) as described, followed by a detailed explanation of document loaders with code examples in Langchain JS.

### Retrieval in RAG 
- **Retrieval Augmented Generation (RAG):** Integrates external data with language model generation, enhancing the model's responses with user-specific or context-specific information. 
- **LangChain:** Provides the infrastructure for RAG applications, covering various aspects from simple to complex retrieval mechanisms.
![RAG](https://js.langchain.com/assets/images/data_connection-c42d68c3d092b85f50d08d4cc171fc25.jpg)


### Key Modules in Retrieval 
1. **Data Connection and Document Loaders** : Interface to load documents from diverse sources (e.g., websites, PDFs, code) into LangChain. 
2. **Text Splitting (Chunking)** : Breaking down large documents into manageable chunks, optimized for different document types. 
3. **Text Embedding Models** : Generating embeddings from documents to capture semantic meanings, facilitating efficient text similarity searches. 
4. **Vector Stores** : Databases for storing and searching text embeddings, with various local and cloud-hosted options. 
5. **Retrievers** : Algorithms for retrieving data from databases, ranging from simple semantic searches to more complex methods like Parent Document Retriever and Self Query Retriever.

## 1. Document Loaders with Code Examples
#### 1. Text Loader 
- **Purpose** : Load text files into LangChain as documents. 
- **Code Example** :

```javascript
import { TextLoader } from "langchain/document_loaders/fs/text";

const loader = new TextLoader("src/document_loaders/example_data/example.txt");
const docs = await loader.load();
```
#### 2. CSV Loader 
- **Purpose** : Load CSV files, creating a document per row or per specified column. 
- **Code Example for All Columns** :

```javascript
// Example csv file: 
// id,text
// 1,This is a sentence.
// 2,This is another sentence.
import { CSVLoader } from "langchain/document_loaders/fs/csv";

const loader = new CSVLoader("src/document_loaders/example_data/example.csv");
const docs = await loader.load();
/*
[
  Document {
    "metadata": {
      "line": 1,
      "source": "src/document_loaders/example_data/example.csv",
    },
    "pageContent": "id: 1
text: This is a sentence.",
  },
  Document {
    "metadata": {
      "line": 2,
      "source": "src/document_loaders/example_data/example.csv",
    },
    "pageContent": "id: 2
text: This is another sentence.",
  },
]
*/
``` 
- **Code Example for Single Column** :

```javascript
// id,text
// 1,This is a sentence.
// 2,This is another sentence.
import { CSVLoader } from "langchain/document_loaders/fs/csv";

const loader = new CSVLoader(
  "src/document_loaders/example_data/example.csv",
  "text"
);
const docs = await loader.load();
/*
[
  Document {
    "metadata": {
      "line": 1,
      "source": "src/document_loaders/example_data/example.csv",
    },
    "pageContent": "This is a sentence.",
  },
  Document {
    "metadata": {
      "line": 2,
      "source": "src/document_loaders/example_data/example.csv",
    },
    "pageContent": "This is another sentence.",
  },
]
*/
```
#### 3. Directory Loader 
- **Purpose** : Load all documents in a directory, handling different file types. 
- **Code Example** :

```javascript
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader, JSONLinesLoader } from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";

const loader = new DirectoryLoader(
  "src/document_loaders/example_data/example",
  {
    ".json": (path) => new JSONLoader(path, "/texts"),
    ".jsonl": (path) => new JSONLinesLoader(path, "/html"),
    ".txt": (path) => new TextLoader(path),
    ".csv": (path) => new CSVLoader(path, "text"),
  }
);
const docs = await loader.load();
```
#### 4. JSON Loader 
- **Purpose** : Load JSON files, targeting specific keys with JSON pointer. 
- **Code Example without JSON Pointer** :

```javascript
// {
//   "texts": ["This is a sentence.", "This is another sentence."]
// }
import { JSONLoader } from "langchain/document_loaders/fs/json";

const loader = new JSONLoader("src/document_loaders/example_data/example.json");
const docs = await loader.load();
/*
[
  Document {
    "metadata": {
      "blobType": "application/json",
      "line": 1,
      "source": "blob",
    },
    "pageContent": "This is a sentence.",
  },
  Document {
    "metadata": {
      "blobType": "application/json",
      "line": 2,
      "source": "blob",
    },
    "pageContent": "This is another sentence.",
  },
]
*/
``` 
- **Code Example with JSON Pointer** :

You can do a more advanced scenario by choosing which keys in your JSON object you want to extract string from.

In this example, we want to only extract information from "from" and "surname" entries.

```json
{
  "1": {
    "body": "BD 2023 SUMMER",
    "from": "LinkedIn Job",
    "labels": ["IMPORTANT", "CATEGORY_UPDATES", "INBOX"]
  },
  "2": {
    "body": "Intern, Treasury and other roles are available",
    "from": "LinkedIn Job2",
    "labels": ["IMPORTANT"],
    "other": {
      "name": "plop",
      "surname": "bob"
    }
  }
}
```

```javascript
import { JSONLoader } from "langchain/document_loaders/fs/json";

const loader = new JSONLoader(
  "src/document_loaders/example_data/example.json",
  ["/from", "/surname"]
);
const docs = await loader.load();
/*
[
  Document {
    pageContent: 'LinkedIn Job',
    metadata: { source: './src/json/example.json', line: 1 }
  },
  Document {
    pageContent: 'LinkedIn Job2',
    metadata: { source: './src/json/example.json', line: 2 }
  },
  Document {
    pageContent: 'bob',
    metadata: { source: './src/json/example.json', line: 3 }
  }
]
**/
```
#### 5. PDF Loader 
- **Purpose** : Load PDF documents, with options for handling pages. 
- **Code Example for One Document per Page** :

```javascript
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

const loader = new PDFLoader("src/document_loaders/example_data/example.pdf");
const docs = await loader.load();
``` 
- **Code Example for One Document per File** :

```javascript
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

const loader = new PDFLoader("src/document_loaders/example_data/example.pdf", {
  splitPages: false,
});
const docs = await loader.load();
```

These examples illustrate how LangChain facilitates the loading and processing of various document types for retrieval purposes in RAG applications.

## 2. Text Splitters with Code Examples

Text splitters are essential in transforming long documents into smaller, more manageable chunks that are semantically meaningful. LangChain offers various text splitters to suit different needs and document types.

### Recursively Split by Character

The `RecursiveCharacterTextSplitter` is ideal for general text. It splits text based on a list of characters and measures chunk size by the number of characters.

**Parameters:**
- `chunkSize`: Controls the maximum size of the final documents.
- `chunkOverlap`: Specifies the overlap amount between chunks.

**Code Example:**

```javascript
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const text = `Hi.\n\nI'm Harrison.\n\nHow? Are? You?\nOkay then f f f f.
This is a weird text to write, but gotta test the splittingggg some how.\n\n
Bye!\n\n-H.`;

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 10,
  chunkOverlap: 1,
});

const docOutput = await splitter.splitDocuments([
  new Document({ pageContent: text }),
]);
```



This example demonstrates splitting a text into chunks, each being a separate document.
### Customizing RecursiveCharacterTextSplitter

You can tailor the `RecursiveCharacterTextSplitter` by specifying different separators.

**Code Example:** 

```javascript
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";

const text = `Some other considerations include:\n\n...`;

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 50,
  chunkOverlap: 1,
  separators: ["|", "##", ">", "-"],
});

const docOutput = await splitter.splitDocuments([
  new Document({ pageContent: text }),
]);
```



This example shows how to use custom separators for splitting documents.
### TokenTextSplitter

`TokenTextSplitter` splits text by converting it into tokens, chunking these tokens, and then converting them back to text.

**Code Example:** 

```javascript
import { Document } from "langchain/document";
import { TokenTextSplitter } from "langchain/text_splitter";

const text = "foo bar baz 123";

const splitter = new TokenTextSplitter({
  encodingName: "gpt2",
  chunkSize: 10,
  chunkOverlap: 0,
});

const output = await splitter.createDocuments([text]);
```



In this example, the text is split into tokens and then into chunks, suitable for processing by token-based models like GPT-2.
### Splitting Code and Markup

LangChain supports language-specific text splitters for programming languages and markup languages.

**JavaScript Example:** 

```javascript
import { RecursiveCharacterTextSplitter, SupportedTextSplitterLanguages } from "langchain/text_splitter";

console.log(SupportedTextSplitterLanguages); // Outputs supported languages

const jsCode = `function helloWorld() { ... }`;

const splitter = RecursiveCharacterTextSplitter.fromLanguage("js", {
  chunkSize: 32,
  chunkOverlap: 0,
});
const jsOutput = await splitter.createDocuments([jsCode]);
```



This example demonstrates how to split JavaScript code into meaningful chunks using the `RecursiveCharacterTextSplitter`.
### Markdown Splitting

Splitting Markdown documents while preserving their structure is possible with LangChain's text splitters.

**Markdown Example:** 

```javascript
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const markdownText = `# Document transformers\n\n...`;

const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
  chunkSize: 500,
  chunkOverlap: 0,
});
const output = await splitter.createDocuments([markdownText]);
```
This code shows how to split a Markdown document, maintaining its structural integrity.


The above examples and descriptions provide a comprehensive guide on using text splitters in LangChain for various types of documents.