{
  "targets": [
    {
      "target_name": "sha256_avx512",
      "sources": ["sha256_avx512.cc"],
      "include_dirs": ["<!(node -p \"require('path').dirname(require.resolve('node-addon-api'))\")"],
      "cflags": ["-O3", "-mavx512f", "-mavx512dq", "-mavx512bw", "-mavx512vl"],
      "cflags_cc": ["-std=c++11", "-O3", "-mavx512f", "-mavx512dq", "-mavx512bw", "-mavx512vl"]
    }
  ]
}
