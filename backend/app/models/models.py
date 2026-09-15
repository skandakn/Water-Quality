from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, Date, 
    ForeignKey, CheckConstraint
)
from sqlalchemy.orm import relationship
from app.database import Base

class Lake(Base):
    __tablename__ = "lakes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    location = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    area_km2 = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    readings = relationship("WaterQualityReading", back_populates="lake", cascade="all, delete-orphan")
    wqi_records = relationship("WQIRecord", back_populates="lake", cascade="all, delete-orphan")
    satellite_observations = relationship("SatelliteObservation", back_populates="lake", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="lake", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="lake", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint('area_km2 > 0', name='check_positive_lake_area'),
    )


class WaterQualityReading(Base):
    __tablename__ = "water_quality_readings"

    id = Column(Integer, primary_key=True, index=True)
    lake_id = Column(Integer, ForeignKey("lakes.id", ondelete="CASCADE"), nullable=False, index=True)
    reading_date = Column(Date, nullable=False, index=True)
    ph = Column(Float, nullable=False)
    turbidity = Column(Float, nullable=False)
    dissolved_oxygen = Column(Float, nullable=False)
    tds = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    conductivity = Column(Float, nullable=True)
    source = Column(String(100), default="In-situ Sensor Station")
    data_quality_status = Column(String(50), default="VALID")  # VALID, SUSPICIOUS, MISSING, REVIEW_REQUIRED
    created_at = Column(DateTime, default=datetime.utcnow)

    lake = relationship("Lake", back_populates="readings")

    __table_args__ = (
        CheckConstraint('ph >= 0 AND ph <= 14', name='check_valid_ph'),
        CheckConstraint('turbidity >= 0', name='check_positive_turbidity'),
        CheckConstraint('dissolved_oxygen >= 0', name='check_positive_do'),
        CheckConstraint('tds >= 0', name='check_positive_tds'),
    )


class WQIRecord(Base):
    __tablename__ = "wqi_records"

    id = Column(Integer, primary_key=True, index=True)
    lake_id = Column(Integer, ForeignKey("lakes.id", ondelete="CASCADE"), nullable=False, index=True)
    reading_date = Column(Date, nullable=False, index=True)
    wqi_score = Column(Float, nullable=False)
    quality_category = Column(String(50), nullable=False)  # Excellent, Good, Moderate, Poor, Very Poor
    calculation_version = Column(String(50), default="WAWQI_v1.0")
    created_at = Column(DateTime, default=datetime.utcnow)

    lake = relationship("Lake", back_populates="wqi_records")

    __table_args__ = (
        CheckConstraint('wqi_score >= 0 AND wqi_score <= 100', name='check_valid_wqi_range'),
    )


class SatelliteObservation(Base):
    __tablename__ = "satellite_observations"

    id = Column(Integer, primary_key=True, index=True)
    lake_id = Column(Integer, ForeignKey("lakes.id", ondelete="CASCADE"), nullable=False, index=True)
    observation_date = Column(Date, nullable=False, index=True)
    water_coverage_percentage = Column(Float, nullable=False)
    estimated_water_area_km2 = Column(Float, nullable=False)
    image_url = Column(String(500), nullable=False)
    mask_url = Column(String(500), nullable=True)
    overlay_url = Column(String(500), nullable=True)
    water_detection_status = Column(String(50), default="Water Detected")
    source = Column(String(100), default="Sentinel-2 Optical (Simulated)")
    created_at = Column(DateTime, default=datetime.utcnow)

    lake = relationship("Lake", back_populates="satellite_observations")

    __table_args__ = (
        CheckConstraint('water_coverage_percentage >= 0 AND water_coverage_percentage <= 100', name='check_valid_coverage'),
        CheckConstraint('estimated_water_area_km2 >= 0', name='check_positive_water_area'),
    )


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    lake_id = Column(Integer, ForeignKey("lakes.id", ondelete="CASCADE"), nullable=False, index=True)
    prediction_date = Column(Date, nullable=False)
    target_date = Column(Date, nullable=False)
    predicted_wqi = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False)  # LOW, MODERATE, HIGH, CRITICAL
    model_version = Column(String(50), default="RF_TS_v1.0")
    created_at = Column(DateTime, default=datetime.utcnow)

    lake = relationship("Lake", back_populates="predictions")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    lake_id = Column(Integer, ForeignKey("lakes.id", ondelete="CASCADE"), nullable=False, index=True)
    alert_type = Column(String(100), nullable=False)  # WQI DETERIORATION, TURBIDITY SPIKE, etc.
    severity = Column(String(50), nullable=False)      # LOW, MODERATE, HIGH, CRITICAL
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    status = Column(String(50), default="ACTIVE")      # ACTIVE, ACKNOWLEDGED, RESOLVED
    created_at = Column(DateTime, default=datetime.utcnow)

    lake = relationship("Lake", back_populates="alerts")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="viewer")        # admin, analyst, viewer
    created_at = Column(DateTime, default=datetime.utcnow)
