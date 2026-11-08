"""Fetch videos and view counts for the Functional Value channel.

Writes docs/assets/data/youtube.json, which the website ranks and displays.

- If the YOUTUBE_API_KEY environment variable is set, every upload on the
  channel is fetched through the YouTube Data API v3.
- Otherwise the public RSS feed is used (latest 15 uploads, no key needed).

Standard library only, so it runs on a stock GitHub Actions runner.
"""

import datetime as dt
import json
import os
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

CHANNEL_ID = "UCDaRx5OtzKj54M8vMKTFrQw"
CHANNEL_URL = "https://www.youtube.com/@FunctionalValue"
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "docs", "assets", "data", "youtube.json")


INVISIBLE = re.compile("[​-‏⁠-⁤﻿]")


def clean(text):
    return INVISIBLE.sub("", text or "").strip()


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "portfolio-youtube-sync"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def from_rss():
    ns = {
        "a": "http://www.w3.org/2005/Atom",
        "yt": "http://www.youtube.com/xml/schemas/2015",
        "m": "http://search.yahoo.com/mrss/",
    }
    root = ET.fromstring(get(f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"))
    videos = []
    for e in root.findall("a:entry", ns):
        stats = e.find("m:group/m:community/m:statistics", ns)
        link = e.find("a:link", ns).get("href", "")
        videos.append({
            "id": e.find("yt:videoId", ns).text,
            "title": clean(e.find("a:title", ns).text),
            "published": e.find("a:published", ns).text,
            "views": int(stats.get("views", 0)) if stats is not None else 0,
            "short": "/shorts/" in link,
        })
    return videos


def iso_duration_seconds(value):
    m = re.fullmatch(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", value or "")
    if not m:
        return 0
    d, h, mi, s = (int(x or 0) for x in m.groups())
    return ((d * 24 + h) * 60 + mi) * 60 + s


def from_api(key):
    uploads = "UU" + CHANNEL_ID[2:]
    ids, token = [], ""
    while True:
        q = urllib.parse.urlencode({"part": "contentDetails", "playlistId": uploads,
                                    "maxResults": 50, "pageToken": token, "key": key})
        page = json.loads(get(f"https://www.googleapis.com/youtube/v3/playlistItems?{q}"))
        ids += [i["contentDetails"]["videoId"] for i in page.get("items", [])]
        token = page.get("nextPageToken")
        if not token:
            break

    videos = []
    for start in range(0, len(ids), 50):
        q = urllib.parse.urlencode({"part": "snippet,statistics,contentDetails",
                                    "id": ",".join(ids[start:start + 50]), "key": key})
        for v in json.loads(get(f"https://www.googleapis.com/youtube/v3/videos?{q}")).get("items", []):
            if v["snippet"].get("liveBroadcastContent") not in (None, "none"):
                continue
            title = clean(v["snippet"]["title"])
            seconds = iso_duration_seconds(v["contentDetails"].get("duration"))
            videos.append({
                "id": v["id"],
                "title": title,
                "published": v["snippet"]["publishedAt"],
                "views": int(v["statistics"].get("viewCount", 0)),
                "short": seconds <= 180 and ("#short" in title.lower() or seconds <= 60),
            })
    return videos


def main():
    key = os.environ.get("YOUTUBE_API_KEY", "").strip()
    source = "api" if key else "rss"
    videos = from_api(key) if key else from_rss()
    if not videos:
        sys.exit("No videos returned; keeping the existing file.")

    videos.sort(key=lambda v: v["published"], reverse=True)
    data = {
        "channel": {"id": CHANNEL_ID, "title": "Functional Value", "url": CHANNEL_URL},
        "source": source,
        "updated": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "videos": videos,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"Wrote {len(videos)} videos from {source} to {os.path.normpath(OUT)}")


if __name__ == "__main__":
    main()
