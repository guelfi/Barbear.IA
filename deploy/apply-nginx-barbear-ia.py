#!/usr/bin/env python3
"""Idempotent: ensure Barbear.IA API/front locations exist in nginx.conf."""

from __future__ import annotations

import re
import sys
from pathlib import Path

MARKER_BEGIN = "# BEGIN Barbear.IA (managed by Barbear.IA CD)"
MARKER_END = "# END Barbear.IA (managed by Barbear.IA CD)"

MANAGED_BLOCK_RE = re.compile(
    re.escape(MARKER_BEGIN) + r".*?" + re.escape(MARKER_END) + r"\n?",
    re.DOTALL,
)

# Qualquer location antiga/manual do Barbear (com ou sem comentário acima).
LEGACY_LOCATION_RE = re.compile(
    r"(?ms)^[ \t]*#\s*Barbear\.IA[^\n]*\n|"
    r"^[ \t]*location\s*(?:=\s*)?(?:\^~\s*)?/barbear-ia(?:/swagger|/api)?/?\s*\{.*?\n[ \t]*\}\n"
)


def load_fragment(path: Path) -> str:
    lines = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("# Fragmento") or line.startswith("# Paths"):
            continue
        lines.append(line)
    fragment = "\n".join(lines).rstrip() + "\n"
    return f"    {MARKER_BEGIN}\n{fragment}    {MARKER_END}\n"


def strip_barbear_blocks(text: str) -> str:
    text = MANAGED_BLOCK_RE.sub("", text)
    # Remover locations órfãs (legado) — repetir até estabilizar
    prev = None
    while prev != text:
        prev = text
        text = LEGACY_LOCATION_RE.sub("", text)
    return text


def insert_before(text: str, block: str, pattern: str) -> tuple[str, bool]:
    m = re.search(pattern, text, flags=re.MULTILINE)
    if not m:
        return text, False
    idx = m.start()
    return text[:idx] + block + "\n" + text[idx:], True


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: apply-nginx-barbear-ia.py <nginx.conf> <fragment.conf>", file=sys.stderr)
        return 2

    nginx_path = Path(sys.argv[1])
    fragment_path = Path(sys.argv[2])
    original = nginx_path.read_text(encoding="utf-8")
    block = load_fragment(fragment_path)

    updated = strip_barbear_blocks(original)

    # Default/IP vhost: before driverhub (or unisystem fallback)
    updated, ok_ip = insert_before(updated, block, r"^[ \t]*location\s+/driverhub/\s*\{")
    if not ok_ip:
        updated, ok_ip = insert_before(updated, block, r"^[ \t]*location\s+/unisystem/\s*\{")

    # batuara.org.br :443 — before catch-all location / inside that server
    ssl_server = re.search(
        r"(?ms)server\s*\{\s*listen\s+443\s+ssl;.*?server_name\s+batuara\.org\.br.*?(?=^\s*server\s*\{|\Z)",
        updated,
    )
    if ssl_server:
        server_text = ssl_server.group(0)
        if MARKER_BEGIN not in server_text:
            patched_server, ok_ssl = insert_before(
                server_text,
                block,
                r"^[ \t]*location\s+/\s*\{",
            )
            if ok_ssl:
                updated = updated[: ssl_server.start()] + patched_server + updated[ssl_server.end() :]

    if updated == original:
        print("nginx.conf already up to date for Barbear.IA")
        return 0

    backup = nginx_path.with_suffix(nginx_path.suffix + ".bak-barbearia")
    backup.write_text(original, encoding="utf-8")
    nginx_path.write_text(updated, encoding="utf-8")
    print(f"Updated {nginx_path} (backup: {backup})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
