#!/usr/bin/env python3
import json, re, subprocess, sys, time
from pathlib import Path

REPO_ROOT   = Path(__file__).resolve().parent.parent
EVENTS_PATH = REPO_ROOT / "src" / "data" / "events.json"
BATCH_SIZE  = 30

def calc_time_layer(year):
    if year <= 1400: return "基層"
    if year <= 1600: return "接続形成層"
    if year <= 1800: return "制度化層"
    if year <= 1900: return "世界接続層"
    if year <= 1990: return "現代秩序層"
    return "デジタル・金融層"

SYSTEM = (
    "JSONのみ返せ。説明・マークダウン不要。\n\n"
    "upper_category（7種から1つ）:\n"
    "- 基層・正統性\n- 結社・非公式ネットワーク\n- 国家・戦争・国際秩序\n"
    "- 通商・資金・企業・資源\n- 知識・政策・情報・技術\n- 社会・人口・環境\n"
    "- 法人制度・公益・政治接続\n\n"
    "mid_category（28種から1つ、upper_categoryと整合）:\n"
    "基層・正統性 -> 宗教制度・宗派・神学 / 王権・帝国・正統性 / 思想・正統性・政治運動 / 法制度・法思想・司法 / 教育・学問・知識伝達\n"
    "結社・非公式ネットワーク -> 秘儀・宗教兄弟団・修道会・騎士団 / ギルド・商人結社・都市ネットワーク / 友愛結社・秘密結社・政治結社 / 地下組織・反社・犯罪シンジケート\n"
    "国家・戦争・国際秩序 -> 国家・外交・条約・国際秩序 / 軍事・戦争・安全保障・軍産複合体 / 諜報・治安・秘密工作 / 国際機関・条約体制・標準化機関\n"
    "通商・資金・企業・資源 -> 通商・特権会社・植民地会社 / 金融・銀行・貨幣・決済システム / 財団・助成・資金ネットワーク / 財閥・企業集団・国有資本 / 資源・エネルギー・食料ネットワーク / 医療・製薬・公衆衛生ネットワーク / 犯罪経済・麻薬・マネーロンダリング\n"
    "知識・政策・情報・技術 -> 政策ネットワーク・シンクタンク / メディア・広告・通信・世論形成 / 技術・通信・デジタル覇権\n"
    "社会・人口・環境 -> 移民・人口・労働・ディアスポラ / NGO・人権・民主化支援 / 環境・気候・人口・食料危機\n"
    "法人制度・公益・政治接続 -> 宗教法人・公益法人・資金政治接続\n\n"
    "region_tags（複数可、以下の値のみ）:\n"
    '"中東" "地中海" "東アジア" "南アジア" "東南アジア" "中央アジア"\n'
    '"欧州" "北アフリカ" "サブサハラアフリカ" "北米" "中南米" "オセアニア" "日本" "全世界"\n\n'
    '出力形式: [{"id":"...","upper_category":"...","mid_category":"...","region_tags":["..."]}]'
)


CLAUDE_CMD = r"C:\Users\PC_User\AppData\Roaming\npm\claude.cmd"


def classify_batch(batch):
    input_data = [
        {
            "id":       e["id"],
            "year":     e.get("year", 0),
            "title":    e.get("title", ""),
            "category": e.get("category", ""),
            "summary":  (e.get("summary") or "")[:200],
        }
        for e in batch
    ]
    full_prompt = (
        SYSTEM
        + "\n\n以下の" + str(len(batch)) + "件を分類:\n"
        + json.dumps(input_data, ensure_ascii=False)
    )

    # stdin 経由で渡す（コマンドライン長制限・エンコード問題を回避）
    result = subprocess.run(
        [CLAUDE_CMD, "-p"],
        input=full_prompt.encode("utf-8"),
        capture_output=True,
        timeout=180,
    )
    if result.returncode != 0:
        raise RuntimeError("claude exit " + str(result.returncode) + ": " + result.stderr[:200].decode("utf-8", errors="replace"))

    raw = result.stdout.decode("utf-8", errors="replace").strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw.strip())
    m = re.search(r"\[\s*\{[\s\S]*\}\s*\]", raw)
    if not m:
        raise ValueError("JSONArray not found:\n" + raw[:300])
    return json.loads(m.group(0))


def run(events, label=""):
    total = len(events)
    id2i  = {e["id"]: i for i, e in enumerate(events)}
    done = err = skip = 0

    for i in range(0, total, BATCH_SIZE):
        batch = events[i: i + BATCH_SIZE]
        end   = min(i + BATCH_SIZE, total)
        bn    = i // BATCH_SIZE + 1
        print("[%s] batch%2d (%3d-%3d) ..." % (label, bn, i + 1, end), end=" ", flush=True)

        try:
            results = classify_batch(batch)
            for cls in results:
                idx = id2i.get(cls.get("id"))
                if idx is None:
                    skip += 1
                    continue
                events[idx]["time_layer"]     = calc_time_layer(events[idx].get("year", 0))
                events[idx]["upper_category"] = cls.get("upper_category", "")
                events[idx]["mid_category"]   = cls.get("mid_category", "")
                rt = cls.get("region_tags", [])
                events[idx]["region_tags"]    = rt if isinstance(rt, list) else []
                done += 1
            miss = len(batch) - len(results)
            if miss > 0:
                skip += miss
            print("OK +%d" % len(results))
        except Exception as ex:
            err += len(batch)
            print("ERROR: " + str(ex)[:120])

        if end < total:
            time.sleep(0.5)

    return done, err, skip


def main():
    trial_only = "--trial" in sys.argv

    print("[READ] " + str(EVENTS_PATH))
    with open(EVENTS_PATH, encoding="utf-8") as f:
        events = json.load(f)
    print("  %d events loaded\n" % len(events))

    if trial_only:
        trial = events[:BATCH_SIZE]
        done, err, skip = run(trial, label="TRIAL")
        print("\n--- TRIAL result --- done=%d err=%d skip=%d" % (done, err, skip))
        print("--- sample 3 ---")
        for e in trial[:3]:
            print("  " + e["id"])
            print("    time_layer    : " + str(e.get("time_layer")))
            print("    upper_category: " + str(e.get("upper_category")))
            print("    mid_category  : " + str(e.get("mid_category")))
            print("    region_tags   : " + str(e.get("region_tags")))
        return

    total = len(events)
    done, err, skip = run(events, label="FULL")

    print("\n[SAVE] " + str(EVENTS_PATH))
    with open(EVENTS_PATH, "w", encoding="utf-8") as f:
        json.dump(events, f, ensure_ascii=False, indent=2)
    print("  saved")
    print("=" * 50)
    print("  done : %d / %d" % (done, total))
    print("  err  : %d" % err)
    print("  skip : %d" % skip)
    print("=" * 50)


if __name__ == "__main__":
    main()
