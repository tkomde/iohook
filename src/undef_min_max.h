// This header undefines min/max macros on Windows to avoid conflicts with std::min/std::max or V8 headers.
#ifdef _WIN32
#ifdef min
#undef min
#endif
#ifdef max
#undef max
#endif
#endif
