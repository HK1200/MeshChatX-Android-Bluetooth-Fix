# MeshChatX HK 4.10.7-HK-1.0.2

- Added Flat, Planet and Radial visualiser views to Android, including the view menu and persisted settings. Included and verified the visualiser WASM assets needed by WebGL/Planet.
- Moved signed update discovery to the latest HK application release. The APK and signed `latest.rsm` / readable `latest.json` travel together; no separate feed release is required. Existing upstream CDN overrides retain their layout.
- Added offline Android text-to-speech for voicemail greetings and packaged the Ogg/Opusfile libraries required to encode and play them. Failed generation preserves the existing greeting.
- Corrected default-branch lookup, made upstream Flatpak CDN publishing optional, and kept HK application/feed tags out of the inherited desktop release pipeline. HK stable APKs retain the permanent offline signing key; the published-release check verifies their signatures and signed manifest.
- Fixed Android wheel preparation when a SONAME link exists before its target is unpacked.
- Updated Docker/artifact/Java/cache actions to pinned Node.js 24-compatible releases. Updated hardened-image runtime packages without relaxing its security scan; serialized image variants to reduce builder resource contention.

Android version code: 100003. APK certificate SHA-256: `e8e1b72b66d882048d8b712fb4fab5983417e55c359f123d8dcdd845bacf667e`.

Stable release APKs use the same application ID and signing key as 1.0.1 and support in-place installation. Android still asks the user to install a downloaded update. Android speech requires an installed offline voice.

Validation: 58 updater/speech/native provisioning and wheel-link regression tests, 79 visualiser/settings/voicemail UI tests, and actionlint across all workflows passed. The previous candidate passed physical OnePlus 13 WebGL/view switching, signed update discovery, and voicemail synthesis/Opus decoding. Final release build checks and device verification are recorded in the release's validation report. GitHub emulator and Docker runs are tracked separately; a source fix alone does not establish their final result.
