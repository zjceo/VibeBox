cmake_minimum_required(VERSION 3.22)
project(vibeboxnative)

# Link c++_shared for all C++ modules to fix linker errors
add_library(c++ SHARED IMPORTED)
set_target_properties(c++ PROPERTIES
  IMPORTED_LOCATION "${ANDROID_NDK}/toolchains/llvm/prebuilt/${ANDROID_TOOLCHAIN}/lib64/libc++_shared.so"
)

# Make all subsequent targets link against c++_shared
link_libraries(c++_shared)
