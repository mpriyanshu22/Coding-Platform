const axios = require('axios');

// Map user language input to Judge0 language IDs
const getLanguageId = (lang) => {
    const languageMap = {
        "c++": 76,
        "cpp": 76,
        "java": 62,
        "javascript": 102,
        "node": 102,
        "nodejs": 102,
    };
    return languageMap[lang.toLowerCase()] || null;
};

// Removed BullMQ/Docker logic. Now we just pass the payload directly forward
// encoded as tokens, so submitoken can execute it synchronously via Judge0 online API.
const submitBatch = async (submission) => {
  try {
    const jobs = [];
    for (let i = 0; i < submission.length; i++) {
      // Store the submission details inside the 'token' to bypass the queue system
      jobs.push({
        token: JSON.stringify(submission[i]),
      });
    }
    return jobs;
  } catch (error) {
    console.error('SubmitBatch Error:', error);
    throw new Error('Failed to process batch');
  }
};

// Execute cleanly with Judge0
const submitoken = async (resultoken) => {
  try {
    const results = [];
    
    // Process each encoded testcase 
    for (const tokenStr of resultoken) {
      const payload = JSON.parse(tokenStr);
      
      try {
          const response = await axios.post("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
              language_id: payload.language,
              source_code: payload.source_code,
              stdin: payload.stdin || "",
              expected_output: payload.expected_output || ""
          }, { timeout: 15000 });

          const result = response.data;
          const status_id = result.status ? result.status.id : 13;

          results.push({
              token: tokenStr,
              status_id: status_id,
              stdout: result.stdout || '',
              stderr: result.stderr || result.compile_output || '',
              time: result.time || '0.000',
              memory: result.memory || null
          });
      } catch(err) {
          console.error("Judge0 Validation Error:", err.message);
          results.push({
              token: tokenStr,
              status_id: 13,
              stdout: '',
              stderr: 'Execution Limit Reached or Service Error'
          });
      }
    }
    return results;
  } catch (error) {
    console.error('submitoken Error:', error);
    throw new Error('Failed to retrieve job results');
  }
};

// Status mapping for error messages 
const checkstatus = [
  { "id": 1, "description": "In Queue" },
  { "id": 2, "description": "Processing" },
  { "id": 3, "description": "Accepted" },
  { "id": 4, "description": "Wrong Answer" },
  { "id": 5, "description": "Time Limit Exceeded" },
  { "id": 6, "description": "Compilation Error" },
  { "id": 7, "description": "Runtime Error (SIGSEGV)" },
  { "id": 8, "description": "Runtime Error (SIGXFSZ)" },
  { "id": 9, "description": "Runtime Error (SIGFPE)" },
  { "id": 10, "description": "Runtime Error (SIGABRT)" },
  { "id": 11, "description": "Runtime Error (NZEC)" },
  { "id": 12, "description": "Runtime Error (Other)" },
  { "id": 13, "description": "Internal Error" },
  { "id": 14, "description": "Exec Format Error" }
];

const statusresult = (status_id) => {
  const status = checkstatus.find(item => item.id === status_id);
  return status ? status.description : "Invalid status id";
};

module.exports = { getLanguageId, submitBatch, submitoken, statusresult };
