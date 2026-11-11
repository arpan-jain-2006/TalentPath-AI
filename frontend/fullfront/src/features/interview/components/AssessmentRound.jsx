import React, { useState, useEffect, useRef } from "react";
import { useInterview } from "../hooks/useInterview";
import "../style/assessment.scss";

// Default comprehensive MCQs and DSA fallback for backwards compatibility
const DEFAULT_MCQS = [
  {
    question: "In the JavaScript Event Loop, which queue takes highest priority immediately after the synchronous execution stack finishes?",
    options: [
      "Macrotask Queue (setTimeout, setInterval)",
      "Microtask Queue (Promises, queueMicrotask, process.nextTick)",
      "RequestAnimationFrame callback queue",
      "Network I/O polling queue"
    ],
    correctIndex: 1,
    explanation: "The microtask queue (Promise callbacks, queueMicrotask) has higher priority than the macrotask queue. The event loop exhausts all pending microtasks before processing the next macrotask.",
    category: "JavaScript Core"
  },
  {
    question: "What is the primary difference between 'useMemo' and 'useCallback' in React?",
    options: [
      "'useMemo' caches a function definition, whereas 'useCallback' caches a computed value",
      "'useMemo' caches the return value of an expensive calculation, whereas 'useCallback' caches a function reference between renders",
      "'useMemo' is used only for server components, while 'useCallback' is client-only",
      "There is no difference; they are aliases for the same internal hook"
    ],
    correctIndex: 1,
    explanation: "useMemo caches the result of running an expensive computation. useCallback caches the function definition itself across renders, preventing unneeded child re-renders.",
    category: "React Framework"
  },
  {
    question: "In MongoDB, which compound indexing sequence is recommended by the ESR rule?",
    options: [
      "Equality first, then Range, then Sort",
      "Equality first, then Sort, then Range",
      "Sort first, then Equality, then Range",
      "Range first, then Sort, then Equality"
    ],
    correctIndex: 1,
    explanation: "The ESR (Equality, Sort, Range) rule states index keys should be structured: 1) Equality fields (exact match), 2) Sort fields (order direction), and 3) Range fields (inequality operators like $gt, $lt).",
    category: "Database Engineering"
  },
  {
    question: "When a browser sends an HTTP OPTIONS request before a cross-origin POST request with custom headers, what is this called?",
    options: [
      "HTTP Keep-Alive Handshake",
      "CORS Preflight Request",
      "TLS Session Negotiation",
      "WebSocket Upgrade Ping"
    ],
    correctIndex: 1,
    explanation: "Browsers automatically dispatch a CORS Preflight OPTIONS request to verify whether the target origin permits the request headers and methods before executing the actual payload.",
    category: "Web Security & Protocols"
  },
  {
    question: "What is the lookup time complexity of an element in an unsorted array versus a balanced Binary Search Tree (AVL / Red-Black)?",
    options: [
      "Unsorted Array: O(1); Balanced BST: O(N)",
      "Unsorted Array: O(N); Balanced BST: O(log N)",
      "Unsorted Array: O(log N); Balanced BST: O(1)",
      "Unsorted Array: O(N^2); Balanced BST: O(N)"
    ],
    correctIndex: 1,
    explanation: "Searching an unsorted array takes linear O(N) worst-case time. In a balanced BST, each branch decision halves the search tree, giving logarithmic O(log N) lookup.",
    category: "Data Structures & Algorithms"
  },
  {
    question: "Which of the following commonly triggers a memory leak in single-page React applications?",
    options: [
      "Using const and let inside functions",
      "Uncleared setInterval timers or unremoved global window event listeners on component unmount",
      "Using CSS Flexbox instead of CSS Grid",
      "Passing props between parent and child components"
    ],
    correctIndex: 1,
    explanation: "Uncleared intervals and unremoved window/document listeners hold closures to component state, preventing the browser garbage collector from reclaiming memory when components unmount.",
    category: "Performance & Profiling"
  },
  {
    question: "What is the primary benefit of HTTP/2 multiplexing compared to HTTP/1.1?",
    options: [
      "It replaces JSON with XML data",
      "It allows multiple concurrent bidirectional request/response streams over a single TCP connection, eliminating head-of-line blocking at the HTTP layer",
      "It automatically converts images to WebP format",
      "It bypasses TLS encryption for faster transfers"
    ],
    correctIndex: 1,
    explanation: "HTTP/2 multiplexing interleaves requests and responses into binary frames over a single persistent TCP connection, preventing the latency bottlenecks of serial HTTP/1.1 requests.",
    category: "Networking & Architecture"
  },
  {
    question: "In Node.js, how should CPU-intensive operations (e.g. heavy cryptography, image processing) be executed without blocking the main event loop?",
    options: [
      "Using fs.readFileSync() inside an async function",
      "Offloading work to the worker_threads module or child processes",
      "Wrapping the code in a while(true) loop",
      "Increasing the computer's screen brightness"
    ],
    correctIndex: 1,
    explanation: "worker_threads or background worker queues allow executing CPU-bound algorithmic computation on separate OS threads, preserving low-latency responsiveness for incoming I/O requests on the main loop.",
    category: "Node.js Internals"
  },
  {
    question: "What is the core difference between 'git merge' and 'git rebase'?",
    options: [
      "Merge creates a non-destructive merge commit joining two branch histories; Rebase replays commits sequentially onto the target branch tip creating a linear commit history",
      "Rebase deletes the commit history permanently from GitHub; Merge keeps it",
      "Merge can only be executed by repository administrators",
      "Rebase only works with SVN repositories"
    ],
    correctIndex: 0,
    explanation: "git merge creates a commit that joins histories preserving the exact timeline. git rebase rewrites the feature commits onto the latest base tip, yielding a pristine linear commit history.",
    category: "DevOps & Version Control"
  },
  {
    question: "Which HTTP status code must an API return when an endpoint requires authentication but valid credentials were not provided in the request headers?",
    options: [
      "200 OK",
      "401 Unauthorized",
      "403 Forbidden",
      "404 Not Found"
    ],
    correctIndex: 1,
    explanation: "401 Unauthorized specifies that authentication credentials are required and were either missing or invalid. (403 Forbidden is used when identity is known but access permissions are denied).",
    category: "API Design"
  }
];

