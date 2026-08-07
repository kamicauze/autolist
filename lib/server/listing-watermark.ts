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
  const tileWidth = Math.max(260, Math.round(width / 3));
  const tileHeight = Math.max(150, Math.round(height / 3));
  const patternMarkWidth = Math.round(tileWidth * 0.72);
  const patternMarkHeight = Math.round(patternMarkWidth * (64 / 470));

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <symbol id="autolist-wordmark" data-brand="autolist-wordmark" viewBox="0 0 470 64">
          ${AUTOLIST_WORDMARK_PATHS}
        </symbol>
        <pattern id="autolist-watermark" width="${tileWidth}" height="${tileHeight}" patternUnits="userSpaceOnUse">
          <g
            data-watermark-layer="pattern"
            transform="translate(${Math.round(tileWidth * 0.5)} ${Math.round(tileHeight * 0.5)}) rotate(-24)"
            opacity="0.34"
          >
            <use
              href="#autolist-wordmark"
              x="${Math.round(patternMarkWidth / -2)}"
              y="${Math.round(patternMarkHeight / -2)}"
              width="${patternMarkWidth}"
              height="${patternMarkHeight}"
              color="#ffffff"
              stroke="#000000"
              stroke-opacity="0.2"
              stroke-width="2"
              paint-order="stroke fill"
            />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#autolist-watermark)" />
    </svg>
  `;
}
