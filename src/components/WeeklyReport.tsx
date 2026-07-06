import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { showToast } from './Toast'
import * as api from '../api/client'

const mdComponents = {
  h1({ children }: { children: React.ReactNode }) {
    return <h1 className="text-xl font-bold text-slate-800 mb-3 mt-4 first:mt-0">{children}</h1>
  },
  h2({ children }: { children: React.ReactNode }) {
    return <h2 className="text-base font-bold text-slate-700 mb-2 mt-4 border-b border-slate-200 pb-1">{children}</h2>
  },
  h3({ children }: { children: React.ReactNode }) {
    return <h3 className="text-sm font-semibold text-slate-700 mb-1.5 mt-3">{children}</h3>
  },
  p({ children }: { children: React.ReactNode }) {
    return <p className="text-sm text-slate-600 leading-relaxed mb-2 last:mb-0">{children}</p>
  },
  ul({ children }: { children: React.ReactNode }) {
    return <ul className="list-disc pl-5 my-2 space-y-1 text-sm text-slate-600">{children}</ul>
  },
  ol({ children }: { children: React.ReactNode }) {
    return <ol className="list-decimal pl-5 my-2 space-y-1 text-sm text-slate-600">{children}</ol>
  },
  strong({ children }: { children: React.ReactNode }) {
    return <strong className="font-semibold text-slate-800">{children}</strong>
  },
  blockquote({ children }: { children: React.ReactNode }) {
    return <blockquote className="border-l-3 border-blue-300 pl-3 py-0.5 my-2 text-sm text-slate-500 italic">{children}</blockquote>
  },
  code({ children }: { children: React.ReactNode }) {
    return <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs text-indigo-600 font-mono">{children}</code>
  },
  table({ children }: { children: React.ReactNode }) {
    return <table className="w-full border-collapse my-3 text-sm text-slate-600">{children}</table>
  },
  thead({ children }: { children: React.ReactNode }) {
    return <thead className="bg-slate-50">{children}</thead>
  },
  th({ children }: { children: React.ReactNode }) {
    return <th className="border border-slate-300 px-3 py-1.5 text-left font-semibold text-slate-700">{children}</th>
  },
  td({ children }: { children: React.ReactNode }) {
    return <td className="border border-slate-300 px-3 py-1.5">{children}</td>
  },
}

/** Escape HTML special characters */
function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Apply inline markdown formatting (bold, italic, code) to a single line */
function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:#f4f4f4;padding:2px 4px;border-radius:3px">$1</code>')
}

/** Convert markdown to basic HTML for Word export */
function markdownToSimpleHtml(md: string): string {
  const lines = md.split('\n')
  const result: string[] = []
  let inTable = false
  let inCodeBlock = false
  let tableHeaderRendered = false
  let inUnorderedList = false
  let inOrderedList = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code block fence
    if (line.trimStart().startsWith('```')) {
      if (inTable) { result.push('</table>'); inTable = false; tableHeaderRendered = false }
      if (inUnorderedList) { result.push('</ul>'); inUnorderedList = false }
      if (inOrderedList) { result.push('</ol>'); inOrderedList = false }
      if (inCodeBlock) {
        result.push('</code></pre>')
        inCodeBlock = false
      } else {
        result.push('<pre><code>')
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      result.push(escapeHtml(line))
      continue
    }

    // Table
    const trimmedLine = line.trim()
    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
      if (inUnorderedList) { result.push('</ul>'); inUnorderedList = false }
      if (inOrderedList) { result.push('</ol>'); inOrderedList = false }
      if (!inTable) {
        result.push('<table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;width:100%;margin:8px 0">')
        inTable = true
        tableHeaderRendered = false
      }
      // Skip alignment separator row
      if (/^\|[\s\-:]+\|[\s\-:]+\|$/.test(trimmedLine)) continue
      const cells = trimmedLine.split('|').slice(1, -1)
      const tag = tableHeaderRendered ? 'td' : 'th'
      tableHeaderRendered = true
      result.push('<tr>' + cells.map(c => `<${tag} style="padding:4px 8px;border:1px solid #999">${inlineFormat(c.trim())}</${tag}>`).join('') + '</tr>')
      continue
    }
    if (inTable) {
      result.push('</table>')
      inTable = false
      tableHeaderRendered = false
    }

    // Close lists on non-list lines
    if (inUnorderedList && !/^[\s]*[-*+]\s/.test(line)) {
      result.push('</ul>')
      inUnorderedList = false
    }
    if (inOrderedList && !/^[\s]*\d+\.\s/.test(line)) {
      result.push('</ol>')
      inOrderedList = false
    }

    // Horizontal rule
    if (/^[-*_]{3,}\s*$/.test(trimmedLine)) {
      result.push('<hr>')
      continue
    }

    // Headings
    if (line.startsWith('### ')) {
      result.push(`<h3 style="font-size:14pt;color:#333;margin:10px 0 4px">${inlineFormat(line.slice(4))}</h3>`)
      continue
    }
    if (line.startsWith('## ')) {
      result.push(`<h2 style="font-size:16pt;color:#222;margin:14px 0 6px;border-bottom:1px solid #ccc;padding-bottom:4px">${inlineFormat(line.slice(3))}</h2>`)
      continue
    }
    if (line.startsWith('# ')) {
      result.push(`<h1 style="font-size:20pt;color:#111;margin:16px 0 8px">${inlineFormat(line.slice(2))}</h1>`)
      continue
    }

    // Unordered list
    if (/^[\s]*[-*+]\s/.test(line)) {
      if (!inUnorderedList) { result.push('<ul style="margin:4px 0;padding-left:24px">'); inUnorderedList = true }
      result.push(`<li style="margin-bottom:4px">${inlineFormat(line.replace(/^[\s]*[-*+]\s/, ''))}</li>`)
      continue
    }

    // Ordered list
    if (/^[\s]*\d+\.\s/.test(line)) {
      if (!inOrderedList) { result.push('<ol style="margin:4px 0;padding-left:24px">'); inOrderedList = true }
      result.push(`<li style="margin-bottom:4px">${inlineFormat(line.replace(/^[\s]*\d+\.\s/, ''))}</li>`)
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      result.push(`<blockquote style="border-left:3px solid #99c;padding-left:12px;color:#555;margin:8px 0">${inlineFormat(line.slice(2))}</blockquote>`)
      continue
    }

    // Empty line
    if (trimmedLine === '') {
      result.push('<br>')
      continue
    }

    // Paragraph
    result.push(`<p style="margin:4px 0;font-size:12pt">${inlineFormat(line)}</p>`)
  }

  if (inTable) result.push('</table>')
  if (inCodeBlock) result.push('</code></pre>')
  if (inUnorderedList) result.push('</ul>')
  if (inOrderedList) result.push('</ol>')

  return result.join('\n')
}

