import type { SourceCandidate, SourceType } from '../types/source';

// ── EventLike（既存の Event 型と共用可能な最小インターフェース）────────────
export interface EventLike {
  id?: string | number;
  title: string;
  year?: number | null;
  category?: string;
  upper_category?: string;
  mid_category?: string;
  region_tags?: string[];
}

// ── アーカイブ定義 ────────────────────────────────────────────────────────
interface ArchiveDef {
  id: string;
  name: string;
  urlFn: (q: string) => string;
  sourceType: SourceType;
  note: string;
}

const ARCHIVES: Record<string, ArchiveDef> = {
  cia: {
    id: 'cia',
    name: 'CIA Reading Room',
    urlFn: (q) => `https://www.cia.gov/readingroom/search/site/${encodeURIComponent(q)}`,
    sourceType: 'primary',
    note: '機密解除文書。諜報・外交・冷戦関連に強い。',
  },
  frus: {
    id: 'frus',
    name: 'FRUS（米国外交文書）',
    urlFn: (q) => `https://history.state.gov/historicaldocuments/search?q=${encodeURIComponent(q)}`,
    sourceType: 'primary',
    note: '米国務省発行の外交電報・会議録。1861年〜。',
  },
  jacar: {
    id: 'jacar',
    name: 'JACAR（アジア歴史資料センター）',
    urlFn: (q) =>
      `https://www.jacar.archives.go.jp/das/meta/listPhoto?keyword=${encodeURIComponent(q)}&LANG=default`,
    sourceType: 'primary',
    note: '日本の公文書。明治〜昭和期の外交・軍事・行政。',
  },
  archives_go_jp: {
    id: 'archives_go_jp',
    name: '国立公文書館デジタルアーカイブ',
    urlFn: (q) =>
      `https://www.digital.archives.go.jp/DAS/meta/listPhoto?KEYWORD=${encodeURIComponent(q)}&LANG=default`,
    sourceType: 'primary',
    note: '江戸時代以降の日本の国家文書。',
  },
  ndl: {
    id: 'ndl',
    name: '国立国会図書館デジタルコレクション',
    urlFn: (q) => `https://dl.ndl.go.jp/simple/result?keyword=${encodeURIComponent(q)}`,
    sourceType: 'secondary',
    note: '書籍・雑誌・新聞。近代デジタルライブラリー含む。',
  },
  wilson: {
    id: 'wilson',
    name: 'Wilson Center Digital Archive',
    urlFn: (q) =>
      `https://digitalarchive.wilsoncenter.org/search?query=${encodeURIComponent(q)}`,
    sourceType: 'primary',
    note: '冷戦期の東側諸国文書を含む国際文書アーカイブ。',
  },
  nara: {
    id: 'nara',
    name: 'NARA（米国国立公文書館）',
    urlFn: (q) =>
      `https://catalog.archives.gov/search?q=${encodeURIComponent(q)}&resultTypes=item`,
    sourceType: 'primary',
    note: '米国連邦政府文書。軍事・外交・行政全般。',
  },
  un: {
    id: 'un',
    name: '国連公式文書システム',
    urlFn: (q) =>
      `https://documents.un.org/prod/ods.nsf/home.xsp?query=${encodeURIComponent(q)}`,
    sourceType: 'primary',
    note: '国連決議・報告書・会議録。',
  },
  avalon: {
    id: 'avalon',
    name: 'Avalon Project（Yale Law）',
    urlFn: (_q) => `https://avalon.law.yale.edu/`,
    sourceType: 'primary',
    note: '条約・外交協定・歴史的法文書。検索は手動。',
  },
  mofa: {
    id: 'mofa',
    name: '外務省外交史料館',
    urlFn: (_q) => `https://www.mofa.go.jp/mofaj/annai/honsho/shiryo/`,
    sourceType: 'primary',
    note: '日本の外交文書。条約・外交電報の一次資料。',
  },
  iaea: {
    id: 'iaea',
    name: 'IAEA Document System',
    urlFn: (q) => `https://www.iaea.org/search?q=${encodeURIComponent(q)}`,
    sourceType: 'primary',
    note: '核・原子力に関する国際機関文書。',
  },
  worldbank: {
    id: 'worldbank',
    name: 'World Bank Open Data',
    urlFn: (q) => `https://data.worldbank.org/indicator?q=${encodeURIComponent(q)}`,
    sourceType: 'primary',
    note: '経済統計・開発データ。数値根拠の確認に。',
  },
  cdli: {
    id: 'cdli', name: 'CDLI（楔形文字デジタルライブラリー）',
    urlFn: (q) => `https://cdli.mpiwg-berlin.mpg.de/search?q=${encodeURIComponent(q)}`,
    sourceType: 'primary' as const,
    note: '楔形文字資料。シュメール・バビロニア・アッシリア文書。',
  },
  british_museum: {
    id: 'british_museum', name: '大英博物館コレクション',
    urlFn: (q) => `https://www.britishmuseum.org/collection?q=${encodeURIComponent(q)}`,
    sourceType: 'primary' as const,
    note: '古代中東・エジプト・地中海の実物資料。',
  },
  jstor: {
    id: 'jstor', name: 'JSTOR',
    urlFn: (q) => `https://www.jstor.org/action/doBasicSearch?Query=${encodeURIComponent(q)}`,
    sourceType: 'secondary' as const,
    note: '査読論文・学術誌。古代史・考古学の二次資料。',
  },
  wayback: {
    id: 'wayback',
    name: 'Wayback Machine（Internet Archive）',
    urlFn: (q) => `https://web.archive.org/web/*/${q}`,
    sourceType: 'secondary',
    note: 'URL無効化・削除済みページの代替資料。',
  },
};

