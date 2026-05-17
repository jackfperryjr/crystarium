'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { Clip } from '@/lib/types'
import { domainHue } from '@/lib/utils'

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
  source: string | GraphNode
  target: string | GraphNode
  strength: number
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

function matchesSearch(clip: Clip, query: string): boolean {
  const q = query.toLowerCase()
  if ((clip.title ?? '').toLowerCase().includes(q)) return true
  if ((clip.domain ?? '').toLowerCase().includes(q)) return true
  if (clip.url.toLowerCase().includes(q)) return true
  if (clip.entities) {
    const all = Object.values(clip.entities).flatMap(v => v ?? [])
    if (all.some(v => v.toLowerCase().includes(q))) return true
  }
  return false
}

function linkEndpointId(endpoint: string | GraphNode): string {
  return typeof endpoint === 'object' ? endpoint.id : endpoint
}

const GEM = [
  [0, -1.5], [0.7, -0.8], [1.05, 0], [0.7, 0.8],
  [0, 1.5],  [-0.7, 0.8], [-1.05, 0], [-0.7, -0.8],
]

function nodePhase(id: string): number {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0
  return (Math.abs(h) % 1000) / 1000 * Math.PI * 2
}

interface Props {
  clips: Clip[]
  onNodeClick: (clip: Clip) => void
  onBackgroundClick?: () => void
  selectedId: string | null
  isDark: boolean
  searchQuery: string
  alwaysShowLabels: boolean
  recencyDays: number | null
  edgeThreshold: number
}

