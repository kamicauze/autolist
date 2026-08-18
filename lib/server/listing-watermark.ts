const AUTOLIST_WORDMARK_PATHS = `
  <path data-letter="A" d="M0 64 20 0h16l20 64H42l-4-14H18l-4 14Zm22-26h12l-6-21Z" fill="currentColor" fill-rule="evenodd"/>
  <path data-letter="U" d="M68 0h14v40c0 8 4 12 12 12s12-4 12-12V0h14v41c0 15-10 23-26 23S68 56 68 41Z" fill="currentColor"/>
  <path data-letter="T" d="M132 0h54v13h-20v51h-14V13h-20Z" fill="currentColor"/>
  <path data-letter="O" d="m212 0h28l14 14v36l-14 14h-28l-14-14V14Zm4 13-4 4v30l4 4h20l4-4V17l-4-4Z" fill="currentColor" fill-rule="evenodd"/>
  <path data-letter="L" d="M266 0h14v51h34v13h-48Z" fill="#FA2529"/>
  <path data-letter="I" d="M326 0h14v64h-14Z" fill="#FA2529"/>
  <path data-letter="S" d="m366 0h36v13h-32l-4 4v7l4 4h20l14 14v8l-14 14h-38V51h34l4-4v-3l-4-4h-20l-14-14V14Z" fill="#FA2529"/>
  <path data-letter="T" d="M416 0h54v13h-20v51h-14V13h-20Z" fill="#FA2529"/>
`;

export function buildListingWatermarkSvgMarkup(width: number, height: number) {
  const markWidth = Math.max(72, Math.round(width * 0.24));
  const markHeight = Math.round(markWidth * (64 / 470));
  const markX = Math.round((width - markWidth) / 2);
  const markY = Math.round((height - markHeight) / 2);

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <symbol id="autolist-wordmark" data-brand="autolist-wordmark" viewBox="0 0 470 64">
          ${AUTOLIST_WORDMARK_PATHS}
        </symbol>
      </defs>
      <use
        id="autolist-watermark"
        data-watermark-layer="center"
        href="#autolist-wordmark"
        x="${markX}"
        y="${markY}"
        width="${markWidth}"
        height="${markHeight}"
        color="#ffffff"
        opacity="0.16"
      />
    </svg>
  `;
}
