# HK Android update feed

HK builds use GitHub Release assets in `HK1200/MeshChatX-HK` rather than the upstream CDN.

- Stable metadata: `releases/latest/download/latest.rsm`, alongside the APK in the latest application release.
- Beta/testing metadata: the newest published matching prerelease (`beta-*`, `nightly-*` / `testing-*`).
- APKs remain under their versioned release tag; the signed manifest supplies that tag and each file's size and SHA-256.
- The pinned HK manifest signer is `4d3aaedcc9aab76c61353deed5adfb8c`. Its private RNS identity is stored outside the repository, beside the permanent APK signing key. Back it up securely; future feeds must use the same identity.
- The update identity is separate from the APK signing certificate and from the user's Reticulum communications identity.

Build and inspect metadata with `scripts/build/update_manifest.py sign --assets APK_DIRECTORY --version PYTHON_VERSION --tag RELEASE_TAG --track release --identity PRIVATE_RID -o latest.json --rsm latest.rsm`. Use a PEP 440 version such as `4.10.7+hk.1.0.3`, not the Android display version. Verify with `scripts/build/update_manifest.py verify latest.rsm` before publishing. Attach the APK, `latest.rsm` and `latest.json` to the same draft application release, verify them, then publish it as latest. No separate feed release is needed.

`MESHCHATX_UPDATE_BASE_URL` retains the original custom-CDN layout (`BASE/TRACK/latest.rsm`, `BASE/TRACK/TAG/FILE`). Set `MESHCHATX_UPDATE_SIGNER` as well when deliberately using a different release identity. Default HK builds must not accept upstream manifests.

Android opens its installation confirmation after a verified APK download. If needed, allow MeshChatX HK to install updates, then return to continue. The native handoff rechecks the exact file checksum and size, its package name, the installed signing certificate and its version code before creating an installation session. Android approval is always required. Cancel keeps the installed app unchanged and leaves the download available to retry; saving the file to Downloads remains a fallback. The update session preserves the existing full-screen incoming-call permission.

# Voicemail speech

Android generates greetings using an installed offline Android speech voice. `VoicemailTextToSpeech` runs initialization on the Android main thread and waits on a Python worker, with bounded waits and cleanup on every path. Speech text is never intentionally sent to a network voice. Voice/language uses an Android voice name or BCP 47 language code, such as `en-US`. Existing speed and pitch controls are mapped to Android rates; eSpeak word-gap controls remain desktop-only.

The status API exposes `has_tts` and `tts_provider`, retaining `has_espeak` for older clients. Recording and uploading greetings remain available without a speech engine. Failed generation or encoding preserves the existing greeting.

Android voicemail encoding also requires packaged libogg. Provision it with `python3 scripts/android/provision-ogg.py --abis arm64-v8a,x86_64,armeabi-v7a`. The source archive is pinned to the official Xiph SHA-256, and Gradle fails packaging when a selected ABI is missing the library. The Android PyOgg discovery hook loads it from the native library directory alongside libopus.

Greeting playback also requires libopusfile. After provisioning Opus and Ogg, run `python3 scripts/android/provision-opusfile.py --abis arm64-v8a,x86_64`. Its release source and dependency headers are checksum-pinned; only the local-file decoder is built, without the HTTP/URL backend. Gradle verifies the library for each selected ABI before packaging.
