import { jina } from 'jina-ai-provider';
import { embed, embedMany } from 'ai';

const textEmbeddingModel = jina.textEmbeddingModel('jina-embeddings-v3');

// Function to generate single embedding
export const generateEmbedding = async (text) => {
  try {
  
    
    const { embedding } = await embed({
      model: textEmbeddingModel,
      value: text,
      providerOptions: {
        jina: {
          inputType: 'retrieval.passage', 
        },
      },
    });
    
    console.log(`✅ Embedding generated successfully (dimension: ${embedding.length})`);
    return embedding;
  } catch (error) {
    console.error("❌ Embedding generation failed:", error.message);
    throw error;
  }
};

// Function to generate multiple embeddings
export const generateEmbeddings = async (texts) => {
  const { embeddings } = await embedMany({
    model: textEmbeddingModel,
    values: texts,
    providerOptions: {
      jina: {
        inputType: 'retrieval.passage',
      },
    },
  });
  return embeddings.map((embedding, index) => ({
    content: texts[index],
    embedding,
  }));
};

export const embedder = {
  model: textEmbeddingModel,
  generateEmbedding,
  generateEmbeddings,
};