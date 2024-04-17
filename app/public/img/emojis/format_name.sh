#!/bin/bash

# Loop through each file in the current directory
for file in *; do
    # Check if the file exists and is a regular file
    if [ -f "$file" ]; then
        # Find the index of the first occurrence of "-"
        index=$(expr index "$file" "-")

        # Check if "-" was found
        if [ "$index" -gt 0 ]; then
            # Extract the filename up to the first "-" character
            filename_prefix=${file:0:index-1}

            # Rename the file with the new extension ".png"
            mv "$file" "$filename_prefix.png"
            
            echo "Renamed $file to $filename_prefix.png"
        fi
    fi
done
