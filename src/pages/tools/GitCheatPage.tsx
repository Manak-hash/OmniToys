import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { GitBranch, GitCommit, GitMerge, ArrowDownToLine, Copy } from 'lucide-react'
import { toast } from 'sonner'

type GitCategory = 'basics' | 'branching' | 'merging' | 'stashing' | 'undo' | 'log'

interface GitCommand {
  command: string
  description: string
  example?: string
}

const gitCommands: Record<GitCategory, { title: string; commands: GitCommand[] }> = {
  basics: {
    title: 'Basic Commands',
    commands: [
      { command: 'git init', description: 'Initialize a new Git repository', example: 'git init' },
      { command: 'git clone', description: 'Clone a repository into a new directory', example: 'git clone https://github.com/user/repo.git' },
      { command: 'git status', description: 'Show the working tree status', example: 'git status' },
      { command: 'git add', description: 'Add file contents to the staging area', example: 'git add file.js' },
      { command: 'git add .', description: 'Add all files to staging area', example: 'git add .' },
      { command: 'git commit', description: 'Record changes to the repository', example: 'git commit -m "Message"' },
      { command: 'git push', description: 'Update remote refs along with associated objects', example: 'git push origin main' },
      { command: 'git pull', description: 'Fetch from and integrate with another repository', example: 'git pull origin main' },
    ]
  },
  branching: {
    title: 'Branching',
    commands: [
      { command: 'git branch', description: 'List all branches', example: 'git branch' },
      { command: 'git branch <name>', description: 'Create a new branch', example: 'git branch feature' },
      { command: 'git checkout -b <name>', description: 'Create and switch to new branch', example: 'git checkout -b feature' },
      { command: 'git switch <name>', description: 'Switch to a branch', example: 'git switch main' },
      { command: 'git branch -d <name>', description: 'Delete a branch', example: 'git branch -d feature' },
      { command: 'git branch -m <new>', description: 'Rename current branch', example: 'git branch -m new-name' },
      { command: 'git branch -a', description: 'List all remote branches', example: 'git branch -a' },
    ]
  },
  merging: {
    title: 'Merging & Rebasing',
    commands: [
      { command: 'git merge <branch>', description: 'Merge a branch into current branch', example: 'git merge feature' },
      { command: 'git merge --abort', description: 'Abort the current conflict resolution', example: 'git merge --abort' },
      { command: 'git rebase <branch>', description: 'Rebase current branch onto another', example: 'git rebase main' },
      { command: 'git rebase -i HEAD~3', description: 'Interactive rebase for last 3 commits', example: 'git rebase -i HEAD~3' },
      { command: 'git rebase --continue', description: 'Continue rebase after resolving conflicts', example: 'git rebase --continue' },
      { command: 'git rebase --abort', description: 'Abort rebase and return to original state', example: 'git rebase --abort' },
    ]
  },
  stashing: {
    title: 'Stashing',
    commands: [
      { command: 'git stash', description: 'Stash changes in a dirty working directory', example: 'git stash' },
      { command: 'git stash save "message"', description: 'Stash with a message', example: 'git stash save "WIP: feature"' },
      { command: 'git stash list', description: 'List all stashes', example: 'git stash list' },
      { command: 'git stash pop', description: 'Apply and remove most recent stash', example: 'git stash pop' },
      { command: 'git stash apply', description: 'Apply stash without removing it', example: 'git stash apply stash@{0}' },
      { command: 'git stash drop', description: 'Remove most recent stash', example: 'git stash drop' },
      { command: 'git stash clear', description: 'Remove all stashes', example: 'git stash clear' },
    ]
  },
  undo: {
    title: 'Undo Changes',
    commands: [
      { command: 'git restore <file>', description: 'Restore file to last committed version', example: 'git restore file.js' },
      { command: 'git restore --staged <file>', description: 'Unstage file', example: 'git restore --staged file.js' },
      { command: 'git reset HEAD <file>', description: 'Unstage file (alternative)', example: 'git reset HEAD file.js' },
      { command: 'git reset --soft HEAD~1', description: 'Undo last commit but keep changes', example: 'git reset --soft HEAD~1' },
      { command: 'git reset --hard HEAD~1', description: 'Undo last commit and discard changes', example: 'git reset --hard HEAD~1' },
      { command: 'git revert <commit>', description: 'Create new commit that undoes changes', example: 'git revert abc123' },
      { command: 'git clean -fd', description: 'Remove untracked files and directories', example: 'git clean -fd' },
    ]
  },
  log: {
    title: 'Log & History',
    commands: [
      { command: 'git log', description: 'Show commit logs', example: 'git log' },
      { command: 'git log --oneline', description: 'Show commits in one line per commit', example: 'git log --oneline' },
      { command: 'git log --graph --oneline', description: 'Show branch graph', example: 'git log --graph --oneline' },
      { command: 'git log --author="name"', description: 'Filter commits by author', example: 'git log --author="John"' },
      { command: 'git log --since="2 weeks ago"', description: 'Filter commits since date', example: 'git log --since="2 weeks ago"' },
      { command: 'git diff', description: 'Show changes between commits', example: 'git diff' },
      { command: 'git diff --staged', description: 'Show staged changes', example: 'git diff --staged' },
      { command: 'git blame <file>', description: 'Show who modified each line', example: 'git blame file.js' },
    ]
  },
}

