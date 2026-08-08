#!/bin/bash
BACKUP_DIR="$HOME/hermes_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r . "$BACKUP_DIR"
echo "Backup saved to $BACKUP_DIR"
