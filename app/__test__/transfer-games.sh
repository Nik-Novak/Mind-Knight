#!/bin/bash
LOGPATH=$HOME/snap/steam/common/.config/unity3d/Nomoon/Mindnight/Player.log

# ./copy-lines.sh ./data/5eb8a47d3ae97e2d482447cb/Player.log $LOGPATH

DATA_FOLDER=./data
COMPLETE_FOLDER=./complete

# Find all Player.log files and print their file paths
find $DATA_FOLDER -name "Player.log" -type f | while read -r log_file; do
    echo "TRANSFERRING: $log_file"
    ./copy-lines.sh $log_file $LOGPATH

    # Move the parent folder to /complete
    parent_folder=$(dirname "$log_file")
    mv "$parent_folder" "$COMPLETE_FOLDER"
done