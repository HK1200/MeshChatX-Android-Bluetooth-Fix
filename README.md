# MeshChatX HK

An Android-focused Reticulum client for messaging, voice calls, voicemail, maps and network visualisation, with additional work on device integration and reliability.

**[Download the latest release](https://github.com/HK1200/MeshChatX-HK/releases/latest)** · **[Report an issue](https://github.com/HK1200/MeshChatX-HK/issues)** · **[Release history](https://github.com/HK1200/MeshChatX-HK/releases)**

## Install on Android

1. Open the [latest release](https://github.com/HK1200/MeshChatX-HK/releases/latest) and download the APK for your device:
   - **arm64:** most current Android phones and tablets, including the OnePlus 13.
   - **x86_64:** compatible Intel/AMD Android devices and emulators.
2. Open the downloaded APK and allow installation from your browser or file manager when Android asks.
3. Open **MeshChatX HK** and complete setup. Existing HK installations signed with the permanent release key can update in place.

Android 7.0 or later is required. No 32-bit APK is provided. Back up your Reticulum identity and app settings before migrating from another build. If Android reports a signing-key conflict, verify your backups before removing an existing installation.

## Features and HK improvements

- Reticulum messaging, voice calls, voicemail, maps and network visualisation.
- Android lock-screen answer handling, dialer state updates, Bluetooth headset routing and call-session cleanup.
- Android foreground-service handling for ongoing device connections.
- Flat, Planet and Radial visualiser views, view controls and saved preferences. WebGL with WASM is supported on capable Android WebViews; a canvas renderer is also available.
- A built-in updater that checks HK releases and verifies a downloaded APK's signed metadata, size and checksum before saving it. Android handles installation.
- Voicemail greetings generated with an installed offline Android text-to-speech voice, with the audio libraries needed to encode and play greetings.
- Checksum-pinned Android dependencies and checks for 16 KB memory-page alignment, including the NumPy/OpenBLAS complex-number correction carried in 1.0.1.

Voicemail speech requires a suitable offline voice installed on the device. Visualiser acceleration depends on the device's WebView and graphics support. See each release's notes for validation results and remaining limitations.

## Versions and updates

**4.10.7-HK-1.0.2** identifies the MeshChatX base version and HK release version. The Python form is `4.10.7+hk.1.0.2`.

The stable updater reads `latest.rsm` from the [latest HK application release](https://github.com/HK1200/MeshChatX-HK/releases/latest). The signed manifest and readable `latest.json` are attached alongside the APKs. There is no separate updater-feed release.

Official APKs retain the permanent HK signing certificate:

```text
SHA-256: e8e1b72b66d882048d8b712fb4fab5983417e55c359f123d8dcdd845bacf667e
```

The update manifest uses a separate pinned signing identity. Details are in [Android updates and voicemail speech](android/release/UPDATES.md).

## Development and validation

```bash
git clone https://github.com/HK1200/MeshChatX-HK.git
cd MeshChatX-HK
```

Android release builds use JDK 17, Python 3.11 and Android NDK 27.3.13750724. Native inputs must match the hashes in [native-inputs.json](android/release/native-inputs.json). Release assets include source, native build inputs, checksums and validation evidence. Private signing keys are kept outside the repository.

- [HK 1.0.2 release notes](android/release/RELEASE-1.0.2.md)
- [Android updates and voicemail speech](android/release/UPDATES.md)
- [Identity and backup documentation](docs/en/identity-and-security.md)

Physical-device testing includes the OnePlus 13 running Android 16. Release reports distinguish phone checks, emulator checks and automated tests. The full NumPy compatibility results include documented failures and are not represented as an entirely passing suite.

For HK build questions and bug reports, use [this repository's issue tracker](https://github.com/HK1200/MeshChatX-HK/issues). Include the HK version, Android version, device model and steps to reproduce the problem. Keep private identities, keys and messages out of public reports.

## Credits

MeshChatX HK builds on the work of:

- **[Quad4](https://github.com/Quad4-Software/MeshChatX)** — MeshChatX and the foundation for the HK build.
- **[Liam Cottle](https://github.com/liamcottle)** — the original Reticulum MeshChat.
- **[RFnexus](https://github.com/RFnexus)** — the Micron JavaScript parser.
- **[markqvist](https://github.com/markqvist)** — Reticulum, LXMF and LXST.

Thanks also to the contributors and dependency authors whose work makes this build possible.

## Licensing

Project licensing, attribution and retained dependency notices are preserved in [LICENSE](LICENSE), [LEGAL.md](LEGAL.md) and the bundled third-party notices.
