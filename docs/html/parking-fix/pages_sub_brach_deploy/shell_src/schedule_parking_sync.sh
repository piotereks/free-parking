#!/bin/sh
cru a ParkingSync_WorkDay "*/5 6-21 * * 1-5 /jffs/scripts/parking_sync.sh"
cru a ParkingSync_Night "*/30 0-5,22-23 * * 1-5 /jffs/scripts/parking_sync.sh"
cru a ParkingSync_Weekend "*/30 * * * 0,6 /jffs/scripts/parking_sync.sh"
