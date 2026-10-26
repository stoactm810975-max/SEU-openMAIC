"use client";

import React, { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathTextProps {
  text: string;
  className?: string;
  inline?: boolean;
}

/**
 * 自动解析字符串中的 LaTeX 公式并使用 KaTeX 印刷体渲染：
 * - 块级公式：$$ ... $$
 * - 行内公式：$ ... $
 * - 其余文本保持原样
 */
export function MathText({ text, className = "", inline = false }: MathTextProps) {
  const renderedContent = useMemo(() => {
    if (!text) return null;

    // 正则拆分：捕获 $$...$$ 或 $...$
    // (?:\$\$([\s\S]*?)\$\$|\$([^\$\n]+?)\$)
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="my-1.5 block overflow-x-auto text-emerald-200"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={index}>{part}</span>;
        }
      } else if (part.startsWith("$") && part.endsWith("$")) {
        const math = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="inline-block px-0.5 align-baseline text-emerald-300"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={index}>{part}</span>;
        }
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  }, [text]);

  const Tag = inline ? "span" : "div";
  return <Tag className={`leading-relaxed ${className}`}>{renderedContent}</Tag>;
}
