#!/usr/bin/env bash
# Step 0: one anonymous catalogue request, measured on the wire and decompressed.
# Mirrors catalogueSelect in app/src/data/repository.ts (copied, not imported).
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
: "${QA_SUPABASE_URL:?}" "${QA_SUPABASE_ANON_KEY:?}"

echo "TARGET  supabase=${QA_SUPABASE_URL}  (PRODUCTION — owner-approved 2026-10-07)"

SELECT='id,name,city,state,country,flag,tagline,description,photo_seed,highlights,source_id,university_facts(kind,value,numeric_value,currency,amount_period,source_id,unknown_reason,suggested_action),requirements(kind,value,numeric_value,benchmark,source_id,unknown_reason,suggested_action),university_scorecard_programs(cip_code,credential_level,credential_title,title,source_id),university_scholarships(scholarships(id,name,amount_value,amount_numeric,currency,amount_period,amount_source_id,amount_unknown_reason,amount_suggested_action,award_conditions(kind,minimum,published_text,source_id))),rankings(id,label,rank_display,year,source_id),campuses(id,name,city,country,source_id)'
ENC=$(python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1],safe=",()"))' "$SELECT")
TMP=$(mktemp)

measure() { # name url
  curl -s -o "$TMP" --compressed -H "apikey: $QA_SUPABASE_ANON_KEY" -H "Authorization: Bearer $QA_SUPABASE_ANON_KEY" \
    -H 'Accept-Encoding: gzip, br' -w '%{http_code} %{size_download} %{time_starttransfer} %{time_total}' "$2"
}

read -r CODE WIRE TTFB TOTAL < <(measure catalogue "$QA_SUPABASE_URL/rest/v1/universities?select=$ENC&order=name")
RAW=$(wc -c < "$TMP" | tr -d ' ')
COUNTS=$(python3 -c '
import json,sys; d=json.load(open(sys.argv[1]))
print(json.dumps({"universities":len(d),"facts":sum(len(u["university_facts"]) for u in d),
 "requirements":sum(len(u["requirements"]) for u in d),"programs":sum(len(u["university_scorecard_programs"]) for u in d)}))' "$TMP")
read -r SCODE SWIRE STTFB STOTAL < <(measure sources "$QA_SUPABASE_URL/rest/v1/sources?select=id,name,url,retrieved_at,verification&order=id")
SRAW=$(wc -c < "$TMP" | tr -d ' ')
rm -f "$TMP"

mkdir -p results
cat > results/step0.json <<JSON
{"measuredAt":"$(date -u +%FT%TZ)","catalogue":{"status":$CODE,"wireBytes":$WIRE,"rawBytes":$RAW,"ttfbS":$TTFB,"totalS":$TOTAL,"rows":$COUNTS},
 "sources":{"status":$SCODE,"wireBytes":$SWIRE,"rawBytes":$SRAW,"totalS":$STOTAL}}
JSON
cat results/step0.json
