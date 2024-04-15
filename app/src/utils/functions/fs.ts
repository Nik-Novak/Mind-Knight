import fs from 'fs';

export function moveDirectorySync(sourcePath:string, destinationPath:string) {
    try {
        fs.renameSync(sourcePath, destinationPath);
    } catch (err) {
      if(err instanceof Error)
        if (err.name === 'EXDEV') {
            // If the move is across different devices, use copy and then remove
            copyDirectorySync(sourcePath, destinationPath);
        } else {
            throw err;
        }
    }
}

export function copyDirectorySync(source:string, target:string) {
    fs.mkdirSync(target, { recursive: true });
    const files = fs.readdirSync(source);
    files.forEach((file) => {
        const sourcePath = `${source}/${file}`;
        const targetPath = `${target}/${file}`;
        const stat = fs.statSync(sourcePath);
        if (stat.isDirectory()) {
            copyDirectorySync(sourcePath, targetPath);
        } else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    });
    fs.rmdirSync(source, { recursive: true });
}