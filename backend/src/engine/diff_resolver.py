import ast
import difflib
import asyncio
from typing import List, Tuple, Dict, Any
from src.models.state import PatchProposal, UnifiedPatchResult, AgentCategory, PatchSeverity
from src.agents.synthesizer import SynthesizerAgent

class DiffConflictResolver:
    """
    High-throughput algorithmic diff reconciliation engine.
    Detects overlapping AST ranges, merges non-conflicting proposals,
    and runs concurrent LLM synthesis for complex overlapping clusters.
    """

    def __init__(self):
        self.synthesizer = SynthesizerAgent()

    def _has_overlap(self, p1: PatchProposal, p2: PatchProposal) -> bool:
        """Check if two patches overlap in line ranges (1-indexed inclusive)."""
        return not (p1.end_line < p2.start_line or p2.end_line < p1.start_line)

    def _cluster_overlapping_patches(self, patches: List[PatchProposal]) -> List[List[PatchProposal]]:
        """Cluster patches into disjoint sets of overlapping proposals."""
        if not patches:
            return []

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

        return clusters

    async def resolve_and_apply(
        self,
        source_code: str,
        file_path: str,
        patches: List[PatchProposal]
    ) -> UnifiedPatchResult:
        if not patches:
            return UnifiedPatchResult(
                success=True,
                original_file_path=file_path,
                original_code=source_code,
                remediated_code=source_code,
                unified_diff="",
                total_patches_applied=0,
                conflicts_resolved=0,
                lines_added=0,
                lines_removed=0,
                syntax_validated=True,
                applied_patches=[],
                conflict_notes=["No actionable patches proposed."]
            )

        source_lines = source_code.splitlines(keepends=False)
        clusters = self._cluster_overlapping_patches(patches)
        final_patches: List[PatchProposal] = []
        conflicts_count = 0
        conflict_notes: List[str] = []

        # Separate single patches from multi-agent overlapping clusters
        single_clusters = [c[0] for c in clusters if len(c) == 1]
        overlapping_clusters = [c for c in clusters if len(c) > 1]

        final_patches.extend(single_clusters)

        # Process all overlapping clusters CONCURRENTLY in parallel
        if overlapping_clusters:
            synthesis_tasks = []
            cluster_meta = []

            for cluster in overlapping_clusters:
                conflicts_count += len(cluster) - 1
                min_line = min(p.start_line for p in cluster)
                max_line = max(p.end_line for p in cluster)
                
                original_snippet = "\n".join(
                    source_lines[max(0, min_line - 1):min(len(source_lines), max_line)]
                )

                note = f"Resolved conflict across {len(cluster)} agents ({', '.join(p.agent for p in cluster)}) on lines {min_line}-{max_line}."
                conflict_notes.append(note)
                cluster_meta.append((min_line, max_line, original_snippet, cluster))

                synthesis_tasks.append(
                    self.synthesizer.synthesize_conflicting_patches(
                        original_code_block=original_snippet,
                        start_line=min_line,
                        end_line=max_line,
                        conflicting_patches=cluster
                    )
                )

            # Concurrent synthesis execution
            synthesized_results = await asyncio.gather(*synthesis_tasks, return_exceptions=True)
            for i, res in enumerate(synthesized_results):
                if isinstance(res, PatchProposal):
                    final_patches.append(res)
                else:
                    # Fallback to highest severity patch in that cluster
                    fallback_patch = sorted(cluster_meta[i][3], key=lambda p: (0 if p.category == AgentCategory.SECURITY else 1))[0]
                    final_patches.append(fallback_patch)

        # Sort final non-overlapping patches in descending order of start_line
        # (Applying from bottom to top prevents line offset drift!)
        final_patches.sort(key=lambda p: p.start_line, reverse=True)

        working_lines = list(source_lines)
        applied_list: List[PatchProposal] = []

        for patch in final_patches:
            start_idx = max(0, patch.start_line - 1)
            end_idx = min(len(working_lines), patch.end_line)
            replacement_lines = patch.proposed_code.splitlines()
            working_lines[start_idx:end_idx] = replacement_lines
            applied_list.append(patch)

        remediated_code = "\n".join(working_lines) + ("\n" if source_code.endswith("\n") else "")

        # Compute unified diff
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

        # Verify Syntax Validity
        syntax_valid = True
        try:
            ast.parse(remediated_code, filename=file_path)
        except SyntaxError as e:
            syntax_valid = False
            conflict_notes.append(f"Syntax validation warning in generated AST: {e.msg} at line {e.lineno}")

        applied_list.sort(key=lambda p: p.start_line)

        return UnifiedPatchResult(
            success=True,
            original_file_path=file_path,
            original_code=source_code,
            remediated_code=remediated_code,
            unified_diff=unified_diff_str,
            total_patches_applied=len(applied_list),
            conflicts_resolved=conflicts_count,
            lines_added=lines_added,
            lines_removed=lines_removed,
            syntax_validated=syntax_valid,
            applied_patches=applied_list,
            conflict_notes=conflict_notes
        )
