
import swisseph as swe
import json

# Set ephemeris path
swe.set_ephe_path('./ephe')

# Birth data: 10 June 1993, 10:57 UTC in Hamburg (lat: 53.55, lon: 10.00)
year, month, day = 1993, 6, 10
hour = 10 + 57/60
lat, lon = 53.55, 10.00

# Julian day
jd = swe.julday(year, month, day, hour)

# House system
houses, ascmc = swe.houses(jd, lat, lon, b'P')
asc = ascmc[0]

# Planet definitions
planet_ids = {
    'sun': swe.SUN,
    'moon': swe.MOON,
    'mercury': swe.MERCURY,
    'venus': swe.VENUS,
    'mars': swe.MARS,
    'jupiter': swe.JUPITER,
    'saturn': swe.SATURN,
    'uranus': swe.URANUS,
    'neptune': swe.NEPTUNE,
    'pluto': swe.PLUTO
}

# Zodiac signs
signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

# Sign to element and modality
element_map = {
    'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire',
    'Taurus': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth',
    'Gemini': 'air', 'Libra': 'air', 'Aquarius': 'air',
    'Cancer': 'water', 'Scorpio': 'water', 'Pisces': 'water'
}
modality_map = {
    'Aries': 'cardinal', 'Cancer': 'cardinal', 'Libra': 'cardinal', 'Capricorn': 'cardinal',
    'Taurus': 'fixed', 'Leo': 'fixed', 'Scorpio': 'fixed', 'Aquarius': 'fixed',
    'Gemini': 'mutable', 'Virgo': 'mutable', 'Sagittarius': 'mutable', 'Pisces': 'mutable'
}

# Determine sign and house
def get_sign_and_house(lon):
    sign_index = int(lon / 30)
    sign = signs[sign_index]
    for i, cusp in enumerate(houses):
        if lon < cusp:
            return sign, i if i > 0 else 12
    return sign, 12

# Collect data
profile = {
    "ascendant": signs[int(asc / 30)],
    "planets": {},
    "elements": {"fire": 0, "earth": 0, "air": 0, "water": 0},
    "modalities": {"cardinal": 0, "fixed": 0, "mutable": 0}
}

for name, pid in planet_ids.items():
    pos, _ = swe.calc_ut(jd, pid)
    lon = pos[0]
    sign, house = get_sign_and_house(lon)
    profile["planets"][name] = {"sign": sign, "house": house}
    profile["elements"][element_map[sign]] += 1
    profile["modalities"][modality_map[sign]] += 1

# Write to JSON
with open("astro_profile.json", "w") as f:
    json.dump(profile, f, indent=2)

print("✅ Profil gespeichert in astro_profile.json")
