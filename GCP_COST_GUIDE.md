# GCP Cost Guide

## Primary Focus

For this project, the highest recurring cost is most likely Cloud SQL rather than Cloud Run.

## What Changed In Code

- Public site settings, pricing, and closed dates are now generated into `public/site-data.json` and served as static data.
- Public pages prefer that snapshot over live API calls.
- Availability checks now use a short in-memory cache with invalidation on booking changes.
- Health checks no longer hit the database unless `?deep=1` is requested.

## Cloud SQL Checks

Review these first in GCP:

1. Instance tier
2. High availability enabled or disabled
3. Backup retention days
4. Point-in-time recovery enabled or disabled
5. Storage size and auto-growth
6. Network egress between regions
7. Idle connections and connection spikes

## Likely Oversized Patterns

- `db-custom-*` tiers for a low-traffic brochure and booking site
- high availability enabled for a workload that tolerates brief maintenance windows
- very long backup retention on a small operational dataset
- Cloud Run in one region and Cloud SQL in another

## Recommended Target Shape

- Cloud Run and Cloud SQL in the same region
- smallest Cloud SQL tier that still supports admin and booking bursts
- Cloud Run min instances at `0`
- Cloud Run max instances capped
- public-read data served from static snapshot instead of database reads

## What Should Stay Live

- booking creation
- availability checks
- admin login and admin mutations

## Next Infra Step

Run a 7-day billing breakdown by service and compare:

- Cloud SQL instance cost
- Cloud SQL storage and backup cost
- Cloud Run request and CPU/memory cost
- Cloud Logging cost

If Cloud SQL still dominates after the new caching and snapshot flow is deployed, the next move is instance rightsizing rather than more app-level caching.