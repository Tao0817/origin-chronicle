import type { ConfidenceLevel } from "../../types";

const LEVELS: ConfidenceLevel[] = ["事実", "分析", "推察", "考察", "未確認", "反対材料"];

export function Analysis() {
  return (
    <div className="screen-placeholder">
      <h2>推察・考察</h2>
      <div className="level-legend">
        {LEVELS.map((l) => (
          <span key={l} className={`level-badge level-${l}`}>{l}</span>
        ))}
      </div>
      <p>事実・分析・推察・考察・未確認・反対材料を分けて整理します。</p>
    </div>
  );
}
