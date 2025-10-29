// src/safety.js
function norm(s='') {
  return s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}\s]/gu, '');
}
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function includesAny(text, list){
  const t = ' ' + norm(text) + ' ';
  return list.some(k => t.includes(' ' + norm(k) + ' '));
}

// Respuestas sugerentes (sin detalle explícito)
const RESP = {
  ANAL: [
    'esa parte no forma de mis encuentros, corazón. me manejo en modalidad “convencional / onda novios”: caricias, besos y todo con protección.',
    'no hago esa parte, soy más de “onda novios” corazon: hablar y conocernos un poco, mimos, abrazos. Y en lo intimo, todo con protección.',
    'prefiero mantenerlo en lo convencional y cariñoso corazon. si querés, igual vemos que día y horario podes venir.'
  ],
  ORAL: [
    'no doy detalles explicitos por acá; mantengo un perfil discreto. la modalidad es “convencional / onda novios”, besos con buena higiene y todo con protección. lo explícito va dentro del VIP.',
    'no entro en detalles tan profundos corazon; la onda es íntima y cuidada dentro de lo convencional. lo explícito va por VIP.',
    'prefiero hablar en términos de cercanía y cuidado, nada explicito. para contenido explícito, lo tengo en el VIP.'
  ],
  POSITIONS: [
    'no uso nombres ni posiciones; prefiero clima cariñoso y convencional, poses libres sin llegar a probar mi 🌼, siempre con protección. lo explícito está en el VIP.',
    'no me manejo con etiquetas; busco conexión real y respeto. el contenido más fuerte está en el VIP.',
    'soy de “onda novios”, sin practicas más allá de lo convencional. para explícito, VIP. ¿miramos turnos?',
    'mi 🌼 y mi * , no los podes probar, luego podemos hacer las poses que quieras. lo demás es VIP.'
  ],
  UNSAFE: [
    'no, siempre con protección y buena higiene, corazón. si te sirve igual, vemos horarios.',
    'sin protección no hago; me cuido mucho y a mis clientes tambien. mantenemos modalidad cuidada y seguimos con mi disponibilidad si querés.',
    'siempre con protección, sin excepciones. ¿coordinamos día y horario?',
    'soy una chica muy segura e higienica corazon, no acepto ofertas de ningun tipo para no usar proteccion, queres verme igual?',
    'la pasamos rico aun con proteccion corazon, mi linda carita te lo garantiza, cuando queres venir?'
  ],
  // contenido explícito que se deriva a VIP
  LESBIAN: [
    'el contenido lesbico esta incluido en el VIP corazon si pagas desde el link de MP.',
    'lo lésbico con mis amigas lo tengo en el VIP corazon, no lo detallo por chat por precaucion. Te paso el link?',
    'eso lo manejo en VIP, donde está el contenido fuerte y explicito corazon. Queres el link de pago?'
  ],
  GROUP: [
    'los grupales / trios /  es contenido explícito y va por VIP corazon, queres que te pase el link de pago?.',
    'eso esta en VIP, donde tengo el material fuerte y rico. Te paso el link de pago corazon?',
    'lo grupal no lo detallo por aqui; si querés verlo, esta en el VIP. Con el link de pago una vez que abonas te lleva directo al grupo VIP'
  ],
  MASTURBATION: [
    'ese contenido explícito va dentro del VIP corazon. acá mantengo perfil bajo. Queres el link para verme?',
    'eso lo manejo en VIP corazon, no en este chat. Queres el link del vip?',
    'contenido explícito (así) lo tengo en VIP corazon. Te paso el link de pago?'
  ],
  TOYS: [
    'el contenido con juguetes está en el VIP, corazon. Queres que te pase el link de pago?',
    'eso lo manejo en VIP porque es bien explícito y rico. Te paso link de pago?',
    'para ese tipo de material, VIP corazon. Queres el link de pago?'
  ],
  PORN: [
    'el contenido fuerte (fotos/videos) está dentro del VIP corazon. Queres el link?',
    'eso va por VIP corazon, no se detalla en este chat. Te paso el link asi podes ver queres?',
    'para explícito fuerte y rico, VIP. Pedime el link y te lo paso corazon.'
  ],
  EXPLICIT_GENERIC: [
    'lo explícito lo manejo en el VIP, no en este chat corazon.',
    'si buscás explícito fuerte, eso es en el VIP.',
    'para ese tipo de cosas, VIP corazon.'
  ],
  GENERIC: [
    'prefiero mantenerlo íntimo y discreto, sin detalles explicitos. mi modalidad es “convencional / onda novios”, todo con protección.',
    'no doy descripciones explícitas. si te interesa el encuentro, avanzamos con algo cuidado y convencional.',
    'mantengo perfil bajo: cercanía, mimos y respeto. ¿querés ver horarios?'
  ]
};

