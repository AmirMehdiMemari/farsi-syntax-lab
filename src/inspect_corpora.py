from pathlib import Path
from collections import Counter
import json
import hashlib
import sys

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path.cwd()

datasets = {
    "formal": ROOT / "data/raw/formal/train.conllu",
    "informal": ROOT / "data/raw/informal/train.conllu"
}

inventory = {}

for name, path in datasets.items():

    assert path.is_file(), f"Missing: {path}"

    sentences = 0
    tokens = 0
    malformed = 0
    zwnj_tokens = 0
    pos_counts = Counter()
    relation_counts = Counter()
    examples = []

    has_tokens = False

    with path.open("r", encoding="utf-8-sig") as file:
        for raw_line in file:
            line = raw_line.strip()

            if not line:
                if has_tokens:
                    sentences += 1
                    has_tokens = False
                continue

            if line.startswith("# text = "):
                if len(examples) < 3:
                    examples.append(line[9:])
                continue

            if line.startswith("#"):
                continue

            columns = line.split("\t")

            if len(columns) != 10:
                malformed += 1
                continue

            token_id = columns[0]

            # Skip multiword ranges and empty nodes
            if not token_id.isdigit():
                continue

            has_tokens = True
            tokens += 1

            word = columns[1]
            pos = columns[3]
            relation = columns[7]

            pos_counts[pos] += 1
            relation_counts[relation] += 1

            if "\u200c" in word:
                zwnj_tokens += 1

    if has_tokens:
        sentences += 1

    checksum = hashlib.sha256(
        path.read_bytes()
    ).hexdigest()

    inventory[name] = {
        "filename": path.name,
        "bytes": path.stat().st_size,
        "sha256": checksum,
        "sentences": sentences,
        "tokens": tokens,
        "malformed_rows": malformed,
        "zwnj_tokens": zwnj_tokens,
        "pos_tags": dict(pos_counts),
        "dependency_relations": dict(relation_counts)
    }

    print(f"\n=== {name.upper()} PERSIAN ===")
    print("Sentences:", sentences)
    print("Tokens:", tokens)
    print("Malformed rows:", malformed)
    print("Tokens containing ZWNJ:", zwnj_tokens)
    print("Unique POS tags:", len(pos_counts))
    print("Dependency relations:", len(relation_counts))

    print("\nMost common POS tags:")
    for tag, count in pos_counts.most_common(8):
        print(f"  {tag}: {count}")

    print("\nSample Persian sentences:")
    for sentence in examples:
        print(" ", sentence)

output = ROOT / "reports/dataset_inventory.json"

output.write_text(
    json.dumps(inventory, ensure_ascii=False, indent=2),
    encoding="utf-8"
)

print("\n=== DATASET INSPECTION COMPLETE ===")
print("Saved:", output)
print("Original datasets unchanged.")
