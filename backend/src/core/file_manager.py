import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from src.parser.ast_parser import PythonASTParser, ParsedASTResult

class FileScanSummary(BaseModel):
    """Structured summary of a scanned Python source file and its parsed AST."""
    file_path: str = Field(description="Absolute path to the source file")
    relative_path: str = Field(description="Relative path from repository root")
    total_lines: int = Field(description="Total line count")
    total_bytes: int = Field(description="Total byte size")
    syntax_valid: bool = Field(default=True, description="Whether AST syntax is valid")
    syntax_error: Optional[str] = Field(default=None, description="Syntax error message if invalid")
    functions_count: int = Field(default=0, description="Total functions extracted")
    classes_count: int = Field(default=0, description="Total classes extracted")
    ast_result: Optional[ParsedASTResult] = Field(default=None, description="Detailed tree-sitter / standard AST result")

class RepositoryScanResult(BaseModel):
    """Aggregate result of local directory scanning and AST ingestion."""
    root_dir: str = Field(description="Target directory path ingested")
    scanned_files_count: int = Field(default=0, description="Total .py files scanned")
    valid_files_count: int = Field(default=0, description="Files with valid Python AST syntax")
    invalid_files_count: int = Field(default=0, description="Files with syntax errors")
    files: List[FileScanSummary] = Field(default_factory=list, description="Per-file AST analysis list")

class LocalFileManager:
    """
    Local Repository Ingestion Module (Phase 3.A Core Component).
    Accepts a local directory path, recursively scans for Python (.py) files,
    and feeds target files to the tree-sitter AST parser.
    """

    EXCLUDED_DIRS = {
        ".git", ".venv", "venv", "__pycache__", ".pytest_cache",
        "node_modules", ".idea", ".vscode", "build", "dist", ".mypy_cache"
    }

    def __init__(self, parser: Optional[PythonASTParser] = None):
        self.parser = parser or PythonASTParser()

    def scan_directory(self, dir_path: str) -> RepositoryScanResult:
        """
        Recursively scan a local repository directory for .py files
        and parse each target file into tree-sitter / Python AST metadata.
        """
        abs_dir = os.path.abspath(os.path.expanduser(dir_path))
        if not os.path.exists(abs_dir):
            raise ValueError(f"Directory path does not exist: {dir_path}")
        if not os.path.isdir(abs_dir):
            raise ValueError(f"Provided path is a file, not a directory: {dir_path}")

        scanned_files: List[FileScanSummary] = []
        valid_count = 0
        invalid_count = 0

        for root, dirs, files in os.walk(abs_dir):
            # Exclude unwanted / hidden directories in-place
            dirs[:] = [d for d in dirs if d not in self.EXCLUDED_DIRS and not d.startswith(".")]

            for file_name in files:
                if file_name.endswith(".py"):
                    full_file_path = os.path.join(root, file_name)
                    rel_path = os.path.relpath(full_file_path, abs_dir)

                    summary = self.parse_single_file(full_file_path, rel_path=rel_path)
                    scanned_files.append(summary)

                    if summary.syntax_valid:
                        valid_count += 1
                    else:
                        invalid_count += 1

        return RepositoryScanResult(
            root_dir=abs_dir,
            scanned_files_count=len(scanned_files),
            valid_files_count=valid_count,
            invalid_files_count=invalid_count,
            files=scanned_files
        )

    def parse_single_file(self, full_file_path: str, rel_path: Optional[str] = None) -> FileScanSummary:
        """Read a single local Python file and pass it to the AST parser."""
        if not os.path.exists(full_file_path):
            raise ValueError(f"File does not exist: {full_file_path}")

        rel_path = rel_path or os.path.basename(full_file_path)

        source_code = self.read_file(full_file_path)
        ast_res = self.parser.parse_code(source_code, file_path=rel_path)

        return FileScanSummary(
            file_path=full_file_path,
            relative_path=rel_path,
            total_lines=ast_res.total_lines,
            total_bytes=ast_res.total_bytes,
            syntax_valid=ast_res.syntax_valid,
            syntax_error=ast_res.syntax_error,
            functions_count=len(ast_res.functions),
            classes_count=len(ast_res.classes),
            ast_result=ast_res
        )

    def read_file(self, file_path: str) -> str:
        """Safely read text content with UTF-8 and fallback encoding."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except UnicodeDecodeError:
            with open(file_path, "r", encoding="latin-1") as f:
                return f.read()

    def save_patched_file(
        self,
        patched_code: str,
        output_filename: str = "temp_patched_file.py",
        target_dir: Optional[str] = None
    ) -> str:
        """
        Save the final remediated code to a temporary local file.
        Returns the absolute path of the written file.
        """
        save_dir = target_dir or os.getcwd()
        os.makedirs(save_dir, exist_ok=True)
        out_path = os.path.join(save_dir, output_filename)

        with open(out_path, "w", encoding="utf-8") as f:
            f.write(patched_code)

        return os.path.abspath(out_path)
