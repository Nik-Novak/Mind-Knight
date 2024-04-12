#!/bin/bash

# Check if correct number of arguments are provided
if [ $# -lt 2 ] || [ $# -gt 3 ]; then
    echo "Usage: $0 source_file destination_file [time_s_between_lines]"
    exit 1
fi

source_file="$1"
destination_file="$2"
# time_s_between_lines= 0.25 #"${3:-0}"  # Set default value to 0 if not provided

# Check if source file exists
if [ ! -f "$source_file" ]; then
    echo "Source file '$source_file' does not exist."
    exit 1
fi

# Flag to indicate if "GameFound" has been found
found=false

# Loop through each line in the source file
while IFS= read -r line; do
    if [[ $line == *"Received GameFound"* ]]; then
        found=true  # Set the flag to true once "GameFound" is found
    fi
    if [ "$found" = true ]; then
        echo "$line" >> "$destination_file"  # Append the line to the destination file
        sleep 0.5
    fi
done < "$source_file"

echo "Copying complete."
