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

EXCLUDED = set()

def get_public_repos():
    repos = []
    url = f"https://api.github.com/users/{OWNER}/repos"
    params = {"per_page": 100, "sort": "pushed", "type": "public"}
    while url:
        try:
            resp = session.get(url, params=params)
            if resp.status_code != 200:
                break
            for r in resp.json():
                if not r["fork"] and r["name"] not in EXCLUDED:
                    repos.append(r["name"])
            url = None
            params = None
            if "next" in resp.links:
                url = resp.links["next"]["url"]
        except requests.RequestException:
            break
    return repos


def load_existing():
    if not os.path.exists(DATA_PATH):
        return defaultdict(lambda: {"additions": 0, "deletions": 0}), None
    with open(DATA_PATH) as f:
        entries = json.load(f)
    daily = defaultdict(lambda: {"additions": 0, "deletions": 0})
    for e in entries:
        daily[e["date"]] = {"additions": e["additions"], "deletions": e.get("deletions", 0)}
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
            if data.get("author") and data["author"].get("login") == OWNER:
                date = data["commit"]["author"]["date"][:10]
                stats = data["stats"]
                return date, stats["additions"], stats["deletions"]
    except requests.RequestException:
        pass
    return None, 0, 0


def main():
    daily, last_date = load_existing()
    since = compute_since(daily, last_date)

    repos = get_public_repos()
    print(f"Found {len(repos)} public repos")

    all_commits = []
    for repo in repos:
        commits = get_repo_commits(repo, since)
        all_commits.extend(commits)
        print(f"  {repo}: {len(commits)} commits")

    print(f"Total: {len(all_commits)} commits to process")

    if not all_commits:
        print("No new commits found")
        output = sorted(
            [{"date": d, "additions": v["additions"], "deletions": v["deletions"]}
             for d, v in daily.items()],
            key=lambda x: x["date"],
        )
        os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
        with open(DATA_PATH, "w") as f:
            json.dump(output, f)
        print(f"Wrote {len(output)} daily entries")
        return

    with ThreadPoolExecutor(max_workers=10) as ex:
        future_to_repo = {
            ex.submit(get_commit_stats, repo, sha): (repo, sha)
            for repo, sha in all_commits
        }
        repo_stats = defaultdict(lambda: {"additions": 0, "deletions": 0})
        for future in as_completed(future_to_repo):
            repo, sha = future_to_repo[future]
            date, additions, deletions = future.result()
            if date:
                daily[date]["additions"] += additions
                daily[date]["deletions"] += deletions
                repo_stats[repo]["additions"] += additions
                repo_stats[repo]["deletions"] += deletions

    print("\nPer-repo stats (this run):")
    for repo in sorted(repo_stats):
        s = repo_stats[repo]
        print(f"  {repo}: +{s['additions']} -{s['deletions']}")

    output = sorted(
        [{"date": d, "additions": v["additions"], "deletions": v["deletions"]}
         for d, v in daily.items()],
        key=lambda x: x["date"],
    )

    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    with open(DATA_PATH, "w") as f:
        json.dump(output, f)

    print(f"Wrote {len(output)} daily entries (since {since})")


if __name__ == "__main__":
    main()
