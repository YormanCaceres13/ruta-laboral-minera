"use client";

import Image from "next/image";
import type { NewsPost } from "./news.data";
import { motion } from "framer-motion";
import { Download, ExternalLink, FileText } from "lucide-react";

const tagPill: Record<string, string> = {
  Aviso: "bg-[#fff4e8] text-[#b85e00] ring-1 ring-[#ffd9ad]",
  Seguridad: "bg-[#edf6fa] text-[#0e5a79] ring-1 ring-[#c8e3ee]",
  CV: "bg-[#eef4f8] text-[#173b5d] ring-1 ring-[#d6e4ec]",
  Proceso: "bg-[#f3f6f8] text-[#0e2840] ring-1 ring-[#dce5ec]",
  Evento: "bg-[#fff4e8] text-[#b85e00] ring-1 ring-[#ffd9ad]",
};

function isDownloadFile(url: string) {
  return (
    url.endsWith(".pdf") ||
    url.endsWith(".doc") ||
    url.endsWith(".docx") ||
    url.endsWith(".xls") ||
    url.endsWith(".xlsx") ||
    url.endsWith(".ppt") ||
    url.endsWith(".pptx")
  );
}

export function NewsCard({ post }: { post: NewsPost }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-[#dce5ec] bg-white shadow-[0_14px_42px_rgba(14,40,64,0.07)] transition-all duration-300 hover:border-[#f47c00]/35 hover:shadow-[0_20px_58px_rgba(14,40,64,0.12)]"
    >
      <div className="relative h-44 w-full overflow-hidden bg-[#edf2f5]">
        {post.cover ? (
          <Image
            src={post.cover}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[#8796aa]">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3 text-xs text-[#7a8999]">
          <span
            className={[
              "rounded-full px-3 py-1 font-black tracking-wide",
              tagPill[post.tag] ?? "bg-[#f3f6f8] text-[#0e2840] ring-1 ring-[#dce5ec]",
            ].join(" ")}
          >
            {post.tag}
          </span>
          <span className="whitespace-nowrap font-medium">{post.dateLabel}</span>
        </div>

        <h3 className="mt-3 text-lg font-black leading-snug tracking-tight text-[#0e2840]">
          {post.title}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#5d6b7a]">
          {post.excerpt}
        </p>

        {post.attachments?.length ? (
          <div className="mt-5 space-y-3">
            <div className="text-xs font-black uppercase tracking-wide text-[#7a8999]">
              Recursos
            </div>

            <div className="space-y-2">
              {post.attachments.map((a) => {
                const isDownload = isDownloadFile(a.url);

                return (
                  <a
                    key={a.url}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group/item flex items-center justify-between gap-3 rounded-xl border border-[#dce5ec] bg-[#f8fafb] px-4 py-2 text-sm font-bold text-[#0e2840] transition hover:border-[#f47c00]/35 hover:bg-white"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-[#f47c00]" />
                      <span className="truncate">{a.label}</span>
                    </div>

                    {isDownload ? (
                      <Download className="h-4 w-4 shrink-0 text-[#8796aa] transition group-hover/item:text-[#0e2840]" />
                    ) : (
                      <ExternalLink className="h-4 w-4 shrink-0 text-[#8796aa] transition group-hover/item:text-[#0e2840]" />
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}
