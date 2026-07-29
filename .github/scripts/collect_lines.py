import json, os, sys
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

OWNER = "iamprasadraju"
TOKEN = os.environ["GH_PAT"]
DATA_PATH = "assets/data/daily-lines.json"
FULL = os.environ.get("FULL", "false").lower() == "true"
START_DATE = f"{datetime.now(timezone.utc).year}-01-01"

HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/vnd.github.v3+json",
}

REPOS = [
    "TrueML", "algoX", "notes", "kaggle-competitions", "vari-mitra",
    "tic-tac-toe", "math-notebooks", "gen-cli", "cs-fun", "ipython-books",
    "jekyll-obsidian-theme", "ml-notebooks", "MLmath-notebooks", "ESP-Alert",
    "ipythonfun", "ai-notebooks", "Trigger",     "configuration",
    "iamprasadraju",
]


def load_existing():
    if not os.path.exists(DATA_PATH):
        return defaultdict(int), None
    with open(DATA_PATH) as f:
        entries = json.load(f)
    daily = defaultdict(int)
    for e in entries:
        daily[e["date"]] = e["additions"]
    last = max(daily) if daily else None
    return daily, last


def compute_since(daily, last_date):
    if FULL or last_date is None:
        return START_DATE
    dt = datetime.strptime(last_date, "%Y-%m-%d") + timedelta(days=1)
    since = dt.strftime("%Y-%m-%d")
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    if since >= today:
        print(f"Already up to date (since={since})")
        sys.exit(0)
    return since


session = requests.Session()
session.headers.update(HEADERS)


def get_repo_commits(repo, since):
    shas = []
    url = f"https://api.github.com/repos/{OWNER}/{repo}/commits"
    params = {"since": f"{since}T00:00:00Z", "per_page": 100}
    while url:
        try:
            resp = session.get(url, params=params)
            if resp.status_code != 200:
                print(f"  Warning: {repo} returned {resp.status_code}")
                break
            for c in resp.json():
                shas.append((repo, c["sha"]))
            url = None
            params = None
            if "next" in resp.links:
                url = resp.links["next"]["url"]
        except requests.RequestException as e:
            print(f"  Error fetching commits for {repo}: {e}")
            break
    return shas


def get_commit_stats(repo, sha):
    try:
        resp = session.get(
            f"https://api.github.com/repos/{OWNER}/{repo}/commits/{sha}"
        )
        if resp.status_code == 200:
            data = resp.json()
            date = data["commit"]["author"]["date"][:10]
            additions = data["stats"]["additions"]
            return date, additions
    except requests.RequestException:
        pass
    return None, 0


def main():
    daily, last_date = load_existing()
    since = compute_since(daily, last_date)

    print(f"Fetching commits since {since} across {len(REPOS)} repos")

    all_commits = []
    for repo in REPOS:
        commits = get_repo_commits(repo, since)
        all_commits.extend(commits)
        print(f"  {repo}: {len(commits)} commits")

    print(f"Total: {len(all_commits)} commits to process")

    if not all_commits:
        print("No new commits found")
        output = sorted(
            [{"date": d, "additions": v} for d, v in daily.items()],
            key=lambda x: x["date"],
        )
        os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
        with open(DATA_PATH, "w") as f:
            json.dump(output, f)
        print(f"Wrote {len(output)} daily entries")
        return

    with ThreadPoolExecutor(max_workers=10) as ex:
        futures = [
            ex.submit(get_commit_stats, repo, sha) for repo, sha in all_commits
        ]
        for f in as_completed(futures):
            date, additions = f.result()
            if date:
                daily[date] += additions

    output = sorted(
        [{"date": d, "additions": v} for d, v in daily.items()],
        key=lambda x: x["date"],
    )

    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    with open(DATA_PATH, "w") as f:
        json.dump(output, f)

    print(f"Wrote {len(output)} daily entries (since {since})")


if __name__ == "__main__":
    main()
