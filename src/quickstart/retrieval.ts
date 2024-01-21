import 'dotenv/config';
// Import necessary modules from Langchain
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// Function to setup the retrieval chain including document loader, splitter, and vectorstore
async function setupRetrievalChain() {
  // Initialize the ChatOpenAI model
  const chatModel = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // Load HTML content from a specified URL using CheerioWebBaseLoader
  // Cheerio parses the HTML and provides access to the content for further processing
  const loader = new CheerioWebBaseLoader(
    'https://docs.smith.langchain.com/overview'
  );
  const docs = await loader.load();
  console.log(`Loaded ${docs.length} documents`);

  // Split documents into smaller parts to manage size and data
  const splitter = new RecursiveCharacterTextSplitter();
  const splitDocs = await splitter.splitDocuments(docs);
  console.log(`Split into ${splitDocs.length} smaller documents`);

  // Embed and index the documents in a vectorstore for efficient retrieval
  const embeddings = new OpenAIEmbeddings();
  const vectorstore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );
  console.log('Documents indexed in vectorstore');

  // Create a retrieval chain to process incoming questions and fetch relevant documents
  // The prompt template is used to format the input question and the retrieved context for the LLM
  const prompt = ChatPromptTemplate.fromTemplate(`
    Answer the following question based only on the provided context:
    <context>{context}</context>
    Question: {input}`);

  // CreateStuffDocumentsChain creates a chain that takes a prompt and an LLM, and generates an answer based on the provided context
  const documentChain = await createStuffDocumentsChain({
    llm: chatModel,
    prompt,
  });

  // The vectorstore's retriever fetches the most relevant documents based on the input question
  const retriever = vectorstore.asRetriever();

  // CreateRetrievalChain combines the document retrieval with the LLM processing
  // This chain first uses the retriever to find relevant documents, and then passes these documents, along with the original question, to the LLM for generating an answer
  const retrievalChain = await createRetrievalChain({
    combineDocsChain: documentChain,
    retriever,
  });

  return { retrievalChain, chatModel };
}

// Function to ask a question and get an answer using the retrieval chain
async function askWithRetrieval(question: string) {
  const { retrievalChain } = await setupRetrievalChain();
  const result = await retrievalChain.invoke({ input: question });
  console.log(`Retrieved answer: ${result.answer}`);
  return result.answer;
}

// Example usage to demonstrate how the retrieval chain works
const question = 'What is LangSmith?';
askWithRetrieval(question).then((answer) =>
  console.log('Final Answer:', answer)
);
