from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
from pathlib import Path
import os
from datetime import datetime

# ----- Config -----
API_TITLE = "Mos Insights API"
API_VERSION = "0.2.0"
DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "sales.csv"

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    os.getenv("FRONTEND_ORIGIN", ""),  # set FRONTEND_ORIGIN in production
]

# ----- Init -----
app = FastAPI(title=API_TITLE, version=API_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in ALLOWED_ORIGINS if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Load + preprocess data -----
df = pd.read_csv(DATA_PATH, parse_dates=["date"])
df["month"] = df["date"].dt.to_period("M").astype(str)
last_updated = datetime.now().isoformat()

# ----- Models -----
class KPIResponse(BaseModel):
    total_revenue: float
    monthly_growth_pct: float
    churn_rate_pct: float
    customers: int

class RevenueByMonth(BaseModel):
    month: str
    revenue: float

class RevenueByRegion(BaseModel):
    region: str
    revenue: float

class CustomerTrend(BaseModel):
    date: str
    customers: int

# ----- Endpoints -----
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "version": API_VERSION,
        "records": len(df),
        "last_updated": last_updated,
    }

@app.get("/api/kpis", response_model=KPIResponse)
def get_kpis():
    monthly = (
        df.groupby("month")
        .agg(revenue=("revenue", "sum"),
             customers=("customers", "sum"),
             churned=("churned", "sum"))
        .reset_index()
        .sort_values("month")
    )

    total_revenue = float(df["revenue"].sum())

    # Monthly growth: last vs previous
    if len(monthly) >= 2:
        last, prev = monthly.iloc[-1]["revenue"], monthly.iloc[-2]["revenue"]
        monthly_growth_pct = ((last - prev) / prev * 100.0) if prev else 0.0
    else:
        monthly_growth_pct = 0.0

    # Churn rate overall
    total_churned = int(df["churned"].sum())
    total_customers = int(df["customers"].sum())
    churn_rate_pct = (total_churned / total_customers * 100.0) if total_customers else 0.0

    return KPIResponse(
        total_revenue=round(total_revenue, 2),
        monthly_growth_pct=round(monthly_growth_pct, 2),
        churn_rate_pct=round(churn_rate_pct, 2),
        customers=total_customers,
    )

@app.get("/api/revenue/monthly", response_model=List[RevenueByMonth])
def get_revenue_by_month():
    monthly = (
        df.groupby("month")["revenue"]
        .sum()
        .reset_index()
        .sort_values("month")
    )
    return [RevenueByMonth(month=row["month"], revenue=float(row["revenue"]))
            for _, row in monthly.iterrows()]

@app.get("/api/revenue/region", response_model=List[RevenueByRegion])
def get_revenue_by_region():
    region = df.groupby("region")["revenue"].sum().reset_index()
    return [RevenueByRegion(region=row["region"], revenue=float(row["revenue"]))
            for _, row in region.iterrows()]

@app.get("/api/customers/trend", response_model=List[CustomerTrend])
def get_customer_trend():
    trend = (
        df.groupby("date")["customers"]
        .sum()
        .reset_index()
        .sort_values("date")
    )
    return [CustomerTrend(date=row["date"].strftime("%Y-%m-%d"),
                          customers=int(row["customers"]))
            for _, row in trend.iterrows()]
