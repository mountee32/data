import os
import requests
from dotenv import load_dotenv
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.openai import OpenAIModel

# Load environment variables
load_dotenv()

# Initialize OpenRouter model with required headers
model = OpenAIModel(
    'openai/gpt-3.5-turbo',
    base_url='https://openrouter.ai/api/v1',
    api_key=os.getenv('OPENROUTER_API_KEY')
)

# Initialize agent with OpenRouter model
agent = Agent(
    model,
    deps_type=str,
    system_prompt=(
        "You're a case information assistant. You can:\n"
        "1. Use list_all_cases to show all cases\n"
        "2. Use get_case_info to show case details\n"
        "3. Use get_case_documents to list case documents\n"
        "4. Use get_document_content to show document content\n\n"
        "Follow these guidelines:\n"
        "- When a user selects a case (by entering its number), you must:\n"
          "1. Show the case details using get_case_info\n"
          "2. Then immediately use get_case_documents to list available documents\n"
          "3. Prompt user to select a document number to view its content\n"
        "- Always number cases and documents for easy selection\n"
        "- Present information clearly with headers and sections\n"
        "- For cases, show: case number, title, status, type\n"
        "- For documents, show: title, type, size, date\n\n"
        "Example responses:\n"
        "When user selects case '1':\n"
        "### Case Details:\n"
        "[case details here]\n\n"
        "### Available Documents:\n"
        "1. Document A (type, size, date)\n"
        "2. Document B (type, size, date)\n\n"
        "Select a document number to view its content."
    ),
)

@agent.tool_plain
def get_case_info(case_id: str) -> str:
    """Retrieve case information from the API."""
    try:
        response = requests.get(f'http://172.17.0.2:8000/api/v1/cases/{case_id}')
        if response.status_code == 200:
            return response.text
        else:
            return f"Error: Unable to retrieve case information. Status code: {response.status_code}"
    except Exception as e:
        return f"Error: {str(e)}"

@agent.tool_plain
def list_all_cases() -> str:
    """Retrieve a list of all cases from the API."""
    try:
        response = requests.get(f'http://172.17.0.2:8000/api/v1/cases')
        if response.status_code == 200:
            return response.text
        else:
            return f"Error: Unable to retrieve list of cases. Status code: {response.status_code}"
    except Exception as e:
        return f"Error: {str(e)}"

@agent.tool_plain
def get_case_documents(case_id: str) -> str:
    """Retrieve documents for a specific case from the API."""
    try:
        response = requests.get(f'http://172.17.0.2:8000/api/v1/cases/{case_id}/documents')
        if response.status_code == 200:
            return response.text
        else:
            return f"Error: Unable to retrieve case documents. Status code: {response.status_code}"
    except Exception as e:
        return f"Error: {str(e)}"

@agent.tool_plain
def get_document_content(doc_id: str) -> str:
    """Retrieve the content of a specific document."""
    try:
        # Get document metadata first
        meta_response = requests.get(f'http://172.17.0.2:8000/api/v1/documents/{doc_id}')
        if meta_response.status_code != 200:
            return f"Error: Unable to retrieve document metadata. Status code: {meta_response.status_code}"
        
        # Then get document content
        content_response = requests.get(f'http://172.17.0.2:8000/api/v1/documents/{doc_id}/download')
        if content_response.status_code != 200:
            return f"Error: Unable to retrieve document content. Status code: {content_response.status_code}"
        
        # Combine metadata and content in a structured format
        metadata = meta_response.json()
        content = content_response.text
        
        return (
            f"Document Metadata:\n"
            f"Title: {metadata['filename']}\n"
            f"Type: {metadata['file_type']}\n"
            f"Size: {metadata['file_size']} bytes\n"
            f"Upload Date: {metadata['upload_date']}\n"
            f"Description: {metadata.get('description', 'N/A')}\n"
            f"\nDocument Content:\n"
            f"{'='*50}\n"
            f"{content}\n"
            f"{'='*50}"
        )
    except Exception as e:
        return f"Error: {str(e)}"

# Interactive case lookup
if __name__ == "__main__":
    result = agent.run_sync('Display a welcome message and explain all available options (case lookup, list cases, read documents) and that they can quit by typing quit')
    print(result.data)
    
    while True:
        print('-----------')
        command = input("Enter your command: ")
        if command.lower() == "quit":
            break
            
        # Handle document selection if the agent returns a numbered list
        case_result = agent.run_sync(command)
        print(case_result.data)
        
        # If the response contains numbered document options, allow selection
        if "Select a document by number:" in case_result.data:
            doc_selection = input("Enter document number: ")
            if doc_selection.lower() != "quit":
                selection_result = agent.run_sync(f"Show document {doc_selection}")
                print(selection_result.data)