// ── 検索語生成 ────────────────────────────────────────────────────────────
export function generateSearchTerms(event: EventLike): string[] {
  const { title, year, upper_category, mid_category, region_tags } = event;
  const cleaned = title.replace(/[。、「」『』【】〔〕（）・]/g, ' ').trim();
  const terms: string[] = [cleaned];

  if (year) terms.push(`${year} ${cleaned}`);
  if (upper_category) terms.push(upper_category);
  if (mid_category && mid_category !== upper_category) terms.push(mid_category);
  if (region_tags?.length) terms.push(`${region_tags[0]} ${cleaned}`);

  return [...new Set(terms)].filter(Boolean);
}

// ── アーカイブ選定ルール ──────────────────────────────────────────────────
function selectArchiveIds(event: EventLike): string[] {
  const ids = new Set<string>();
  const rawYear = event.year;
  const year = rawYear === null || rawYear === undefined ? null : Number(rawYear);
  const full = [
    event.title,
    event.upper_category ?? '',
    event.mid_category ?? '',
    event.category ?? '',
    ...(event.region_tags ?? []),
  ].join(' ');

  // 年代ベース
  if (year !== null && year < 0) {
    ids.add('cdli'); ids.add('british_museum');
    ids.add('jstor'); ids.add('ndl'); ids.add('avalon');
  } else if (year !== null && year < 1868) {
    ids.add('ndl'); ids.add('avalon'); ids.add('jstor');
    if (/日本|江戸|室町|鎌倉|平安|奈良|飛鳥/.test(full)) ids.add('archives_go_jp');
  } else if (year !== null && year < 1945) {
    ids.add('jacar'); ids.add('archives_go_jp'); ids.add('ndl'); ids.add('frus');
  } else if (year !== null && year <= 1991) {
    ids.add('frus'); ids.add('cia'); ids.add('wilson'); ids.add('nara');
  } else if (year !== null) {
    ids.add('frus'); ids.add('un'); ids.add('ndl');
  } else {
    ids.add('ndl'); ids.add('jstor'); ids.add('frus');
  }

  // カテゴリーベース
  if (/諜報|スパイ|情報機関|CIA|KGB|MI[56]|NSA|モサド/.test(full)) {
    ids.add('cia'); ids.add('wilson');
  }
  if (/外交|条約|協定|会談|会議|交渉/.test(full)) {
    ids.add('frus'); ids.add('avalon');
  }
  if (/軍事|戦争|作戦|軍|紛争|戦闘/.test(full)) {
    ids.add('nara'); ids.add('frus');
  }
  if (/冷戦|鉄のカーテン|ベルリン/.test(full)) {
    ids.add('cia'); ids.add('wilson');
  }
  if (/ソ連|共産党|コミンテルン/.test(full)) {
    ids.add('wilson'); ids.add('cia');
  }
  if (/国際連合|安保理|UNESCO|WHO|ILO/.test(full)) {
    ids.add('un');
  }
  if (/核|原子力|IAEA|NPT|核拡散/.test(full)) {
    ids.add('iaea'); ids.add('cia');
  }
  if (/日本|Japan|大日本帝国|帝国議会|外務省/.test(full)) {
    ids.add('jacar'); ids.add('archives_go_jp'); ids.add('ndl'); ids.add('mofa');
  }
  if (/経済|金融|為替|通貨|貿易|GDP/.test(full)) {
    ids.add('worldbank');
  }

  return [...ids];
}

// ── 候補生成（メイン公開関数）────────────────────────────────────────────
export function generateSourceCandidates(event: EventLike): SourceCandidate[] {
  const terms = generateSearchTerms(event);
  const archiveIds = selectArchiveIds(event);
  const primaryQuery = terms[0] ?? event.title;
  const candidates: SourceCandidate[] = [];
  const rawYear = event.year;
  const year = rawYear === null || rawYear === undefined ? null : Number(rawYear);

  for (const archiveId of archiveIds) {
    const archive = ARCHIVES[archiveId];
    if (!archive) continue;
    candidates.push({
      id: `${archiveId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      archiveId: archive.id,
      archiveName: archive.name,
      url: archive.urlFn(primaryQuery),
      query: primaryQuery,
      sourceType: archive.sourceType,
      note: archive.note,
      urlStatus: 'unchecked',
    });
  }

  // Wayback：1990年以降、またはyear不明のみ追加（古代史には不要）
  if (year === null || year > 1990) {
    candidates.push({
      id: `wayback-${Date.now()}`,
      archiveId: 'wayback',
      archiveName: ARCHIVES.wayback.name,
      url: ARCHIVES.wayback.urlFn(
        `https://ja.wikipedia.org/wiki/${encodeURIComponent(event.title)}`
      ),
      query: event.title,
      sourceType: 'secondary',
      note: ARCHIVES.wayback.note,
      urlStatus: 'unchecked',
    });
  }

  return candidates;
}
