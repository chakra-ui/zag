import { writeFileSync } from "fs"
import { join } from "path"
import { ModuleResolutionKind, Project, SourceFile, Symbol, TypeChecker } from "ts-morph"
import { getMachinePackages } from "./get-packages"

function getConnectReturnType(sourceFile: SourceFile | undefined, typeChecker?: TypeChecker) {
  if (!sourceFile) return {}

  const returnType = sourceFile.getFunction("connect")?.getReturnType()

  const result: Record<string, { type: string; description: string }> = {}

  returnType?.getProperties().forEach((property) => {
    const name = property.getName()
    const type = property.getValueDeclaration()?.getType().getText()
    const description = getDescription(property, typeChecker)

    if (type && description) {
      result[name] = { type: trimType(type), description }
    }
  })

  return result
}

function trimType(value: string) {
  return value.replace(/import\(".*"\)\./, "")
}

function getDefaultValue(property: Symbol) {
  const tags = property.getJsDocTags()
  const [defaultValue] = tags.find((tag) => tag.getName() === "default")?.getText() ?? []
  return defaultValue?.text ?? null
}

function getDescription(property: Symbol, typeChecker?: TypeChecker) {
  // @ts-expect-error - ts-morph types are inconsistent
  const [description] = property.compilerSymbol.getDocumentationComment(typeChecker)
  return description?.text
}

function getContextReturnType(sourceFile: SourceFile | undefined, typeChecker?: TypeChecker) {
  if (!sourceFile) return {}

  const result: Record<string, { type: string; description: string; defaultValue: string | null }> = {}

  const contextType = sourceFile.getTypeAlias("PublicContext")?.getType()

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
      moduleResolution: ModuleResolutionKind.NodeJs,
    },
  })

  const typeChecker = project.getTypeChecker()

  const result: Record<string, any> = {}

  const machines = await getMachinePackages()

  for (const { dir } of machines) {
    const baseDir = dir.split("/").pop()!
    const glob = `${dir}/src/**/*.ts`

    const connectFilePath = `${dir}/src/${baseDir}.connect.ts`
    const typesFilePath = `${dir}/src/${baseDir}.types.ts`

    project.addSourceFilesAtPaths(glob)

    const connectSrc = project.getSourceFile(connectFilePath)
    const connectType = getConnectReturnType(connectSrc, typeChecker)

    const contextSrc = project.getSourceFile(typesFilePath)
    const contextType = getContextReturnType(contextSrc, typeChecker)

    result[baseDir] = { api: connectType, context: contextType }
  }

  const outPath = join(process.cwd(), "packages", "docs", "api.json")

  writeFileSync(outPath, JSON.stringify(result, null, 2))
}

main()
