import React, { useState } from 'react';
import { GRAPH_NODES, GRAPH_EDGES } from '../data/mockSocData';
import { GraphNode } from '../types/soc';

interface GraphIntelligenceViewProps {
  onOpenAccountById: (id: string) => void;
  onShowToast: (msg: string) => void;
  initialSelectedId?: string | null;
}

export const GraphIntelligenceView: React.FC<GraphIntelligenceViewProps> = ({
  onOpenAccountById,
  onShowToast,
  initialSelectedId,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    initialSelectedId || 'ACC105'
  );
  const [layerFilter, setLayerFilter] = useState<'ALL' | 'L1' | 'L2' | 'L3'>('ALL');
  const [animateFlow, setAnimateFlow] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const selectedNode = GRAPH_NODES.find((n) => n.id === selectedNodeId);

  // Filter nodes based on selected layer
  const visibleNodes = GRAPH_NODES.filter((n) => {
    if (layerFilter === 'ALL') return true;
    if (layerFilter === 'L1') return n.layer === 'L1' || n.layer === 'IP';
    if (layerFilter === 'L2') return n.layer === 'L2';
    if (layerFilter === 'L3') return n.layer === 'L3' || n.layer === 'VAULT';
    return true;
  });

  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));

  const visibleEdges = GRAPH_EDGES.filter(
    (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
  );

  // Edges connected to selected node
  const activeEdges = GRAPH_EDGES.filter(
    (e) => e.source === selectedNodeId || e.target === selectedNodeId
  );

  const totalConnectedVolume = activeEdges.reduce((acc, curr) => acc + curr.amountUSD, 0);

  return (
    <div className="flex flex-col w-full h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top Workspace Header */}
      <div className="p-4 bg-[#181c24] border-b border-[#262a33] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#262a33] text-[#adc6ff] font-badge-label uppercase">
              WORKSPACE // GRAPH INTELLIGENCE
            </span>
            <span className="font-mono-sm text-[#8c909f]">ALGO: HOP-DISTANCE-DFS</span>
          </div>
          <h1 className="font-headline-lg text-[#dfe2ee] font-bold">
            Settlement Flow & Entity Adjacency Matrix
          </h1>
          <p className="font-body-sm text-[#c2c6d6]">
            Visual correlation of nested layering hops from mule ingress accounts to off-ramp vaults.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Layer Filter Buttons */}
          <div className="bg-[#0a0e16] p-0.5 rounded-lg border border-[#262a33] flex items-center font-mono-sm">
            {(['ALL', 'L1', 'L2', 'L3'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLayerFilter(l)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  layerFilter === l
                    ? 'bg-[#1c2028] text-[#adc6ff] font-semibold'
                    : 'text-[#8c909f] hover:text-[#dfe2ee]'
                }`}
              >
                {l === 'ALL' ? 'All Tiers' : `${l} Tier`}
              </button>
            ))}
          </div>

          {/* Toggle Flow Animation */}
          <button
            onClick={() => setAnimateFlow(!animateFlow)}
            className={`px-3 py-1.5 rounded font-mono-sm flex items-center gap-1.5 border transition-all cursor-pointer ${
              animateFlow
                ? 'bg-[#00a572]/20 border-[#00a572]/40 text-[#4edea3]'
                : 'bg-[#262a33] border-[#31353e] text-[#8c909f]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {animateFlow ? 'motion_photos_on' : 'motion_photos_off'}
            </span>
            <span>Flow Pulse</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-[#0a0e16] rounded-lg border border-[#262a33] p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
              className="p-1 text-[#8c909f] hover:text-[#dfe2ee] cursor-pointer"
              title="Zoom out"
            >
              <span className="material-symbols-outlined text-base">remove</span>
            </button>
            <span className="font-mono-sm px-1.5 text-[#dfe2ee] tabular-nums">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.15))}
              className="p-1 text-[#8c909f] hover:text-[#dfe2ee] cursor-pointer"
              title="Zoom in"
            >
              <span className="material-symbols-outlined text-base">add</span>
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-[#8c909f] hover:text-[#dfe2ee] cursor-pointer border-l border-[#262a33]"
              title="Reset Zoom"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Graph Canvas Area + Side Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Tier Backdrop Columns Guide */}
        <div className="absolute inset-0 grid grid-cols-3 pointer-events-none opacity-20">
          <div className="border-r border-[#31353e] p-3 flex flex-col justify-between">
            <span className="font-badge-label text-[#ffb3ad] uppercase">
              TIER 1: MULE INGRESS & DEPOSITS
            </span>
            <span className="font-mono-sm text-[#8c909f]">High-Velocity Entry</span>
          </div>
          <div className="border-r border-[#31353e] p-3 flex flex-col justify-between">
            <span className="font-badge-label text-[#adc6ff] uppercase">
              TIER 2: SYNTHETIC LAYERING & ROUTERS
            </span>
            <span className="font-mono-sm text-[#8c909f]">Sub-Second Hop Shuffling</span>
          </div>
          <div className="p-3 flex flex-col justify-between">
            <span className="font-badge-label text-[#4edea3] uppercase">
              TIER 3: OFF-RAMP CLEARING & VAULTS
            </span>
            <span className="font-mono-sm text-[#8c909f]">Settlement Enclaves</span>
          </div>
        </div>

        {/* SVG Graph Viewport */}
        <div className="flex-1 h-full overflow-auto bg-[#0a0e16] relative flex items-center justify-center">
          <svg
            className="w-full h-full min-w-[850px] min-h-[550px]"
            viewBox="0 0 850 550"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <defs>
              {/* Marker for directed arrow heads */}
              <marker
                id="arrowhead-critical"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <polygon points="0 0, 8 4, 0 8" fill="#ff5451" />
              </marker>
              <marker
                id="arrowhead-primary"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <polygon points="0 0, 8 4, 0 8" fill="#4d8eff" />
              </marker>
              <marker
                id="arrowhead-secondary"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <polygon points="0 0, 8 4, 0 8" fill="#4edea3" />
              </marker>
            </defs>

            {/* Directed Edges */}
            {visibleEdges.map((edge) => {
              const src = GRAPH_NODES.find((n) => n.id === edge.source);
              const tgt = GRAPH_NODES.find((n) => n.id === edge.target);
              if (!src || !tgt) return null;

              const isEdgeHighlighted =
                selectedNodeId === edge.source || selectedNodeId === edge.target;

              const strokeColor =
                edge.amountUSD > 300000
                  ? '#ff5451'
                  : edge.amountUSD > 100000
                  ? '#4d8eff'
                  : '#4edea3';

              const markerId =
                edge.amountUSD > 300000
                  ? 'url(#arrowhead-critical)'
                  : edge.amountUSD > 100000
                  ? 'url(#arrowhead-primary)'
                  : 'url(#arrowhead-secondary)';

              // Compute smooth curved control point
              const dx = tgt.x - src.x;
              const dy = tgt.y - src.y;
              const cx = src.x + dx * 0.5;
              const cy = src.y + dy * 0.5 - 20;

              const pathD = `M ${src.x} ${src.y} Q ${cx} ${cy} ${tgt.x} ${tgt.y}`;

              return (
                <g key={edge.id} className="cursor-pointer">
                  {/* Background fat hit area */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isEdgeHighlighted ? 3 : 1.5}
                    strokeOpacity={isEdgeHighlighted ? 0.9 : 0.4}
                    markerEnd={markerId}
                  />

                  {/* Flow Pulse animation particle */}
                  {animateFlow && (
                    <circle r={isEdgeHighlighted ? 3.5 : 2.5} fill={strokeColor}>
                      <animateMotion
                        path={pathD}
                        dur={`${Math.max(1.2, 50 / edge.velocityTxMin)}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Flow Amount Label */}
                  <text
                    x={cx}
                    y={cy - 4}
                    fill="#8c909f"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                    className="select-none pointer-events-none"
                  >
                    ${(edge.amountUSD / 1000).toFixed(0)}k • {edge.layerHop}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {visibleNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isCritical = node.riskLevel === 'CRITICAL';
              const isHigh = node.riskLevel === 'HIGH';
              const isLow = node.riskLevel === 'LOW';

              const nodeColor = isCritical
                ? '#ff5451'
                : isHigh
                ? '#ffb3ad'
                : isLow
                ? '#4edea3'
                : '#4d8eff';

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer group"
                >
                  {/* Selection Glow Halo */}
                  {isSelected && (
                    <circle
                      r="26"
                      fill="none"
                      stroke={nodeColor}
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      className="animate-spin"
                      style={{ animationDuration: '8s' }}
                    />
                  )}

                  {/* Node Background */}
                  <circle
                    r="18"
                    fill="#181c24"
                    stroke={nodeColor}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    className="transition-all group-hover:scale-110"
                  />

                  {/* Risk Score or Icon */}
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill={nodeColor}
                    fontSize="11"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    className="select-none pointer-events-none"
                  >
                    {node.riskScore}
                  </text>

                  {/* Node Label Below */}
                  <text
                    textAnchor="middle"
                    dy="32"
                    fill="#dfe2ee"
                    fontSize="10"
                    fontFamily="Inter"
                    fontWeight="600"
                    className="select-none"
                  >
                    {node.id}
                  </text>

                  {/* Secondary descriptor */}
                  <text
                    textAnchor="middle"
                    dy="43"
                    fill="#8c909f"
                    fontSize="8.5"
                    fontFamily="JetBrains Mono"
                    className="select-none"
                  >
                    {node.layer}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Inspector Drawer (Right Pane) */}
        {selectedNode && (
          <div className="w-80 bg-[#181c24] border-l border-[#262a33] p-4 flex flex-col justify-between overflow-y-auto shrink-0 z-20">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#262a33]">
                <div>
                  <span className="font-badge-label text-[#8c909f] uppercase">
                    Graph Entity Node
                  </span>
                  <h3 className="font-headline-md text-[#dfe2ee] font-bold">
                    {selectedNode.id}
                  </h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-badge-label font-badge-label uppercase font-semibold ${
                    selectedNode.riskLevel === 'CRITICAL'
                      ? 'bg-[#93000a]/40 text-[#ffb4ab] border border-[#ffb4ab]/30'
                      : selectedNode.riskLevel === 'HIGH'
                      ? 'bg-[#ff5451]/20 text-[#ffb3ad] border border-[#ff5451]/30'
                      : 'bg-[#4d8eff]/20 text-[#adc6ff] border border-[#4d8eff]/30'
                  }`}
                >
                  {selectedNode.riskLevel}
                </span>
              </div>

              {/* Score & Tier */}
              <div className="p-3 rounded bg-[#0a0e16] border border-[#262a33] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono-sm text-[#8c909f]">Adjacency Layer:</span>
                  <span className="font-mono-sm text-[#adc6ff] font-bold">
                    {selectedNode.layer} Tier
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono-sm text-[#8c909f]">Fraud Threat Score:</span>
                  <span className="font-mono-md text-[#ffb3ad] font-bold">
                    {selectedNode.riskScore} / 100
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono-sm text-[#8c909f]">Connected Exposure:</span>
                  <span className="font-mono-md text-[#dfe2ee] font-bold">
                    ${totalConnectedVolume.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Entity Description */}
              <div>
                <span className="font-badge-label text-[#8c909f] uppercase block mb-1">
                  Entity Details & Activity
                </span>
                <p className="font-body-sm text-[#c2c6d6] bg-[#0a0e16] p-2.5 rounded border border-[#262a33]">
                  {selectedNode.details}
                </p>
              </div>

              {/* Connected Hops List */}
              <div className="space-y-1.5">
                <span className="font-badge-label text-[#8c909f] uppercase tracking-wider">
                  Associated Hops ({activeEdges.length})
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono-sm">
                  {activeEdges.map((e) => (
                    <div
                      key={e.id}
                      className="p-2 rounded bg-[#0a0e16] border border-[#262a33] flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[#dfe2ee]">
                          {e.source === selectedNode.id ? `To ${e.target}` : `From ${e.source}`}
                        </span>
                        <span className="block text-[#8c909f] text-[10px]">{e.layerHop}</span>
                      </div>
                      <span className="text-[#4edea3] font-semibold">
                        ${e.amountUSD.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#262a33] space-y-2">
              <button
                onClick={() => onOpenAccountById(selectedNode.id)}
                className="w-full py-2 rounded bg-[#adc6ff] text-[#002e6a] font-headline-md font-semibold hover:bg-[#4d8eff] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-base">visibility</span>
                <span>Open Full Dossier</span>
              </button>

              <button
                onClick={() => {
                  onShowToast(`Entity ${selectedNode.id} isolated from settlement pool.`);
                }}
                className="w-full py-2 rounded bg-[#262a33] hover:bg-[#ff5451] hover:text-[#00285d] text-[#dfe2ee] font-mono-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-[#31353e]"
              >
                <span className="material-symbols-outlined text-base">security</span>
                <span>Quarantine Node</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="h-9 px-4 bg-[#0a0e16] border-t border-[#262a33] flex items-center justify-between text-[#8c909f] font-mono-sm shrink-0">
        <div className="flex items-center gap-4">
          <span>
            Entities: <strong className="text-[#dfe2ee]">{visibleNodes.length}</strong>
          </span>
          <span>•</span>
          <span>
            Hops: <strong className="text-[#dfe2ee]">{visibleEdges.length}</strong>
          </span>
          <span>•</span>
          <span>
            Total Volume in View:{' '}
            <strong className="text-[#4edea3]">$2,410,000 USD</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[#4edea3]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
          <span>Adjacency Engine: Synced with DuckDB OLAP</span>
        </div>
      </div>
    </div>
  );
};
