# LangChain Output Parsers
## Overview

LangChain's Output Parsers are designed to transform responses from language models into structured formats. This functionality is essential for applications requiring more than just text outputs, particularly when dealing with structured data.
### Quick Start Guide 
- **Purpose** : To structure language model responses into a more organized format. 
- **Key Methods** : 
1. `getFormatInstructions()`: Returns instructions for formatting the language model's output. 
2. `parse()`: Parses a string response into a structured format. 
3. `parseWithPrompt()`: Parses a response with reference to the original prompt.
### Installation

To use these parsers, installation of certain packages is required:

```bash
npm install @langchain/openai
# Other package managers like Yarn or pnpm can also be used.
```


## StructuredOutputParser

This parser is particularly useful for responses requiring multiple fields.

### Example Usage

```javascript
import { OpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

const parser = StructuredOutputParser.fromNamesAndDescriptions({
  answer: "answer to the user's question",
  source: "source used to answer the user's question, should be a website.",
});

const chain = RunnableSequence.from([
  PromptTemplate.fromTemplate(
    "Answer the users question as best as possible.\n{format_instructions}\n{question}"
  ),
  new OpenAI({ temperature: 0 }),
  parser,
]);

console.log(parser.getFormatInstructions());

/*
Answer the users question as best as possible.
You must format your output as a JSON value that adheres to a given "JSON Schema" instance.

"JSON Schema" is a declarative language that allows you to annotate and validate JSON documents.

For example, the example "JSON Schema" instance {{"properties": {{"foo": {{"description": "a list of test words", "type": "array", "items": {{"type": "string"}}}}}}, "required": ["foo"]}}}}
would match an object with one required property, "foo". The "type" property specifies "foo" must be an "array", and the "description" property semantically describes it as "a list of test words". The items within "foo" must be strings.
Thus, the object {{"foo": ["bar", "baz"]}} is a well-formatted instance of this example "JSON Schema". The object {{"properties": {{"foo": ["bar", "baz"]}}}} is not well-formatted.

Your output will be parsed and type-checked according to the provided schema instance, so make sure all fields in your output match the schema exactly and there are no trailing commas!

Here is the JSON Schema instance your output must adhere to. Include the enclosing markdown codeblock:

{"type":"object","properties":{"answer":{"type":"string","description":"answer to the user's question"},"sources":{"type":"array","items":{"type":"string"},"description":"sources used to answer the question, should be websites."}},"required":["answer","sources"],"additionalProperties":false,"$schema":"http://json-schema.org/draft-07/schema#"}


What is the capital of France?
*/

const response = await chain.invoke({
  question: "What is the capital of France?",
  format_instructions: parser.getFormatInstructions(),
});

console.log(response);
// { answer: 'Paris', source: 'https://en.wikipedia.org/wiki/Paris' }
```

## Output Parses Available in Langchain JS
- **String** : Converts model output into a string. 
- **HTTPResponse** : Streams model output as HTTP response bytes. 
- **OpenAIFunctions** : Uses function calling for structured output. 
- **CSV** : Returns output as a list of comma-separated values. 
- **OutputFixing** : Corrects misformatted output. 
- **Structured** : Returns structured information with string fields. 
- **Datetime** : Parses output into JavaScript date objects.
## Specific Output Parsers
### StringOutputParser

Converts language model output into a string, useful for standardizing outputs.
#### Usage

```javascript
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";

const parser = new StringOutputParser();

const model = new ChatOpenAI({ temperature: 0 });

const stream = await model.pipe(parser).stream("Hello there!");

for await (const chunk of stream) {
  console.log(chunk);
}

/*
  Hello
  !
  How
  can
  I
  assist
  you
  today
  ?
*/
```


### HTTPResponse Output Parser

Allows streaming of LLM output as HTTP responses, suitable for web applications.
#### Example

```javascript
import { ChatOpenAI } from "@langchain/openai";
import { HttpResponseOutputParser } from "langchain/output_parsers";

const handler = async () => {
  const parser = new HttpResponseOutputParser();

  const model = new ChatOpenAI({ temperature: 0 });

  const stream = await model.pipe(parser).stream("Hello there!");

  const httpResponse = new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });

  return httpResponse;
};

await handler();
```
### JSON Output Functions Parser

The JSON Output Functions Parser is specialized for parsing structured JSON responses from functions, such as those in OpenAI.
#### Key Features 
- **Default Behavior** : Extracts function calls and applies JSON.stringify. 
- **argsOnly Parameter** : Returns only the arguments of the function call. 
- **Response Parsing** : Parses the output parser's response.
#### Example Usage