export default function KnowledgeGraph({
  clips, onNodeClick, onBackgroundClick, selectedId, isDark,
  searchQuery, alwaysShowLabels, recencyDays, edgeThreshold,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  const selectedIdRef      = useRef(selectedId)
  const isDarkRef          = useRef(isDark)
  const searchQueryRef     = useRef(searchQuery)
  const alwaysShowLabelsRef = useRef(alwaysShowLabels)
  const recencyDaysRef     = useRef(recencyDays)
  const clipMapRef         = useRef(new Map<string, Clip>())
  const neighborMapRef     = useRef(new Map<string, Set<string>>())

  useEffect(() => { selectedIdRef.current = selectedId },         [selectedId])
  useEffect(() => { isDarkRef.current = isDark },                 [isDark])
  useEffect(() => { searchQueryRef.current = searchQuery },       [searchQuery])
  useEffect(() => { alwaysShowLabelsRef.current = alwaysShowLabels }, [alwaysShowLabels])
  useEffect(() => { recencyDaysRef.current = recencyDays },       [recencyDays])
  useEffect(() => {
    clipMapRef.current = new Map(clips.map(c => [c.id, c]))
  }, [clips])

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
    const neighborMap = new Map<string, Set<string>>()

    for (let i = 0; i < clips.length; i++) {
      const a = embeddings[i]
      if (!a) continue
      for (let j = i + 1; j < clips.length; j++) {
        const b = embeddings[j]
        if (!b) continue
        const sim = cosineSimilarity(a, b)
        if (sim >= edgeThreshold) {
          links.push({ source: clips[i].id, target: clips[j].id, strength: sim })
          if (!neighborMap.has(clips[i].id)) neighborMap.set(clips[i].id, new Set())
          if (!neighborMap.has(clips[j].id)) neighborMap.set(clips[j].id, new Set())
          neighborMap.get(clips[i].id)!.add(clips[j].id)
          neighborMap.get(clips[j].id)!.add(clips[i].id)
        }
      }
    }

    neighborMapRef.current = neighborMap
    return { nodes, links }
  }, [clips])

  const darkBg  = 'radial-gradient(ellipse at 28% 28%, rgba(90,45,180,0.14) 0%, transparent 58%), radial-gradient(ellipse at 72% 68%, rgba(20,55,140,0.10) 0%, transparent 52%), radial-gradient(ellipse at 55% 80%, rgba(40,20,100,0.07) 0%, transparent 40%), #07070f'
  const lightBg = 'radial-gradient(ellipse at 28% 28%, rgba(120,125,140,0.13) 0%, transparent 58%), radial-gradient(ellipse at 74% 68%, rgba(100,110,130,0.10) 0%, transparent 52%), radial-gradient(ellipse at 55% 85%, rgba(130,130,145,0.07) 0%, transparent 40%), #f5f4fc'

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <div className="absolute inset-0" style={{ background: isDark ? darkBg : lightBg }} />

      <ForceGraph2D
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeId="id"
        nodeLabel={(node: any) => (node as GraphNode).title}
        linkColor={(link: any) => {
          const l = link as GraphLink
          const dark = isDarkRef.current
          const sel = selectedIdRef.current
          if (sel) {
            const src = linkEndpointId(l.source)
            const tgt = linkEndpointId(l.target)
            if (src === sel || tgt === sel) {
              return dark ? 'rgba(140,170,255,0.40)' : 'rgba(80,100,200,0.50)'
            }
            return dark ? 'rgba(120,160,255,0.04)' : 'rgba(80,100,200,0.05)'
          }
          return dark ? 'rgba(120,160,255,0.18)' : 'rgba(80,100,200,0.25)'
        }}
        linkWidth={(link: any) => {
          const l = link as GraphLink
          const sel = selectedIdRef.current
          if (sel) {
            const src = linkEndpointId(l.source)
            const tgt = linkEndpointId(l.target)
            if (src === sel || tgt === sel) return l.strength * 2.5
            return 0.2
          }
          return l.strength * 2
        }}
        autoPauseRedraw={false}
        onNodeClick={(node: any) => {
          const clip = clips.find(c => c.id === (node as GraphNode).id)
          if (clip) onNodeClick(clip)
        }}
        onBackgroundClick={onBackgroundClick}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const n = node as GraphNode & { x: number; y: number }
          const dark = isDarkRef.current
          const isSelected = n.id === selectedIdRef.current
          const clip = clipMapRef.current.get(n.id)
          const hue = domainHue(n.domain)
          const lightnessBase = dark ? 68 : 45
          const r = isSelected ? 7 : 4

          // Determine if node passes all active filters
          let active = true

          if (searchQueryRef.current && clip) {
            active = matchesSearch(clip, searchQueryRef.current)
          }

          if (active && recencyDaysRef.current && clip) {
            const cutoff = Date.now() - recencyDaysRef.current * 24 * 60 * 60 * 1000
            active = new Date(clip.created_at).getTime() >= cutoff
          }

          const sel = selectedIdRef.current
          if (active && sel && sel !== n.id) {
            const neighbors = neighborMapRef.current.get(sel)
            active = neighbors?.has(n.id) ?? false
          }

          function tracePoly(scale: number) {
            ctx.beginPath()
            ctx.moveTo(n.x + GEM[0][0] * r * scale, n.y + GEM[0][1] * r * scale)
            for (let i = 1; i < GEM.length; i++) {
              ctx.lineTo(n.x + GEM[i][0] * r * scale, n.y + GEM[i][1] * r * scale)
            }
            ctx.closePath()
          }

          if (!active) {
            tracePoly(1)
            ctx.fillStyle = dark
              ? `hsla(${hue}, 20%, 60%, 0.08)`
              : `hsla(${hue}, 20%, 50%, 0.12)`
            ctx.fill()
            return
          }

          const twinkle = (Math.sin(Date.now() / 2200 + nodePhase(n.id)) + 1) / 2
          const lightness = Math.round(lightnessBase + twinkle * (dark ? 14 : 10))
          const color = isSelected
            ? (dark ? '#ffffff' : '#2d2060')
            : `hsl(${hue}, 65%, ${lightness}%)`
          const glowOpacityBase = dark
            ? (isSelected ? 0.2 : 0.12)
            : (isSelected ? 0.2 : 0.14)
          const glowOpacity = glowOpacityBase * (0.7 + twinkle * 0.3)
          const glowScale = 2.4 + twinkle * 0.8

          const glowColor = isSelected
            ? `rgba(180,160,255,${glowOpacity})`
            : `hsla(${hue}, 65%, ${lightness}%, ${glowOpacity})`

          tracePoly(glowScale)
          ctx.fillStyle = glowColor
          ctx.fill()

          tracePoly(1)
          ctx.fillStyle = color
          ctx.fill()

          ctx.beginPath()
          ctx.moveTo(n.x + GEM[0][0] * r, n.y + GEM[0][1] * r)
          ctx.lineTo(n.x + GEM[7][0] * r, n.y + GEM[7][1] * r)
          ctx.lineTo(n.x + GEM[6][0] * r, n.y + GEM[6][1] * r)
          ctx.lineTo(n.x, n.y)
          ctx.closePath()
          ctx.fillStyle = 'rgba(255,255,255,0.18)'
          ctx.fill()

          ctx.beginPath()
          ctx.moveTo(n.x + GEM[0][0] * r, n.y + GEM[0][1] * r)
          ctx.lineTo(n.x + GEM[1][0] * r, n.y + GEM[1][1] * r)
          ctx.lineTo(n.x + GEM[2][0] * r, n.y + GEM[2][1] * r)
          ctx.lineTo(n.x, n.y)
          ctx.closePath()
          ctx.fillStyle = 'rgba(255,255,255,0.08)'
          ctx.fill()

          if (alwaysShowLabelsRef.current || globalScale >= 1.8) {
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

      <Starfield isDark={isDark} />
    </div>
  )
}
