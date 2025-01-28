const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabase = createClient(
  'https://trtjucrqcjapcvfgsbdd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRydGp1Y3JxY2phcGN2ZmdzYmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzMyMzksImV4cCI6MjA1MzY0OTIzOX0.bzkf_w0IG7hYNmo2TKjTO5MSSrWC6h4U0RDy7UI4zqE'
);

async function testChatHistory() {
  console.log('\nTesting chat history functionality...');

  // Generate a test session ID (UUID v4 format)
  const sessionId = '868fea98-700f-429d-b257-44df40f131f5';
  console.log(`Using test session ID: ${sessionId}`);

  // Test inserting user message
  console.log('\nTesting user message insertion...');
  try {
    const { data: userMsg, error: userError } = await supabase
      .from('chat_history')
      .insert({
        session_id: sessionId,
        message: 'What is my balance?',
        is_bot: false
      })
      .select()
      .single();

    if (userError) throw userError;
    console.log('✓ User message inserted successfully');
    console.log('Record:', userMsg);
  } catch (error) {
    console.error('✗ Failed to insert user message:', error.message);
    return;
  }

  // Test inserting bot response
  console.log('\nTesting bot response insertion...');
  try {
    const { data: botMsg, error: botError } = await supabase
      .from('chat_history')
      .insert({
        session_id: sessionId,
        message: 'Your current balance is $1500',
        is_bot: true
      })
      .select()
      .single();

    if (botError) throw botError;
    console.log('✓ Bot message inserted successfully');
    console.log('Record:', botMsg);
  } catch (error) {
    console.error('✗ Failed to insert bot message:', error.message);
    return;
  }

  // Test retrieving conversation history
  console.log('\nTesting conversation retrieval...');
  try {
    const { data: history, error: historyError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (historyError) throw historyError;
    console.log('✓ Conversation retrieved successfully');
    console.log('Conversation flow:');
    history.forEach(msg => {
      const prefix = msg.is_bot ? 'Bot' : 'User';
      console.log(`${prefix}: ${msg.message}`);
    });
  } catch (error) {
    console.error('✗ Failed to retrieve conversation:', error.message);
  }
}

// Run the tests
testChatHistory().catch(console.error);