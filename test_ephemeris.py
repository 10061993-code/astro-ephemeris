import swisseph as swe

# Set path to ephemeris files
swe.set_ephe_path('./ephe')

# Julian Day for 10 June 1993, 10:57 UTC
jd = swe.julday(1993, 6, 10, 10 + 57 / 60)

# Helper to format and print planetary data
def log_planet(name, planet_id):
    try:
        values, flags = swe.calc_ut(jd, planet_id)
        lon = values[0]  # geozentrische Länge
        print(f"{name} (Longitude): {lon:.2f}°")
    except Exception as e:
        print(f"❌ Fehler bei {name}: {str(e)}")

# Run calculations
log_planet("☀️ Sonne", swe.SUN)
log_planet("☊ Mondknoten (mean)", swe.MEAN_NODE)
log_planet("⚫ Lilith", swe.MEAN_APOG)

