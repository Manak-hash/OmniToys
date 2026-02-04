// OmniNative Common Definitions - Real C Compiler
#pragma once
#include <vector>
#include <string>
#include <cstdint>
#include <map>
#include <cstring>

namespace OmniNative {

    // Types
    enum TypeKind {
        TYPE_VOID,
        TYPE_INT,
        TYPE_CHAR,
        TYPE_DOUBLE,
        TYPE_PTR,
        TYPE_ARRAY,
        TYPE_FUNCTION
    };

    struct Type {
        TypeKind kind;
        Type* base = nullptr;  // For pointers and arrays
        bool isConst = false;
        int arraySize = 0;     // For arrays

        bool equals(const Type* other) const {
            if (kind != other->kind) return false;
            if (kind == TYPE_PTR) {
                return base->equals(other->base);
            }
            return true;
        }
    };

    // Instruction Set Architecture (ISA) for OmniVM
    enum OpCode : uint8_t {
        HALT = 0x00,
        NOOP = 0x01,

        // Stack Operations
        PUSH_IMM,   // Push immediate value (double)
        PUSH_STR,   // Push string address
        POP,        // Pop value
        DUP,        // Duplicate top of stack

        // Arithmetic
        ADD, SUB, MUL, DIV, MOD,

        // Bitwise
        BIT_AND, BIT_OR, BIT_XOR, BIT_NOT, SHL, SHR,

        // Comparison (pushes 0 or 1)
        EQ, NEQ, LT, GT, LTE, GTE,
        LOGICAL_AND, LOGICAL_OR, LOGICAL_NOT,

        // Memory Access
        LOAD,       // Load from address on stack
        STORE,      // Store value to address
        ALLOC,      // Allocate N bytes
        FREE,       // Free memory

        // Address operations
        ADDR_OF,    // Get address of lvalue
        DEREF,      // Dereference pointer

        // Control Flow
        JMP,        // Unconditional jump
        JMP_IF,     // Jump if top is true (non-zero)
        JMP_IF_NOT, // Jump if top is false
        CALL,       // Call function
        RET,        // Return from function
        ENTER,      // Enter function (setup stack frame)
        LEAVE,      // Leave function

        // I/O
        PRINT,      // Print value on top of stack
        PRINT_CHAR, // Print character
        PRINT_STR,  // Print null-terminated string

        // Type conversions
        INT_TO_DOUBLE,
        DOUBLE_TO_INT
    };

    struct Instruction {
        OpCode op;
        double immediate;
        std::string strValue;  // For string immediates

        Instruction(OpCode o, double i = 0) : op(o), immediate(i) {}
    };

    // Symbol table entry
    struct Symbol {
        std::string name;
        Type type;
        int address = 0;      // Memory address or stack offset
        bool isGlobal = false;
        bool isFunction = false;
        std::vector<Type> paramTypes;

        Symbol() = default;
        Symbol(const std::string& n, const Type& t) : name(n), type(t) {}
    };

    // Executable program
    struct Program {
        std::vector<Instruction> instructions;
        std::vector<uint8_t> dataSegment;     // Static data
        std::map<std::string, size_t> functions;  // Function name -> instruction index
        std::map<std::string, Symbol> globals;   // Global variables
        uint32_t entryPoint = 0;
        int nextGlobalAddr = 0;                // Next free global address
        int nextStringAddr = 0;                // Next free string address
    };

    // Built-in functions
    inline const char* BUILT_INS[] = {
        "printf", "sprintf", "snprintf", "fprintf",
        "scanf", "sscanf", "fscanf",
        "malloc", "free", "calloc", "realloc",
        "strcpy", "strncpy", "strlen", "strcmp", "strncmp", "strcat", "strchr",
        "memcpy", "memmove", "memcmp", "memset",
        "sin", "cos", "tan", "sqrt", "pow", "exp", "log", "log10", "abs",
        "atoi", "atof", "itoa",
        "puts", "putchar", "gets", "getchar",
        nullptr
    };

    inline bool isBuiltin(const std::string& name) {
        for (int i = 0; BUILT_INS[i]; i++) {
            if (name == BUILT_INS[i]) return true;
        }
        return false;
    }
}
