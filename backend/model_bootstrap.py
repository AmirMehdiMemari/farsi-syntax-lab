"""
FarsiSyntax Lab - Secure Model Bootstrap
Creator: Amir Mehdi Memari

Loads a verified local archive or downloads the
private GitHub Release at container startup.

Secrets are read only from environment variables.
"""

import argparse
import hashlib
import json
import os
import shutil
import tempfile
import urllib.error
import urllib.request
import zipfile

from pathlib import Path
from urllib.parse import urlsplit


REPO = "AmirMehdiMemari/farsi-syntax-lab"
TAG = "parsbert-pos-v1"
ASSET = "farsi-syntax-lab-parsbert-pos-v1.zip"

ARCHIVE_SHA256 = (
    "e2b786610c70a4e55e40aae31e92b0dbb"
    "ff95bf2e0854bab169d6c534a197b6f"
)

WEIGHTS_SHA256 = (
    "c4baf420f72f7a5191a334b5ed179a82"
    "5e7b0d9ee9bcc30c09450ec9329494c0"
)

FILES = {
    "config.json",
    "model.safetensors",
    "tokenizer.json",
    "tokenizer_config.json",
    "vocab.txt",
    "special_tokens_map.json",
    "research_metadata.json",
}

LABELS = {
    "ADJ", "ADP", "ADV", "AUX",
    "CCONJ", "DET", "INTJ", "NOUN",
    "NUM", "PART", "PRON", "PROPN",
    "PUNCT", "SCONJ", "VERB", "X",
}


def sha256_file(path):
    digest = hashlib.sha256()

    with open(path, "rb") as stream:
        for block in iter(
            lambda: stream.read(4 * 1024 * 1024),
            b""
        ):
            digest.update(block)

    return digest.hexdigest()


def verify_model(directory):
    for name in FILES:
        path = directory / name

        if not path.is_file() or path.stat().st_size == 0:
            raise RuntimeError(
                f"Missing or empty model file: {name}"
            )

    weights = directory / "model.safetensors"

    if sha256_file(weights) != WEIGHTS_SHA256:
        raise RuntimeError(
            "Trained model weights checksum mismatch."
        )

    with open(
        directory / "config.json",
        encoding="utf-8"
    ) as stream:
        config = json.load(stream)

    actual = set(config["id2label"].values())

    if len(config["id2label"]) != 16 or actual != LABELS:
        raise RuntimeError(
            "Expected 16 Persian POS labels."
        )

    print("[OK] Trained checkpoint 4000 verified")
    print("[OK] All 16 POS categories verified")


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(
        self, req, fp, code, msg, headers, newurl
    ):
        return None


def github_headers(token, accept):
    return {
        "Authorization": f"Bearer {token}",
        "Accept": accept,
        "User-Agent": "FarsiSyntaxLab-ModelLoader",
        "X-GitHub-Api-Version": "2022-11-28",
    }


