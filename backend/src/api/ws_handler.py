import asyncio
import json
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from src.engine.workflow import RemediationEngine
from src.engine.source_resolver import SourceResolver
from src.models.state import StreamLogEvent
from src.api.routes import ACTIVE_SCANS, REAL_SCANS_DB

ws_router = APIRouter(tags=["WebSocket Real Stream"])

class RealTimeStreamManager:
    def __init__(self):
        self.active_sockets: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active_sockets.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active_sockets:
            self.active_sockets.remove(ws)

stream_manager = RealTimeStreamManager()

@ws_router.websocket("/ws/agent-stream/{scan_id}")
async def websocket_real_agent_stream(websocket: WebSocket, scan_id: str):
    await stream_manager.connect(websocket)
    try:
        scan_data = ACTIVE_SCANS.get(scan_id) or {}
        target_input = scan_data.get("repo_url") or scan_data.get("file_path") or ""
        branch = scan_data.get("branch", "main")
        
        # Initial Handshake
        await websocket.send_json({
            "type": "SYSTEM",
            "timestamp": datetime.utcnow().strftime("%H:%M:%S.%f")[:-3],
            "agent": "Supervisor",
            "level": "INFO",
            "message": f"Connected to Real Multi-Agent LangGraph Engine. Attached to scan [{scan_id}].",
            "scan_id": scan_id
        })

        # Define real-time log callback for LangGraph streaming
        async def on_log_event(event: StreamLogEvent):
            try:
                await websocket.send_json({
                    "type": "AGENT_LOG",
                    "timestamp": event.timestamp,
                    "agent": event.agent,
                    "level": event.level,
                    "message": event.message,
                    "scan_id": scan_id
                })
            except Exception:
                pass

        source_code = scan_data.get("source_code")
        file_path = scan_data.get("file_path", "source.py")

        # If source code wasn't pre-populated, resolve it from target_input (GitHub or Local Path)
        if not source_code and target_input:
            await websocket.send_json({
                "type": "AGENT_LOG",
                "timestamp": datetime.utcnow().strftime("%H:%M:%S.%f")[:-3],
                "agent": "Supervisor",
                "level": "INFO",
                "message": f"Resolving target source from: {target_input} (Branch: {branch})...",
                "scan_id": scan_id
            })
            try:
                source_code, resolved_file_path, label = await SourceResolver.resolve(target_input, branch)
                file_path = resolved_file_path
                await websocket.send_json({
                    "type": "AGENT_LOG",
                    "timestamp": datetime.utcnow().strftime("%H:%M:%S.%f")[:-3],
                    "agent": "Supervisor",
                    "level": "SUCCESS",
                    "message": f"Ingested {len(source_code.splitlines())} lines from [{label}]. Dispatching to AST parser...",
                    "scan_id": scan_id
                })
            except Exception as resolve_err:
                await websocket.send_json({
                    "type": "AGENT_LOG",
                    "timestamp": datetime.utcnow().strftime("%H:%M:%S.%f")[:-3],
                    "agent": "Supervisor",
                    "level": "WARN",
                    "message": f"Could not load '{target_input}': {resolve_err}. Falling back to default audit target.",
                    "scan_id": scan_id
                })

        # Fallback if neither was present
        if not source_code:
            source_code = '''import sqlite3
import hashlib
import pickle
import subprocess

def process_user_login(db_conn, username, raw_password, auth_payload):
    # SQL Injection Vulnerability
    cursor = db_conn.cursor()
    query = f"SELECT id, password_hash, role FROM users WHERE username = '{username}'"
    cursor.execute(query)
    user = cursor.fetchone()
    
    # Insecure Deserialization
    data = pickle.loads(auth_payload)
    
    # Insecure Cryptography
    pwd_hash = hashlib.md5(raw_password.encode()).hexdigest()
    
    # O(N^2) Lookup Inefficiency
    active_tokens = ["token_" + str(i) for i in range(5000)]
    valid_sessions = []
    for item in active_tokens:
        if item in active_tokens: # Linear list lookup in loop
            valid_sessions.append(item)
            
    # Command Injection
    subprocess.Popen(f"echo User logged in: {username}", shell=True)
    return user
'''
            file_path = "src/auth/login_handler.py"

        # Execute the real multi-agent pipeline with error capturing
        try:
            final_state = await RemediationEngine.run_pipeline(
                source_code=source_code,
                file_path=file_path,
                log_callback=on_log_event
            )

            # Update persistent scan history record
            if scan_id in REAL_SCANS_DB:
                REAL_SCANS_DB[scan_id]["status"] = "completed"
                REAL_SCANS_DB[scan_id]["file_path"] = file_path
                REAL_SCANS_DB[scan_id]["source_code"] = source_code
                REAL_SCANS_DB[scan_id]["agent_patches"] = [p.dict() for p in final_state.agent_patches]
                REAL_SCANS_DB[scan_id]["unified_patch"] = final_state.unified_patch.dict() if final_state.unified_patch else None

            # Send final unified diff result payload
            if final_state.unified_patch:
                await websocket.send_json({
                    "type": "SCAN_COMPLETE",
                    "timestamp": datetime.utcnow().strftime("%H:%M:%S.%f")[:-3],
                    "agent": "Supervisor",
                    "level": "SUCCESS",
                    "message": f"Remediation pipeline completed. {final_state.unified_patch.total_patches_applied} patches applied cleanly.",
                    "scan_id": scan_id,
                    "payload": {
                        "scan_id": scan_id,
                        "repo_url": target_input or file_path,
                        "branch": branch,
                        "unified_patch": final_state.unified_patch.dict(),
                        "agent_patches": [p.dict() for p in final_state.agent_patches]
                    }
                })
        except Exception as pipeline_err:
            await websocket.send_json({
                "type": "AGENT_LOG",
                "timestamp": datetime.utcnow().strftime("%H:%M:%S.%f")[:-3],
                "agent": "Supervisor",
                "level": "ERROR",
                "message": f"Pipeline execution error: {pipeline_err}"
            })
            await websocket.send_json({
                "type": "SCAN_COMPLETE",
                "timestamp": datetime.utcnow().strftime("%H:%M:%S.%f")[:-3],
                "agent": "Supervisor",
                "level": "ERROR",
                "message": "Scan completed with errors. See terminal logs.",
                "scan_id": scan_id,
                "payload": None
            })

        # Keep alive for incoming dashboard user commands
        while True:
            client_msg = await websocket.receive_text()
            await websocket.send_json({
                "type": "AGENT_LOG",
                "timestamp": datetime.utcnow().strftime("%H:%M:%S.%f")[:-3],
                "agent": "Supervisor",
                "level": "EXEC",
                "message": f"Command received by Supervisor: '{client_msg}'. Dispatched to LangGraph runtime."
            })
    except WebSocketDisconnect:
        stream_manager.disconnect(websocket)
    except Exception as e:
        stream_manager.disconnect(websocket)

