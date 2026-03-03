import { useState, useCallback, useEffect, useRef } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { InputPane } from '@/components/tools/InputPane'
import { OutputPane } from '@/components/tools/OutputPane'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Binary, Play, Pause, Shuffle, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

type SortingAlgorithm = 'bubble' | 'quick' | 'merge' | 'insertion' | 'selection'
type ArrayState = { values: number[]; comparing: number[]; sorted: number[]; pivot?: number }

const ALGORITHMS: Record<SortingAlgorithm, { name: string; complexity: string; description: string }> = {
  bubble: { name: 'Bubble Sort', complexity: 'O(n²)', description: 'Repeatedly swaps adjacent elements' },
  quick: { name: 'Quick Sort', complexity: 'O(n log n)', description: 'Divide and conquer with pivot' },
  merge: { name: 'Merge Sort', complexity: 'O(n log n)', description: 'Divide, sort, and merge' },
  insertion: { name: 'Insertion Sort', complexity: 'O(n²)', description: 'Build sorted array one item at a time' },
  selection: { name: 'Selection Sort', complexity: 'O(n²)', description: 'Find minimum and place at start' },
}

const SPEEDS: Record<string, number> = {
  'Slow': 500,
  'Medium': 200,
  'Fast': 50,
  'Instant': 5,
}

