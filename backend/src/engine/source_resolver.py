import os
import re
import glob
from typing import Tuple, List, Dict, Optional
import httpx

class SourceResolver:
    """
    Resolves source code and metadata from GitHub URLs or local filesystem paths.
    """

    @staticmethod
    async def resolve(target_input: str, branch: str = "main") -> Tuple[str, str, str]:
        """
        Returns: (source_code, resolved_file_path, display_origin_label)
        Raises: ValueError with user-friendly error message if resolution fails.
        """
        target = target_input.strip()

        # 1. Direct raw code detection (if someone pasted raw python code)
        if "\n" in target and ("def " in target or "import " in target or "class " in target):
            return target, "snippet.py", "Direct Code Snippet"

        # 2. GitHub URL Resolution
        if target.startswith("http://") or target.startswith("https://") or "github.com" in target:
            return await SourceResolver._resolve_github(target, branch)

        # 3. Local Path Resolution
        return await SourceResolver._resolve_local_path(target)

    @staticmethod
    async def _resolve_github(url: str, default_branch: str = "main") -> Tuple[str, str, str]:
        """
        Fetch file or repo from GitHub.
        """
        # Case A: Raw GitHub user content URL
        if "raw.githubusercontent.com" in url:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    filename = url.split("/")[-1] or "remote_module.py"
                    return res.text, filename, f"GitHub ({url})"
                raise ValueError(f"Failed to fetch raw GitHub URL (HTTP {res.status_code})")

        # Case B: Direct file URL on github.com (e.g., https://github.com/owner/repo/blob/main/src/app.py)
        blob_match = re.match(r"https?://github\.com/([^/]+)/([^/]+)/blob/([^/]+)/(.+)", url)
        if blob_match:
            owner, repo, branch, filepath = blob_match.groups()
            raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{filepath}"
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.get(raw_url)
                if res.status_code == 200:
                    return res.text, filepath, f"GitHub: {owner}/{repo}/{filepath}@{branch}"
                raise ValueError(f"Failed to fetch GitHub file from {raw_url} (HTTP {res.status_code})")

        # Case C: GitHub Repository Root URL (e.g., https://github.com/owner/repo)
        repo_match = re.match(r"https?://github\.com/([^/]+)/([^/]+?)(?:\.git|/)?$", url)
        if repo_match:
            owner, repo = repo_match.groups()
            async with httpx.AsyncClient(timeout=15.0, headers={"User-Agent": "MAS-Remediation-Engine"}) as client:
                # 1. Try fetching repo tree via GitHub API
                api_tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1"
                tree_res = await client.get(api_tree_url)
                
                if tree_res.status_code == 200:
                    tree_data = tree_res.json().get("tree", [])
                    py_files = [item["path"] for item in tree_data if item.get("path", "").endswith(".py")]
                    
                    if py_files:
                        # Prioritize core/main/auth files if found, else first py file
                        target_file = py_files[0]
                        for candidate in py_files:
                            if any(k in candidate.lower() for k in ["main.py", "app.py", "auth", "handler", "service", "core"]):
                                target_file = candidate
                                break
                        
                        raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{default_branch}/{target_file}"
                        file_res = await client.get(raw_url)
                        if file_res.status_code == 200:
                            return file_res.text, target_file, f"GitHub: {owner}/{repo}/{target_file}@{default_branch}"

                # Fallback: try common python candidate paths across main and master branches
                candidates = [
                    "main.py", "app.py", "src/main.py", "src/app.py",
                    "backend/main.py", "backend/app.py", "server.py", "manage.py"
                ]
                for branch_choice in [default_branch, "main", "master"]:
                    for candidate in candidates:
                        fallback_raw = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch_choice}/{candidate}"
                        fres = await client.get(fallback_raw)
                        if fres.status_code == 200:
                            return fres.text, candidate, f"GitHub: {owner}/{repo}/{candidate}@{branch_choice}"

                raise ValueError(
                    f"No Python (.py) source files were found in repository '{owner}/{repo}'. "
                    f"The Autonomous Remediation Engine currently targets Python code. "
                    f"If your Python file resides in a subfolder, please provide the full GitHub file URL."
                )

        raise ValueError(f"Unrecognized GitHub URL format: {url}")

    @staticmethod
    async def _resolve_local_path(path_str: str) -> Tuple[str, str, str]:
        """
        Resolves a local file or directory on the host filesystem via LocalFileManager.
        """
        from src.core.file_manager import LocalFileManager

        clean_path = os.path.normpath(os.path.expanduser(path_str))

        if not os.path.exists(clean_path):
            # Check relative to backend or workspace root
            workspace_candidate = os.path.abspath(os.path.join(os.getcwd(), "..", path_str))
            if os.path.exists(workspace_candidate):
                clean_path = workspace_candidate
            else:
                raise ValueError(f"Local path does not exist: {path_str}")

        file_manager = LocalFileManager()

        if os.path.isfile(clean_path):
            summary = file_manager.parse_single_file(clean_path)
            content = file_manager.read_file(clean_path)
            return content, summary.relative_path, f"Local File: {clean_path}"

        elif os.path.isdir(clean_path):
            repo_summary = file_manager.scan_directory(clean_path)
            if repo_summary.scanned_files_count == 0:
                raise ValueError(f"No Python (.py) files found in local directory: {clean_path}")

            # Pick primary target from ingested files
            target_summary = repo_summary.files[0]
            for candidate in repo_summary.files:
                fname = os.path.basename(candidate.file_path).lower()
                if any(k in fname for k in ["main.py", "app.py", "routes.py", "models.py", "auth.py", "service.py"]):
                    target_summary = candidate
                    break

            content = file_manager.read_file(target_summary.file_path)
            return content, target_summary.relative_path, f"Local Repo ({repo_summary.scanned_files_count} .py files): {target_summary.relative_path}"

        raise ValueError(f"Invalid filesystem entity: {clean_path}")
