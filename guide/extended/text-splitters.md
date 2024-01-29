# Text Splitters with Code Examples

Text splitters are essential in transforming long documents into smaller, more manageable chunks that are semantically meaningful. LangChain offers various text splitters to suit different needs and document types.

### 1. Recursively Split by Character

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


### 2. Customizing RecursiveCharacterTextSplitter

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


### 3. TokenTextSplitter

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


### 4. Splitting Code and Markup

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


### 5. Markdown Splitting

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

The above examples and descriptions provide a comprehensive guide on using text splitters in LangChain for various types of documents.
