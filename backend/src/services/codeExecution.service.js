const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");

const TIMEOUT_MS = 5000;
const MAX_BUFFER = 1024 * 64; // 64KB

function runProcess(cmd, args, options = {}, stdinData = "") {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const proc = execFile(cmd, args, {
            timeout: options.timeout || TIMEOUT_MS,
            maxBuffer: MAX_BUFFER,
            cwd: options.cwd || process.cwd(),
            windowsHide: true
        }, (error, stdout, stderr) => {
            const executionTimeMs = Date.now() - startTime;
            if (error) {
                if (error.killed || error.signal === "SIGTERM") {
                    return resolve({
                        success: false,
                        error: "Time Limit Exceeded (TLE) - Execution timed out (max 5s)",
                        output: (stdout || "").trim(),
                        stderr: (stderr || "").trim(),
                        executionTimeMs
                    });
                }
                return resolve({
                    success: false,
                    error: error.message || "Execution error",
                    output: (stdout || "").trim(),
                    stderr: (stderr || error.message || "").trim(),
                    executionTimeMs
                });
            }
            return resolve({
                success: true,
                output: (stdout || "").trim(),
                stderr: (stderr || "").trim(),
                executionTimeMs
            });
        });

        if (stdinData && proc.stdin) {
            try {
                proc.stdin.write(stdinData);
                proc.stdin.end();
            } catch (err) {
                // ignore write error if proc exited early
            }
        }
    });
}

/**
 * Normalizes language string
 */
function normalizeLang(lang) {
    const l = (lang || "").toLowerCase().trim();
    if (l === "js" || l === "javascript") return "javascript";
    if (l === "py" || l === "python" || l === "python3") return "python";
    if (l === "cpp" || l === "c++") return "cpp";
    if (l === "c") return "c";
    if (l === "java") return "java";
    return l;
}

/**
 * Execute code in a temporary directory across 5 languages
 */
async function executeCode({ language, code, input = "", testCases = [] }) {
    const lang = normalizeLang(language);
    const tempDir = path.join(os.tmpdir(), `tp_code_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);

    try {
        fs.mkdirSync(tempDir, { recursive: true });

        // JavaScript
        if (lang === "javascript") {
            const filePath = path.join(tempDir, "solution.js");
            fs.writeFileSync(filePath, code, "utf8");
            return await runProcess("node", [filePath], { cwd: tempDir }, input);
        }

        // Python
        if (lang === "python") {
            const filePath = path.join(tempDir, "solution.py");
            fs.writeFileSync(filePath, code, "utf8");
            return await runProcess("python", [filePath], { cwd: tempDir }, input);
        }

        // C++
        if (lang === "cpp") {
            const srcPath = path.join(tempDir, "solution.cpp");
            const exePath = path.join(tempDir, "solution.exe");
            fs.writeFileSync(srcPath, code, "utf8");

            // Compile
            const compileResult = await runProcess("g++", ["-O0", srcPath, "-o", exePath], { cwd: tempDir, timeout: 12000 });
            if (!compileResult.success || !fs.existsSync(exePath)) {
                return {
                    success: false,
                    error: "Compilation Error",
                    output: "",
                    stderr: compileResult.stderr || compileResult.error || "G++ compilation failed",
                    executionTimeMs: compileResult.executionTimeMs
                };
            }

            // Execute
            return await runProcess(exePath, [], { cwd: tempDir, timeout: 5000 }, input);
        }

        // C
        if (lang === "c") {
            const srcPath = path.join(tempDir, "solution.c");
            const exePath = path.join(tempDir, "solution.exe");
            fs.writeFileSync(srcPath, code, "utf8");

            // Compile
            const compileResult = await runProcess("gcc", ["-O0", srcPath, "-o", exePath], { cwd: tempDir, timeout: 10000 });
            if (!compileResult.success || !fs.existsSync(exePath)) {
                return {
                    success: false,
                    error: "Compilation Error",
                    output: "",
                    stderr: compileResult.stderr || compileResult.error || "GCC compilation failed",
                    executionTimeMs: compileResult.executionTimeMs
                };
            }

            // Execute
            return await runProcess(exePath, [], { cwd: tempDir, timeout: 5000 }, input);
        }

        // Java
        if (lang === "java") {
            // Check class name in code or default to Main
            let className = "Main";
            const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
            if (classMatch) {
                className = classMatch[1];
            } else if (!code.includes("class Main")) {
                code = `public class Main {\n${code}\n}`;
            }

            const srcPath = path.join(tempDir, `${className}.java`);
            fs.writeFileSync(srcPath, code, "utf8");

            // Compile
            const compileResult = await runProcess("javac", [srcPath], { cwd: tempDir });
            if (!compileResult.success) {
                return {
                    success: false,
                    error: "Compilation Error",
                    output: "",
                    stderr: compileResult.stderr || compileResult.error || "Java compilation failed",
                    executionTimeMs: compileResult.executionTimeMs
                };
            }

            // Execute
            return await runProcess("java", ["-cp", tempDir, className], { cwd: tempDir }, input);
        }

        return {
            success: false,
            error: `Unsupported language: ${language}. Supported languages: JavaScript, Python, C++, C, Java.`,
            output: "",
            stderr: "",
            executionTimeMs: 0
        };
    } catch (err) {
        return {
            success: false,
            error: err.message || "Runner internal error",
            output: "",
            stderr: err.message || "",
            executionTimeMs: 0
        };
    } finally {
        // Cleanup temp folder
        try {
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        } catch (cleanupErr) {
            // ignore
        }
    }
}

/**
 * Runs code against multiple test cases and evaluates results
 */
async function runTestCases({ language, code, testCases = [] }) {
    const results = [];
    let allPassed = true;
    let totalTimeMs = 0;

    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const runRes = await executeCode({
            language,
            code,
            input: tc.input || ""
        });

        totalTimeMs += runRes.executionTimeMs || 0;

        const actualTrimmed = (runRes.output || "").trim().replace(/\r\n/g, "\n");
        const expectedTrimmed = (tc.expectedOutput || "").trim().replace(/\r\n/g, "\n");
        const passed = runRes.success && actualTrimmed === expectedTrimmed;

        if (!passed) allPassed = false;

        results.push({
            testCaseNumber: i + 1,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: runRes.output,
            stderr: runRes.stderr || runRes.error || "",
            passed,
            executionTimeMs: runRes.executionTimeMs
        });
    }

    return {
        allPassed,
        results,
        totalTimeMs
    };
}

module.exports = {
    executeCode,
    runTestCases
};
