# HK Android stable release preparation

Candidate **4.10.7-HK-1.0.1**, Android version code **100002**. The existing published1.0.0 release remains unchanged. Build from the reviewed release commit and bake its exact hash before publication.

## Build and signing inputs

`native-inputs.json` pins 63 wheel/JNI inputs for arm64-v8a and x86_64, including corrected OpenBLAS build 7 and NumPy build 2. NumPy build 2 restores missing quad-precision floating exception flags using bounded, hidden static AOSP runtime objects; the modern NDK 27 compiler and16 KB linker layout remain in use. Sources, original license notices, object-member hashes and a tested regeneration tool accompany the native input archive. No shared Fortran runtime or GCC unwinder is added.

The official APK is arm64-only. Separate x86_64 diagnostic targets were tested. No32-bit release is prepared. The development checkout's original arm64 Opus remains SHA256 `c6f6e0816bbd5812ff72b190dd62278d54904f7127207d5ca9ed2bdb00e63cad`.

Run `scripts/android/prepare-stable-build.py --native-inputs INPUT_ROOT --frontend PREPARED_PUBLIC --dest NEW_DIRECTORY`. It verifies all 63 pinned hashes before creating a fresh build tree and includes tracked sources plus explicitly listed release tools; untracked backups and signing secrets are excluded. Keep the exact source hashes and dirty state in build provenance. Rebuild the frontend when its source changes. Bake `MESHCHATX_BUILD_CHANNEL=stable` and `MESHCHATX_GIT_COMMIT=REVIEWED_COMMIT`. The release metadata must identify the actual reviewed commit.

Use JDK 17, Python 3.11 and NDK 27.3.13750724:

```
./gradlew :app:testDebugUnitTest :app:lintRelease :app:assembleRelease -PmeshchatxAbis=arm64-v8a
```

Normal production builds omit `meshchatxRuntimeTests` and `meshchatxRuntimeForeground`. Do not publish diagnostic targets or instrumentation APKs. Test instructions and physical-device foreground diagnostics are in `scripts/android/runtime-tests/README.md`.

The permanent release certificate SHA256 is `e8e1b72b66d882048d8b712fb4fab5983417e55c359f123d8dcdd845bacf667e`. Keep the private key/password outside Git and public assets and retain a separate secure backup. The former debug-signed APK cannot update in place to this unrelated release key. The owner's phone 13 migration verified identity and settings backups in isolation and restored them successfully. Other installations must verify backups before uninstalling. Future releases must retain this permanent signing identity.

The upstream tag workflow assumes master and multi-platform publication; this fork uses main. Do not dispatch that workflow without adapting destination and signing gates.

## Validation and limitations

The preceding exact release-signed APK passed the owner's locked-screen notification answer and two-way Bluetooth microphone/playback check on phone 13/Android 16. Identity, app settings and Reticulum configuration matched after migration. The corrected NumPy candidate retains the same voice/Bluetooth/notification code and other native payloads; its final phone 13 installation/smoke test remains a publication gate.

NumPy build 2 resolves 52 rebuild regressions, with original-wheel controls and standalone native probes establishing the cause. Both architectures pass 40 focused binding checks. The complete casting/numeric/arithmetic modules pass6,093 ARM or6,094 x86_64 tests, retaining seven inherited failures. Both4 KB and16 KB x86_64 configurations were exercised. All 220 dual-ABI native entries and 110 official arm64 entries pass 16 KB LOAD/RELRO layout checks and match their expected input hashes.

| Corrected NumPy build 2 full suite | Passed | Failed | Errors | Skipped | Expected failures | Unexpected passes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| ARM phone / 4 KB | 33931 | 335 | 10 | 1222 | 33 | 1 |
| x86_64 / 16 KB | 34637 | 335 | 10 | 3332 | 33 | 1 |

The full suites remain non-green: desktop build/compiler/CLI and embedded package assumptions fail, alongside inherited floating exception/precision behavior. The completed corrected x86_64 run has 52 additional passes and no new failing case IDs compared with the earlier complete build 1 suite. Record incomplete OOM/background-suspended attempts separately; never label instrumentation result code-1 as pytest success. See the release validation/NumPy investigation record for raw results and exact scope.

Android unit tests: 32 passed. Release lint:0 errors. Prior frontend call tests: 99 passed. The connected-device foreground-service classification and timeout callback passed the accelerated emulator check; it is not a six-hour soak test. Final APK certificate, ZIP alignment, reflection classes, complete native inventory, provenance and SHA256 checksums must be verified again after the final committed-source rebuild. No Git publication steps are part of local preparation.

The completed ARM rerun resolves the same 52 regression cases. One additional CPU-feature test runs on the 9 because NumPy reports ASIMDFHM unavailable there; it was skipped on the prior device when there was no unavailable feature to exercise. It fails while attempting to launch Python through Android `app_process64`, reporting a dalvik-cache ownership error. This is a desktop-CLI assumption, with no new numerical failure case. The corrected ARM extension's actual imported SHA256 matches the pinned build 2 wheel.