export default function AlgorithmVizPage() {
  const [arraySize, setArraySize] = useState(30)
  const [arrayState, setArrayState] = useState<ArrayState>({ values: [], comparing: [], sorted: [] })
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>('bubble')
  const [speedLabel, setSpeedLabel] = useState('Medium')
  const [isSorting, setIsSorting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [comparisons, setComparisons] = useState(0)
  const [swaps, setSwaps] = useState(0)
  const [currentStep, setCurrentStep] = useState('')

  // Use refs for mutable state that algorithms need to check synchronously
  const isSortingRef = useRef(false)
  const isPausedRef = useRef(false)

  // Update refs when state changes
  useEffect(() => {
    isSortingRef.current = isSorting
  }, [isSorting])

  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  // Generate random array
  const generateArray = useCallback(() => {
    if (isSortingRef.current) return
    const newArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 5)
    setArrayState({ values: newArray, comparing: [], sorted: [] })
    setComparisons(0)
    setSwaps(0)
    setCurrentStep('')
  }, [arraySize])

  // Initialize array on mount
  useEffect(() => {
    generateArray()
  }, [generateArray])

  // Delay helper
  const delay = useCallback((ms: number) => new Promise(resolve => setTimeout(resolve, ms)), [])

  // Check if paused and wait
  const checkPaused = useCallback(async () => {
    while (isPausedRef.current && isSortingRef.current) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }, [])

  // Bubble Sort
  const bubbleSort = async (arr: number[]) => {
    const n = arr.length
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!isSortingRef.current) return
        await checkPaused()

        const speed = SPEEDS[speedLabel]
        setArrayState({ values: [...arr], comparing: [j, j + 1], sorted: Array.from({ length: i }, (_, k) => n - 1 - k) })
        setCurrentStep(`Comparing ${arr[j]} and ${arr[j + 1]}`)
        setComparisons(c => c + 1)
        await delay(speed)

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
          setArrayState({ values: [...arr], comparing: [j, j + 1], sorted: Array.from({ length: i }, (_, k) => n - 1 - k) })
          setCurrentStep(`Swapping ${arr[j]} and ${arr[j + 1]}`)
          setSwaps(s => s + 1)
          await delay(speed)
        }
      }
    }
  }

  // Quick Sort
  const quickSort = async (arr: number[], low = 0, high = arr.length - 1, sorted: number[] = []) => {
    if (low < high && isSortingRef.current) {
      await checkPaused()
      const pi = await partition(arr, low, high, sorted)
      sorted.push(pi)
      await quickSort(arr, low, pi - 1, sorted)
      await quickSort(arr, pi + 1, high, sorted)
    }
  }

  const partition = async (arr: number[], low: number, high: number, sorted: number[]) => {
    const pivot = arr[high]
    let i = low - 1
    const speed = SPEEDS[speedLabel]

    for (let j = low; j < high; j++) {
      if (!isSortingRef.current) return low
      await checkPaused()

      setArrayState({ values: [...arr], comparing: [j], sorted, pivot: high })
      setCurrentStep(`Comparing ${arr[j]} with pivot ${pivot}`)
      setComparisons(c => c + 1)
      await delay(speed)

      if (arr[j] < pivot) {
        i++
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]]
          setArrayState({ values: [...arr], comparing: [i, j], sorted, pivot: high })
          setCurrentStep(`Swapping ${arr[i]} and ${arr[j]}`)
          setSwaps(s => s + 1)
          await delay(speed)
        }
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
    setArrayState({ values: [...arr], comparing: [i + 1, high], sorted, pivot: high })
    setSwaps(s => s + 1)
    await delay(speed)

    return i + 1
  }

  // Merge Sort
  const mergeSort = async (arr: number[], left = 0, right = arr.length - 1, sorted: number[] = []) => {
    if (left < right && isSortingRef.current) {
      await checkPaused()
      const mid = Math.floor((left + right) / 2)
      await mergeSort(arr, left, mid, sorted)
      await mergeSort(arr, mid + 1, right, sorted)
      await merge(arr, left, mid, right, sorted)
    }
  }

  const merge = async (arr: number[], left: number, mid: number, right: number, sorted: number[]) => {
    const leftArr = arr.slice(left, mid + 1)
    const rightArr = arr.slice(mid + 1, right + 1)
    let i = 0, j = 0, k = left
    const speed = SPEEDS[speedLabel]

    while (i < leftArr.length && j < rightArr.length && isSortingRef.current) {
      await checkPaused()

      setArrayState({ values: [...arr], comparing: [left + i, mid + 1 + j], sorted })
      setCurrentStep(`Merging: comparing ${leftArr[i]} and ${rightArr[j]}`)
      setComparisons(c => c + 1)
      await delay(speed)

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i]
        i++
      } else {
        arr[k] = rightArr[j]
        j++
      }
      setArrayState({ values: [...arr], comparing: [k], sorted })
      setSwaps(s => s + 1)
      await delay(speed)
      k++
    }

    while (i < leftArr.length && isSortingRef.current) {
      await checkPaused()
      arr[k] = leftArr[i]
      setArrayState({ values: [...arr], comparing: [k], sorted })
      await delay(speed)
      i++
      k++
    }

    while (j < rightArr.length && isSortingRef.current) {
      await checkPaused()
      arr[k] = rightArr[j]
      setArrayState({ values: [...arr], comparing: [k], sorted })
      await delay(speed)
      j++
      k++
    }
  }

  // Insertion Sort
  const insertionSort = async (arr: number[]) => {
    const n = arr.length
    const speed = SPEEDS[speedLabel]

    for (let i = 1; i < n; i++) {
      if (!isSortingRef.current) return
      await checkPaused()

      const key = arr[i]
      let j = i - 1

      setArrayState({ values: [...arr], comparing: [i], sorted: [] })
      setCurrentStep(`Inserting ${key}`)
      await delay(speed)

      while (j >= 0 && arr[j] > key && isSortingRef.current) {
        await checkPaused()

        setArrayState({ values: [...arr], comparing: [j, j + 1], sorted: Array.from({ length: i - j - 1 }, (_, k) => j - k) })
        setCurrentStep(`Comparing ${arr[j]} with ${key}`)
        setComparisons(c => c + 1)
        await delay(speed)

        arr[j + 1] = arr[j]
        setSwaps(s => s + 1)
        j--
      }

      arr[j + 1] = key
      setArrayState({ values: [...arr], comparing: [j + 1], sorted: Array.from({ length: i + 1 }, (_, k) => k) })
      await delay(speed)
    }
  }

  // Selection Sort
  const selectionSort = async (arr: number[]) => {
    const n = arr.length
    const speed = SPEEDS[speedLabel]

    for (let i = 0; i < n - 1; i++) {
      if (!isSortingRef.current) return
      await checkPaused()

      let minIdx = i
      for (let j = i + 1; j < n; j++) {
        if (!isSortingRef.current) return
        await checkPaused()

        setArrayState({ values: [...arr], comparing: [minIdx, j], sorted: Array.from({ length: i }, (_, k) => k) })
        setCurrentStep(`Finding minimum: comparing ${arr[minIdx]} and ${arr[j]}`)
        setComparisons(c => c + 1)
        await delay(speed)

        if (arr[j] < arr[minIdx]) {
          minIdx = j
        }
      }

      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
        setArrayState({ values: [...arr], comparing: [i, minIdx], sorted: Array.from({ length: i }, (_, k) => k) })
        setCurrentStep(`Swapping ${arr[i]} and ${arr[minIdx]}`)
        setSwaps(s => s + 1)
        await delay(speed)
      }
    }
  }

  // Start sorting
  const handleSort = async () => {
    if (isSorting && !isPaused) {
      setIsPaused(true)
      return
    }

    if (isSorting && isPaused) {
      setIsPaused(false)
      return
    }

    setIsSorting(true)
    setIsPaused(false)
    isSortingRef.current = true
    isPausedRef.current = false

    const arrCopy = [...arrayState.values]

    try {
      switch (algorithm) {
        case 'bubble':
          await bubbleSort(arrCopy)
          break
        case 'quick':
          await quickSort(arrCopy)
          break
        case 'merge':
          await mergeSort(arrCopy)
          break
        case 'insertion':
          await insertionSort(arrCopy)
          break
        case 'selection':
          await selectionSort(arrCopy)
          break
      }

      if (isSortingRef.current) {
        setArrayState({ values: arrCopy, comparing: [], sorted: Array.from({ length: arrCopy.length }, (_, i) => i) })
        setCurrentStep('Sort completed!')
        toast.success(`${ALGORITHMS[algorithm].name} completed!`)
      }
    } catch (error) {
      console.error('Sorting error:', error)
      toast.error('Sorting interrupted')
    } finally {
      setIsSorting(false)
      setIsPaused(false)
      isSortingRef.current = false
      isPausedRef.current = false
    }
  }

  // Stop sorting
  const handleStop = () => {
    setIsSorting(false)
    setIsPaused(false)
    isSortingRef.current = false
    isPausedRef.current = false
    toast.info('Sorting stopped')
  }

  // Get bar color based on state
  const getBarColor = (index: number) => {
    if (arrayState.sorted.includes(index)) return 'bg-green-500'
    if (arrayState.pivot === index) return 'bg-yellow-500'
    if (arrayState.comparing.includes(index)) return 'bg-omni-primary'
    return 'bg-omni-text/40'
  }

  const maxValue = Math.max(...arrayState.values, 100)

  return (
    <ToolLayout
      title="Algorithm Visualizer"
      description="Visualize sorting algorithms step-by-step with animations"
      icon={<Binary className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleStop} />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
        {/* Controls Panel */}
        <InputPane title="Controls">
          <div className="flex flex-col h-full p-6 gap-6">
            {/* Algorithm Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-widest">Algorithm</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(ALGORITHMS) as SortingAlgorithm[]).map((algo) => (
                  <button
                    key={algo}
                    onClick={() => !isSorting && setAlgorithm(algo)}
                    disabled={isSorting}
                    className={`p-3 rounded-lg text-left transition-all ${
                      algorithm === algo
                        ? 'bg-omni-primary text-white shadow-lg shadow-omni-primary/30'
                        : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text/70'
                    } ${isSorting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="font-bold text-sm">{ALGORITHMS[algo].name}</div>
                    <div className="text-[10px] opacity-70">{ALGORITHMS[algo].complexity}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Array Size */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-widest">
                Array Size: {arraySize}
              </label>
              <input
                type="range"
                min="5"
                max="100"
                value={arraySize}
                onChange={(e) => !isSorting && setArraySize(Number(e.target.value))}
                disabled={isSorting}
                className="w-full h-2 bg-omni-text/10 rounded-lg appearance-none cursor-pointer accent-omni-primary"
              />
            </div>

            {/* Speed Control */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Speed</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.keys(SPEEDS).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeedLabel(s)}
                    className={`p-2 rounded text-xs font-bold transition-all ${
                      speedLabel === s
                        ? 'bg-omni-primary text-white'
                        : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text/70'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={generateArray}
                disabled={isSorting}
                className="flex-1 py-4 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shuffle className="w-4 h-4" /> Randomize
              </button>
              <button
                onClick={handleSort}
                className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  isSorting && !isPaused
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-omni-primary hover:bg-omni-primary-hover text-white shadow-lg shadow-omni-primary/20'
                }`}
              >
                {isSorting ? (
                  <>
                    <Pause className="w-4 h-4" /> {isPaused ? 'Resume' : 'Pause'}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start
                  </>
                )}
              </button>
            </div>
          </div>
        </InputPane>

        {/* Visualization Panel */}
        <OutputPane title="Visualization">
          <div className="flex flex-col h-full">
            {/* Stats Bar */}
            <div className="flex items-center justify-between p-4 border-b border-omni-text/5 bg-omni-bg/40">
              <div className="flex gap-6 text-xs">
                <div>
                  <span className="text-omni-text/50 uppercase tracking-wider">Comparisons:</span>
                  <span className="ml-2 font-bold text-omni-primary">{comparisons}</span>
                </div>
                <div>
                  <span className="text-omni-text/50 uppercase tracking-wider">Swaps:</span>
                  <span className="ml-2 font-bold text-omni-primary">{swaps}</span>
                </div>
              </div>
              <div className="text-xs text-omni-text/50 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-3 h-3" />
                {ALGORITHMS[algorithm].name}
              </div>
            </div>

            {/* Current Step */}
            <div className="px-4 py-3 text-center text-xs font-mono text-omni-text/60 bg-omni-bg/20 border-b border-omni-text/5">
              {currentStep || 'Ready to sort...'}
            </div>

            {/* Bars Container */}
            <div className="flex-1 flex items-end justify-center gap-[2px] p-6">
              <AnimatePresence mode="sync">
                {arrayState.values.map((value, index) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.15 }}
                    className={`flex-1 max-w-[50px] min-w-[4px] ${getBarColor(index)} rounded-t-sm transition-colors duration-150 relative group`}
                    style={{ height: `${(value / maxValue) * 100}%` }}
                  >
                    {/* Value tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-omni-text text-omni-bg text-[10px] font-bold px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                      {value}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 p-4 border-t border-omni-text/5 text-[10px]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-omni-primary rounded"></div>
                <span className="text-omni-text/50">Comparing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-omni-text/50">Pivot</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-omni-text/50">Sorted</span>
              </div>
            </div>
          </div>
        </OutputPane>
      </div>
    </ToolLayout>
  )
}
