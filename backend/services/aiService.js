
import OpenAI from "openai";

const client = new OpenAI();
{
  // apiKey: process.env.OPENAI_API_KEY,
}

const SYSTEM_PROMPT = `You are a helpful news assistant that provides concise and accurate answers based on the provided news context. If the context does not contain relevant information, respond with "I'm sorry, I don't have enough information to answer that question based on the available news articles."

### Guidelines:
- Use ONLY the information from the provided news articles
- Always cite sources when possible (mention article titles)
- Do NOT hallucinate or invent details not present in the context
- Be concise but clear and well-structured
- If information isn't available in context, clearly state so
- Provide specific details and quotes when relevant
- If multiple articles have conflicting information, present both viewpoints
- Keep responses conversational and helpful
- When multiple articles are relevant, synthesize the information coherently

### Response Format:
- Start with a direct answer to the question
- Include relevant details from the news articles
- End with source attribution when applicable

### Examples:


##Context and Q&A pairs:
Q: "What did the UN say about climate change?"
C: "UN Secretary-General Antonio Guterres warned that global emissions are rising and urged nations to take urgent action."
A: The UN Secretary-General Antonio Guterres warned that global emissions are continuing to rise and called on nations to act urgently to tackle climate change. (Source: UN statement)

---

Q: "What happened in the recent US elections?"
C: "Joe Biden won the election with 306 electoral votes against Donald Trump’s 232."
A: Joe Biden won the recent US elections, securing 306 electoral votes compared to Donald Trump’s 232. (Source: Election results coverage)

---

Q: "What is the latest on the Russia-Ukraine war?"
C: "Ukrainian forces launched a counter-offensive in the eastern region, while Russia intensified missile strikes in Kyiv."
A: Ukrainian forces have launched a counter-offensive in the eastern region, while Russia has escalated missile strikes targeting Kyiv. (Source: Reuters, BBC News)

---

Q: "Did scientists discover water on Mars?"
C: "NASA researchers found evidence of sub-surface ice deposits on Mars, but no liquid water."
A: NASA researchers reported evidence of sub-surface ice deposits on Mars, though they have not found liquid water. (Source: NASA study)

---

Q: "What is the stock price of Tesla?"
C: ""
A: I'm sorry, I don't have enough information to answer that question based on the available news articles.

---

Q: "What did WHO say about COVID-19 vaccines?"
C: "The World Health Organization confirmed that approved COVID-19 vaccines remain effective against severe illness and hospitalization."
A: The World Health Organization confirmed that currently approved COVID-19 vaccines remain effective in preventing severe illness and hospitalizations. (Source: WHO statement)


`;



export const generateAIResponse = async (userQuery, newsContext) => {
  try {
    console.log(`🤖 Generating OpenAI response for: "${userQuery.substring(0, 50)}..."`);
    
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
       { role: "assistant", content: `Here are the relevant news articles:\n${newsContext}` },
  { role: "user", content: userQuery }
    ];

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = response.choices[0].message.content;
    console.log(`✅ OpenAI response generated (${aiResponse.length} characters)`);
    
    return aiResponse;
  } catch (error) {
    console.error("❌ AI response generation failed:", error.message);
    
    // Handle specific OpenAI errors
    if (error.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    } else if (error.status === 401) {
      throw new Error("Invalid OpenAI API key.");
    } else if (error.status === 400) {
      throw new Error("Invalid request to OpenAI API.");
    }
    
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
};

// Streaming version
export const generateAIResponseStream = async (userQuery, newsContext) => {
  try {
    console.log(`🤖 Generating streaming OpenAI response for: "${userQuery.substring(0, 50)}..."`);
    
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
       { role: "assistant", content: `Here are the relevant news articles:\n${newsContext}` },
  { role: "user", content: userQuery }
    ];

    const stream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    });

    console.log("✅ OpenAI streaming response initiated");
    return stream;
    
  } catch (error) {
    console.error("❌ AI streaming response generation failed:", error.message);
    
    // Handle specific OpenAI errors
    if (error.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    } else if (error.status === 401) {
      throw new Error("Invalid OpenAI API key.");
    } else if (error.status === 400) {
      throw new Error("Invalid request to OpenAI API.");
    }
    
    throw new Error(`Failed to generate streaming AI response: ${error.message}`);
  }
};

// Helper function to validate API key
export const validateOpenAIConnection = async () => {
  try {
    await client.models.list();
    console.log("✅ OpenAI connection successful");
    return true;
  } catch (error) {
    console.error("❌ OpenAI connection failed:", error.message);
    throw new Error(`Cannot connect to OpenAI: ${error.message}`);
  }
};