const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\enzog\\projects\\assados-vaguinho\\cliente-web\\public\\products';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

function makeSvg(title, bgGradient, iconSvg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        ${bgGradient}
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.6" />
      </filter>
    </defs>
    <rect width="800" height="600" fill="url(#bg)" />
    <g filter="url(#shadow)">
      ${iconSvg}
    </g>
    <rect x="0" y="500" width="800" height="100" fill="rgba(0,0,0,0.7)" />
    <text x="400" y="560" font-family="sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="middle" letter-spacing="1">
      ${title.toUpperCase()}
    </text>
  </svg>`;
}

const svgs = {
  'maionese_branca.svg': makeSvg('Maionese Tradicional', 
    '<stop offset="0%" stop-color="#27272a"/><stop offset="100%" stop-color="#09090b"/>',
    `<ellipse cx="400" cy="310" rx="240" ry="120" fill="#18181b" stroke="#3f3f46" stroke-width="8" />
     <ellipse cx="400" cy="280" rx="210" ry="95" fill="#ffffff" />
     <ellipse cx="380" cy="265" rx="150" ry="60" fill="#fafafa" />
     <path d="M390,230 Q410,210 400,190 Q390,210 390,230 Z" fill="#16a34a" />`),

  'marmita_pote.svg': makeSvg('Marmita da Casa (~600g)',
    '<stop offset="0%" stop-color="#27272a"/><stop offset="100%" stop-color="#09090b"/>',
    `<circle cx="400" cy="280" r="190" fill="#ffffff" stroke="#e4e4e7" stroke-width="14" />
     <path d="M 210,280 A 190,190 0 0,1 400,90 L 400,280 Z" fill="#ea580c" />
     <path d="M 400,90 A 190,190 0 0,1 590,280 L 400,280 Z" fill="#d97706" />
     <path d="M 400,280 A 190,190 0 0,1 210,280 Z" fill="#f5f5f4" />
     <rect x="340" y="230" width="130" height="60" rx="14" fill="#78350f" stroke="#b45309" stroke-width="4" />`),

  'coca_cola_2l.svg': makeSvg('Coca-Cola 2 Litros',
    '<stop offset="0%" stop-color="#450a0a"/><stop offset="100%" stop-color="#09090b"/>',
    `<rect x="340" y="100" width="120" height="340" rx="40" fill="#180808" stroke="#dc2626" stroke-width="4" />
     <rect x="340" y="200" width="120" height="100" fill="#dc2626" />
     <text x="400" y="260" font-family="sans-serif" font-weight="900" font-size="24" fill="#ffffff" text-anchor="middle">Coca-Cola 2L</text>
     <rect x="380" y="70" width="40" height="30" fill="#dc2626" rx="5" />`),

  'guarana_2l.svg': makeSvg('Guaraná Antarctica 2 Litros',
    '<stop offset="0%" stop-color="#064e3b"/><stop offset="100%" stop-color="#09090b"/>',
    `<rect x="340" y="100" width="120" height="340" rx="40" fill="#047857" stroke="#10b981" stroke-width="4" />
     <rect x="340" y="200" width="120" height="100" fill="#059669" />
     <text x="400" y="260" font-family="sans-serif" font-weight="900" font-size="20" fill="#ffffff" text-anchor="middle">Guaraná 2L</text>
     <rect x="380" y="70" width="40" height="30" fill="#dc2626" rx="5" />`),

  'agua_mineral.svg': makeSvg('Água Mineral 500ml',
    '<stop offset="0%" stop-color="#0c4a6e"/><stop offset="100%" stop-color="#09090b"/>',
    `<rect x="350" y="120" width="100" height="300" rx="30" fill="#e0f2fe" stroke="#38bdf8" stroke-width="6" />
     <rect x="350" y="220" width="100" height="70" fill="#0284c7" />
     <text x="400" y="262" font-family="sans-serif" font-weight="bold" font-size="16" fill="#ffffff" text-anchor="middle">Água 500ml</text>
     <rect x="380" y="90" width="40" height="30" fill="#0284c7" rx="5" />`),

  'meio_frango.svg': makeSvg('Meio Frango Assado',
    '<stop offset="0%" stop-color="#7c2d12"/><stop offset="100%" stop-color="#09090b"/>',
    `<path d="M 230,360 C 230,160 400,140 400,360 Z" fill="#ea580c" stroke="#f97316" stroke-width="8" />
     <line x1="400" y1="140" x2="400" y2="360" stroke="#ffffff" stroke-width="10" stroke-dasharray="12 6" />
     <text x="320" y="280" font-family="sans-serif" font-weight="bold" font-size="20" fill="#fff">CORTE ½</text>`),

  'espetinho_coracao.svg': makeSvg('Espetinho de Coração',
    '<stop offset="0%" stop-color="#450a0a"/><stop offset="100%" stop-color="#09090b"/>',
    `<line x1="200" y1="400" x2="600" y2="160" stroke="#d97706" stroke-width="8" stroke-linecap="round" />
     <circle cx="300" cy="340" r="32" fill="#881337" stroke="#4c0519" stroke-width="4" />
     <circle cx="370" cy="300" r="32" fill="#881337" stroke="#4c0519" stroke-width="4" />
     <circle cx="440" cy="260" r="32" fill="#881337" stroke="#4c0519" stroke-width="4" />
     <circle cx="510" cy="220" r="32" fill="#881337" stroke="#4c0519" stroke-width="4" />`),

  'medalhao_frango_bacon.svg': makeSvg('Medalhão de Frango c/ Bacon',
    '<stop offset="0%" stop-color="#78350f"/><stop offset="100%" stop-color="#09090b"/>',
    `<line x1="200" y1="400" x2="600" y2="160" stroke="#d97706" stroke-width="8" stroke-linecap="round" />
     <rect x="270" y="310" width="64" height="64" rx="20" fill="#fef08a" stroke="#9f1239" stroke-width="10" />
     <rect x="350" y="260" width="64" height="64" rx="20" fill="#fef08a" stroke="#9f1239" stroke-width="10" />
     <rect x="430" y="210" width="64" height="64" rx="20" fill="#fef08a" stroke="#9f1239" stroke-width="10" />`),

  'medalhao_porco_bacon.svg': makeSvg('Medalhão de Porco c/ Bacon',
    '<stop offset="0%" stop-color="#831843"/><stop offset="100%" stop-color="#09090b"/>',
    `<line x1="200" y1="400" x2="600" y2="160" stroke="#d97706" stroke-width="8" stroke-linecap="round" />
     <rect x="270" y="310" width="64" height="64" rx="20" fill="#fbcfe8" stroke="#9f1239" stroke-width="10" />
     <rect x="350" y="260" width="64" height="64" rx="20" fill="#fbcfe8" stroke="#9f1239" stroke-width="10" />
     <rect x="430" y="210" width="64" height="64" rx="20" fill="#fbcfe8" stroke="#9f1239" stroke-width="10" />`),

  'risoto_frango.svg': makeSvg('Risoto de Frango',
    '<stop offset="0%" stop-color="#7c2d12"/><stop offset="100%" stop-color="#09090b"/>',
    `<ellipse cx="400" cy="300" rx="220" ry="110" fill="#ea580c" stroke="#c2410c" stroke-width="6" />
     <path d="M250,280 Q300,260 350,290 M400,270 Q450,300 500,275 M320,310 Q380,320 440,300" stroke="#ffffff" stroke-width="8" stroke-linecap="round" fill="none" />`),

  'maionese_verde.svg': makeSvg('Maionese Verde',
    '<stop offset="0%" stop-color="#064e3b"/><stop offset="100%" stop-color="#09090b"/>',
    `<ellipse cx="400" cy="300" rx="220" ry="100" fill="#15803d" stroke="#166534" stroke-width="6" />
     <circle cx="350" cy="280" r="5" fill="#052e16" />
     <circle cx="420" cy="310" r="6" fill="#052e16" />
     <circle cx="460" cy="270" r="5" fill="#052e16" />`),

  'nhoque.svg': makeSvg('Nhoque Receita Dona Isa',
    '<stop offset="0%" stop-color="#7f1d1d"/><stop offset="100%" stop-color="#09090b"/>',
    `<rect x="300" y="220" width="55" height="42" rx="12" fill="#fef08a" stroke="#ca8a04" stroke-width="4" />
     <rect x="370" y="210" width="55" height="42" rx="12" fill="#fef08a" stroke="#ca8a04" stroke-width="4" />
     <rect x="440" y="230" width="55" height="42" rx="12" fill="#fef08a" stroke="#ca8a04" stroke-width="4" />
     <rect x="330" y="280" width="55" height="42" rx="12" fill="#fef08a" stroke="#ca8a04" stroke-width="4" />
     <rect x="410" y="270" width="55" height="42" rx="12" fill="#fef08a" stroke="#ca8a04" stroke-width="4" />
     <path d="M240,200 C300,360 500,360 560,200" stroke="#dc2626" stroke-width="32" stroke-linecap="round" fill="none" opacity="0.8" />`),

  'macarronese.svg': makeSvg('Macarronese Especial',
    '<stop offset="0%" stop-color="#1c1917"/><stop offset="100%" stop-color="#09090b"/>',
    `<ellipse cx="400" cy="300" rx="220" ry="100" fill="#f5f5f4" stroke="#e7e5e4" stroke-width="6" />
     <path d="M300,280 C320,250 360,250 380,280 M420,270 C440,240 480,240 500,270" stroke="#fde047" stroke-width="18" stroke-linecap="round" fill="none" />`),

  'batata_rodela.svg': makeSvg('Batata Frita Rodela',
    '<stop offset="0%" stop-color="#78350f"/><stop offset="100%" stop-color="#09090b"/>',
    `<circle cx="320" cy="280" r="55" fill="#eab308" stroke="#ca8a04" stroke-width="6" />
     <circle cx="400" cy="260" r="60" fill="#eab308" stroke="#ca8a04" stroke-width="6" />
     <circle cx="470" cy="290" r="55" fill="#eab308" stroke="#ca8a04" stroke-width="6" />`),

  'banana_frita.svg': makeSvg('Banana Frita ao Leite',
    '<stop offset="0%" stop-color="#713f12"/><stop offset="100%" stop-color="#09090b"/>',
    `<ellipse cx="330" cy="280" rx="75" ry="38" fill="#d97706" stroke="#78350f" stroke-width="6" />
     <ellipse cx="450" cy="290" rx="75" ry="38" fill="#d97706" stroke="#78350f" stroke-width="6" />`),

  'salada_tomate_cebola.svg': makeSvg('Salada de Tomate c/ Cebola',
    '<stop offset="0%" stop-color="#7f1d1d"/><stop offset="100%" stop-color="#09090b"/>',
    `<circle cx="330" cy="280" r="60" fill="#dc2626" stroke="#991b1b" stroke-width="6" />
     <circle cx="450" cy="280" r="60" fill="#dc2626" stroke="#991b1b" stroke-width="6" />
     <path d="M270,270 Q330,230 390,270 M390,290 Q450,240 510,290" stroke="#ffffff" stroke-width="10" fill="none" />`),

  'salada_vagem.svg': makeSvg('Salada de Vagem',
    '<stop offset="0%" stop-color="#14532d"/><stop offset="100%" stop-color="#09090b"/>',
    `<line x1="240" y1="250" x2="560" y2="270" stroke="#16a34a" stroke-width="20" stroke-linecap="round" />
     <line x1="260" y1="300" x2="540" y2="310" stroke="#16a34a" stroke-width="20" stroke-linecap="round" />`),

  'salada_feijao.svg': makeSvg('Salada de Feijão Cavalo',
    '<stop offset="0%" stop-color="#451a03"/><stop offset="100%" stop-color="#09090b"/>',
    `<ellipse cx="320" cy="270" rx="28" ry="18" fill="#78350f" />
     <ellipse cx="380" cy="290" rx="28" ry="18" fill="#78350f" />
     <ellipse cx="440" cy="260" rx="28" ry="18" fill="#78350f" />
     <ellipse cx="490" cy="300" rx="28" ry="18" fill="#78350f" stroke="#16a34a" stroke-width="4" />`),

  'salada_repolho.svg': makeSvg('Salada de Repolho Cozido',
    '<stop offset="0%" stop-color="#14532d"/><stop offset="100%" stop-color="#09090b"/>',
    `<path d="M270,300 C310,230 490,230 530,300 C490,340 310,340 270,300 Z" fill="#4ade80" fill-opacity="0.8" stroke="#166534" stroke-width="8" />`),

  'carne_bovina.svg': makeSvg('Carne Bovina na Brasa',
    '<stop offset="0%" stop-color="#450a0a"/><stop offset="100%" stop-color="#09090b"/>',
    `<rect x="240" y="190" width="320" height="190" rx="32" fill="#7f1d1d" stroke="#b91c1c" stroke-width="10" />
     <line x1="280" y1="210" x2="520" y2="360" stroke="#18181b" stroke-width="12" opacity="0.6" />
     <line x1="320" y1="190" x2="550" y2="320" stroke="#18181b" stroke-width="12" opacity="0.6" />`)
};

for (const key in svgs) {
  const filePath = path.join(dir, key);
  fs.writeFileSync(filePath, svgs[key]);
  console.log('Gerado:', key);
}
