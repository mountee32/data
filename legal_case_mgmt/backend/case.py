import requests
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.openai import OpenAIModel

# Initialize OpenRouter model with required headers
model = OpenAIModel(
    'openai/gpt-3.5-turbo',
    base_url='https://openrouter.ai/api/v1',
    api_key='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'
)

# Initialize agent with OpenRouter model
agent = Agent(
    model,
    deps_type=str,
    system_prompt=(
        "You're a case information assistant. Use get_case_info to retrieve case details "
        "based on the provided case number. Then present the information in a clear, "
        "organized manner. Focus on key details like case number, title, status, and type. "
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

# Interactive case lookup
if __name__ == "__main__":
    case_id = input("Enter case ID: ")
    case_result = agent.run_sync(f'Get information for case {case_id}', deps=case_id)
    print(case_result.data)
