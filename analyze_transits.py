
import json
import math

# Load birth chart and transits
with open("astro_profile.json") as f:
    birth_data = json.load(f)

with open("transit_data.json") as f:
    transit_data = json.load(f)

# Define aspects with orbs
aspects = {
    "conjunction": 0,
    "sextile": 60,
    "square": 90,
    "trine": 120,
    "opposition": 180
}
orb = 6  # degree tolerance for aspects

# Result list
aspect_hits = []

# Compare each transit planet with each birth planet
for t_name, t_info in transit_data["planets"].items():
    t_pos = t_info["longitude"]
    for b_name, b_info in birth_data["planets"].items():
        b_sign_index = [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ].index(b_info["sign"])
        b_pos = b_sign_index * 30 + 15  # use midpoint of sign for estimate

        angle = abs(t_pos - b_pos) % 360
        if angle > 180:
            angle = 360 - angle

        for asp_name, asp_angle in aspects.items():
            if abs(angle - asp_angle) <= orb:
                aspect_hits.append({
                    "transit_planet": t_name,
                    "transit_position": round(t_pos, 2),
                    "birth_planet": b_name,
                    "birth_position": round(b_pos, 2),
                    "aspect": asp_name,
                    "orb": round(abs(angle - asp_angle), 2)
                })

# Write result
with open("transit_aspects.json", "w") as f:
    json.dump(aspect_hits, f, indent=2)

print("✅ Transit-Aspekte gespeichert in transit_aspects.json")
