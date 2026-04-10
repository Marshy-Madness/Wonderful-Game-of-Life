import React, { useMemo } from 'react';
import Box from '@mui/material/Box';

const NODE_R = 28;
const LEVEL_DY = 100;
const NODE_DX = 80;

/**
 * Compute 2D layout for a tree of unlocks. Roots (no prerequisite) at top;
 * children below parents; horizontal spread per level.
 */
function computeLayout(unlocks) {
  if (!unlocks || unlocks.length === 0) return [];
  const byId = new Map(unlocks.map((u) => [u.id, { ...u, children: [] }]));
  const roots = [];
  byId.forEach((u) => {
    if (!u.prerequisiteId || !byId.has(u.prerequisiteId)) {
      roots.push(u);
    } else {
      byId.get(u.prerequisiteId).children.push(u);
    }
  });
  const levels = [];
  let frontier = roots.slice();
  const placed = new Set();
  while (frontier.length) {
    levels.push(frontier.slice());
    frontier.forEach((n) => placed.add(n.id));
    const next = [];
    frontier.forEach((n) => {
      (n.children || []).forEach((c) => {
        if (!placed.has(c.id)) next.push(c);
      });
    });
    frontier = [...new Map(next.map((n) => [n.id, n])).values()];
  }
  const result = [];
  levels.forEach((level, yi) => {
    const y = 40 + yi * LEVEL_DY;
    level.forEach((node, xi) => {
      const x = 60 + (xi - (level.length - 1) / 2) * NODE_DX;
      result.push({ ...node, x, y });
    });
  });
  return result;
}

export default function VisualSkillTree({
  unlocks = [],
  getIconComponent,
  selectedId,
  onSelectNode,
  readOnly = false,
  unlockedSet,
}) {
  const layout = useMemo(() => computeLayout(unlocks), [unlocks]);
  const byId = useMemo(() => new Map(layout.map((n) => [n.id, n])), [layout]);

  const width = Math.max(200, layout.reduce((w, n) => Math.max(w, n.x + NODE_R + 20), 0));
  const height = layout.length
    ? Math.max(120, Math.max(...layout.map((n) => n.y)) + NODE_R + 40)
    : 120;

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: 200,
        bgcolor: 'grey.900',
        borderRadius: 1,
        p: 2,
        overflow: 'auto',
      }}
    >
      <Box sx={{ position: 'relative', width, minHeight: height }}>
        <svg
          width={width}
          height={height}
          style={{ display: 'block', position: 'relative', zIndex: 0 }}
        >
          {layout.map((node) => {
            if (!node.prerequisiteId) return null;
            const parent = byId.get(node.prerequisiteId);
            if (!parent) return null;
            const dx = node.x - parent.x;
            const dy = node.y - parent.y;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const startR = NODE_R + 2;
            const endR = NODE_R + 2;
            const x1 = parent.x + ux * startR;
            const y1 = parent.y + uy * startR;
            const x2 = node.x - ux * endR;
            const y2 = node.y - uy * endR;
            return (
              <line
                key={`line-${node.id}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(100, 180, 255, 0.8)"
                strokeWidth={2}
              />
            );
          })}
        </svg>
        {layout.map((node) => {
          const isUnlocked = unlockedSet && unlockedSet.has(node.id);
          const isSelected = selectedId === node.id;
          const fill = node.color || (isUnlocked ? '#4caf50' : '#5c6bc0');
          const IconComponent = getIconComponent ? getIconComponent(node) : null;
          return (
            <Box
              key={node.id}
              onClick={() => !readOnly && onSelectNode && onSelectNode(node.id)}
              sx={{
                position: 'absolute',
                left: node.x - NODE_R,
                top: node.y - NODE_R,
                width: NODE_R * 2,
                height: NODE_R * 2,
                borderRadius: '50%',
                bgcolor: fill,
                border: `${isSelected ? 4 : 1}px solid ${isSelected ? '#ffeb3b' : 'rgba(255,255,255,0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: readOnly ? 'default' : 'pointer',
                zIndex: 1,
              }}
            >
              {node.imageDataUrl ? (
                <Box
                  component="img"
                  src={node.imageDataUrl}
                  alt=""
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : IconComponent ? (
                <IconComponent sx={{ color: 'white', fontSize: 28 }} />
              ) : (
                <Box component="span" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }}>
                  ?
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
