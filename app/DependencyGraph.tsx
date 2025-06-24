'use client';
import ReactFlow, { MiniMap, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

export default function DependencyGraph({ todos, dependencies }: { todos: any[]; dependencies: any[] }) {
  const nodes = todos.map((todo) => ({
    id: todo.id.toString(),
    data: { label: `${todo.title}\n${todo.earliestStart ? `Start: ${new Date(todo.earliestStart).toLocaleDateString()}` : ''}` },
    position: { x: Math.random() * 500, y: Math.random() * 300 },
    style: {
      border: '2px solid',
      borderColor: todo.isOnCriticalPath ? 'red' : 'gray',
      background: todo.isOnCriticalPath ? '#ffe5e5' : '#fff',
      padding: 10,
    },
  }));

  const edges = dependencies.map((dep) => ({
    id: `${dep.taskId}->${dep.dependsOnId}`,
    source: dep.dependsOnId.toString(),
    target: dep.taskId.toString(),
  }));

  return (
    <div style={{ height: 500 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
