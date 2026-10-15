import Link from "next/link";
import type { FaqBlock } from "@/lib/constants/faqs";

const INLINE_TOKEN = /\[([^\]]+)\]\(([^)]+)\)|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;
const LINK_CLASS = "font-medium text-primary underline-offset-2 hover:underline";

function InlineText({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_TOKEN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));

    const [whole, label, href, email] = match;
    if (email) {
      nodes.push(
        <a key={index} href={`mailto:${email}`} className={LINK_CLASS}>
          {email}
        </a>
      );
    } else if (href.startsWith("/")) {
      nodes.push(
        <Link key={index} href={href} className={LINK_CLASS}>
          {label}
        </Link>
      );
    } else {
      nodes.push(
        <a key={index} href={href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
          {label}
        </a>
      );
    }

    lastIndex = index + whole.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return <>{nodes}</>;
}

export function FaqAnswer({ blocks }: { blocks: FaqBlock[] }) {
  return (
    <>
      {blocks.map((block, index) =>
        "p" in block ? (
          <p key={index}>
            <InlineText text={block.p} />
          </p>
        ) : (
          <ul key={index}>
            {block.ul.map((item) => (
              <li key={item}>
                <InlineText text={item} />
              </li>
            ))}
          </ul>
        )
      )}
    </>
  );
}
