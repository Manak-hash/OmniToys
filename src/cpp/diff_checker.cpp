#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <sstream>
#include <emscripten.h>

// Myers Diff Algorithm for WASM
// Returns a JSON-like string with diff operations

namespace OmniDiff {

    enum DiffType { EQUAL, INSERT, DELETE };

    struct DiffOp {
        DiffType type;
        std::string text;
    };

    // Simple line-based diff using LCS (Longest Common Subsequence) approach
    std::vector<DiffOp> computeDiff(const std::string& oldText, const std::string& newText) {
        std::vector<DiffOp> result;

        // Split into lines
        std::vector<std::string> oldLines, newLines;
        std::stringstream ssOld(oldText), ssNew(newText);
        std::string line;

        while (std::getline(ssOld, line)) oldLines.push_back(line);
        while (std::getline(ssNew, line)) newLines.push_back(line);

        // Build LCS table
        size_t m = oldLines.size();
        size_t n = newLines.size();
        std::vector<std::vector<size_t>> dp(m + 1, std::vector<size_t>(n + 1, 0));

        for (size_t i = 1; i <= m; i++) {
            for (size_t j = 1; j <= n; j++) {
                if (oldLines[i - 1] == newLines[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = std::max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        // Backtrack to find diff
        size_t i = m, j = n;
        std::vector<DiffOp> reversed;

        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && oldLines[i - 1] == newLines[j - 1]) {
                reversed.push_back({EQUAL, oldLines[i - 1]});
                i--; j--;
            } else if (j > 0 && (i == 0 || dp[i][j - 1] >= dp[i - 1][j])) {
                reversed.push_back({INSERT, newLines[j - 1]});
                j--;
            } else if (i > 0 && (j == 0 || dp[i][j - 1] < dp[i - 1][j])) {
                reversed.push_back({DELETE, oldLines[i - 1]});
                i--;
            }
        }

        // Reverse to get correct order
        std::reverse(reversed.begin(), reversed.end());

        // Merge consecutive operations of the same type
        for (const auto& op : reversed) {
            if (result.empty() || result.back().type != op.type) {
                result.push_back(op);
            } else {
                result.back().text += "\n" + op.text;
            }
        }

        return result;
    }

    std::string diffToString(const std::vector<DiffOp>& diffs) {
        std::stringstream output;
        for (const auto& op : diffs) {
            switch (op.type) {
                case EQUAL:
                    output << "  " << op.text << "\n";
                    break;
                case INSERT:
                    output << "+ " << op.text << "\n";
                    break;
                case DELETE:
                    output << "- " << op.text << "\n";
                    break;
            }
        }
        return output.str();
    }
}

// Static buffer for returning strings (needed for WASM interop)
static std::string g_diffResultBuffer;

extern "C" {
    const char* compute_diff(const char* oldText, const char* newText) {
        try {
            auto diffs = OmniDiff::computeDiff(oldText, newText);
            g_diffResultBuffer = OmniDiff::diffToString(diffs);
            return g_diffResultBuffer.c_str();
        } catch (...) {
            g_diffResultBuffer = "Error: Diff computation failed";
            return g_diffResultBuffer.c_str();
        }
    }
}
