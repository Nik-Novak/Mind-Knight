#!/bin/bash

# Check if correct number of arguments are provided
if [ $# -ne 2 ]; then
    echo "Usage: $0 source_file destination_file"
    exit 1
fi

source_file="$1"
destination_file="$2"

# Check if source file exists
if [ ! -f "$source_file" ]; then
    echo "Source file '$source_file' does not exist."
    exit 1
fi

# Loop through each line in the source file
while IFS= read -r line; do
    echo "$line" >> "$destination_file"  # Append the line to the destination file
    sleep 0.25  # Sleep for 2 seconds
done < "$source_file"

echo "Copying complete."
