import 'dotenv/config';
// Import necessary modules from Langchain
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { MessagesPlaceholder } from '@langchain/core/prompts';
import { Document } from '@langchain/core/documents';

// ------------------------ Document Loading ------------------------
async function loadDocuments() {
  const loader = new CheerioWebBaseLoader(
    'https://docs.smith.langchain.com/overview'
  );
  return await loader.load();
}

// ------------------------ Document Splitting ------------------------
async function splitDocuments(docs: Document<Record<string, any>>[]) {
  const splitter = new RecursiveCharacterTextSplitter();
  return await splitter.splitDocuments(docs);
}

// ------------------------ Vectorstore Creation ------------------------
async function createVectorStore(splitDocs: Document<Record<string, any>>[]) {
  const embeddings = new OpenAIEmbeddings();
  return await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
}

// ------------------------ Regular Retrieval Chain ------------------------
async function setupRegularRetrievalChain(
  chatModel: ChatOpenAI,
  vectorstore: MemoryVectorStore
) {
  // Define a prompt template for the LLM to generate responses based on the context.
  const prompt = ChatPromptTemplate.fromTemplate(`
    Answer the following question based only on the provided context:
    <context>{context}</context>
    Question: {input}`);

  // CreateStuffDocumentsChain takes the retrieved documents and passes them to the LLM,
  // allowing the LLM to generate responses based on these documents and the user's input.
  const documentChain = await createStuffDocumentsChain({
    llm: chatModel,
    prompt,
  });

  // Set up a retrieval chain to fetch relevant documents from the vectorstore based on the user's question.
  return await createRetrievalChain({
    combineDocsChain: documentChain,
    retriever: vectorstore.asRetriever(),
  });
}

// ------------------------ History-Aware Retrieval Chain ------------------------
async function setupHistoryAwareRetrievalChain(
  chatModel: ChatOpenAI,
  vectorstore: MemoryVectorStore
) {
  // Define a prompt that incorporates the entire conversation history. This is used to generate contextually relevant search queries.
  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    new MessagesPlaceholder('chat_history'),
    ['user', '{input}'],
    ['user', 'Generate a search query based on the conversation to find relevant information.'],
  ]);

  // Create a history-aware retriever chain. This chain takes the full conversation history into account when fetching documents, 
  // ensuring that the search query is relevant to the entire conversation, not just the latest input.
  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: chatModel,
    retriever: vectorstore.asRetriever(),
    rephrasePrompt: historyAwarePrompt,
  });

  // Define a prompt for combining the retrieved documents with the full conversation history for the final response generation.
  const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
    ['system', "Answer the user's questions based on the below context:\n\n{context}"],
    new MessagesPlaceholder('chat_history'),
    ['user', '{input}'],
  ]);

  // Create a document chain that combines the retrieved documents with the conversation history, allowing the LLM to generate context-aware responses.
  const historyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm: chatModel,
    prompt: historyAwareRetrievalPrompt,
  });

  // Return the complete retrieval chain that combines document retrieval with LLM processing for conversational context.
  return await createRetrievalChain({
    combineDocsChain: historyAwareCombineDocsChain,
    retriever: historyAwareRetrieverChain,
  });
}


async function main() {
  // Initialize the ChatOpenAI model
  const chatModel = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // Load, split documents and create vectorstore
  const docs = await loadDocuments();
  const splitDocs = await splitDocuments(docs);
  const vectorstore = await createVectorStore(splitDocs);

  // Set up the regular and history-aware retrieval chains
  const retrievalChain = await setupRegularRetrievalChain(
    chatModel,
    vectorstore
  );
  const conversationalRetrievalChain = await setupHistoryAwareRetrievalChain(
    chatModel,
    vectorstore
  );

  // Using the regular retrieval chain for an initial question
  const question = 'What is LangSmith?';
  const initialResult = await retrievalChain.invoke({ input: question });
  console.log(`Initial answer: ${initialResult.answer}`);

  // Building chat history for context-aware follow-up processing
  const chatHistory = [
    new HumanMessage(question),
    new AIMessage(initialResult.answer),
  ];

  // Using the conversational retrieval chain for the follow-up question
  const followUpQuestion = 'How does it help in testing?';
  const followUpResult = await conversationalRetrievalChain.invoke({
    chat_history: chatHistory,
    input: followUpQuestion,
  });
  console.log(`Follow-up answer: ${followUpResult.answer}`);
}

main().then(() => console.log('Finished executing'));