export default function GitCheatPage() {
  const [category, setCategory] = useState<GitCategory>('basics')
  const [search, setSearch] = useState('')

  const currentCommands = gitCommands[category].commands.filter(cmd =>
    cmd.command.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase())
  )

  const handleCopy = useCallback((command: string) => {
    navigator.clipboard.writeText(command)
    toast.success('Copied to clipboard!')
  }, [])

  const handleReset = useCallback(() => {
    setSearch('')
    setCategory('basics')
  }, [])

  const categories: { key: GitCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'basics', label: 'Basics', icon: <GitCommit className="w-4 h-4" /> },
    { key: 'branching', label: 'Branching', icon: <GitBranch className="w-4 h-4" /> },
    { key: 'merging', label: 'Merging', icon: <GitMerge className="w-4 h-4" /> },
    { key: 'stashing', label: 'Stashing', icon: <ArrowDownToLine className="w-4 h-4" /> },
    { key: 'undo', label: 'Undo', icon: <GitCommit className="w-4 h-4" /> },
    { key: 'log', label: 'Log', icon: <Copy className="w-4 h-4" /> },
  ]

  return (
    <ToolLayout
      title="Git Cheat Lab"
      description="Interactive Git command reference"
      icon={<GitBranch className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Category Selection */}
        <div className="flex gap-2">
          {categories.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                category === key
                  ? 'bg-omni-primary text-white'
                  : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search commands..."
          className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
        />

        {/* Commands */}
        <div className="flex-1 overflow-auto">
          <h3 className="text-lg font-bold text-omni-text mb-4">{gitCommands[category].title}</h3>
          <div className="space-y-3">
            {currentCommands.map((cmd, index) => (
              <div
                key={index}
                className="p-4 bg-omni-bg/30 rounded-xl border border-omni-text/10 hover:border-omni-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <code className="text-sm font-mono text-omni-primary bg-omni-primary/10 px-2 py-1 rounded">
                      {cmd.example || cmd.command}
                    </code>
                    <p className="text-sm text-omni-text mt-2">{cmd.description}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(cmd.example || cmd.command)}
                    className="p-2 hover:bg-omni-text/10 rounded transition-colors"
                    title="Copy command"
                  >
                    <Copy className="w-4 h-4 text-omni-text/50" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {currentCommands.length === 0 && (
            <div className="text-center py-8 text-omni-text/40">
              No commands found matching "{search}"
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <h3 className="text-xs font-bold text-omni-text/50 uppercase mb-3">Quick Tips</h3>
          <ul className="text-xs text-omni-text/60 space-y-2">
            <li>• Use <code className="bg-omni-text/10 px-1 rounded">git status</code> frequently to check your state</li>
            <li>• Always pull before push to avoid conflicts</li>
            <li>• Write clear, descriptive commit messages</li>
            <li>• Use branches for features, fixes, experiments</li>
            <li>• Stash is great for temporarily saving work</li>
            <li>• Interactive rebase helps clean commit history</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
