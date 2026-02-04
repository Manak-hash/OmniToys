// OmniNative Virtual Machine - Real C Execution
#include "common.h"
#include <iostream>
#include <vector>
#include <stack>
#include <map>
#include <cstring>
#include <sstream>
#include <cmath>
#include <cstdio>

namespace OmniNative {

    class VirtualMachine {
    private:
        // Stack-based VM with memory
        std::vector<uint8_t> memory;
        std::stack<double> evalStack;
        std::stack<size_t> callStack;
        std::stack<size_t> loopStack;  // For break/continue

        size_t ip = 0;  // Instruction pointer
        size_t heapPtr = 4096;  // Heap starts after static data

        std::stringstream output;
        size_t maxCycles = 10000000;  // Infinite loop protection
        size_t cycles = 0;

        // Helper macros
        #define BINARY_OP(op) \
            do { \
                if (evalStack.size() >= 2) { \
                    double b = evalStack.top(); evalStack.pop(); \
                    double a = evalStack.top(); evalStack.pop(); \
                    evalStack.push(a op b); \
                } \
            } while(0)

        #define BINARY_OP_FUNC(op, func) \
            do { \
                if (evalStack.size() >= 2) { \
                    double b = evalStack.top(); evalStack.pop(); \
                    double a = evalStack.top(); evalStack.pop(); \
                    evalStack.push(func(a, b)); \
                } \
            } while(0)

        #define COMPARE_OP(op) \
            do { \
                if (evalStack.size() >= 2) { \
                    double b = evalStack.top(); evalStack.pop(); \
                    double a = evalStack.top(); evalStack.pop(); \
                    evalStack.push((a op b) ? 1.0 : 0.0); \
                } \
            } while(0)

    public:
        VirtualMachine() {
            memory.resize(1024 * 1024, 0);  // 1MB
        }

        std::string getOutput() {
            return output.str();
        }

        void clearOutput() {
            output.str("");
            output.clear();
        }

        // Memory access helpers
        double loadDouble(size_t addr) {
            if (addr + sizeof(double) <= memory.size()) {
                double val;
                std::memcpy(&val, &memory[addr], sizeof(double));
                return val;
            }
            return 0;
        }

        void storeDouble(size_t addr, double val) {
            if (addr + sizeof(double) <= memory.size()) {
                std::memcpy(&memory[addr], &val, sizeof(double));
            }
        }

        uint8_t loadByte(size_t addr) {
            if (addr < memory.size()) return memory[addr];
            return 0;
        }

        void storeByte(size_t addr, uint8_t val) {
            if (addr < memory.size()) memory[addr] = val;
        }