def download_private_release(destination):
    token = os.environ.get(
        "GITHUB_RELEASE_TOKEN", ""
    ).strip()

    if not token:
        raise RuntimeError(
            "GITHUB_RELEASE_TOKEN is required "
            "for private release downloads."
        )

    api = f"https://api.github.com/repos/{REPO}"

    release_request = urllib.request.Request(
        f"{api}/releases/tags/{TAG}",
        headers=github_headers(
            token, "application/vnd.github+json"
        ),
    )

    with urllib.request.urlopen(
        release_request, timeout=60
    ) as response:
        release = json.load(response)

    assets = [
        item for item in release.get("assets", [])
        if item.get("name") == ASSET
    ]

    if len(assets) != 1:
        raise RuntimeError(
            "Expected GitHub model asset was not found."
        )

    asset = assets[0]

    if not (
        400 * 1024**2
        < int(asset["size"])
        < 600 * 1024**2
    ):
        raise RuntimeError(
            "Unexpected GitHub model asset size."
        )

    url = f'{api}/releases/assets/{asset["id"]}'

    request = urllib.request.Request(
        url,
        headers=github_headers(
            token, "application/octet-stream"
        ),
    )

    opener = urllib.request.build_opener(
        NoRedirect()
    )

    try:
        response = opener.open(request, timeout=120)

    except urllib.error.HTTPError as error:
        if error.code not in (301, 302, 303, 307, 308):
            raise

        location = error.headers.get("Location", "")
        parsed = urlsplit(location)

        hostname = (parsed.hostname or "").lower()

        if not (
            parsed.scheme == "https"
            and (
                hostname == "githubusercontent.com"
                or hostname.endswith(".githubusercontent.com")
            )
        ):
            raise RuntimeError(
                "Unexpected GitHub asset redirect."
            )

        # Never send the GitHub token to the
        # redirected asset-download host.
        response = urllib.request.urlopen(
            urllib.request.Request(
                location,
                headers={
                    "User-Agent":
                    "FarsiSyntaxLab-ModelLoader"
                },
            ),
            timeout=120,
        )

    print("[INFO] Downloading private model asset...")

    with response, open(destination, "wb") as output:
        content_type = response.headers.get(
            "Content-Type", ""
        ).lower()

        if "json" in content_type:
            raise RuntimeError(
                "GitHub returned metadata, not model bytes."
            )

        transferred = 0

        while True:
            block = response.read(4 * 1024 * 1024)

            if not block:
                break

            transferred += len(block)

            if transferred > 600 * 1024**2:
                raise RuntimeError(
                    "Model download exceeded size limit."
                )

            output.write(block)

    if transferred != int(asset["size"]):
        raise RuntimeError(
            "Downloaded asset size differs from GitHub."
        )


def install_archive(archive, destination):
    print("[INFO] Verifying release archive...")

    if sha256_file(archive) != ARCHIVE_SHA256:
        raise RuntimeError(
            "Release archive SHA-256 mismatch."
        )

    destination.parent.mkdir(
        parents=True, exist_ok=True
    )

    temporary = Path(
        tempfile.mkdtemp(
            prefix=".farsisyntax-stage-",
            dir=destination.parent,
        )
    )

    try:
        with zipfile.ZipFile(archive) as bundle:
            names = bundle.namelist()

            if len(names) != len(FILES):
                raise RuntimeError(
                    "Unexpected archive entries."
                )

            if set(names) != FILES:
                raise RuntimeError(
                    "Unexpected filenames in archive."
                )

            for name in sorted(FILES):
                entry = bundle.getinfo(name)

                if (
                    entry.is_dir()
                    or entry.file_size > 600 * 1024**2
                ):
                    raise RuntimeError(
                        "Invalid archive entry."
                    )

                target = temporary / name

                with bundle.open(entry) as source:
                    with open(target, "wb") as output:
                        shutil.copyfileobj(
                            source, output,
                            length=4 * 1024 * 1024
                        )

                print("[EXTRACTED]", name)

        verify_model(temporary)

        if destination.exists():
            raise RuntimeError(
                "Destination appeared during installation."
            )

        temporary.rename(destination)

    finally:
        if temporary.exists():
            shutil.rmtree(
                temporary, ignore_errors=True
            )

    print("[OK] Model installation complete")


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--archive",
        type=Path,
        default=None,
    )

    parser.add_argument(
        "--destination",
        type=Path,
        default=Path(
            os.environ.get(
                "PARSBERT_MODEL_SOURCE",
                "/app/model-cache/parsbert-pos"
            )
        ),
    )

    args = parser.parse_args()

    destination = args.destination.resolve()

    if destination.exists():
        print("[INFO] Existing model found")
        verify_model(destination)
        print("FARSI SYNTAX MODEL BOOTSTRAP VERIFIED")
        return

    if args.archive is not None:
        archive = args.archive.resolve()

        if not archive.is_file():
            raise RuntimeError(
                "Local model archive is missing."
            )

        install_archive(archive, destination)

    else:
        destination.parent.mkdir(
            parents=True, exist_ok=True
        )

        fd, filename = tempfile.mkstemp(
            prefix="farsisyntax-release-",
            suffix=".zip",
            dir=destination.parent,
        )

        os.close(fd)
        archive = Path(filename)

        try:
            download_private_release(archive)
            install_archive(archive, destination)

        finally:
            archive.unlink(missing_ok=True)

    verify_model(destination)

    print("FARSI SYNTAX MODEL BOOTSTRAP VERIFIED")


if __name__ == "__main__":
    main()