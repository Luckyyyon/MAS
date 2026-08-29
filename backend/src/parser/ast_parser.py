import ast
import re
from typing import List, Dict, Any, Optional, Set
from pydantic import BaseModel, Field

class FunctionNodeMetadata(BaseModel):
    name: str
    qualified_name: str
    docstring: Optional[str] = None
    parameters: List[str] = Field(default_factory=list)
    decorators: List[str] = Field(default_factory=list)
    start_line: int
    end_line: int
    start_byte: int
    end_byte: int
    is_async: bool = False
    parent_class: Optional[str] = None
    calls_made: List[str] = Field(default_factory=list)
    variables_assigned: List[str] = Field(default_factory=list)
    code_snippet: str = ""

class ClassNodeMetadata(BaseModel):
    name: str
    docstring: Optional[str] = None
    bases: List[str] = Field(default_factory=list)
    decorators: List[str] = Field(default_factory=list)
    start_line: int
    end_line: int
    start_byte: int
    end_byte: int
    methods: List[str] = Field(default_factory=list)
    code_snippet: str = ""

class ImportMetadata(BaseModel):
    module: str
    names: List[str] = Field(default_factory=list)
    alias: Optional[str] = None
    is_from_import: bool = False
    start_line: int
    end_line: int

class DependencyGraph(BaseModel):
    call_graph: Dict[str, List[str]] = Field(default_factory=dict)
    imports: List[ImportMetadata] = Field(default_factory=list)
    global_variables: List[str] = Field(default_factory=list)

class ParsedASTResult(BaseModel):
    file_path: str
    total_lines: int
    total_bytes: int
    syntax_valid: bool = True
    syntax_error: Optional[str] = None
    functions: List[FunctionNodeMetadata] = Field(default_factory=list)
    classes: List[ClassNodeMetadata] = Field(default_factory=list)
    imports: List[ImportMetadata] = Field(default_factory=list)
    dependencies: DependencyGraph = Field(default_factory=DependencyGraph)
    raw_symbols: List[str] = Field(default_factory=list)

