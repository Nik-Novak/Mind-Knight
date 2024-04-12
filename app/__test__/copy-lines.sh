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

# Loop through each line in the source file
while IFS= read -r line; do
    echo "$line" >> "$destination_file"  # Append the line to the destination file
    sleep 0.5
    # if [ $time_s_between_lines -gt 0 ]; then
    # sleep $time_s_between_lines  # Sleep for {time_s_between_lines} seconds if non-zero value provided
    # fi
done < "$source_file"

echo "Copying complete."
