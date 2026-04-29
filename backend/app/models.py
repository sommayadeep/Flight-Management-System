# Database models are defined in database.py
# This file can be used for additional model utilities and constants

FLIGHT_STATUSES = ["On Time", "Delayed", "Boarding", "In Flight", "Landed", "Cancelled"]

STATUS_COLORS = {
    "On Time": "green",
    "Delayed": "red",
    "Boarding": "blue",
    "In Flight": "cyan",
    "Landed": "gray",
    "Cancelled": "red",
}
