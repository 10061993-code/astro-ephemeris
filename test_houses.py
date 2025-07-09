import swisseph as swe

# Ephemeridenpfad setzen
swe.set_ephe_path('./ephe')

# 📅 Geburtsdaten
year, month, day = 1993, 6, 10
hour_decimal = 10 + 57 / 60  # 10:57 Uhr UTC

# 🌍 Geodaten (z. B. Hamburg)
latitude = 53.55
longitude = 10.00

# Julianisches Datum
jd = swe.julday(year, month, day, hour_decimal)

# 🏛 Häusersystem (z. B. 'P' = Placidus)
houses, ascmc = swe.houses(jd, latitude, longitude, b'P')

# 🔢 Ausgabe
print(f"Aszendent (AC): {ascmc[0]:.2f}°")
print(f"Medium Coeli (MC): {ascmc[1]:.2f}°")
for i in range(12):
    print(f"Haus {i+1}: {houses[i]:.2f}°")

