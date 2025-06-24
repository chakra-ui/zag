import { writeFileSync } from "fs"
import { join } from "path"
import { ModuleResolutionKind, Project, SourceFile, Symbol, TypeChecker } from "ts-morph"
import { getMachinePackages } from "./get-packages"
import { pascalCase } from "scule"

function trimType(value: string) {
  return value
    .split("=>")
    .map((t) => t.replace(/import\(".*"\)\./, ""))
    .join("=>")
}

function getDefaultValue(property: Symbol) {
  const tags = property.getJsDocTags()
  const [defaultValue] = tags.find((tag) => tag.getName() === "default")?.getText() ?? []
  return defaultValue?.text
}

function getDescription(property: Symbol, typeChecker?: TypeChecker) {
  // @ts-expect-error - ts-morph types are inconsistent
  const [description] = property.compilerSymbol.getDocumentationComment(typeChecker)
  return description?.text
}

function getPropTypes(sourceFile: SourceFile | undefined, typeName: string, typeChecker?: TypeChecker) {
  if (!sourceFile) return {}

  const result: Record<string, { type: string; description: string; defaultValue: string | null }> = {}

  const contextType = sourceFile.getInterface(typeName)?.getType()

  contextType?.getProperties().forEach((property) => {
    const name = property.getName()
    const type = property.getValueDeclaration()?.getType()?.getText()

    const defaultValue = getDefaultValue(property)
    const description = getDescription(property, typeChecker)

    if (type && description) {
      result[name] = { type: trimType(type), description, defaultValue }
    }
  })

  return result
}

async function main() {
  const project = new Project({
    compilerOptions: {
      moduleResolution: ModuleResolutionKind.NodeNext,
    },
  })

  const typeChecker = project.getTypeChecker()

  const result: Record<string, any> = {}

  const machines = await getMachinePackages()

  for (const { dir } of machines) {
    const baseDir = dir.split("/").pop()!
    const glob = `${dir}/src/**/*.ts`

    const typesFilePath = `${dir}/src/${baseDir}.types.ts`

    project.addSourceFilesAtPaths(glob)

    const sourceFile = project.getSourceFile(typesFilePath)

    try {
      const ctxName = baseDir === "toast" ? "ToastStore" : `${pascalCase(baseDir)}Props`
      const propTypes = getPropTypes(sourceFile, ctxName, typeChecker)

      const apiName = baseDir === "toast" ? "ToastGroupApi" : `${pascalCase(baseDir)}Api`
      const apiTypes = getPropTypes(sourceFile, apiName, typeChecker)

      result[baseDir] = { api: apiTypes, context: propTypes }
    } catch {
      console.error("failed --------->", dir)
    }
  }

  const outPath = join(process.cwd(), "packages", "docs", "data", "api.json")

  writeFileSync(outPath, JSON.stringify(result, null, 2))
}

main()
