{
  "targets": [
    {
      "target_name": "trillions_native",
      "sources": [ "src/trillions_native.cc" ],

      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],

      "defines": [
        "NAPI_DISABLE_CPP_EXCEPTIONS"
      ],

      "cflags_cc": [
        "-O3",
        "-march=native",
        "-mtune=native",

        "-mavx",
        "-mavx2",
        "-mfma",
        "-msse4.2",

        "-ffast-math",
        "-funroll-loops",
        "-fomit-frame-pointer"
      ],

      "conditions": [
        [
          "OS=='linux'",
          {
            "cflags_cc+": [
              "-mavx512f",
              "-mavx512dq",
              "-mavx512bw",
              "-mavx512vl"
            ]
          }
        ]
      ]
    }
  ]
}
