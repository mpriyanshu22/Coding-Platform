const Submission = require("../model/submission");
const Problem = require("../model/problem");
const axios = require("axios");

const getJudge0LanguageId = (lang) => {
    const map = {
        "javascript": 102,
        "java": 62,
        "cpp": 76
    };
    return map[lang.toLowerCase()] || 102;
};

// CRITICAL: Robust status checking
const getStatusId = (judge0Result) => {
    // Return Judge0's official status ID (3 for Accepted, 4 for Wrong Answer, etc.)
    return judge0Result.status ? judge0Result.status.id : 12;
};

const submitcode = async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;
    try {
        const { code, language } = req.body;
        const problem = await Problem.findById(id);
        
        const submit = await Submission.create({
            problem_id: id,
            user_id: userId,
            code: code,
            language: language,
            status: 'pending',
            totaltestcases: problem.invisibleTestCases.length + problem.visibleTestCases.length,
        });

        const langId = getJudge0LanguageId(language);
        const allTestCases = [...problem.visibleTestCases, ...problem.invisibleTestCases];

        let testcasespassed = 0;
        let finalStatus = 'accepted';
        let errormessage = null;

        // Process sequentially to respect Piston's rate limits
        for (const test of allTestCases) {
            try {
                const response = await axios.post("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
                    language_id: langId,
                    source_code: code,
                    stdin: test.input.toString(), // Ensure input is stringified
                    expected_output: test.output.toString()
                }, { timeout: 15000 }); // 15s timeout per test case

                const result = response.data;
                const statusId = getStatusId(result);

                if (statusId === 3) {
                    testcasespassed++;
                } else {
                    if (finalStatus === 'accepted') {
                        finalStatus = (statusId === 4) ? 'wrong' : 'error';
                        errormessage = result.stderr || result.compile_output || (statusId === 4 ? "Wrong Answer" : "Runtime Error");
                    }
                }
            } catch (e) {
                finalStatus = 'error';
                errormessage = "Execution Service Timeout";
                break;
            }
        }

        submit.status = finalStatus;
        submit.runtime = 0;
        submit.memory = 0;
        submit.testcasespassed = testcasespassed;
        submit.errormessage = errormessage;
        await submit.save();

        if (finalStatus === 'accepted' && !req.user.problemSolved.includes(id)) {
            req.user.problemSolved.push(id);
            await req.user.save();
        }

        res.status(200).send(submit);
    } catch (err) {
        console.error("Submit Error:", err);
        res.status(500).send("Internal Server Error");
    }
}

const runtestcases = async (req, res) => {
    const { id } = req.params;
    try {
        const { code, language } = req.body;
        const problem = await Problem.findById(id);
        const langId = getJudge0LanguageId(language);

        const testResults = [];

        // Loop sequentially - safer for free APIs
        for (let i = 0; i < problem.visibleTestCases.length; i++) {
            const test = problem.visibleTestCases[i];
            console.log(`[Judge] Running Test Case ${i + 1}/${problem.visibleTestCases.length}...`);

            try {
                const response = await axios.post("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
                    language_id: langId,
                    source_code: code,
                    stdin: test.input.toString(),
                    expected_output: test.output.toString()
                }, { timeout: 15000 }); // 15s timeout

                const result = response.data;
                testResults.push({
                    stdin: test.input,
                    expected_output: test.output,
                    stdout: result.stdout || "",
                    status_id: getStatusId(result),
                    stderr: result.stderr || result.compile_output || ""
                });
            } catch (e) {
                console.error(`[Judge] Test Case ${i + 1} Failed:`, e.message);
                testResults.push({
                    stdin: test.input,
                    expected_output: test.output,
                    stdout: "",
                    status_id: 12,
                    stderr: "Execution Timeout or Service Error"
                });
            }
        }

        const finalResponse = {
            status_id: testResults.every(r => r.status_id === 3) ? 3 : 4,
            time: "0",
            memory: "0",
            testCases: testResults
        };

        console.log("[Judge] All test cases completed.");
        return res.status(200).json(finalResponse);

    } catch (err) {
        console.error("Run Error:", err);
        return res.status(500).json({ success: false, message: "Backend error" });
    }
};

module.exports = { submitcode, runtestcases };