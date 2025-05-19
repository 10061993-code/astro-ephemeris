import sys
import json
import swisseph as swe
import pytz
from datetime import datetime

if len(sys.argv) != 6:
    print("Usage: calculate_houses.py <date> <time> <latitude> <longitude> <timezone>")
    sys.exit(1)

date_str = sys.argv[1]
time_str = sys.argv[2]
latitude = float(sys.argv[3])
longitude = float(sys.argv[4])
timezone_str = sys.argv[5]

local = pytz.timezone(timezone_str)
dt_local = local.localize(datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M"))
dt_utc = dt_local.astimezone(pytz.utc)

jd = swe.julday(dt_utc.year, dt_utc.month, dt_utc.day, dt_utc.hour + dt_utc.minute / 60)

# ✅ Hier ist der korrigierte Teil:
cusps, ascmc = swe.houses(jd, latitude, longitude, b'P')
asc = ascmc[0]
mc = ascmc[1]

result = {
    "ascendant": asc,
    "midheaven": mc,
    "houses": {f"house_{i+1}": cusps[i] for i in range(12)}
}

print(json.dumps(result))
