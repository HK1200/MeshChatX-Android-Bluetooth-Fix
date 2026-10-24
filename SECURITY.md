# MeshChatX HK security policy

This policy covers the Android builds and releases maintained in [HK1200/MeshChatX-HK](https://github.com/HK1200/MeshChatX-HK).

## Supported releases

Security fixes target the latest stable HK release. Use the [latest release](https://github.com/HK1200/MeshChatX-HK/releases/latest) when reporting a problem, and include the exact HK version. Older releases, development builds and test candidates may require an upgrade rather than a backported fix.

## Report a vulnerability privately

Use **Report a vulnerability** on this repository's [Security Advisories page](https://github.com/HK1200/MeshChatX-HK/security/advisories). Private vulnerability reporting is enabled for the HK repository.

Include the HK version, device model, Android version, affected feature, steps to reproduce and the expected security impact. Provide a minimal example and redacted logs where useful. Keep unfixed vulnerability details out of public issues, and do not include private Reticulum identities, signing keys, passwords or other people's messages.

For ordinary bugs, setup questions and non-sensitive licensing questions, use the [HK issue tracker](https://github.com/HK1200/MeshChatX-HK/issues). See [LEGAL.md](LEGAL.md) for licensing information.

## Verify an HK Android download

Download official APKs from [this repository's releases](https://github.com/HK1200/MeshChatX-HK/releases). Release assets include checksums and build/validation records.

Official APKs use the permanent HK signing certificate:

```text
SHA-256: e8e1b72b66d882048d8b712fb4fab5983417e55c359f123d8dcdd845bacf667e
```

The built-in updater verifies signed metadata using a separate pinned identity:

```text
4d3aaedcc9aab76c61353deed5adfb8c
```

The signed `latest.rsm` manifest is attached to the application release alongside its APKs. It supplies each update's filename, size and SHA-256 checksum. The updater verifies those values before staging a download; Android checks the APK signature during installation.

HK release APKs are prepared and signed using the permanent release key outside the repository. GitHub's published-release verification checks the manifest signature, APK checksums and signing certificate. Read each release's actual validation reports and workflow results for completed checks. The presence of inherited workflows or signature files alone does not establish that an HK APK has SLSA provenance or passed every test.

## Protect your installation

Keep Android, its WebView and MeshChatX HK updated. Protect identity backups and review logs before sharing them. Back up your identity and settings before a migration or reinstall.

The Android interface normally connects to its embedded backend on localhost. If you configure a remote backend or expose a backend to another network, use authentication and HTTPS and restrict access to trusted clients. Treat network exposure as a separate configuration decision.

Dependency notices and licenses remain in the repository and packaged third-party notices. Third-party components can have their own security advisories; report an issue affecting the HK build through the private channel above.