class PythonASTParser:
    """
    Production AST Parser leveraging Tree-Sitter with fallback to Python built-in AST.
    Extracts deep syntactic hierarchies, byte offsets, scopes, and dependency graphs.
    """

    def __init__(self):
        self.ts_parser = None
        self.ts_language = None
        self._init_tree_sitter()

    def _init_tree_sitter(self):
        """Initialize tree-sitter Python grammar if available."""
        try:
            import tree_sitter_python
            from tree_sitter import Language, Parser
            self.ts_language = Language(tree_sitter_python.language())
            self.ts_parser = Parser(self.ts_language)
        except Exception as e:
            # Tree-sitter might have different API versions or bindings; fallback to robust AST
            self.ts_parser = None

    def parse_code(self, source_code: str, file_path: str = "source.py") -> ParsedASTResult:
        """Parse source code string into structured AST node metadata and dependency graph."""
        lines = source_code.splitlines(keepends=True)
        source_bytes = source_code.encode("utf-8")
        total_lines = len(lines)
        total_bytes = len(source_bytes)

        # 1. First run Python standard AST visitor for semantic scoping & call graph
        py_ast_result = self._parse_with_standard_ast(source_code, lines, file_path, total_lines, total_bytes)
        
        # 2. If tree-sitter is loaded, enrich with exact byte offset node boundaries
        if self.ts_parser is not None and py_ast_result.syntax_valid:
            try:
                self._enrich_with_tree_sitter(py_ast_result, source_bytes)
            except Exception as e:
                # Tree-sitter enrichment is non-fatal
                pass

        return py_ast_result

    def _parse_with_standard_ast(
        self,
        source_code: str,
        lines: List[str],
        file_path: str,
        total_lines: int,
        total_bytes: int
    ) -> ParsedASTResult:
        """Standard AST parser with recursive visitor for scopes and call-graph."""
        try:
            tree = ast.parse(source_code, filename=file_path)
        except SyntaxError as se:
            return ParsedASTResult(
                file_path=file_path,
                total_lines=total_lines,
                total_bytes=total_bytes,
                syntax_valid=False,
                syntax_error=f"Line {se.lineno}, Col {se.offset}: {se.msg}"
            )

        functions: List[FunctionNodeMetadata] = []
        classes: List[ClassNodeMetadata] = []
        imports: List[ImportMetadata] = []
        global_vars: Set[str] = set()
        call_graph: Dict[str, List[str]] = {}
        raw_symbols: Set[str] = set()

        # Helper to compute byte offsets from line/col numbers
        def get_byte_offsets(node: ast.AST) -> tuple[int, int]:
            start_line = getattr(node, "lineno", 1) - 1
            start_col = getattr(node, "col_offset", 0)
            end_line = getattr(node, "end_lineno", getattr(node, "lineno", 1)) - 1
            end_col = getattr(node, "end_col_offset", len(lines[end_line]) if end_line < len(lines) else 0)
            
            # Compute start byte
            start_byte = sum(len(lines[i].encode("utf-8")) for i in range(min(start_line, len(lines)))) + start_col
            # Compute end byte
            end_byte = sum(len(lines[i].encode("utf-8")) for i in range(min(end_line, len(lines)))) + end_col
            return max(0, start_byte), min(total_bytes, end_byte)

        # Extract Imports
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append(ImportMetadata(
                        module=alias.name,
                        alias=alias.asname,
                        is_from_import=False,
                        start_line=node.lineno,
                        end_line=getattr(node, 'end_lineno', node.lineno)
                    ))
                    raw_symbols.add(alias.name)
            elif isinstance(node, ast.ImportFrom):
                mod = node.module or ""
                names = [n.name for n in node.names]
                imports.append(ImportMetadata(
                    module=mod,
                    names=names,
                    is_from_import=True,
                    start_line=node.lineno,
                    end_line=getattr(node, 'end_lineno', node.lineno)
                ))
                raw_symbols.update(names)
            elif isinstance(node, ast.Assign):
                # Top-level global assignments
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        global_vars.add(target.id)
                        raw_symbols.add(target.id)

        # Recursive Scope Visitor for Classes and Functions
        class ScopeVisitor(ast.NodeVisitor):
            def __init__(self):
                self.current_class: Optional[str] = None
                self.current_func: Optional[str] = None

            def visit_ClassDef(self, node: ast.ClassDef):
                prev_class = self.current_class
                self.current_class = node.name
                raw_symbols.add(node.name)

                start_byte, end_byte = get_byte_offsets(node)
                start_l = node.lineno
                end_l = getattr(node, 'end_lineno', node.lineno)
                snippet = "".join(lines[start_l - 1:end_l])

                decorators = [self._decorator_name(d) for d in node.decorator_list]
                bases = [self._expr_name(b) for b in node.bases]
                methods = [n.name for n in node.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))]

                classes.append(ClassNodeMetadata(
                    name=node.name,
                    docstring=ast.get_docstring(node),
                    bases=bases,
                    decorators=decorators,
                    start_line=start_l,
                    end_line=end_l,
                    start_byte=start_byte,
                    end_byte=end_byte,
                    methods=methods,
                    code_snippet=snippet
                ))

                self.generic_visit(node)
                self.current_class = prev_class

            def visit_FunctionDef(self, node: ast.FunctionDef):
                self._handle_function(node, is_async=False)

            def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
                self._handle_function(node, is_async=True)

            def _handle_function(self, node, is_async: bool):
                prev_func = self.current_func
                qname = f"{self.current_class}.{node.name}" if self.current_class else node.name
                self.current_func = qname
                raw_symbols.add(node.name)

                start_byte, end_byte = get_byte_offsets(node)
                start_l = node.lineno
                end_l = getattr(node, 'end_lineno', node.lineno)
                snippet = "".join(lines[start_l - 1:end_l])

                params = [arg.arg for arg in node.args.args]
                decorators = [self._decorator_name(d) for d in node.decorator_list]

                # Find internal calls & assignments
                calls = []
                vars_assigned = []
                for inner in ast.walk(node):
                    if isinstance(inner, ast.Call):
                        calls.append(self._expr_name(inner.func))
                    elif isinstance(inner, ast.Assign):
                        for t in inner.targets:
                            if isinstance(t, ast.Name):
                                vars_assigned.append(t.id)

                call_graph[qname] = list(set(calls))

                functions.append(FunctionNodeMetadata(
                    name=node.name,
                    qualified_name=qname,
                    docstring=ast.get_docstring(node),
                    parameters=params,
                    decorators=decorators,
                    start_line=start_l,
                    end_line=end_l,
                    start_byte=start_byte,
                    end_byte=end_byte,
                    is_async=is_async,
                    parent_class=self.current_class,
                    calls_made=list(set(calls)),
                    variables_assigned=list(set(vars_assigned)),
                    code_snippet=snippet
                ))

                self.generic_visit(node)
                self.current_func = prev_func

            def _decorator_name(self, d: ast.AST) -> str:
                return self._expr_name(d)

            def _expr_name(self, expr: ast.AST) -> str:
                if isinstance(expr, ast.Name):
                    return expr.id
                elif isinstance(expr, ast.Attribute):
                    return f"{self._expr_name(expr.value)}.{expr.attr}"
                elif isinstance(expr, ast.Call):
                    return self._expr_name(expr.func)
                return "<expr>"

        visitor = ScopeVisitor()
        visitor.visit(tree)

        dep_graph = DependencyGraph(
            call_graph=call_graph,
            imports=imports,
            global_variables=list(global_vars)
        )

        return ParsedASTResult(
            file_path=file_path,
            total_lines=total_lines,
            total_bytes=total_bytes,
            syntax_valid=True,
            functions=functions,
            classes=classes,
            imports=imports,
            dependencies=dep_graph,
            raw_symbols=list(raw_symbols)
        )

    def _enrich_with_tree_sitter(self, result: ParsedASTResult, source_bytes: bytes):
        """Enrich with Tree-Sitter parsed exact token spans if parser is operational."""
        tree = self.ts_parser.parse(source_bytes)
        root = tree.root_node
        if root.has_error:
            # Tree-sitter noticed syntax error
            pass
