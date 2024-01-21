import 'dotenv/config';
// Import necessary modules from Langchain
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// Function to set up the retrieval chain
async function setupRetrievalChain() {
  // Initialize the LLM model with the API key from environment variables.
  const chatModel = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // Load and parse the HTML content from a specified URL to get the documents.
  const loader = new CheerioWebBaseLoader(
    'https://docs.smith.langchain.com/overview'
  );
  const docs = await loader.load();

  // Split the loaded HTML content into smaller documents for more manageable processing.
  const splitter = new RecursiveCharacterTextSplitter();
  const splitDocs = await splitter.splitDocuments(docs);

  // Embed and index the split documents into a vectorstore for efficient and relevant retrieval.
  const embeddings = new OpenAIEmbeddings();
  const vectorstore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );

  // Define a prompt template for the LLM. This formats the question and context for the LLM's response.
  const prompt = ChatPromptTemplate.fromTemplate(`
    Answer the following question based only on the provided context:
    <context>{context}</context>
    Question: {input}`);

  // Create a document chain that combines the LLM with the prompt to generate context-aware responses.
  const documentChain = await createStuffDocumentsChain({
    llm: chatModel,
    prompt,
  });

  // Set up a retriever to fetch the most relevant documents based on the input question.
  // The retrieved documents along with the user's question are then passed to the LLM for response generation.
  const retriever = vectorstore.asRetriever();

  // Form a complete retrieval chain combining document retrieval with LLM processing.
  const retrievalChain = await createRetrievalChain({
    combineDocsChain: documentChain,
    retriever,
  });

  return { retrievalChain, chatModel };
}

// Function to ask a question using the retrieval chain and log the LLM's context-aware response.
async function askWithRetrieval(question: string) {
  const { retrievalChain } = await setupRetrievalChain();
  const result = await retrievalChain.invoke({ input: question });
  console.log(`Retrieved answer: ${result.answer}`);
  return result.answer;
}

// Demonstrate the retrieval chain's ability to provide contextually relevant answers.
const question = 'What is LangSmith?';
askWithRetrieval(question).then((answer) =>
  console.log('Final Answer:', answer)
);