        void run(const Program& prog) {
            ip = 0;
            cycles = 0;
            bool running = true;

            // Load data segment
            if (prog.dataSegment.size() > memory.size()) {
                memory.resize(prog.dataSegment.size() + 4096);
            }
            std::memcpy(memory.data(), prog.dataSegment.data(), prog.dataSegment.size());
            heapPtr = prog.dataSegment.size() + 8;

            while (running && cycles < maxCycles) {
                if (ip >= prog.instructions.size()) break;

                const Instruction& instr = prog.instructions[ip++];
                cycles++;

                switch (instr.op) {
                    case HALT: running = false; break;
                    case NOOP: break;

                    // Stack operations
                    case PUSH_IMM:
                        evalStack.push(instr.immediate);
                        break;

                    case PUSH_STR: {
                        // String is already in memory, just push address
                        evalStack.push(instr.immediate);
                        break;
                    }

                    case POP:
                        if (!evalStack.empty()) evalStack.pop();
                        break;

                    case DUP:
                        if (!evalStack.empty()) evalStack.push(evalStack.top());
                        break;

                    // Arithmetic
                    case ADD: BINARY_OP(+); break;
                    case SUB: BINARY_OP(-); break;
                    case MUL: BINARY_OP(*); break;
                    case DIV:
                        if (!evalStack.empty()) {
                            double b = evalStack.top(); evalStack.pop();
                            double a = evalStack.top(); evalStack.pop();
                            evalStack.push(b != 0 ? a / b : 0);
                        }
                        break;

                    case MOD:
                        if (!evalStack.empty()) {
                            double b = evalStack.top(); evalStack.pop();
                            double a = evalStack.top(); evalStack.pop();
                            evalStack.push(b != 0 ? std::fmod(a, b) : 0);
                        }
                        break;

                    // Bitwise
                    case BIT_AND: {
                        if (evalStack.size() >= 2) {
                            double b = evalStack.top(); evalStack.pop();
                            double a = evalStack.top(); evalStack.pop();
                            evalStack.push((double)((int64_t)a & (int64_t)b));
                        }
                        break;
                    }
                    case BIT_OR: {
                        if (evalStack.size() >= 2) {
                            double b = evalStack.top(); evalStack.pop();
                            double a = evalStack.top(); evalStack.pop();
                            evalStack.push((double)((int64_t)a | (int64_t)b));
                        }
                        break;
                    }
                    case BIT_XOR: {
                        if (evalStack.size() >= 2) {
                            double b = evalStack.top(); evalStack.pop();
                            double a = evalStack.top(); evalStack.pop();
                            evalStack.push((double)((int64_t)a ^ (int64_t)b));
                        }
                        break;
                    }
                    case BIT_NOT:
                        if (!evalStack.empty()) {
                            double a = evalStack.top(); evalStack.pop();
                            evalStack.push((double)~(int64_t)a);
                        }
                        break;
                    case SHL:
                        if (evalStack.size() >= 2) {
                            double b = evalStack.top(); evalStack.pop();
                            double a = evalStack.top(); evalStack.pop();
                            evalStack.push((double)((int64_t)a << (int)b));
                        }
                        break;
                    case SHR:
                        if (evalStack.size() >= 2) {
                            double b = evalStack.top(); evalStack.pop();
                            double a = evalStack.top(); evalStack.pop();
                            evalStack.push((double)((int64_t)a >> (int)b));
                        }
                        break;

                    // Logical
                    case LOGICAL_AND:
                        if (evalStack.size() >= 2) {
                            double b = evalStack.top(); evalStack.pop();
                            double a = evalStack.top(); evalStack.pop();
                            evalStack.push((a != 0 && b != 0) ? 1.0 : 0.0);
                        }
                        break;
                    case LOGICAL_OR:
                        if (evalStack.size() >= 2) {
                            double b = evalStack.top(); evalStack.pop();
                            double a = evalStack.top(); evalStack.pop();
                            evalStack.push((a != 0 || b != 0) ? 1.0 : 0.0);
                        }
                        break;
                    case LOGICAL_NOT:
                        if (!evalStack.empty()) {
                            double a = evalStack.top(); evalStack.pop();
                            evalStack.push(a == 0 ? 1.0 : 0.0);
                        }
                        break;

                    // Comparison
                    case EQ: COMPARE_OP(==); break;
                    case NEQ: COMPARE_OP(!=); break;
                    case LT: COMPARE_OP(<); break;
                    case GT: COMPARE_OP(>); break;
                    case LTE: COMPARE_OP(<=); break;
                    case GTE: COMPARE_OP(>=); break;

                    // Memory operations
                    case LOAD: {
                        if (!evalStack.empty()) {
                            size_t addr = (size_t)evalStack.top();
                            evalStack.pop();
                            evalStack.push(loadDouble(addr));
                        }
                        break;
                    }

                    case STORE: {
                        if (evalStack.size() >= 2) {
                            double val = evalStack.top(); evalStack.pop();
                            size_t addr = (size_t)evalStack.top();
                            evalStack.pop();
                            storeDouble(addr, val);
                        }
                        break;
                    }

                    case ALLOC: {
                        if (!evalStack.empty()) {
                            size_t size = (size_t)evalStack.top();
                            evalStack.pop();
                            evalStack.push((double)heapPtr);
                            heapPtr += size;
                            if (heapPtr > memory.size()) {
                                memory.resize(heapPtr + 4096);
                            }
                        }
                        break;
                    }

                    case FREE:
                        // Simple stub - real implementation would need free list
                        if (!evalStack.empty()) evalStack.pop();
                        break;

                    // Address operations
                    case ADDR_OF: {
                        // Push address of lvalue
                        // For now, just use the value on stack as the address
                        break;
                    }

                    case DEREF: {
                        if (!evalStack.empty()) {
                            size_t addr = (size_t)evalStack.top();
                            evalStack.pop();
                            evalStack.push(loadDouble(addr));
                        }
                        break;
                    }

                    // Control flow
                    case JMP:
                        ip = (size_t)instr.immediate;
                        break;

                    case JMP_IF: {
                        if (!evalStack.empty()) {
                            double cond = evalStack.top();
                            evalStack.pop();
                            if (cond != 0) ip = (size_t)instr.immediate;
                        }
                        break;
                    }

                    case JMP_IF_NOT: {
                        if (!evalStack.empty()) {
                            double cond = evalStack.top();
                            evalStack.pop();
                            if (cond == 0) ip = (size_t)instr.immediate;
                        }
                        break;
                    }

                    case CALL: {
                        callStack.push(ip);
                        // TODO: Handle function lookup by name
                        break;
                    }

                    case RET: {
                        if (callStack.empty()) {
                            running = false;
                        } else {
                            ip = callStack.top();
                            callStack.pop();
                        }
                        break;
                    }

                    case ENTER:
                        // Setup stack frame
                        // TODO: Implement proper stack frames
                        break;

                    case LEAVE:
                        // Tear down stack frame
                        break;

                    // I/O
                    case PRINT: {
                        if (!evalStack.empty()) {
                            double val = evalStack.top();
                            evalStack.pop();
                            // Check if it's an integer
                            if (val == (int64_t)val) {
                                output << (int64_t)val;
                            } else {
                                output << val;
                            }
                            output << "\n";
                        }
                        break;
                    }

                    case PRINT_CHAR: {
                        if (!evalStack.empty()) {
                            char c = (char)evalStack.top();
                            evalStack.pop();
                            output << c;
                        }
                        break;
                    }

                    case PRINT_STR: {
                        if (!evalStack.empty()) {
                            size_t addr = (size_t)evalStack.top();
                            evalStack.pop();
                            while (addr < memory.size() && memory[addr] != 0) {
                                output << (char)memory[addr];
                                addr++;
                            }
                        }
                        break;
                    }

                    // Type conversions
                    case INT_TO_DOUBLE:
                        // Already using doubles for everything
                        break;

                    case DOUBLE_TO_INT:
                        if (!evalStack.empty()) {
                            double val = evalStack.top();
                            evalStack.pop();
                            evalStack.push((double)(int64_t)val);
                        }
                        break;

                    default:
                        break;
                }
            }

            if (cycles >= maxCycles) {
                output << "[ERROR] Infinite loop detected\n";
            }
        }
    };

}