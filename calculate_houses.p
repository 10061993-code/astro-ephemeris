import swisseph as swe
import sys
from datetime import datetime
import pytz

def calculate_houses(date_str, time_str, lat, lon, tz_str):
    # Parse datetime und Zeitzone
    local = pytz.timezone(tz_str)
    dt_naive = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M:%S")
    dt_local = local.localize(dt_naive)
    print(f"Lokale Zeit: {dt_local.isoformat()}")

    # Umrechnung in Julianisches Datum UT
    # dt_local.utcoffset() ist ein timedelta, in Tagen umgerechnet
    offset_hours = dt_local.utcoffset().total_seconds() / 3600
    jd_ut = swe.julday(dt_local.year, dt_local.month, dt_local.day,
                       dt_local.hour + dt_local.minute / 60 + dt_local.second / 3600) - offset_hours / 24

    # Häuser berechnen mit Koch (Zeichen als Bytes übergeben)
    # Rückgabe: (Häuser-Array, Aszendent-Tupel, MC-Tupel)
    houses, ascendant, midheaven = swe.houses(jd_ut, lat, lon, b'K')

    # ascendant und midheaven sind Tupel, erster Wert ist Winkel in Grad
    asc = ascendant[0] if isinstance(ascendant, (tuple, list)) else ascendant
    mc = midheaven[0] if isinstance(midheaven, (tuple, list)) else midheaven

    houses_dict = {f"house_{i + 1}": round(houses[i], 2) for i in range(12)}

    result = {
        'houses': houses_dict,
        'ascendant': round(asc, 2),
        'midheaven': round(mc, 2)
    }
    return result

if __name__ == "__main__":
    if len(sys.argv) != 6:
        print("Usage: calculate_houses.py <date> <time> <latitude> <longitude> <timezone>")
        sys.exit(1)
    date_str, time_str, lat, lon, tz_str = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
    result = calculate_houses(date_str, time_str, lat, lon, tz_str)
    print(result)

