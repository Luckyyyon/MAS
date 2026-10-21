import ast
import difflib
import os
import difflib
from typing import List, Tuple, Dict, Any, Optional
from pydantic import ValidationError

from src.models.state import PatchProposal, UnifiedPatchResult, AgentCategory, PatchSeverity
from src.core.file_manager import LocalFileManager

# Strict priority order for resolving overlapping patch conflicts
CATEGORY_PRIORITY: Dict[AgentCategory, int] = {
    AgentCategory.SECURITY: 100,
    AgentCategory.PERFORMANCE: 50,
    AgentCategory.MAINTAINABILITY: 10,
    AgentCategory.SUPERVISOR: 5,
    AgentCategory.SYNTHESIS: 5,
}

SEVERITY_PRIORITY: Dict[PatchSeverity, int] = {
    PatchSeverity.CRITICAL: 5,
    PatchSeverity.HIGH: 4,
    PatchSeverity.MEDIUM: 3,
    PatchSeverity.LOW: 2,
    PatchSeverity.INFO: 1,
}

class DiffConflictResolver:
    """
    Production Conflict Resolution Engine (Inside LangGraph Supervisor).
    Provides strict Pydantic validation of LLM patch outputs, maps proposals against
    the AST, applies non-overlapping patches sequentially, and deterministically resolves
    overlapping patch conflicts using category priority (Security > Performance > Maintainability).
    """

    def __init__(self):
        self.file_manager = LocalFileManager()

    def validate_and_map_patch(
        self,
        patch: PatchProposal,
        source_lines: List[str],
        ast_tree: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, Optional[PatchProposal], Optional[str]]:
        """
        Validates LLM output against Pydantic model constraints and maps line bounds against original source code.
        Corrects minor 1-based index offsets if snippet match is found, or discards hallucinated line bounds.
        """
        total_lines = len(source_lines)
        if total_lines == 0:
            return False, None, "Source file is empty."

        # 1. Check basic Pydantic line bound constraints
        start_l = patch.start_line
        end_l = patch.end_line

        if start_l < 1:
            start_l = 1
        if end_l < start_l:
            end_l = start_l

        if start_l > total_lines:
            return False, None, f"Hallucinated start_line {start_l} exceeds total lines ({total_lines}). Patch discarded."

        if end_l > total_lines:
            end_l = total_lines

        # Update normalized bounds
        patch.start_line = start_l
        patch.end_line = end_l

        # 2. Extract actual source snippet at specified line bounds
        actual_snippet_lines = source_lines[start_l - 1:end_l]
        actual_snippet = "\n".join(actual_snippet_lines).strip()
        expected_snippet = (patch.original_code_snippet or "").strip()

        # If snippets match cleanly or expected snippet is trivial, validation passes
        if not expected_snippet or actual_snippet == expected_snippet or expected_snippet in actual_snippet:
            return True, patch, None

        # 3. Fuzzy window search for hallucinated line number offsets (+/- 4 lines)
        search_start = max(0, start_l - 5)
        search_end = min(total_lines, end_l + 5)
        window_lines = source_lines[search_start:search_end]
        window_text = "\n".join(window_lines)

        if expected_snippet and expected_snippet in window_text:
            # Re-align start_line and end_line to match exact position inside window
            for idx in range(search_start, search_end):
                sub_snippet = "\n".join(source_lines[idx:idx + (end_l - start_l + 1)]).strip()
                if expected_snippet in sub_snippet or sub_snippet in expected_snippet:
                    aligned_start = idx + 1
                    aligned_end = idx + len(expected_snippet.splitlines())
                    patch.start_line = aligned_start
                    patch.end_line = max(aligned_start, aligned_end)
                    return True, patch, f"Re-aligned hallucinated line numbers from ({start_l}-{end_l}) to ({patch.start_line}-{patch.end_line})."

        # If similarity ratio is acceptable, keep patch with current bounds
        ratio = difflib.SequenceMatcher(None, actual_snippet, expected_snippet).ratio()
        if ratio >= 0.4:
            return True, patch, None

        # Discard patch if snippet is completely unaligned (hallucinated line bounds)
        return False, None, f"Discarded patch '{patch.vulnerability_type}' on lines {start_l}-{end_l}: snippet mismatch ratio {ratio:.2f}."

    def _has_overlap(self, p1: PatchProposal, p2: PatchProposal) -> bool:
        """Check if two patches overlap in 1-indexed inclusive line ranges."""
        return not (p1.end_line < p2.start_line or p2.end_line < p1.start_line)

    def _get_patch_priority_score(self, patch: PatchProposal) -> Tuple[int, int, float]:
        """Compute sorting tuple for patch priority: (Category Rank, Severity Rank, Confidence)."""
        cat_score = CATEGORY_PRIORITY.get(patch.category, 0)
        sev_score = SEVERITY_PRIORITY.get(patch.severity, 0)
        return (cat_score, sev_score, patch.confidence)

    def resolve_overlapping_clusters(
        self,
        patches: List[PatchProposal]
    ) -> Tuple[List[PatchProposal], List[str]]:
        """
        Core Merge Algorithm for Supervisor:
        Clusters overlapping proposals and prioritizes Security patches over Performance/Maintainability.
        Discards lower priority overlapping patches to guarantee code safety.
        """
        if not patches:
            return [], []

        # Sort patches primarily by start_line
        sorted_patches = sorted(patches, key=lambda p: (p.start_line, p.end_line))

        clusters: List[List[PatchProposal]] = []
        for patch in sorted_patches:
            placed = False
            for cluster in clusters:
                if any(self._has_overlap(patch, existing) for existing in cluster):
                    cluster.append(patch)
                    placed = True
                    break
            if not placed:
                clusters.append([patch])

        winning_patches: List[PatchProposal] = []
        conflict_notes: List[str] = []

        for cluster in clusters:
            if len(cluster) == 1:
                winning_patches.append(cluster[0])
            else:
                # Rank proposals inside cluster by (Category, Severity, Confidence)
                ranked_cluster = sorted(cluster, key=self._get_patch_priority_score, reverse=True)
                winner = ranked_cluster[0]
                winning_patches.append(winner)

                discarded = ranked_cluster[1:]
                for disc in discarded:
                    note = (
                        f"[Supervisor Conflict Engine] Prioritized {winner.category.value} patch "
                        f"('{winner.vulnerability_type}', lines {winner.start_line}-{winner.end_line}) "
                        f"over overlapping {disc.category.value} patch "
                        f"('{disc.vulnerability_type}', lines {disc.start_line}-{disc.end_line}) to guarantee safety."
                    )
                    conflict_notes.append(note)

        return winning_patches, conflict_notes

    async def resolve_and_apply(
        self,
        source_code: str,
        file_path: str,
        patches: List[PatchProposal],
        ast_tree: Optional[Dict[str, Any]] = None,
        save_temp_file: bool = True
    ) -> UnifiedPatchResult:
        """
        Executes full deterministic patch validation, overlap conflict resolution,
        bottom-to-top AST replacement, syntax check, and temp file output.
        """
        source_lines = source_code.splitlines(keepends=False)
        conflict_notes: List[str] = []

        # 1. Pydantic validation & AST line bounds mapping
        validated_patches: List[PatchProposal] = []
        for raw_patch in patches:
            is_valid, mapped_patch, note = self.validate_and_map_patch(raw_patch, source_lines, ast_tree)
            if note:
                conflict_notes.append(note)
            if is_valid and mapped_patch:
                validated_patches.append(mapped_patch)

        # 2. Overlap detection & Supervisor priority conflict resolution
        winning_patches, resolution_notes = self.resolve_overlapping_clusters(validated_patches)
        conflict_notes.extend(resolution_notes)

        # 3. Sort non-overlapping winning patches in descending start_line order ($N -> 1$)
        # (Bottom-to-top application prevents line offset drift!)
        winning_patches.sort(key=lambda p: p.start_line, reverse=True)

        working_lines = list(source_lines)
        applied_list: List[PatchProposal] = []

        for patch in winning_patches:
            start_idx = max(0, patch.start_line - 1)
            end_idx = min(len(working_lines), patch.end_line)
            replacement_lines = patch.proposed_code.splitlines()

            working_lines[start_idx:end_idx] = replacement_lines
            applied_list.append(patch)

        remediated_code = "\n".join(working_lines) + ("\n" if source_code.endswith("\n") else "")

        # 4. Generate unified diff string
        diff_lines = list(difflib.unified_diff(
            source_lines,
            working_lines,
            fromfile=f"a/{file_path}",
            tofile=f"b/{file_path}",
            lineterm=""
        ))
        unified_diff_str = "\n".join(diff_lines)

        lines_added = sum(1 for line in diff_lines if line.startswith("+") and not line.startswith("+++"))
        lines_removed = sum(1 for line in diff_lines if line.startswith("-") and not line.startswith("---"))

        # 5. AST Syntax Verification
        syntax_valid = True
        try:
            ast.parse(remediated_code, filename=file_path)
        except SyntaxError as e:
            syntax_valid = False
            conflict_notes.append(f"Syntax validation warning in merged code: {e.msg} at line {e.lineno}")

        applied_list.sort(key=lambda p: p.start_line)
        conflicts_resolved_count = len(resolution_notes)

        # 6. Save final merged code to local temporary file (temp_patched_file.py)
        temp_file_path = None
        if save_temp_file:
            try:
                base_name = os.path.basename(file_path)
                out_name = "temp_patched_file.py" if base_name in ("source.py", "main.py") else f"temp_patched_{base_name}"
                temp_file_path = self.file_manager.save_patched_file(remediated_code, output_filename=out_name)
                conflict_notes.append(f"Patched source saved locally to: {temp_file_path}")
            except Exception as e:
                conflict_notes.append(f"Warning: Failed to save temporary patched file: {e}")

        return UnifiedPatchResult(
            success=True,
            original_file_path=file_path,
            original_code=source_code,
            remediated_code=remediated_code,
            unified_diff=unified_diff_str,
            total_patches_applied=len(applied_list),
            conflicts_resolved=conflicts_resolved_count,
            lines_added=lines_added,
            lines_removed=lines_removed,
            syntax_validated=syntax_valid,
            applied_patches=applied_list,
            conflict_notes=conflict_notes
        )