const DEFAULT_DSA = [
  {
    title: "Two Sum (Target Pair Indices)",
    difficulty: "Easy",
    timeLimitMinutes: 10,
    problemStatement: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0, 1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1, 2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    starterCode: {
      javascript: `// Two Sum: Return [index1, index2]
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}

// Test Run
const nums = [2, 7, 11, 15];
const target = 9;
console.log(JSON.stringify(twoSum(nums, target)));`,
      python: `# Two Sum: Return [index1, index2]
def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test Run
nums = [2, 7, 11, 15]
target = 9
print(twoSum(nums, target))`,
      java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }

    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = twoSum(nums, target);
        System.out.println(Arrays.toString(result));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>

std::vector<int> twoSum(const std::vector<int>& nums, int target) {
    std::unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); ++i) {
        int complement = target - nums[i];
        if (map.find(complement) != map.end()) {
            return {map[complement], i};
        }
        map[nums[i]] = i;
    }
    return {};
}

int main() {
    std::vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    std::vector<int> res = twoSum(nums, target);
    std::cout << "[" << res[0] << ", " << res[1] << "]" << std::endl;
    return 0;
}`,
      c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    int* result = (int*)malloc(2 * sizeof(int));
    *returnSize = 2;
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    *returnSize = 0;
    return result;
}

int main() {
    int nums[] = {2, 7, 11, 15};
    int returnSize;
    int* res = twoSum(nums, 4, 9, &returnSize);
    printf("[%d, %d]\\n", res[0], res[1]);
    free(res);
    return 0;
}`
    },
    testCases: [
      { input: "nums = [2,7,11,15], target = 9", expectedOutput: "[0, 1]" },
      { input: "nums = [3,2,4], target = 6", expectedOutput: "[1, 2]" }
    ]
  },
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    timeLimitMinutes: 30,
    problemStatement: "Given a string `s`, find the length of the longest substring without repeating characters.\n\nA substring is a contiguous non-empty sequence of characters within a string.",
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "`s` consists of English letters, digits, symbols and spaces."
    ],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: 'The answer is "b", with the length of 1.'
      }
    ],
    starterCode: {
      javascript: `// Longest Substring Without Repeating Characters
function lengthOfLongestSubstring(s) {
    let maxLength = 0;
    let left = 0;
    const charMap = new Map();

    for (let right = 0; right < s.length; right++) {
        const char = s[right];
        if (charMap.has(char) && charMap.get(char) >= left) {
            left = charMap.get(char) + 1;
        }
        charMap.set(char, right);
        maxLength = Math.max(maxLength, right - left + 1);
    }

    return maxLength;
}

// Test Run
console.log(lengthOfLongestSubstring("abcabcbb"));`,
      python: `# Longest Substring Without Repeating Characters
def lengthOfLongestSubstring(s: str) -> int:
    char_map = {}
    max_len = 0
    left = 0

    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)

    return max_len

# Test Run
print(lengthOfLongestSubstring("abcabcbb"))`,
      java: `import java.util.*;

public class Main {
    public static int lengthOfLongestSubstring(String s) {
        int maxLen = 0, left = 0;
        Map<Character, Integer> map = new HashMap<>();

        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }

        return maxLen;
    }

    public static void main(String[] args) {
        System.out.println(lengthOfLongestSubstring("abcabcbb"));
    }
}`,
      cpp: `#include <iostream>
#include <string>
#include <unordered_map>
#include <algorithm>

int lengthOfLongestSubstring(const std::string& s) {
    std::unordered_map<char, int> map;
    int maxLen = 0, left = 0;

    for (int right = 0; right < s.length(); ++right) {
        char c = s[right];
        if (map.find(c) != map.end() && map[c] >= left) {
            left = map[c] + 1;
        }
        map[c] = right;
        maxLen = std::max(maxLen, right - left + 1);
    }

    return maxLen;
}

int main() {
    std::cout << lengthOfLongestSubstring("abcabcbb") << std::endl;
    return 0;
}`,
      c: `#include <stdio.h>
#include <string.h>

int lengthOfLongestSubstring(char* s) {
    int maxLen = 0, left = 0;
    int lastPos[256];
    memset(lastPos, -1, sizeof(lastPos));

    for (int right = 0; s[right] != '\\0'; right++) {
        unsigned char c = (unsigned char)s[right];
        if (lastPos[c] >= left) {
            left = lastPos[c] + 1;
        }
        lastPos[c] = right;
        int currentLen = right - left + 1;
        if (currentLen > maxLen) maxLen = currentLen;
    }

    return maxLen;
}

int main() {
    printf("%d\\n", lengthOfLongestSubstring("abcabcbb"));
    return 0;
}`
    },
    testCases: [
      { input: 's = "abcabcbb"', expectedOutput: "3" },
      { input: 's = "bbbbb"', expectedOutput: "1" }
    ]
  }
];