// Palabras clave
const KW = {
  ANAL: ['anal','doble anal','a2','doble penetracion','penetracion doble','dp','culo'],
  ORAL: [
    'oral','sexo oral','chupar','chupon','chupones',
    'chuparla','mamada','lamer','lamida','conchita','chupada'
  ],
  POSITIONS: ['69','sesenta y nueve','posicion','posición','doggy','perrito'],
  UNSAFE: [
    'sin prote','sin proteccion','sin protección','a pelo',
    'sin globito','sin condon','sin condón','natural','oral sin','oral natural', 'sin forro'
  ],
  LESBIAN: ['lesbico','lésbico','lesbiana','lesbi','sexo entre chicas','chica con chica'],
  GROUP: ['orgia','orgía','grupal','fiesta','gang','gangbang','múltiples','trio','trío'],
  MASTURBATION: ['masturbar','masturbacion','masturbación','paja','haciendo paja','tocar','tocarte','autosatisfaccion'],
  TOYS: ['juguete','juguetes','vibrador','dildo','satisfyer','plug'],
  PORN: ['porno','xxx','video xxx','hard','contenido fuerte','porno duro','hardcore']
};

const EXTRA_EXPLICIT = [
  'pija','poronga','pene','concha','coger','quiero coger','garchar','quiero garchar','culiar','quiero culiar','acabada','acabada adentro','acabarte'
];

export function checkExplicitQuestion(text){
  const t = norm(text);

  if (includesAny(t, KW.UNSAFE))     return { kind:'UNSAFE',          reply: pick(RESP.UNSAFE) };
  if (includesAny(t, KW.ANAL))       return { kind:'ANAL',            reply: pick(RESP.ANAL) };
  if (includesAny(t, KW.ORAL))       return { kind:'ORAL',            reply: pick(RESP.ORAL) };
  if (includesAny(t, KW.POSITIONS))  return { kind:'POSITIONS',       reply: pick(RESP.POSITIONS) };

  if (includesAny(t, KW.LESBIAN))    return { kind:'LESBIAN',         reply: pick(RESP.LESBIAN) };
  if (includesAny(t, KW.GROUP))      return { kind:'GROUP',           reply: pick(RESP.GROUP) };
  if (includesAny(t, KW.MASTURBATION))return { kind:'MASTURBATION',   reply: pick(RESP.MASTURBATION) };
  if (includesAny(t, KW.TOYS))       return { kind:'TOYS',            reply: pick(RESP.TOINGS) }; // FIX TYP
  if (includesAny(t, KW.PORN))       return { kind:'PORN',            reply: pick(RESP.PORN) };

  if (includesAny(t, EXTRA_EXPLICIT)) return { kind:'EXPLICIT_GENERIC', reply: pick(RESP.EXPLICIT_GENERIC) };

  if (/\b(tragar|creampie)\b/.test(t)) return { kind:'GENERIC', reply: pick(RESP.GENERIC) };

  return null;
}
