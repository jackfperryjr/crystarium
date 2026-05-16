'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { Clip } from '@/lib/types'

// Deterministic seeded RNG so stars don't shift between renders
function makeStars(count: number) {
  let s = 0xdeadbeef
  const rng = () => { s = Math.imul(s ^ (s >>> 15), s | 1); s ^= s + Math.imul(s ^ (s >>> 7), s | 61); return ((s ^ (s >>> 14)) >>> 0) / 0xffffffff }
  return Array.from({ length: count }, () => ({ x: rng() * 100, y: rng() * 100, r: rng() * 0.65 + 0.2, o: rng() * 0.22 + 0.04 }))
}

const STARS = makeStars(150)

function Starfield({ isDark }: { isDark: boolean }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={isDark ? s.r : s.r * 1.3}
          fill={isDark ? 'white' : '#64748b'}
          opacity={isDark ? s.o : s.o * 1.4}
        />
      ))}
    </svg>
  )
}

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

interface GraphNode {
  id: string
  title: string
  domain: string | null
}

interface GraphLink {
  source: string
  target: string
  strength: number
}

function domainHue(domain: string | null): number {
  if (!domain) return 220
  let hash = 0
  for (const char of domain) {
    hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0
  }
  return Math.abs(hash) % 360
}

function parseEmbedding(raw: number[] | string | null): number[] | null {
  if (!raw) return null
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return null }
  }
  return raw
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (!normA || !normB) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

const EDGE_THRESHOLD = 0.7

interface Props {
  clips: Clip[]
  onNodeClick: (clip: Clip) => void
  selectedId: string | null
  isDark: boolean
}

export default function KnowledgeGraph({ clips, onNodeClick, selectedId, isDark }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const selectedIdRef = useRef(selectedId)
  const isDarkRef = useRef(isDark)

  useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])
  useEffect(() => { isDarkRef.current = isDark }, [isDark])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = clips.map(c => ({
      id: c.id,
      title: c.title ?? c.url,
      domain: c.domain,
    }))

    const embeddings = clips.map(c => parseEmbedding(c.embedding))
    const links: GraphLink[] = []

    for (let i = 0; i < clips.length; i++) {
      const a = embeddings[i]
      if (!a) continue
      for (let j = i + 1; j < clips.length; j++) {
        const b = embeddings[j]
        if (!b) continue
        const sim = cosineSimilarity(a, b)
        if (sim >= EDGE_THRESHOLD) {
          links.push({ source: clips[i].id, target: clips[j].id, strength: sim })
        }
      }
    }

    return { nodes, links }
  }, [clips])

  const darkBg = 'radial-gradient(ellipse at 28% 28%, rgba(90,45,180,0.14) 0%, transparent 58%), radial-gradient(ellipse at 72% 68%, rgba(20,55,140,0.10) 0%, transparent 52%), radial-gradient(ellipse at 55% 80%, rgba(40,20,100,0.07) 0%, transparent 40%), #07070f'
  const lightBg = 'radial-gradient(ellipse at 28% 28%, rgba(120,125,140,0.13) 0%, transparent 58%), radial-gradient(ellipse at 74% 68%, rgba(100,110,130,0.10) 0%, transparent 52%), radial-gradient(ellipse at 55% 85%, rgba(130,130,145,0.07) 0%, transparent 40%), #f5f4fc'

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Gradient background behind the canvas */}
      <div className="absolute inset-0" style={{ background: isDark ? darkBg : lightBg }} />

      <ForceGraph2D
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeId="id"
        nodeLabel={(node: any) => (node as GraphNode).title}
        linkColor={() => isDarkRef.current ? 'rgba(120,160,255,0.18)' : 'rgba(80,100,200,0.25)'}
        linkWidth={(link: any) => (link as GraphLink).strength * 2}
        onNodeClick={(node: any) => {
          const clip = clips.find(c => c.id === (node as GraphNode).id)
          if (clip) onNodeClick(clip)
        }}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const n = node as GraphNode & { x: number; y: number }
          const dark = isDarkRef.current
          const isSelected = n.id === selectedIdRef.current
          const hue = domainHue(n.domain)
          const lightness = dark ? 68 : 45
          const color = isSelected ? (dark ? '#ffffff' : '#2d2060') : `hsl(${hue}, 65%, ${lightness}%)`
          const glowOpacity = dark ? (isSelected ? 0.2 : 0.12) : (isSelected ? 0.2 : 0.14)
          const glowColor = isSelected
            ? `rgba(180,160,255,${glowOpacity})`
            : `hsla(${hue}, 65%, ${lightness}%, ${glowOpacity})`
          const r = isSelected ? 7 : 4

          // Gem polygon points (relative, scaled by r)
          // 8-point cut gem: top, upper-r, right, lower-r, bottom, lower-l, left, upper-l
          const GEM = [
            [0, -1.5],
            [0.7, -0.8],
            [1.05, 0],
            [0.7, 0.8],
            [0, 1.5],
            [-0.7, 0.8],
            [-1.05, 0],
            [-0.7, -0.8],
          ]

          function tracePoly(scale: number) {
            ctx.beginPath()
            ctx.moveTo(n.x + GEM[0][0] * r * scale, n.y + GEM[0][1] * r * scale)
            for (let i = 1; i < GEM.length; i++) {
              ctx.lineTo(n.x + GEM[i][0] * r * scale, n.y + GEM[i][1] * r * scale)
            }
            ctx.closePath()
          }

          // Glow halo
          tracePoly(2.8)
          ctx.fillStyle = glowColor
          ctx.fill()

          // Main gem fill
          tracePoly(1)
          ctx.fillStyle = color
          ctx.fill()

          // Upper-left facet highlight — makes it read as a 3D gem
          ctx.beginPath()
          ctx.moveTo(n.x + GEM[0][0] * r, n.y + GEM[0][1] * r)   // top
          ctx.lineTo(n.x + GEM[7][0] * r, n.y + GEM[7][1] * r)   // upper-left
          ctx.lineTo(n.x + GEM[6][0] * r, n.y + GEM[6][1] * r)   // left
          ctx.lineTo(n.x, n.y)                                      // center
          ctx.closePath()
          ctx.fillStyle = 'rgba(255,255,255,0.18)'
          ctx.fill()

          // Upper-right facet (slightly lighter than base, darker than left)
          ctx.beginPath()
          ctx.moveTo(n.x + GEM[0][0] * r, n.y + GEM[0][1] * r)   // top
          ctx.lineTo(n.x + GEM[1][0] * r, n.y + GEM[1][1] * r)   // upper-right
          ctx.lineTo(n.x + GEM[2][0] * r, n.y + GEM[2][1] * r)   // right
          ctx.lineTo(n.x, n.y)                                      // center
          ctx.closePath()
          ctx.fillStyle = 'rgba(255,255,255,0.08)'
          ctx.fill()

          // Label at higher zoom
          if (globalScale >= 1.8) {
            const label = n.title.length > 30 ? n.title.slice(0, 30) + '…' : n.title
            const fontSize = Math.max(8, 11 / globalScale)
            ctx.font = `${fontSize}px system-ui, sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillStyle = dark ? 'rgba(255,255,255,0.7)' : 'rgba(30,30,50,0.7)'
            ctx.fillText(label, n.x, n.y + 1.6 * r + 2 / globalScale)
          }
        }}
        nodeCanvasObjectMode={() => 'replace'}
        cooldownTicks={80}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />

      {/* Starfield overlays the canvas — pointer-events-none so clicks pass through */}
      <Starfield isDark={isDark} />
    </div>
  )
}
