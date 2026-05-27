# origin-chronicle — CLAUDE.md

## プロジェクト概要
歴史年代DBアプリ。事件・制度・思想の一次資料を収集・整理・考察するためのリサーチツール。

- **フレームワーク**: React 19 + TypeScript + Vite
- **ルーティング**: react-router-dom v7
- **スタイル**: App.css（CSS変数ベースのダークテーマ）
- **データ**: `src/data/events.json`（静的JSON）
- **GitHub**: https://github.com/Tao0817/origin-chronicle

## 開発サーバー
```bash
npm run dev        # http://localhost:5173
npm run build      # TypeScriptチェック + Viteビルド
```

## ディレクトリ構成
```
src/
  context/
    AppContext.tsx        # グローバル選択状態（selectedEvent）
  data/
    events.json          # 全イベントデータ
  screens/
    Timeline/            # 年表（メイン画面）
    PrimarySources/      # 一次資料画面 ✅実装済み
    ExternalSearch/      # 外部探索画面 🔲未実装
    ResourceInbox/       # 資料インボックス画面 🔲未実装
    DiscoveryNotes/      # 発見メモ画面 🔲未実装
    Analysis/            # 推察・考察画面 🔲未実装
  types/
    index.ts             # 型定義（Category, TimelineEvent, PrimarySource 等）
  App.tsx                # ルーティング + AppContextProvider
  App.css                # 全スタイル（CSS変数）
```

## データ構造

### TimelineEvent
```typescript
{
  id: string;
  year: number;               // BC はマイナス整数
  title: string;
  category: Category;
  region: "world" | "japan";
  japan_connection: boolean;
  summary: string;
  primary_sources: PrimarySource[];
  discovery_notes: string[];
  analysis: EventAnalysis;
}
```

### PrimarySource
```typescript
{
  title: string;
  url: string;
  publisher: string;          // 発行元・所蔵元
  source_type: string;        // 議事録 / 白書 / 条約 / 報告書 / 新聞 / 統計
  created_year: number | null;
  published_year: number | string | null;  // "不明" も可
  related_timeline: string;
  related_event: string;
}
```

### カテゴリ（Category）
- 軍事・戦争
- 思想・宗教・結社
- 帝国・植民地・資源
- 金融・通貨・制度
- 国際機関・諜報・政策ネットワーク

## グローバル状態
`AppContext`（`src/context/AppContext.tsx`）が `selectedEvent` を管理。
- Timeline でイベントをクリック → `setSelectedEvent` で更新
- PrimarySource など他画面から `useAppContext()` で参照可能

---

## 作業ログ

### 2026-05-24
**完了:**
- `events.json` を68件→302件に大幅拡充
  - 軍事・戦争: 60件（古代〜現代、Wikipediaから取得）
  - 思想・宗教・結社: 82件
  - 帝国・植民地・資源: 60件
  - 金融・通貨・制度: 51件（古代貨幣・中央銀行・国際通貨制度など）
  - 国際機関・諜報・政策ネットワーク: 49件
- 年表画面: 3カラムグリッドレイアウト、カテゴリフィルター、日本接続トグル実装
- 一次資料画面（`PrimarySources`）実装完了
  - 未選択時: 「年表からイベントを選んでください」エンプティステート
  - 選択時: イベントヘッダー + 資料カード一覧
  - 資料カード: 種別バッジ（色分け）・外部リンク・発行元・作成年・公開年・関連年表・関連イベント
- `AppContext.tsx` 新規作成（グローバル選択状態管理）
- サンプルデータ: 1973年「第一次石油危機」に一次資料2件追加
  - 第71回国会 石油問題に関する特別委員会 会議録（議事録）
  - エネルギー白書 1974年版（白書）

**次の作業:**
- 外部探索画面（`ExternalSearch`）
  - カテゴリごとに探索先リンクを切り替える
  - 探索方法5種: 年代範囲・組織名・語句・人物名・統計変化
- 資料インボックス画面（`ResourceInbox`）
- 発見メモ画面（`DiscoveryNotes`）
- 推察・考察画面（`Analysis`）

### 完了（追加分）
- 外部探索画面（`ExternalSearch`）実装完了
  - カテゴリー別探索先リンク自動切り替え
  - 5タブ：年代範囲・組織名・資料内語句・人物名・統計変化
  - コピー用クエリ自動生成
  - 年代範囲前後10年自動設定

### 現在の実装状況
| 画面 | 状態 |
|------|------|
| 年表 | ✅ 完成 |
| 一次資料 | ✅ 完成 |
| 外部探索 | ✅ 完成 |
| 資料インボックス | ✅ 完成 |
| 発見メモ | ✅ 完成 |
| 推察・考察 | ✅ 完成 |

### GitHub
https://github.com/Tao0817/origin-chronicle
events.json 302件

---

## 2026-05-24 最終記録

### 完了（全6画面）
- 年表 ✅
- 一次資料 ✅
- 外部探索 ✅
- 資料インボックス ✅
- 発見メモ ✅
- 推察・考察 ✅

### 次回
- 6画面の動作確認（localhost:5173）
- GitHub push
- 資料インボックス・発見メモ・推察考察の
  動作チェックと修正

---

## 2026-05-25 作業記録

### 完了
- 全6画面の動作確認
- 資料インボックスの動作確認・修正
- GitHub push完了

### 現状
- 年表：302件・3カラム ✅
- 一次資料：✅
- 外部探索：✅
- 資料インボックス：✅
- 発見メモ：✅
- 推察・考察：✅

---

## 2026-05-27 作業記録

### 完了
- Electron導入・ファイルIO永続化完了
- concurrently設定済み（npm start で一発起動）
- 全6画面動作確認済み
- GitHub push済み

### 起動方法
```bash
npm run start    # Vite + Electron 同時起動
```
またはデスクトップの「年代史DB」ショートカットをダブルクリック

### データ保存
- 保存先: `D:\origin-chronicle\data\`
- Electron環境: ファイルIO（JSON）
- ブラウザ環境: localStorage（フォールバック）

---

## 2026-05-28 作業記録

### 完了
- concurrently設定（npm start で一発起動）
- 発見メモUI改善
- 中世・近世データ拡充（+68件）
- データ総件数：370件

### 年代分布
| 年代 | 件数 |
|------|------|
| 古代(~500) | 72件 |
| 中世(501-1500) | 55件 |
| 近世(1501-1800) | 51件 |
| 近現代(1801~) | 192件 |
| **合計** | **370件** |

### 起動方法
```bash
npm start
```
