#!/usr/bin/env python3
"""Update <lastmod> in sitemap.xml from local file modification dates."""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parent.parent
SITEMAP_PATH = ROOT / "sitemap.xml"
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
NS = {"sm": SITEMAP_NS}


def url_to_path(loc: str) -> Path | None:
    parsed = urlparse(loc.strip())
    path = parsed.path or "/"
    if path == "/":
        return ROOT / "index.html"
    relative = path.lstrip("/")
    return ROOT / relative


def to_iso_date(file_path: Path) -> str:
    mtime = file_path.stat().st_mtime
    dt = datetime.fromtimestamp(mtime, tz=timezone.utc)
    return dt.date().isoformat()


def main() -> int:
    if not SITEMAP_PATH.exists():
        raise FileNotFoundError(f"Missing sitemap file: {SITEMAP_PATH}")

    ET.register_namespace("", SITEMAP_NS)
    tree = ET.parse(SITEMAP_PATH)
    root = tree.getroot()

    updated_count = 0
    missing_files: list[str] = []

    for url_el in root.findall("sm:url", NS):
        loc_el = url_el.find("sm:loc", NS)
        lastmod_el = url_el.find("sm:lastmod", NS)

        if loc_el is None or not loc_el.text:
            continue

        file_path = url_to_path(loc_el.text)
        if file_path is None or not file_path.exists():
            missing_files.append(loc_el.text)
            continue

        date_value = to_iso_date(file_path)
        if lastmod_el is None:
            lastmod_el = ET.SubElement(url_el, f"{{{SITEMAP_NS}}}lastmod")
        if lastmod_el.text != date_value:
            lastmod_el.text = date_value
            updated_count += 1

    tree.write(SITEMAP_PATH, encoding="UTF-8", xml_declaration=True)

    print(f"Updated {updated_count} sitemap entries in {SITEMAP_PATH.name}")
    if missing_files:
        print("Skipped missing files for URLs:")
        for missing in missing_files:
            print(f"- {missing}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
