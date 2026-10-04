from flask import Flask, jsonify, request, send_from_directory
from datetime import datetime
import os

app = Flask(__name__, static_folder=".", static_url_path="")

AREAS = ["Central", "North", "South", "East", "West"]
TYPES = ["Theft", "Assault", "Burglary", "Cybercrime"]
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August"]

def build_rows():
    rows = []
    for year in [2025, 2026]:
        for m, month in enumerate(MONTHS):
            for t, crime_type in enumerate(TYPES):
                rows.append({
                    "year": year,
                    "month": month,
                    "area": AREAS[(m + t + year) % 5],
                    "type": crime_type,
                    "count": 25 + (m * 9) + (t * 13) + ((m + t) % 4) * 5 + (7 if year == 2026 else 0)
                })
    return rows

ROWS = build_rows()

@app.route("/")
def home():
    return send_from_directory(".", "index.html")

@app.route("/api/crimes")
def crimes():
    area = request.args.get("area", "All")
    year = request.args.get("year", "All")
    data = [
        row for row in ROWS
        if (area == "All" or row["area"] == area)
        and (year == "All" or str(row["year"]) == year)
    ]
    return jsonify(data)

@app.route("/api/report", methods=["POST"])
def report():
    payload = request.get_json(silent=True) or {}
    required = ["category", "area", "date", "description"]
    if any(not str(payload.get(field, "")).strip() for field in required):
        return jsonify({"success": False, "message": "Please complete all required fields."}), 400

    # Educational demo: no report is persisted.
    return jsonify({
        "success": True,
        "message": "Demo submitted successfully. No information was stored."
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
