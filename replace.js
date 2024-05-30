const fs = require("fs")
const path = require("path")

// Function to replace occurrences in a single file
function replaceInFile(filePath) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err)
      return
    }

    const result = data.replace(/\{...\b([\w.()]+)\.([a-zA-Z]+)Props\b}/g, (match, objectName, propName) => {
      return `{...${objectName}.get${propName.charAt(0).toUpperCase()}${propName.slice(1)}Props()}`
    })

    fs.writeFile(filePath, result, "utf8", (err) => {
      if (err) {
        console.error(err)
        return
      }
      console.log(`File ${filePath} has been updated`)
    })
  })
}

// Function to replace occurrences in all files in a directory and its subdirectories
function replaceInDirectory(directoryPath) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error(err)
      return
    }

    files.forEach((file) => {
      const filePath = path.join(directoryPath, file)
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(err)
          return
        }

        if (stats.isDirectory() && !file.startsWith(".") && file !== "node_modules" && file !== "public") {
          replaceInDirectory(filePath) // Recursively process subdirectories, excluding "node_modules" and "public"
        } else if (stats.isFile() && file !== "CHANGELOG.md" && file !== "favicon.ico") {
          replaceInFile(filePath) // Process files, excluding "CHANGELOG.md" and "favicon.ico"
        }
      })
    })
  })
}

// Replace occurrences in all files in the current directory
const directoryPath = "./" // Set to the current directory
replaceInDirectory(directoryPath)