```javascript
import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { HumanMessage } from "@langchain/core/messages";

// Instantiate the parser
const parser = new JsonOutputFunctionsParser();

// Define the function schema
const extractionFunctionSchema = {
  name: "extractor",
  description: "Extracts fields from the input.",
  parameters: {
    type: "object",
    properties: {
      tone: {
        type: "string",
        enum: ["positive", "negative"],
        description: "The overall tone of the input",
      },
      word_count: {
        type: "number",
        description: "The number of words in the input",
      },
      chat_response: {
        type: "string",
        description: "A response to the human's input",
      },
    },
    required: ["tone", "word_count", "chat_response"],
  },
};

// Instantiate the ChatOpenAI class
const model = new ChatOpenAI({ modelName: "gpt-4" });

// Create a new runnable, bind the function to the model, and pipe the output through the parser
const runnable = model
  .bind({
    functions: [extractionFunctionSchema],
    function_call: { name: "extractor" },
  })
  .pipe(parser);

// Invoke the runnable with an input
const result = await runnable.invoke([
  new HumanMessage("What a beautiful day!"),
]);

console.log({ result });

/**
{
  result: {
    tone: 'positive',
    word_count: 4,
    chat_response: "Indeed, it's a lovely day!"
  }
}
 */
```


### Streaming

Supports streaming of function responses, either as aggregated responses or as JSON patch diff operations.

### List Parser

Used for parsing comma-separated items.
#### Example Usage

```javascript
import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { CommaSeparatedListOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

export const run = async () => {
  // With a `CommaSeparatedListOutputParser`, we can parse a comma separated list.
  const parser = new CommaSeparatedListOutputParser();

  const chain = RunnableSequence.from([
    PromptTemplate.fromTemplate("List five {subject}.\n{format_instructions}"),
    new OpenAI({ temperature: 0 }),
    parser,
  ]);

  /*
   List five ice cream flavors.
   Your response should be a list of comma separated values, eg: `foo, bar, baz`
  */
  const response = await chain.invoke({
    subject: "ice cream flavors",
    format_instructions: parser.getFormatInstructions(),
  });

  console.log(response);
  /*
			[
			'Vanilla',
			'Chocolate',
			'Strawberry',
			'Mint Chocolate Chip',
			'Cookies and Cream'
			]
		*/
};
```


## Custom List Parser

Parses a list of items with specific length and separator.
### Example Usage

```javascript
import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { CustomListOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

// With a `CustomListOutputParser`, we can parse a list with a specific length and separator.
const parser = new CustomListOutputParser({ length: 3, separator: "\n" });

const chain = RunnableSequence.from([
  PromptTemplate.fromTemplate(
    "Provide a list of {subject}.\n{format_instructions}"
  ),
  new OpenAI({ temperature: 0 }),
  parser,
]);

/*
Provide a list of great fiction books (book, author).
Your response should be a list of 3 items separated by "\n" (eg: `foo\n bar\n baz`)
*/
const response = await chain.invoke({
  subject: "great fiction books (book, author)",
  format_instructions: parser.getFormatInstructions(),
});

console.log(response);
/*
[
  'The Catcher in the Rye, J.D. Salinger',
  'To Kill a Mockingbird, Harper Lee',
  'The Great Gatsby, F. Scott Fitzgerald'
]
*/
```


## Datetime Parser

Parses LLM output into datetime format.
### Example Usage

```javascript
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { DatetimeOutputParser } from "langchain/output_parsers";

const parser = new DatetimeOutputParser();

const prompt = ChatPromptTemplate.fromTemplate(`Answer the users question:

{question}

{format_instructions}`);

const promptWithInstructions = await prompt.partial({
  format_instructions: parser.getFormatInstructions(),
});

const model = new ChatOpenAI({ temperature: 0 });

const chain = promptWithInstructions.pipe(model).pipe(parser);

const response = await chain.invoke({
  question: "When was Chicago incorporated?",
});

console.log(response, response instanceof Date);

/*
  1837-03-04T00:00:00.000Z, true
*/
```


## Structured Output Parser

Allows returning multiple fields and supports complex JSON schema.
### Example Usage

```javascript
import { OpenAI, RunnableSequence, StructuredOutputParser, PromptTemplate } from "appropriate-packages";

const parser = StructuredOutputParser.fromNamesAndDescriptions({
  answer: "answer to the user's question",
  source: "source used to answer the user's question, should be a website.",
});
const chain = RunnableSequence.from([
  // configurations...
]);

const response = await chain.invoke({
  question: "What is the capital of France?",
  format_instructions: parser.getFormatInstructions(),
});
console.log(response);
// Outputs structured JSON object
```


### Structured Output Parser with Zod Schema

Uses Zod, a TypeScript validation library, to define output schema.
#### Example Usage

```javascript
import { z, OpenAI, RunnableSequence, StructuredOutputParser, PromptTemplate } from "appropriate-packages";

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    answer: z.string(),
    sources: z.array(z.string()),
  })
);
const chain = RunnableSequence.from([
  // configurations...
]);

const response = await chain.invoke({
  question: "What is the capital of France?",
  format_instructions: parser.getFormatInstructions(),
});
console.log(response);
// Outputs structured JSON object with Zod schema validation
```

---

**Note** : These notes provide a detailed guide on various LangChain Output Parsers, including their features, example usage, and API references. The information is tailored for educational purposes, offering insights into the functionalities and implementations of different parsers.
