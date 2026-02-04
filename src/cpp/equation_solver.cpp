#include <iostream>
#include <string>
#include <vector>
#include <cmath>
#include <map>
#include <sstream>
#include <functional>
#include <algorithm>

namespace OmniMath {

    enum TokenType {
        NUMBER, VARIABLE, 
        PLUS, MINUS, MULTIPLY, DIVIDE, POWER, 
        LPAREN, RPAREN, EQ,
        FUNC_SIN, FUNC_COS, FUNC_TAN, FUNC_LOG, FUNC_EXP, FUNC_SQRT,
        END
    };

    struct Token {
        TokenType type;
        std::string value;
        double numValue;
    };

    class Lexer {
        std::string input;
        size_t pos = 0;
    public:
        Lexer(const std::string& text) : input(text) {}

        Token next() {
            while (pos < input.length() && std::isspace(input[pos])) pos++;
            if (pos >= input.length()) return {END, "", 0};

            char c = input[pos];
            if (std::isdigit(c) || c == '.') {
                size_t start = pos;
                while (pos < input.length() && (std::isdigit(input[pos]) || input[pos] == '.')) pos++;
                std::string val = input.substr(start, pos - start);
                return {NUMBER, val, std::stod(val)};
            }

            if (std::isalpha(c)) {
                size_t start = pos; // Note: 'pos' is member variable
                while (pos < input.length() && std::isalpha(input[pos])) pos++;
                std::string id = input.substr(start, pos - start);
                if (id == "sin") return {FUNC_SIN, id, 0};
                if (id == "cos") return {FUNC_COS, id, 0};
                if (id == "tan") return {FUNC_TAN, id, 0};
                if (id == "log") return {FUNC_LOG, id, 0};
                if (id == "exp") return {FUNC_EXP, id, 0};
                if (id == "sqrt") return {FUNC_SQRT, id, 0};
                return {VARIABLE, id, 0};
            }

            pos++;
            switch (c) {
                case '+': return {PLUS, "+", 0};
                case '-': return {MINUS, "-", 0};
                case '*': return {MULTIPLY, "*", 0};
                case '/': return {DIVIDE, "/", 0};
                case '^': return {POWER, "^", 0};
                case '(': return {LPAREN, "(", 0};
                case ')': return {RPAREN, ")", 0};
                case '=': return {EQ, "=", 0};
            }
            return {END, "", 0};
        }
    };

    // --- AST ---
    struct Node {
        virtual ~Node() = default;
        virtual double evaluate(double x) const = 0;
    };

    struct NumberNode : Node {
        double val;
        NumberNode(double v) : val(v) {}
        double evaluate(double) const override { return val; }
    };

    struct VariableNode : Node {
        double evaluate(double x) const override { return x; }
    };

    struct BinaryNode : Node {
        Node *left, *right;
        TokenType op;
        BinaryNode(Node* l, TokenType o, Node* r) : left(l), right(r), op(o) {}
        ~BinaryNode() { delete left; delete right; }
        double evaluate(double x) const override {
            double l = left->evaluate(x);
            double r = right->evaluate(x);
            switch (op) {
                case PLUS: return l + r;
                case MINUS: return l - r;
                case MULTIPLY: return l * r;
                case DIVIDE: return l / r;
                case POWER: return std::pow(l, r);
                default: return 0;
            }
        }
    };

    struct FuncNode : Node {
        Node* arg;
        TokenType func;
        FuncNode(TokenType f, Node* a) : func(f), arg(a) {}
        ~FuncNode() { delete arg; }
        double evaluate(double x) const override {
            double v = arg->evaluate(x);
            switch (func) {
                case FUNC_SIN: return std::sin(v);
                case FUNC_COS: return std::cos(v);
                case FUNC_TAN: return std::tan(v);
                case FUNC_LOG: return std::log(v);
                case FUNC_EXP: return std::exp(v);
                case FUNC_SQRT: return std::sqrt(v);
                default: return 0;
            }
        }
    };

    class Parser {
        Lexer lexer;
        Token current;
    public:
        Parser(const std::string& text) : lexer(text) {
            current = lexer.next();
        }

        Node* parseExpression() {
            Node* lhs = parseTerm();
            while (current.type == PLUS || current.type == MINUS) {
                TokenType op = current.type;
                current = lexer.next();
                lhs = new BinaryNode(lhs, op, parseTerm());
            }
            // Check for equals
            if (current.type == EQ) {
                current = lexer.next();
                Node* rhs = parseExpression(); // Actually parse RHS
                // equation: lhs = rhs => lhs - rhs = 0
                return new BinaryNode(lhs, MINUS, rhs);
            }
            return lhs;
        }

        Node* parseTerm() {
            Node* lhs = parseFactor();
            while (current.type == MULTIPLY || current.type == DIVIDE || current.type == POWER) {
                TokenType op = current.type;
                current = lexer.next();
                lhs = new BinaryNode(lhs, op, parseFactor());
            }
            return lhs;
        }

        Node* parseFactor() {
            if (current.type == NUMBER) {
                Node* n = new NumberNode(current.numValue);
                current = lexer.next();
                return n;
            }
            if (current.type == VARIABLE) {
                current = lexer.next();
                return new VariableNode();
            }
            if (current.type >= FUNC_SIN && current.type <= FUNC_SQRT) {
                TokenType fn = current.type;
                current = lexer.next();
                if (current.type == LPAREN) {
                    current = lexer.next();
                    Node* arg = parseExpression();
                    if (current.type == RPAREN) current = lexer.next();
                    return new FuncNode(fn, arg);
                }
            }
            if (current.type == LPAREN) {
                current = lexer.next();
                Node* n = parseExpression();
                if (current.type == RPAREN) current = lexer.next();
                return n;
            }
            return new NumberNode(0); // Error
        }
    };

    // Newton-Raphson Solver
    double solve(const std::string& equation) {
        Parser parser(equation);
        Node* ast = parser.parseExpression();

        // Newton method
        double x = 1.0; // Initial guess
        const int MAX_ITER = 100;
        const double EPSILON = 1e-7;

        for (int i = 0; i < MAX_ITER; ++i) {
            double fx = ast->evaluate(x);
            if (std::abs(fx) < EPSILON) break;
            
            // Numerical derivative
            double h = 1e-5;
            double fxh = ast->evaluate(x + h);
            double dfx = (fxh - fx) / h;

            if (std::abs(dfx) < 1e-9) break; // Zero derivative

            x = x - fx / dfx;
        }

        delete ast;
        return x;
    }
}

extern "C" {
    double solve_equation(const char* eq_ptr) {
        return OmniMath::solve(std::string(eq_ptr));
    }
}
