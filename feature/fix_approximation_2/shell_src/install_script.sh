#!/bin/sh

chmod +x /jffs/scripts/parking_sync.sh
cat > /jffs/scripts/services-start << 'EOF'
#!/bin/sh
echo "$(date): Starting services" >> /jffs/services-start.log
sleep 30
cru d ParkingSync
cru a ParkingSync_WorkDay "*/5 6-21 * * 1-5 /jffs/scripts/parking_sync.sh"
cru a ParkingSync_Night "*/30 0-5,22-23 * * 1-5 /jffs/scripts/parking_sync.sh"
cru a ParkingSync_Weekend "*/30 * * * 0,6 /jffs/scripts/parking_sync.sh"
EOF
chmod +x /jffs/scripts/services-start