interface Props {
  onClose: () => void
}

export function WeeklyReport({ onClose }: Props) {
  const [report, setReport] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.generateWeeklyReport()
      setReport(result.report)
      setGeneratedAt(new Date().toLocaleString('zh-CN'))
      showToast('周报生成成功')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '生成周报失败'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCopy = useCallback(async () => {
    if (!report) return
    try {
      await navigator.clipboard.writeText(report)
      showToast('周报已复制到剪贴板')
    } catch {
      showToast('复制失败，请手动复制', 'error')
    }
  }, [report])

  const handleExportPdf = useCallback(() => {
    if (!report) return
    const title = 'AI 健康检查周报'
    const timestamp = generatedAt || new Date().toLocaleString('zh-CN')
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page { margin: 2cm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      color: #1a1a1a;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    h1 { text-align: center; font-size: 22pt; margin-bottom: 4px; }
    h2 { font-size: 16pt; color: #222; margin: 20px 0 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
    h3 { font-size: 13pt; color: #333; margin: 14px 0 4px; }
    p { margin: 6px 0; font-size: 12pt; }
    ul, ol { padding-left: 24px; }
    li { margin-bottom: 4px; font-size: 12pt; }
    strong { color: #1a1a1a; }
    table { border-collapse: collapse; width: 100%; margin: 12px 0; }
    th, td { border: 1px solid #666; padding: 6px 10px; text-align: left; font-size: 11pt; }
    th { background: #f0f0f0; font-weight: bold; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: "SF Mono", monospace; font-size: 10pt; }
    pre { background: #f7f7f7; padding: 12px; border-radius: 6px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 3px solid #88b; padding-left: 12px; color: #555; margin: 10px 0; }
    .timestamp { text-align: center; color: #888; font-size: 10pt; margin-bottom: 24px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="timestamp">生成时间：${timestamp}</p>
  ${markdownToSimpleHtml(report)}
</body>
</html>`

    const w = window.open('', '_blank', 'width=900,height=700')
    if (!w) {
      showToast('请允许浏览器弹窗以导出 PDF', 'error')
      return
    }
    w.document.write(htmlContent)
    w.document.close()
    w.focus()
    // Wait for content to render, then trigger print
    w.onload = () => {
      setTimeout(() => {
        w.print()
      }, 300)
    }
    // If onload already fired (cached), trigger immediately
    if (w.document.readyState === 'complete') {
      setTimeout(() => {
        w.print()
      }, 300)
    }
  }, [report, generatedAt])

  const handleExportWord = useCallback(() => {
    if (!report) return
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><title>AI 健康检查周报</title></head>
      <body style="font-family:system-ui,sans-serif;padding:20px;color:#000">
        <h1 style="text-align:center;font-size:22pt;margin-bottom:4px">AI 健康检查周报</h1>
        ${generatedAt ? `<p style="text-align:center;color:#666;font-size:10pt;margin-bottom:20px">生成时间：${generatedAt}</p>` : ''}
        ${markdownToSimpleHtml(report)}
      </body></html>`

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AI健康检查周报_${new Date().toISOString().slice(0, 10)}.doc`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Word 文档已下载')
  }, [report, generatedAt])

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">AI 健康检查周报</h2>
          <p className="text-[10px] text-slate-400">
            {generatedAt ? `生成时间：${generatedAt}` : '基于规则引擎检查结果，由 AI 自动生成'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {report && (
            <>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                复制
              </button>
              <button
                onClick={handleExportPdf}
                title="通过浏览器打印为 PDF"
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="12" y1="12" x2="12" y2="18" />
                  <polyline points="9,15 12,18 15,15" />
                </svg>
                导出 PDF
              </button>
              <button
                onClick={handleExportWord}
                title="下载为 Word 文档"
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                导出 Word
              </button>
            </>
          )}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                生成中...
              </>
            ) : report ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="23,4 23,10 17,10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                重新生成
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
                </svg>
                生成周报
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={handleGenerate} className="px-4 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600">
              重试
            </button>
          </div>
        ) : report ? (
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-sm prose-slate max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {report}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600 mb-1">AI 健康检查周报</p>
              <p className="text-xs text-slate-400 max-w-xs">
                点击上方"生成周报"按钮，AI 将基于规则引擎检查结果自动生成一份结构化的中文周报
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