const LANGUAGES = [
  { id: "javascript", label: "JavaScript (Node)", icon: "🟡" },
  { id: "python", label: "Python 3", icon: "🐍" },
  { id: "java", label: "Java 23", icon: "☕" },
  { id: "cpp", label: "C++ (g++)", icon: "⚡" },
  { id: "c", label: "C (gcc)", icon: "⚙️" }
];

export const AssessmentRound = ({ assessmentData }) => {
  const { executeCodeSnippet } = useInterview();

  // Mode Selection: "mcq" | "dsa"
  const [activeSubTab, setActiveSubTab] = useState("mcq");

  // ── MCQ State ──
  const mcqs = (assessmentData?.mcqs && assessmentData.mcqs.length > 0)
    ? assessmentData.mcqs
    : DEFAULT_MCQS;

  const [mcqState, setMcqState] = useState("idle"); // "idle" | "running" | "completed"
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState(new Array(mcqs.length).fill(null));
  const [qTimeLeft, setQTimeLeft] = useState(10); // 10 seconds per MCQ
  const timerRef = useRef(null);

  // ── DSA State ──
  const dsaQuestions = (assessmentData?.dsaQuestions && assessmentData.dsaQuestions.length > 0)
    ? assessmentData.dsaQuestions
    : DEFAULT_DSA;

  const [selectedDsaIndex, setSelectedDsaIndex] = useState(0);
  const [selectedLang, setSelectedLang] = useState("javascript");
  const [userCodes, setUserCodes] = useState({});
  const [dsaTimerSeconds, setDsaTimerSeconds] = useState(dsaQuestions[0]?.timeLimitMinutes * 60 || 600);
  const [isDsaTimerRunning, setIsDsaTimerRunning] = useState(false);
  const dsaTimerRef = useRef(null);

  // Compiler Runner State
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [executionOutput, setExecutionOutput] = useState(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState("results"); // "results" | "terminal"
  const [customInput, setCustomInput] = useState("");
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const activeProblem = dsaQuestions[selectedDsaIndex] || dsaQuestions[0];

  // Initialize Code when problem or language changes
  useEffect(() => {
    const key = `${selectedDsaIndex}_${selectedLang}`;
    if (!userCodes[key]) {
      const defaultCode = activeProblem?.starterCode?.[selectedLang] || "// Write your code here...";
      setUserCodes((prev) => ({ ...prev, [key]: defaultCode }));
    }
  }, [selectedDsaIndex, selectedLang, activeProblem]);

  // Handle problem change timer reset
  useEffect(() => {
    const minutes = activeProblem?.timeLimitMinutes || (selectedDsaIndex === 0 ? 10 : 30);
    setDsaTimerSeconds(minutes * 60);
    setIsDsaTimerRunning(false);
    setExecutionOutput(null);
    setSubmissionSuccess(false);
  }, [selectedDsaIndex, activeProblem]);

  // ── MCQ Timer Logic (10s per question) ──
  useEffect(() => {
    if (mcqState !== "running") return;

    timerRef.current = setInterval(() => {
      setQTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion(true);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [mcqState, currentQIndex]);

  // ── DSA Timer Logic ──
  useEffect(() => {
    if (!isDsaTimerRunning) return;

    dsaTimerRef.current = setInterval(() => {
      setDsaTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(dsaTimerRef.current);
          setIsDsaTimerRunning(false);
          alert("⏱️ Time limit reached for this problem!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(dsaTimerRef.current);
  }, [isDsaTimerRunning]);

  const handleStartMcq = () => {
    setUserAnswers(new Array(mcqs.length).fill(null));
    setCurrentQIndex(0);
    setQTimeLeft(10);
    setMcqState("running");
  };

  const handleSelectOption = (optionIndex) => {
    const nextAnswers = [...userAnswers];
    nextAnswers[currentQIndex] = optionIndex;
    setUserAnswers(nextAnswers);
  };

  const handleNextQuestion = (forcedByTimeout = false) => {
    if (currentQIndex < mcqs.length - 1) {
      setCurrentQIndex((idx) => idx + 1);
      setQTimeLeft(10);
    } else {
      clearInterval(timerRef.current);
      setMcqState("completed");
    }
  };

  // Calculate MCQ Score
  const calculateScore = () => {
    let correct = 0;
    mcqs.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    return correct;
  };

  // Current code accessor
  const currentCodeKey = `${selectedDsaIndex}_${selectedLang}`;
  const currentCode = userCodes[currentCodeKey] || activeProblem?.starterCode?.[selectedLang] || "";

  const handleCodeChange = (newCode) => {
    setUserCodes((prev) => ({ ...prev, [currentCodeKey]: newCode }));
  };

  const handleResetBoilerplate = () => {
    const defaultCode = activeProblem?.starterCode?.[selectedLang] || "";
    setUserCodes((prev) => ({ ...prev, [currentCodeKey]: defaultCode }));
    setExecutionOutput(null);
  };

  // Format seconds to mm:ss
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Run Code via backend execution engine
  const handleRunCode = async (isSubmit = false) => {
    try {
      setIsRunningCode(true);
      setSubmissionSuccess(false);

      let payload = {
        language: selectedLang,
        code: currentCode
      };

      if (useCustomInput && !isSubmit) {
        payload.input = customInput;
      } else {
        payload.testCases = activeProblem.testCases || [];
      }

      const res = await executeCodeSnippet(payload);
      setExecutionOutput(res);

      if (isSubmit && res.allPassed) {
        setSubmissionSuccess(true);
      }
    } catch (err) {
      console.error("Execution failed:", err);
      setExecutionOutput({
        success: false,
        stderr: err.response?.data?.message || err.message || "Failed to execute code."
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  return (
    <div className="assessment-container">
      {/* Top Header & Round Switcher */}
      <div className="assessment-topbar">
        <div className="topbar-title-wrap">
          <span className="live-pulse-badge">
            <span className="live-dot"></span> LIVE TEST SIMULATION
          </span>
          <h2>Job Assessment &amp; Technical Screening</h2>
          <p>Real-world online assessment round simulating top engineering interview screening tests.</p>
        </div>

        <div className="round-pills">
          <button
            type="button"
            className={`round-pill ${activeSubTab === "mcq" ? "active" : ""}`}
            onClick={() => setActiveSubTab("mcq")}
          >
            <span className="round-icon">⚡</span>
            <div className="round-text">
              <span className="round-name">Round 1: 10 MCQ Speed Test</span>
              <span className="round-timing">10 Sec / Question</span>
            </div>
          </button>

          <button
            type="button"
            className={`round-pill ${activeSubTab === "dsa" ? "active" : ""}`}
            onClick={() => setActiveSubTab("dsa")}
          >
            <span className="round-icon">💻</span>
            <div className="round-text">
              <span className="round-name">Round 2: Live DSA Compiler</span>
              <span className="round-timing">Easy (10m) &bull; Medium (30m)</span>
            </div>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ROUND 1: 10 MCQ SPEED TEST (10s PER QUESTION)
          ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "mcq" && (
        <div className="mcq-screen">
          {/* State 1: Start Banner */}
          {mcqState === "idle" && (
            <div className="mcq-start-card">
              <div className="hero-icon-wrap">
                <span className="speed-icon">⚡</span>
              </div>
              <h3>10-Question High-Velocity Technical Screening</h3>
              <p className="start-description">
                Simulates real-world company pre-screening rounds. You have exactly <strong>10 seconds per question</strong> to answer. Test your fundamentals, architecture, and language internals under pressure.
              </p>

              <div className="mcq-rules-grid">
                <div className="rule-box">
                  <span className="rule-num">10</span>
                  <span className="rule-label">Curated Questions</span>
                </div>
                <div className="rule-box">
                  <span className="rule-num">10s</span>
                  <span className="rule-label">Time Per Question</span>
                </div>
                <div className="rule-box">
                  <span className="rule-num">4</span>
                  <span className="rule-label">Options Per Q</span>
                </div>
                <div className="rule-box">
                  <span className="rule-num">100%</span>
                  <span className="rule-label">Detailed Analysis</span>
                </div>
              </div>

              <button type="button" className="start-test-btn" onClick={handleStartMcq}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Start 10 MCQ Test (10s / Q)
              </button>
            </div>
          )}

          {/* State 2: Active Test in Progress */}
          {mcqState === "running" && (
            <div className="mcq-active-card">
              <div className="mcq-progress-bar-wrap">
                <div 
                  className={`mcq-timer-bar ${qTimeLeft <= 3 ? "urgent" : ""}`}
                  style={{ width: `${(qTimeLeft / 10) * 100}%` }}
                ></div>
              </div>

              <div className="mcq-card-head">
                <div className="q-badge-group">
                  <span className="q-category-tag">{mcqs[currentQIndex]?.category || "Technical Competency"}</span>
                  <span className="q-counter">Question {currentQIndex + 1} of {mcqs.length}</span>
                </div>

                <div className={`countdown-clock ${qTimeLeft <= 3 ? "urgent" : ""}`}>
                  <span className="clock-icon">⏱️</span>
                  <span className="clock-digits">{qTimeLeft}s left</span>
                </div>
              </div>

              <h3 className="mcq-question-text">{mcqs[currentQIndex]?.question}</h3>

              <div className="mcq-options-list">
                {mcqs[currentQIndex]?.options?.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentQIndex] === optIdx;
                  const letter = String.fromCharCode(65 + optIdx);
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      className={`mcq-option-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectOption(optIdx)}
                    >
                      <span className="opt-letter">{letter}</span>
                      <span className="opt-text">{opt}</span>
                      {isSelected && <span className="opt-check">✓</span>}
                    </button>
                  );
                })}
              </div>

              <div className="mcq-footer-actions">
                <span className="auto-advance-hint">
                  {qTimeLeft <= 3 ? "⚠️ Hurry! Auto-advancing soon..." : "⚡ Select an option to lock in your answer"}
                </span>
                <button
                  type="button"
                  className="next-q-btn"
                  onClick={() => handleNextQuestion(false)}
                >
                  {currentQIndex === mcqs.length - 1 ? "Submit Test →" : "Next Question →"}
                </button>
              </div>
            </div>
          )}

          {/* State 3: Result Analysis */}
          {mcqState === "completed" && (
            <div className="mcq-results-card">
              <div className="results-header">
                <div className="score-summary-box">
                  <div className="score-circle">
                    <span className="score-val">{calculateScore()}</span>
                    <span className="score-max">/ {mcqs.length}</span>
                  </div>
                  <div className="score-texts">
                    <h3>Performance Analysis</h3>
                    <p className="score-percent">
                      Score: {((calculateScore() / mcqs.length) * 100).toFixed(0)}% Match
                    </p>
                    <span className={`eval-pill ${calculateScore() >= 8 ? "high" : calculateScore() >= 5 ? "mid" : "low"}`}>
                      {calculateScore() >= 8 ? "🌟 Strong Technical Hire" : calculateScore() >= 5 ? "👍 Competent Foundation" : "⚠️ Needs Technical Review"}
                    </span>
                  </div>
                </div>

                <button type="button" className="retake-btn" onClick={handleStartMcq}>
                  🔄 Retake Assessment
                </button>
              </div>

              {/* Detailed Question Review */}
              <div className="review-section">
                <h4>Detailed Question &amp; Answer Breakdown</h4>
                <div className="review-list">
                  {mcqs.map((q, idx) => {
                    const selected = userAnswers[idx];
                    const isCorrect = selected === q.correctIndex;
                    const didTimeout = selected === null;

                    return (
                      <div key={idx} className={`review-item ${isCorrect ? "correct" : "incorrect"}`}>
                        <div className="review-item-header">
                          <span className="q-index-pill">Q{idx + 1}</span>
                          <span className="review-category">{q.category}</span>
                          <span className={`status-tag ${isCorrect ? "correct" : "wrong"}`}>
                            {isCorrect ? "✓ Correct" : didTimeout ? "⏱️ Timed Out" : "✕ Incorrect"}
                          </span>
                        </div>

                        <p className="review-question">{q.question}</p>

                        <div className="review-options">
                          {q.options?.map((opt, optIdx) => {
                            const isUserChoice = selected === optIdx;
                            const isTargetAnswer = q.correctIndex === optIdx;
                            let styleClass = "";
                            if (isTargetAnswer) styleClass = "is-correct";
                            else if (isUserChoice && !isCorrect) styleClass = "is-wrong";

                            return (
                              <div key={optIdx} className={`review-opt ${styleClass}`}>
                                <span className="opt-marker">
                                  {isTargetAnswer ? "✓ Correct: " : isUserChoice ? "✕ Your Choice: " : "• "}
                                </span>
                                <span>{opt}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="review-explanation">
                          <strong>💡 Why this is correct:</strong> {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ROUND 2: LIVE DSA COMPILER (C / C++ / JAVA / PYTHON / JS)
          ───────────────────────────────────────────────────────────── */}
      {activeSubTab === "dsa" && (
        <div className="dsa-screen">
          {/* Problem Selector & Timer Bar */}
          <div className="dsa-controls-bar">
            <div className="problem-pills">
              {dsaQuestions.map((prob, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`prob-tab ${selectedDsaIndex === idx ? "active" : ""}`}
                  onClick={() => setSelectedDsaIndex(idx)}
                >
                  <span className={`diff-dot ${prob.difficulty?.toLowerCase()}`}></span>
                  <span className="prob-tab-title">{prob.title || `Problem ${idx + 1}`}</span>
                  <span className={`diff-badge ${prob.difficulty?.toLowerCase()}`}>
                    {prob.difficulty} ({prob.timeLimitMinutes || (idx === 0 ? 10 : 30)}m)
                  </span>
                </button>
              ))}
            </div>

            {/* Countdown Clock */}
            <div className="dsa-timer-box">
              <span className="timer-icon">⏳</span>
              <span className={`timer-digits ${dsaTimerSeconds <= 120 ? "urgent" : ""}`}>
                {formatTime(dsaTimerSeconds)}
              </span>
              <button
                type="button"
                className={`timer-toggle-btn ${isDsaTimerRunning ? "running" : ""}`}
                onClick={() => setIsDsaTimerRunning(!isDsaTimerRunning)}
              >
                {isDsaTimerRunning ? "⏸ Pause" : "▶ Start Timer"}
              </button>
            </div>
          </div>

          {/* Main 2-Column Split: Problem Description vs Live Compiler */}
          <div className="dsa-workspace-grid">
            {/* Left: Problem Statement & Examples */}
            <div className="problem-pane">
              <div className="pane-header">
                <h3>{activeProblem?.title}</h3>
                <span className={`diff-tag ${activeProblem?.difficulty?.toLowerCase()}`}>
                  {activeProblem?.difficulty} &bull; {activeProblem?.timeLimitMinutes} min limit
                </span>
              </div>

              <div className="problem-content-scroll">
                <div className="problem-desc">
                  <p>{activeProblem?.problemStatement}</p>
                </div>

                {/* Examples */}
                <div className="examples-section">
                  <h4>Example Test Cases</h4>
                  {activeProblem?.examples?.map((ex, exIdx) => (
                    <div key={exIdx} className="example-box">
                      <div className="ex-title">Example {exIdx + 1}:</div>
                      <div className="ex-line">
                        <strong>Input:</strong> <code>{ex.input}</code>
                      </div>
                      <div className="ex-line">
                        <strong>Output:</strong> <code>{ex.output}</code>
                      </div>
                      {ex.explanation && (
                        <div className="ex-line ex-expl">
                          <strong>Explanation:</strong> {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                {activeProblem?.constraints && activeProblem.constraints.length > 0 && (
                  <div className="constraints-section">
                    <h4>Constraints</h4>
                    <ul>
                      {activeProblem.constraints.map((c, cIdx) => (
                        <li key={cIdx}><code>{c}</code></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Live Multi-Language Compiler & Output Console */}
            <div className="compiler-pane">
              {/* Language Selector Bar */}
              <div className="lang-bar">
                <div className="lang-list">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      className={`lang-btn ${selectedLang === l.id ? "active" : ""}`}
                      onClick={() => setSelectedLang(l.id)}
                    >
                      <span>{l.icon}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>

                <div className="editor-quick-actions">
                  <button
                    type="button"
                    className="quick-btn"
                    onClick={handleResetBoilerplate}
                    title="Reset to starter boilerplate"
                  >
                    ↺ Reset
                  </button>
                  <button
                    type="button"
                    className="quick-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(currentCode);
                      alert("Code copied to clipboard!");
                    }}
                    title="Copy code"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              {/* Code Area */}
              <div className="code-editor-wrap">
                <textarea
                  className="code-textarea"
                  value={currentCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder={`Write your ${selectedLang} code here...`}
                  spellCheck={false}
                />
              </div>

              {/* Execution Actions Bar */}
              <div className="compiler-actions-bar">
                <div className="custom-input-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={useCustomInput}
                      onChange={(e) => setUseCustomInput(e.target.checked)}
                    />
                    <span>Custom Input (stdin)</span>
                  </label>
                </div>

                <div className="run-buttons-group">
                  <button
                    type="button"
                    className="run-code-btn"
                    onClick={() => handleRunCode(false)}
                    disabled={isRunningCode}
                  >
                    {isRunningCode ? (
                      <>
                        <span className="btn-spinner"></span>
                        Compiling &amp; Executing...
                      </>
                    ) : (
                      <>
                        <span>▶</span>
                        Run Code
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="submit-code-btn"
                    onClick={() => handleRunCode(true)}
                    disabled={isRunningCode}
                  >
                    <span>✓</span>
                    Submit Solution
                  </button>
                </div>
              </div>

              {/* Custom Input Box if toggled */}
              {useCustomInput && (
                <div className="custom-input-box">
                  <label>Custom Input (stdin):</label>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter custom input arguments..."
                    rows={2}
                  />
                </div>
              )}

              {/* Output & Test Runner Console */}
              <div className="console-panel">
                <div className="console-tabs">
                  <button
                    type="button"
                    className={`console-tab ${activeConsoleTab === "results" ? "active" : ""}`}
                    onClick={() => setActiveConsoleTab("results")}
                  >
                    Test Cases Output
                  </button>
                  <button
                    type="button"
                    className={`console-tab ${activeConsoleTab === "terminal" ? "active" : ""}`}
                    onClick={() => setActiveConsoleTab("terminal")}
                  >
                    Terminal Logs &amp; Stderr
                  </button>

                  {executionOutput && (
                    <span className="execution-time-badge">
                      ⏱ {executionOutput.executionTimeMs || executionOutput.totalTimeMs || 0} ms
                    </span>
                  )}
                </div>

                <div className="console-body">
                  {submissionSuccess && (
                    <div className="submission-success-banner">
                      🎉 <strong>ACCEPTED!</strong> Your solution passed all test cases!
                    </div>
                  )}

                  {isRunningCode ? (
                    <div className="console-loading">
                      <div className="spinner-small"></div>
                      <span>Compiling across {selectedLang} runtime &bull; Executing test suite...</span>
                    </div>
                  ) : executionOutput ? (
                    activeConsoleTab === "results" ? (
                      executionOutput.results ? (
                        <div className="testcases-results-list">
                          {executionOutput.results.map((tc, tcIdx) => (
                            <div key={tcIdx} className={`testcase-row ${tc.passed ? "passed" : "failed"}`}>
                              <div className="tc-status-line">
                                <span className={`tc-tag ${tc.passed ? "passed" : "failed"}`}>
                                  {tc.passed ? "✓ Passed" : "✕ Failed"}
                                </span>
                                <span className="tc-title">Test Case {tc.testCaseNumber}</span>
                                <span className="tc-time">{tc.executionTimeMs} ms</span>
                              </div>
                              <div className="tc-details">
                                <div><strong>Input:</strong> <code>{tc.input}</code></div>
                                <div><strong>Expected:</strong> <code>{tc.expectedOutput}</code></div>
                                <div><strong>Output:</strong> <code>{tc.actualOutput || "<empty>"}</code></div>
                                {tc.stderr && <div className="tc-err"><strong>Error:</strong> {tc.stderr}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="raw-output-wrap">
                          <pre>{executionOutput.output || executionOutput.stderr || "Process finished with no stdout."}</pre>
                        </div>
                      )
                    ) : (
                      <div className="raw-output-wrap">
                        {executionOutput.stderr ? (
                          <pre className="stderr-text">{executionOutput.stderr}</pre>
                        ) : (
                          <pre className="stdout-text">{executionOutput.output || "No stderr logged. Clean execution."}</pre>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="console-empty-prompt">
                      Click <strong>"Run Code"</strong> to test your solution against sample test cases in <strong>{selectedLang}</strong>.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentRound;
