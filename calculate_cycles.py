import swisseph as swe
from datetime import datetime, timedelta
import sys
import json

# Ephemeriden-Pfad setzen
swe.set_ephe_path("./ephemerides")  # seas_00.se1 sollte hier liegen

def julday_from_date(date: datetime):
    return swe.julday(date.year, date.month, date.day, date.hour + date.minute / 60)

def get_planet_pos(julday, planet):
    pos, _ = swe.calc_ut(julday, planet)
    return pos[0]

def find_transit(birth_deg, planet, start_date, end_date, aspect_deg, orb=1.5):
    current = start_date
    found = None
    while current <= end_date:
        jd = julday_from_date(current)
        pos = get_planet_pos(jd, planet)
        diff = (pos - birth_deg + 360) % 360
        if abs(diff - aspect_deg) < orb:
            found = current
            break
        current += timedelta(days=1)
    return found

def calculate_cycles(birth_date, birth_time, coords, now_date):
    birth_dt = datetime.strptime(birth_date + " " + birth_time, "%Y-%m-%d %H:%M")
    birth_jul = julday_from_date(birth_dt)

    result = {}
    lat, lon = coords

    saturn_birth = get_planet_pos(birth_jul, swe.SATURN)
    uranus_birth = get_planet_pos(birth_jul, swe.URANUS)

    start_date = datetime.strptime(now_date, "%Y-%m-%d") - timedelta(days=365 * 5)
    end_date = datetime.strptime(now_date, "%Y-%m-%d") + timedelta(days=365 * 5)

    saturn_return = find_transit(saturn_birth, swe.SATURN, start_date, end_date, aspect_deg=0)
    if saturn_return:
        result["Saturn Return"] = {
            "exact": saturn_return.strftime("%Y-%m-%d"),
            "status": "active" if abs((saturn_return - datetime.strptime(now_date, "%Y-%m-%d")).days) < 90 else 
"upcoming"
        }

    saturn_opposition = find_transit(saturn_birth, swe.SATURN, start_date, end_date, aspect_deg=180)
    if saturn_opposition:
        result["Saturn Opposition"] = {
            "exact": saturn_opposition.strftime("%Y-%m-%d"),
            "status": "active" if abs((saturn_opposition - datetime.strptime(now_date, "%Y-%m-%d")).days) < 90 else 
"upcoming"
        }

    uranus_opposition = find_transit(uranus_birth, swe.URANUS, start_date, end_date, aspect_deg=180)
    if uranus_opposition:
        result["Uranus Opposition"] = {
            "exact": uranus_opposition.strftime("%Y-%m-%d"),
            "status": "active" if abs((uranus_opposition - datetime.strptime(now_date, "%Y-%m-%d")).days) < 180 else 
"upcoming"
        }

    return result

if __name__ == "__main__":
    birth_date = sys.argv[1]
    birth_time = sys.argv[2]
    lat = float(sys.argv[3])
    lon = float(sys.argv[4])
    now_date = sys.argv[5]

    cycles = calculate_cycles(birth_date, birth_time, (lat, lon), now_date)
    print(json.dumps(cycles, indent=2, ensure_ascii=False))

