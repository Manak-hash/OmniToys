
// TypeScript implementation of Myers Diff Algorithm
// Used as fallback when C++ WASM is not available

export interface DiffResult {
    original: string
    modified: string
    changes: {
        type: 'eq' | 'ins' | 'del'
        value: string
        line?: number
    }[]
}

export function computeDiff(text1: string, text2: string): DiffResult['changes'] {
    // Simplified Line-by-Line Diff for MVP
    // A full Myers implementation is verbose. We will implement a decent LCS based diff.
    const lines1 = text1.split('\n')
    const lines2 = text2.split('\n')
    
    // Matrix for LCS
    const dp: number[][] = Array(lines1.length + 1).fill(0).map(() => Array(lines2.length + 1).fill(0))
    
    for (let i = 1; i <= lines1.length; i++) {
        for (let j = 1; j <= lines2.length; j++) {
            if (lines1[i-1] === lines2[j-1]) {
                dp[i][j] = dp[i-1][j-1] + 1
            } else {
                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])
            }
        }
    }

    // Backtrack to find changes
    let i = lines1.length
    let j = lines2.length

    const stack: DiffResult['changes'] = []
    
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && lines1[i-1] === lines2[j-1]) {
            stack.push({ type: 'eq', value: lines1[i-1], line: i })
            i--
            j--
        } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
            stack.push({ type: 'ins', value: lines2[j-1], line: j })
            j--
        } else {
            stack.push({ type: 'del', value: lines1[i-1], line: i })
            i--
        }
    }
    
    return stack.reverse()
}
