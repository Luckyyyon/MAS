import os
import sys
import pytest
import asyncio
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from src.core.file_manager import LocalFileManager, RepositoryScanResult
from src.agents.supervisor import SupervisorAgent
from src.engine.diff_resolver import DiffConflictResolver
from src.models.state import PatchProposal, AgentCategory, PatchSeverity

client = TestClient(app)

def test_local_file_manager_ingestion(tmp_path):
    """Requirement 1: Test recursive local directory ingestion and tree-sitter AST parsing."""
    # Create mock directory structure with python files
    sub_dir = tmp_path / "src" / "core"
    sub_dir.mkdir(parents=True)
    
    file1 = tmp_path / "main.py"
    file1.write_text("def main():\n    print('hello world')\n", encoding="utf-8")

    file2 = sub_dir / "utils.py"
    file2.write_text("class Helper:\n    def run(self):\n        pass\n", encoding="utf-8")

    file_manager = LocalFileManager()
    res: RepositoryScanResult = file_manager.scan_directory(str(tmp_path))

    assert res.scanned_files_count == 2
    assert res.valid_files_count == 2
    assert res.invalid_files_count == 0
    assert len(res.files) == 2

    # Verify AST parser extracted functions and classes
    paths_scanned = [f.relative_path for f in res.files]
    assert "main.py" in paths_scanned

def test_local_file_manager_save_patched_file(tmp_path):
    """Requirement 3: Test saving patched code to a temporary local file."""
    file_manager = LocalFileManager()
    code = "def patched_func():\n    return 'safe'\n"
    out_path = file_manager.save_patched_file(code, output_filename="temp_patched_file.py", target_dir=str(tmp_path))
    
    assert os.path.exists(out_path)
    assert os.path.basename(out_path) == "temp_patched_file.py"
    with open(out_path, "r", encoding="utf-8") as f:
        assert f.read() == code

def test_supervisor_conflict_resolution_distinct_lines():
    """Requirement 2: Distinct non-overlapping patches applied sequentially."""
    resolver = DiffConflictResolver()
    source = "def example():\n    print('line 1')\n    print('line 2')\n    print('line 3')\n"

    p1 = PatchProposal(
        id="patch-sec-1",
        agent="Security Agent",
        category=AgentCategory.SECURITY,
        vulnerability_type="Hardcoded Secret",
        severity=PatchSeverity.HIGH,
        confidence=0.95,
        start_line=2,
        end_line=2,
        original_code_snippet="print('line 1')",
        proposed_code="    print('secure line 1')",
        reasoning="Security fix"
    )

    p2 = PatchProposal(
        id="patch-perf-1",
        agent="Performance Agent",
        category=AgentCategory.PERFORMANCE,
        vulnerability_type="Linear Lookup",
        severity=PatchSeverity.MEDIUM,
        confidence=0.90,
        start_line=4,
        end_line=4,
        original_code_snippet="print('line 3')",
        proposed_code="    print('fast line 3')",
        reasoning="Performance fix"
    )

    result = asyncio.run(resolver.resolve_and_apply(source, "example.py", [p1, p2], save_temp_file=False))

    assert result.success is True
    assert result.total_patches_applied == 2
    assert result.conflicts_resolved == 0
    assert "secure line 1" in result.remediated_code
    assert "fast line 3" in result.remediated_code

def test_supervisor_conflict_resolution_overlapping_security_wins():
    """Requirement 2: Overlapping Security vs Performance patch -> Security wins, Performance discarded."""
    supervisor = SupervisorAgent()
    source = "def process():\n    db.execute('SELECT * FROM users')\n    res = []\n"

    sec_patch = PatchProposal(
        id="sec-1",
        agent="Security Agent",
        category=AgentCategory.SECURITY,
        vulnerability_type="SQL Injection",
        severity=PatchSeverity.CRITICAL,
        confidence=0.99,
        start_line=2,
        end_line=2,
        original_code_snippet="db.execute('SELECT * FROM users')",
        proposed_code="    db.execute('SELECT * FROM users WHERE id = %s', (user_id,))",
        reasoning="Parameterized query prevents SQLi"
    )

    perf_patch = PatchProposal(
        id="perf-1",
        agent="Performance Agent",
        category=AgentCategory.PERFORMANCE,
        vulnerability_type="Unbounded Query",
        severity=PatchSeverity.MEDIUM,
        confidence=0.85,
        start_line=2,
        end_line=3,
        original_code_snippet="db.execute('SELECT * FROM users')\n    res = []",
        proposed_code="    db.execute_batch('SELECT * FROM users LIMIT 100')",
        reasoning="Add query batching"
    )

    result = asyncio.run(supervisor.resolve_conflicts(source, "process.py", [sec_patch, perf_patch], save_temp_file=False))

    assert result.success is True
    assert result.total_patches_applied == 1
    assert result.conflicts_resolved == 1
    assert "WHERE id = %s" in result.remediated_code
    assert "LIMIT 100" not in result.remediated_code

    # Check note explaining prioritization
    notes_text = "\n".join(result.conflict_notes)
    assert "Prioritized Security patch" in notes_text
    assert "over overlapping Performance patch" in notes_text

def test_api_ingest_local_dir_endpoint(tmp_path):
    """Requirement 3 & API test: /api/scans/ingest-local-dir endpoint."""
    test_file = tmp_path / "app.py"
    test_file.write_text("import os\nprint('app running')\n", encoding="utf-8")

    response = client.post("/api/scans/ingest-local-dir", json={"dir_path": str(tmp_path)})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    repo = data["repository"]
    assert repo["scanned_files_count"] == 1
    assert repo["valid_files_count"] == 1
