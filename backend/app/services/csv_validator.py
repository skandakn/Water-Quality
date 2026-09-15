"""
Jaal Drushti - CSV Ingestion & Quality Validation Service
Provides rigorous row-by-row schema and domain validation for uploaded water quality data.
"""

import csv
import io
from datetime import datetime
from typing import List, Dict, Any, Tuple
from app.schemas.schemas import CSVRowValidation, CSVUploadValidationResult

REQUIRED_COLUMNS = [
    "date", "lake_name", "ph", "turbidity", "dissolved_oxygen", "tds", "temperature"
]

def parse_and_validate_csv(csv_content: str, known_lake_names: List[str]) -> CSVUploadValidationResult:
    f = io.StringIO(csv_content)
    reader = csv.DictReader(f)
    
    # Normalize headers
    if not reader.fieldnames:
        return CSVUploadValidationResult(
            total_rows=0,
            valid_rows_count=0,
            invalid_rows_count=0,
            suspicious_count=0,
            preview_rows=[],
            can_import=False
        )

    field_map = {col.strip().lower().replace(" ", "_"): col for col in reader.fieldnames}
    
    preview_rows: List[CSVRowValidation] = []
    total_rows = 0
    valid_count = 0
    invalid_count = 0
    suspicious_count = 0

    known_lakes_lower = [name.lower() for name in known_lake_names]

    for idx, row in enumerate(reader, start=1):
        total_rows += 1
        errors = []
        warnings = []
        status = "VALID"

        # 1. Date Check
        raw_date = row.get(field_map.get("date", ""), "").strip()
        parsed_date = None
        if not raw_date:
            errors.append("Missing date")
            status = "MISSING"
        else:
            for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%Y/%m/%d"):
                try:
                    parsed_date = datetime.strptime(raw_date, fmt).date()
                    break
                except ValueError:
                    pass
            if not parsed_date:
                errors.append(f"Invalid date format '{raw_date}'. Expected YYYY-MM-DD")

        # 2. Lake Name Check
        raw_lake = row.get(field_map.get("lake_name", ""), "").strip()
        if not raw_lake:
            errors.append("Missing lake_name")
            status = "MISSING"
        elif raw_lake.lower() not in known_lakes_lower and known_lake_names:
            warnings.append(f"Lake '{raw_lake}' not found in registered database. Will be flagged for review.")
            status = "REVIEW_REQUIRED"

        # 3. Numeric Fields
        def parse_float(key: str, name: str, min_val: float, max_val: float, extreme_min: float, extreme_max: float) -> Tuple[Any, List[str], List[str]]:
            errs = []
            warns = []
            val_str = row.get(field_map.get(key, ""), "").strip()
            if not val_str:
                errs.append(f"Missing {name}")
                return None, errs, warns
            try:
                v = float(val_str)
                if v < min_val or v > max_val:
                    errs.append(f"{name} {v} out of physically possible range [{min_val}, {max_val}]")
                elif v < extreme_min or v > extreme_max:
                    warns.append(f"{name} {v} is outside typical expected boundaries [{extreme_min}, {extreme_max}]")
                return v, errs, warns
            except ValueError:
                errs.append(f"Non-numeric value '{val_str}' for {name}")
                return None, errs, warns

        ph, err_ph, warn_ph = parse_float("ph", "pH", 0.0, 14.0, 4.0, 10.0)
        turb, err_turb, warn_turb = parse_float("turbidity", "Turbidity", 0.0, 5000.0, 0.5, 100.0)
        do, err_do, warn_do = parse_float("dissolved_oxygen", "Dissolved Oxygen", 0.0, 30.0, 1.0, 15.0)
        tds, err_tds, warn_tds = parse_float("tds", "TDS", 0.0, 20000.0, 10.0, 3000.0)
        temp, err_temp, warn_temp = parse_float("temperature", "Temperature", -10.0, 65.0, 5.0, 45.0)

        errors.extend(err_ph + err_turb + err_do + err_tds + err_temp)
        warnings.extend(warn_ph + warn_turb + warn_do + warn_tds + warn_temp)

        if errors:
            status = "MISSING" if any("Missing" in e for e in errors) else "REVIEW_REQUIRED"
            invalid_count += 1
            is_valid = False
        elif warnings:
            status = "SUSPICIOUS"
            suspicious_count += 1
            valid_count += 1
            is_valid = True
        else:
            status = "VALID"
            valid_count += 1
            is_valid = True

        preview_rows.append(CSVRowValidation(
            row_number=idx,
            lake_name=raw_lake,
            date=raw_date,
            ph=ph,
            turbidity=turb,
            dissolved_oxygen=do,
            tds=tds,
            temperature=temp,
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            status=status
        ))

    return CSVUploadValidationResult(
        total_rows=total_rows,
        valid_rows_count=valid_count,
        invalid_rows_count=invalid_count,
        suspicious_count=suspicious_count,
        preview_rows=preview_rows,
        can_import=valid_count > 0
    )
