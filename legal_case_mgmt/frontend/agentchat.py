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
        "You're a case information assistant. Use get_case_info to retrieve case details "
        "based on the provided case number. Use list_all_cases to retrieve a list of all cases. "
        "Then present the information in a clear, organized manner. Focus on key details like case number, title, status, and type. "
        "If the case is not found, inform the user politely."
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

# Interactive case lookup
if __name__ == "__main__":
    print("Welcome to the Case Information Assistant. You can:")
    print("1. Get details for a specific case by entering the case ID.")
    print("2. List all cases by typing 'list all cases'.")
    command = input("Enter your command: ")
    if command == "list all cases":
        case_result = agent.run_sync('List all cases')
        print(case_result.data)
    else:
        case_id = command
        case_result = agent.run_sync(f'Get information for case {case_id}', deps=case_id)
        print(case_result.data)
