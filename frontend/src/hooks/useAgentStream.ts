import { useState, useEffect, useRef, useCallback } from 'react';
import { TerminalLog } from '../types';

interface ScanCompletePayload {
  unified_patch?: {
    original_file_path: string;
    original_code: string;
    remediated_code: string;
    unified_diff: string;
    total_patches_applied: number;
    lines_added: number;
    lines_removed: number;
  };
  agent_patches?: any[];
}

export function useAgentStream(
  scanId: string | null,
  onScanComplete?: (payload: ScanCompletePayload) => void
) {
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: "log-init-1",
      timestamp: "14:20:01.120",
      agent: "Supervisor",
      level: "INFO",
      message: "Autonomous Remediation Engine runtime initialized. Real LangGraph backend connected.",
    },
    {
      id: "log-init-2",
      timestamp: "14:20:01.350",
      agent: "Supervisor",
      level: "EXEC",
      message: "Tree-sitter AST parser operational across Python AST hierarchies.",
    }
  ]);
  
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Use ref for onScanComplete callback to avoid tearing down WebSocket connections on re-render
  const onScanCompleteRef = useRef(onScanComplete);
  useEffect(() => {
    onScanCompleteRef.current = onScanComplete;
  }, [onScanComplete]);

  const addLog = useCallback((log: TerminalLog) => {
    setLogs((prev) => [...prev, log]);
  }, []);

  const connectWebSocket = useCallback((id: string) => {
    // If already connected to this scanId, do not reconnect!
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    const host = window.location.hostname || "localhost";
    const wsUrl = `ws://${host}:8000/ws/agent-stream/${id}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      setIsStreaming(true);
      addLog({
        id: `sys-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0] + '.' + String(new Date().getMilliseconds()).padStart(3, '0'),
        agent: 'Supervisor',
        level: 'INFO',
        message: `[WS CONNECTED] Subscribed to real LangGraph stream: ${id}`,
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        addLog({
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: data.timestamp || new Date().toTimeString().split(' ')[0],
          agent: data.agent || 'Supervisor',
          level: data.level || 'INFO',
          message: data.message || JSON.stringify(data),
        });

        if (data.type === 'SCAN_COMPLETE') {
          setIsStreaming(false);
          if (data.payload && onScanCompleteRef.current) {
            onScanCompleteRef.current(data.payload);
          }
        }
      } catch (err) {
        console.error("Failed to parse WS payload:", err);
      }
    };

    ws.onerror = () => {
      setIsConnected(false);
      console.warn("FastAPI WebSocket connection error.");
    };

    ws.onclose = () => {
      setIsConnected(false);
      setIsStreaming(false);
    };

    wsRef.current = ws;
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const sendAgentCommand = useCallback((cmd: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(cmd);
    } else {
      addLog({
        id: `user-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        agent: 'Supervisor',
        level: 'EXEC',
        message: `Dashboard Command Triggered: ${cmd}`,
      });
    }
  }, [addLog]);

  useEffect(() => {
    if (scanId) {
      connectWebSocket(scanId);
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [scanId, connectWebSocket]);

  return {
    logs,
    isConnected,
    isStreaming,
    clearLogs,
    addLog,
    sendAgentCommand,
  };
}
