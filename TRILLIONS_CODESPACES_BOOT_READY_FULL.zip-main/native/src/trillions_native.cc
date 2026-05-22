#include <napi.h>
#include <immintrin.h>
#include <chrono>

Napi::Object avx2Bench(const Napi::CallbackInfo& info){

    Napi::Env env = info.Env();

    uint64_t loops = 10000000;

    if(info.Length()>0 && info[0].IsNumber())
        loops = info[0].As<Napi::Number>().Uint32Value();

    alignas(32) float a[8]={1,2,3,4,5,6,7,8};
    alignas(32) float b[8]={8,7,6,5,4,3,2,1};
    alignas(32) float c[8]={0};

    auto start =
    std::chrono::high_resolution_clock::now();

    for(uint64_t i=0;i<loops;i++){

        __m256 va =
        _mm256_load_ps(a);

        __m256 vb =
        _mm256_load_ps(b);

        __m256 vc =
        _mm256_mul_ps(va,vb);

        vc =
        _mm256_add_ps(vc,va);

        _mm256_store_ps(c,vc);
    }

    auto end =
    std::chrono::high_resolution_clock::now();

    double ms =
    std::chrono::duration<double,std::milli>
    (end-start).count();

    Napi::Object o =
    Napi::Object::New(env);

    o.Set("status","AVX2_NATIVE_OK");
    o.Set("loops",(double)loops);
    o.Set("duration_ms",ms);

    o.Set(
      "gflops_est",
      (loops*16.0)/(ms*1000000.0)
    );

    o.Set(
      "honesty",
      "real native SIMD if host VM exposes AVX"
    );

    return o;
}

Napi::Object Init(
    Napi::Env env,
    Napi::Object exports
){
    exports.Set(
      "avx2Bench",
      Napi::Function::New(env,avx2Bench)
    );

    return exports;
}

NODE_API_MODULE(
  trillions_native,
  Init
)
