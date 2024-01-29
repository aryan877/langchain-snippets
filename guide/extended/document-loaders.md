# Document Loaders with Code Examples
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
