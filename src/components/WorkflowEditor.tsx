"use client"

import * as React from 'react'
import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Mail, Clock, User, CheckCircle, AlertTriangle, Zap } from 'lucide-react'

// Custom Node Components
const TriggerNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-blue-50 border-2 border-blue-200">
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-blue-500">
          <Clock className="w-4 h-4 text-white" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold">{data.label}</div>
          <div className="text-xs text-gray-500">{data.type}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  )
}

const ActionNode = ({ data }: { data: any }) => {
  const getIcon = () => {
    switch (data.actionType) {
      case 'send_email':
        return <Mail className="w-4 h-4 text-white" />
      case 'create_task':
        return <CheckCircle className="w-4 h-4 text-white" />
      case 'send_notification':
        return <AlertTriangle className="w-4 h-4 text-white" />
      default:
        return <Zap className="w-4 h-4 text-white" />
    }
  }

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-green-50 border-2 border-green-200">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-green-500">
          {getIcon()}
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold">{data.label}</div>
          <div className="text-xs text-gray-500">{data.actionType}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  )
}

const ConditionNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-yellow-50 border-2 border-yellow-200">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-yellow-500">
          <AlertTriangle className="w-4 h-4 text-white" />
        </div>
        <div className="ml-2">
          <div className="text-sm font-bold">{data.label}</div>
          <div className="text-xs text-gray-500">Condition</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
}

interface WorkflowEditorProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onSave: (nodes: Node[], edges: Edge[]) => void
}

const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  initialNodes = [],
  initialEdges = [],
  onSave,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // Default nodes if none provided
  const defaultNodes: Node[] = useMemo(() => {
    if (initialNodes.length > 0) return initialNodes
    return [
      {
        id: '1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'New Client Added', type: 'event' },
      },
      {
        id: '2',
        type: 'action',
        position: { x: 400, y: 100 },
        data: { label: 'Send Welcome Email', actionType: 'send_email' },
      },
    ]
  }, [initialNodes])

  const defaultEdges: Edge[] = useMemo(() => {
    if (initialEdges.length > 0) return initialEdges
    return [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        animated: true,
      },
    ]
  }, [initialEdges])

  // Initialize with default nodes/edges if empty
  React.useEffect(() => {
    if (nodes.length === 0) {
      setNodes(defaultNodes)
    }
    if (edges.length === 0) {
      setEdges(defaultEdges)
    }
  }, [nodes.length, edges.length, defaultNodes, defaultEdges, setNodes, setEdges])

  const addTriggerNode = () => {
    const newNode: Node = {
      id: `trigger-${Date.now()}`,
      type: 'trigger',
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      data: { label: 'New Trigger', type: 'schedule' },
    }
    setNodes((nds) => [...nds, newNode])
  }

  const addActionNode = () => {
    const newNode: Node = {
      id: `action-${Date.now()}`,
      type: 'action',
      position: { x: Math.random() * 300 + 200, y: Math.random() * 300 },
      data: { label: 'New Action', actionType: 'send_email' },
    }
    setNodes((nds) => [...nds, newNode])
  }

  const addConditionNode = () => {
    const newNode: Node = {
      id: `condition-${Date.now()}`,
      type: 'condition',
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      data: { label: 'New Condition' },
    }
    setNodes((nds) => [...nds, newNode])
  }

  const handleSave = () => {
    onSave(nodes, edges)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={addTriggerNode}
            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
          >
            + Trigger
          </button>
          <button
            onClick={addActionNode}
            className="px-3 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
          >
            + Action
          </button>
          <button
            onClick={addConditionNode}
            className="px-3 py-1 text-xs font-medium text-yellow-600 bg-yellow-100 rounded-md hover:bg-yellow-200 transition-colors"
          >
            + Condition
          </button>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Save Workflow
        </button>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50 dark:bg-gray-900"
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case 'trigger':
                  return '#3b82f6'
                case 'action':
                  return '#10b981'
                case 'condition':
                  return '#f59e0b'
                default:
                  return '#6b7280'
              }
            }}
          />
        </ReactFlow>
      </div>
    </div>
  )
}

export default WorkflowEditor