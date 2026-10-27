#!/usr/bin/env python3
"""Verify the signed HK manifest and the exact APKs attached to a release."""

import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from meshchatx.src.update_rsm import verify_rsm

SIGNER = bytes.fromhex("4d3aaedcc9aab76c61353deed5adfb8c")
CERTIFICATE = "e8e1b72b66d882048d8b712fb4fab5983417e55c359f123d8dcdd845bacf667e"


def certificate_matches(output):
    # New build-tools can label signers by SDK range instead of "Signer #1".
    # Compare every reported certificate fingerprint, independent of that label.
    digests = re.findall(
        r"certificate SHA-256 digest:\s*([0-9a-fA-F:]+)", output, re.IGNORECASE
    )
    return {digest.replace(":", "").lower() for digest in digests} == {CERTIFICATE}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("assets", type=Path)
    parser.add_argument("--tag", required=True)
    parser.add_argument("--apksigner", required=True)
    args = parser.parse_args()
    manifest = verify_rsm(
        (args.assets / "latest.rsm").read_bytes(), required_signer_hash=SIGNER
    )
    if manifest != json.loads((args.assets / "latest.json").read_text()):
        raise SystemExit("Signed and readable manifests differ")
    if manifest["tag"] != args.tag or manifest["track"] != "release":
        raise SystemExit("Manifest tag/channel mismatch")
    apk_names = {p.name for p in args.assets.glob("*.apk")}
    described = {a["file"] for a in manifest["artifacts"] if a["kind"] == "apk"}
    if not apk_names or apk_names != described:
        raise SystemExit("Release APK inventory differs from signed manifest")
    for artifact in manifest["artifacts"]:
        name = artifact["file"]
        if Path(name).name != name:
            raise SystemExit("Release artifact must be a simple filename")
        path = args.assets / name
        if (
            path.stat().st_size != artifact["size"]
            or hashlib.file_digest(path.open("rb"), "sha256").hexdigest()
            != artifact["sha256"]
        ):
            raise SystemExit(f"Checksum or size mismatch: {name}")
        if artifact["kind"] == "apk":
            output = subprocess.check_output(
                [args.apksigner, "verify", "--verbose", "--print-certs", str(path)],
                text=True,
            )
            if not certificate_matches(output):
                raise SystemExit(f"Unexpected APK signing certificate: {name}")
    print(
        f"Verified {args.tag}: {len(apk_names)} APK(s), pinned update signer, checksums and permanent APK certificate."
    )


if __name__ == "__main__":
    main()
