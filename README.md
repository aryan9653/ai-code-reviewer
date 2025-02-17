# AI Code Reviewer

AI-powered automated code review and explanation tool that integrates with GitHub, OpenAI (GPT-4 Turbo), and WebSockets to analyze code, provide AI-generated suggestions, and offer real-time chatbot assistance.

## Features
- **Automated Code Review**: Analyzes code for issues, optimizations, and best practices.
- **AI-Powered Explanations**: Uses GPT-4 Turbo to explain code snippets.
- **GitHub Integration**: Works with GitHub repositories to review pull requests and commits.
- **Real-time Chatbot Assistance**: Uses WebSockets for instant AI-based coding help.

## Prerequisites
Before setting up the project, ensure you have the following installed:

- **Git**: [Download Git](https://git-scm.com/downloads)
- **Node.js** (Latest LTS version): [Download Node.js](https://nodejs.org/)
- **Python** (For backend scripts, if needed): [Download Python](https://www.python.org/)
- **Docker** (Optional, for containerized deployment): [Download Docker](https://www.docker.com/)

## Installation
### Step 1: Clone the Repository
```sh
git clone git@github.com:aryan9653/ai-code-reviewer.git
cd ai-code-reviewer
```

### Step 2: Install Dependencies
```sh
npm install
```

### Step 3: Set Up Environment Variables
Create a `.env` file in the project root and add the following:
```env
OPENAI_API_KEY=your_openai_api_key
GITHUB_ACCESS_TOKEN=your_github_access_token
```
Replace `your_openai_api_key` and `your_github_access_token` with actual keys.

### Step 4: Run the Application
```sh
npm start
```

### Step 5: Access the Application
Once running, open your browser and navigate to:
```
http://localhost:3000
```

## Running with Docker (Optional)
```sh
docker build -t ai-code-reviewer .
docker run -p 3000:3000 --env-file .env ai-code-reviewer
```

## Contribution
Feel free to fork the repository, create a new branch, make improvements, and submit a pull request.

## License
This project is licensed under the MIT License.

---



