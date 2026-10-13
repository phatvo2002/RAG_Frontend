import type { ReactNode } from 'react';
import type { ChatSource } from '@/api/chat.api';

type Block = { kind: 'paragraph' | 'heading' | 'unordered' | 'ordered' | 'code'; lines: string[]; level?: number };

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  let current: Block | null = null;
  let inCode = false;

  const flush = () => {
    if (current) blocks.push(current);
    current = null;
  };

  for (const line of content.replace(/\r\n/g, '\n').split('\n')) {
    if (line.trim().startsWith('```')) {
      if (inCode) flush();
      else { flush(); current = { kind: 'code', lines: [] }; }
      inCode = !inCode;
      continue;
    }
    if (inCode) { current?.lines.push(line); continue; }
    if (!line.trim()) { flush(); continue; }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flush();
      blocks.push({ kind: 'heading', lines: [heading[2]], level: heading[1].length });
      continue;
    }

    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    const kind = unordered ? 'unordered' : ordered ? 'ordered' : 'paragraph';
    const value = unordered?.[1] ?? ordered?.[1] ?? line;
    if (current?.kind !== kind) { flush(); current = { kind, lines: [] }; }
    current?.lines.push(value);
  }
  flush();
  return blocks;
}

function inlineContent(text: string, sources: ChatSource[], onSource: (index: number) => void): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index} className="font-semibold text-[#102456]">{part.slice(2, -2)}</strong>;
    const citation = part.match(/^\[(\d+)\]$/);
    if (citation && sources[Number(citation[1]) - 1]) {
      const sourceIndex = Number(citation[1]) - 1;
      return <button key={index} type="button" title={sources[sourceIndex].fileName} onClick={() => onSource(sourceIndex)}
        className="mx-0.5 inline-flex rounded border border-[#bcd4ff] bg-[#edf4ff] px-1.5 align-baseline text-[11px] font-semibold text-[#1762f4] hover:bg-[#dbe9ff]">[{citation[1]}]</button>;
    }
    return part;
  });
}

export function ChatAnswerContent({ content, sources, onSource }: { content: string; sources: ChatSource[]; onSource: (index: number) => void }) {
  return <div className="space-y-3 text-[14px] leading-[1.7] text-[#263b63]">
    {parseBlocks(content).map((block, index) => {
      if (block.kind === 'heading') {
        const className = block.level === 1 ? 'text-lg' : 'text-base';
        return <h3 key={index} className={`${className} pt-1 font-bold text-[#102456]`}>{inlineContent(block.lines[0], sources, onSource)}</h3>;
      }
      if (block.kind === 'unordered') return <ul key={index} className="list-disc space-y-1 pl-6">{block.lines.map((line, lineIndex) => <li key={lineIndex}>{inlineContent(line, sources, onSource)}</li>)}</ul>;
      if (block.kind === 'ordered') return <ol key={index} className="list-decimal space-y-1 pl-6">{block.lines.map((line, lineIndex) => <li key={lineIndex}>{inlineContent(line, sources, onSource)}</li>)}</ol>;
      if (block.kind === 'code') return <pre key={index} className="overflow-x-auto rounded-lg bg-[#f4f7fc] p-3 text-xs leading-relaxed text-[#243653]"><code>{block.lines.join('\n')}</code></pre>;
      return <p key={index} className="whitespace-pre-line">{block.lines.map((line, lineIndex) => <span key={lineIndex}>{lineIndex > 0 && <br />}{inlineContent(line, sources, onSource)}</span>)}</p>;
    })}
  </div>;
}
