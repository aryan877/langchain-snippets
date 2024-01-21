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
  // Initialize the LLM model with the API key
  const chatModel = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // Load and parse HTML content from a URL
  const loader = new CheerioWebBaseLoader('https://docs.smith.langchain.com/overview');
  const docs = await loader.load();

  // Split the loaded HTML content into smaller, manageable documents
  const splitter = new RecursiveCharacterTextSplitter();
  const splitDocs = await splitter.splitDocuments(docs);

  // Index the split documents in a vectorstore for efficient retrieval
  const embeddings = new OpenAIEmbeddings();
  const vectorstore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

  // Set up a prompt template that formats the input question and retrieved context for the LLM
  const prompt = ChatPromptTemplate.fromTemplate(`
    Answer the following question based only on the provided context:
    <context>{context}</context>
    Question: {input}`);

  // Create a document chain that combines the LLM with the prompt to generate answers
  const documentChain = await createStuffDocumentsChain({ llm: chatModel, prompt });

  // Set up a retriever that fetches the most relevant documents based on the input query
  const retriever = vectorstore.asRetriever();

  // Combine the document retrieval process with the LLM processing
  // This chain first uses the retriever to find and provide relevant context (documents) to the LLM
  // The LLM then generates an answer based on both the question and the provided context
  const retrievalChain = await createRetrievalChain({ combineDocsChain: documentChain, retriever });

  return { retrievalChain, chatModel };
}

// Function to ask a question using the retrieval chain
async function askWithRetrieval(question: string) {
  const { retrievalChain } = await setupRetrievalChain();
  const result = await retrievalChain.invoke({ input: question });

  // Log and return the answer received from the LLM after considering the provided context
  console.log(`Retrieved answer: ${result.answer}`);
  return result.answer;
}

// Example usage to demonstrate the retrieval chain's capability to provide contextually relevant answers
const question = 'What is LangSmith?';
askWithRetrieval(question).then((answer) => console.log('Final Answer:', answer));