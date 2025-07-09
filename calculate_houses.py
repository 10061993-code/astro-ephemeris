import swisseph as swe
import sys
from datetime import datetime
import pytz
import json

def calculate_houses(date_str, time_str, lat_str, lon_str, tz_str):
    lat = float(lat_str)
    lon = float(lon_str)

    local = pytz.timezone(tz_str)
    local_dt = local.localize(datetime.strptime(f"{date_str} {time_str}", '%Y-%m-%d %H:%M:%S'))
    utc_dt = local_dt.astimezone(pytz.utc)

    jd_ut = swe.julday(
        utc_dt.year, utc_dt.month, utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60.0 + utc_dt.second / 3600.0
    )

    houses, asc = swe.houses(jd_ut, lat, lon, b'K')
    mc = houses[9]  # 10. Haus = MC (Index 9)

    result = {
        "houses": list(houses),
        "ascendant": asc[0],
        "mc": mc,
        "local_time": local_dt.isoformat()
    }

    print(json.dumps(result))

if __name__ == "__main__":
    if len(sys.argv) != 6:
        print("Usage: calculate_houses.py <YYYY-MM-DD> <HH:MM:SS> <latitude> <longitude> <timezone>")
        sys.exit(1)

    calculate_houses(*sys.argv[1:])

