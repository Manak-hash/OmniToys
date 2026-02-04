#include <iostream>
#include <string>
#include <emscripten.h>
#include "common.h"

// Forward declare executeSource from compiler.cpp
namespace OmniNative {
    std::vector<std::string> executeSource(const std::string& source);
}

extern "C" {

    // Main API called by React
    // Returns: Output String (each line is separate)
    const char* compile_and_run(const char* source_code) {
        static std::string output_cache;
        static std::vector<std::string> results;

        output_cache.clear();
        results.clear();

        try {
            // Use the interpreter directly
            results = OmniNative::executeSource(source_code);

            // Combine results with newlines
            for (size_t i = 0; i < results.size(); i++) {
                if (i > 0) output_cache += "\n";
                output_cache += "> " + results[i];
            }

            if (output_cache.empty()) {
                output_cache = "> Program finished with no output.";
            }

        } catch (const std::exception& e) {
            output_cache = std::string("> Runtime Error: ") + e.what();
        } catch (...) {
            output_cache = "> Unknown Fatal Error";
        }

        return output_cache.c_str();
    }
}

int main() {
    std::cout << "[OmniNative] C Interpreter Loaded. Ready for code..." << std::endl;
    return 0;
}
