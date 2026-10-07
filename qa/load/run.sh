#!/usr/bin/env bash
# Run one load scenario with every guard on.
#   QA_ALLOW_PRODUCTION=yes-owner-approved ./load/run.sh A|B|C|D|E|F1|F2|F4|F5 [extra k6 args]
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
S="${1:?scenario: A|B|C|D|E|F1|F2|F4|F5}"; shift || true

REF=$(echo "$QA_SUPABASE_URL" | sed -E 's#https://([^.]+)\..*#\1#')
echo "TARGET supabase=$QA_SUPABASE_URL app=${QA_APP_URL:-https://4-prep-ai2.vercel.app} ref=$REF"
if [ "$REF" = "pubhgajlqhdbpwqahtki" ]; then
  echo "        *** PRODUCTION *** (owner-approved 2026-10-07)"
  [ "${QA_ALLOW_PRODUCTION:-}" = "yes-owner-approved" ] || { echo "Refusing: set QA_ALLOW_PRODUCTION=yes-owner-approved"; exit 3; }
fi
# The network must resolve the project normally (see results/step0-network.json).
curl -sS -o /dev/null -m 10 -H "apikey: $QA_SUPABASE_ANON_KEY" "$QA_SUPABASE_URL/rest/v1/sources?select=id&limit=1" \
  || { echo "Supabase unreachable from this machine — run from a network where it resolves normally."; exit 4; }

case "$S" in
  A) FILE=A_baseline.js ;; B) FILE=B_stress.js ;; C) FILE=C_spike.js ;; D) FILE=D_soak.js ;; E) FILE=E_writes.js ;;
  F1|F2|F4|F5) FILE=F_ai.js; export QA_F_STEP="$S" ;;
  *) echo "unknown scenario $S"; exit 2 ;;
esac

LEDGER=.state/ai-ledger.json
if [ "$S" = F4 ] || [ "$S" = F5 ]; then
  USED=$(node -e "try{console.log(require('./$LEDGER').calls)}catch{console.log(0)}")
  export QA_AI_REMAINING=$(( 300 - USED ))
  echo "AI budget: $USED used, $QA_AI_REMAINING remaining"
  [ "$QA_AI_REMAINING" -gt 0 ] || { echo "AI cap reached — skipping $S"; exit 0; }
fi
export QA_RUN_ID="$(date +%s)"

mkdir -p results/ledger
k6 run --log-format raw --summary-export "results/$S.json" --console-output "results/ledger/$S.jsonl" \
  --out "csv=results/$S.timeseries.csv.gz" \
  -e "QA_SUPABASE_URL=$QA_SUPABASE_URL" -e "QA_SUPABASE_ANON_KEY=$QA_SUPABASE_ANON_KEY" \
  -e "QA_APP_URL=${QA_APP_URL:-https://4-prep-ai2.vercel.app}" -e "QA_RUN_ID=$QA_RUN_ID" \
  -e "QA_F_STEP=${QA_F_STEP:-}" -e "QA_AI_REMAINING=${QA_AI_REMAINING:-0}" \
  -e "QA_EGRESS_GB=${QA_EGRESS_GB:-}" -e "QA_MAX_VUS=${QA_MAX_VUS:-1500}" -e "QA_SPIKE_VUS=${QA_SPIKE_VUS:-100}" \
  -e "QA_SOAK_MIN=${QA_SOAK_MIN:-60}" -e "QA_SOAK_VUS=${QA_SOAK_VUS:-100}" \
  -e "QA_BASELINE_CATALOGUE_P95=${QA_BASELINE_CATALOGUE_P95:-2500}" \
  "$@" "load/$FILE" &
K6=$!
node --env-file=.env load/watchdog.mjs "$K6" "$S" &
WD=$!
set +e; wait "$K6"; CODE=$?; set -e
kill "$WD" 2>/dev/null || true

if [ "$S" = F4 ] || [ "$S" = F5 ]; then
  node -e "
    const fs=require('fs');const p='$LEDGER';
    const l=fs.existsSync(p)?JSON.parse(fs.readFileSync(p)):{calls:0,estUsd:0,entries:[]};
    const n=fs.readFileSync('results/ledger/$S.jsonl','utf8').split('\n').filter(x=>x.includes('\"op\":\"ai_live\"')).length;
    l.calls+=n;l.estUsd=Math.round((l.estUsd+n*0.0075)*1e4)/1e4;l.entries.push({at:new Date().toISOString(),purpose:'$S',calls:n});
    fs.writeFileSync(p,JSON.stringify(l,null,2));console.log('AI ledger now',l.calls,'calls, est \$'+l.estUsd)"
fi
echo "k6 exit $CODE (99 = threshold abort). Raw results: results/$S.json"
exit "$CODE"
